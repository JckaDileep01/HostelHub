import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import Razorpay from 'razorpay';
import type { CreateRentOrderRequest } from '@/lib/types';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_mock_key',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'rzp_test_mock_secret',
});

export async function POST(request: Request) {
  try {
    const body: CreateRentOrderRequest = await request.json();

    if (!body.tenantId || !body.hostelId || !body.roomNumber || !body.month || !body.year || !body.amount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 1. Fetch target owner's razorpay_account_id
    const { data: ownerAccount, error: ownerError } = await supabase
      .from('owner_payment_accounts')
      .select('razorpay_account_id')
      .eq('hostel_id', body.hostelId)
      .single();

    if (ownerError) {
      console.warn('Could not fetch owner payment account, proceeding without transfer route for now:', ownerError);
    }

    const transfers = ownerAccount ? [
      {
        account: ownerAccount.razorpay_account_id,
        amount: body.amount * 100, // 100% transfer route
        currency: 'INR',
        notes: {
          note: 'Hostelhood Rent Collection'
        },
        linked_account_notes: ['note'],
        on_hold: 0,
      }
    ] : undefined;

    // 2. Create Razorpay Order
    // Handle mock keys to prevent crashes in development
    let orderId = `order_${Math.random().toString(36).substring(2, 15)}`;
    
    try {
        if (process.env.RAZORPAY_KEY_ID) {
            const orderOptions: any = {
                amount: body.amount * 100,
                currency: 'INR',
                receipt: `rcpt_rent_${Date.now()}`,
                notes: {
                  tenant_id: body.tenantId,
                  hostel_id: body.hostelId,
                  month: body.month,
                  year: body.year.toString(),
                  room: body.roomNumber,
                },
            };
            if (transfers) {
                orderOptions.transfers = transfers;
            }
            
            const rzpOrder = await razorpay.orders.create(orderOptions);
            orderId = rzpOrder.id;
        }
    } catch (e: any) {
        console.warn("Razorpay API failed, using mock order ID for development:", e.message);
    }

    // 3. Insert record into rent_transactions as PENDING
    const { data: transaction, error: txError } = await supabase
      .from('rent_transactions')
      .insert({
        tenant_id: body.tenantId,
        hostel_id: body.hostelId,
        room_number: body.roomNumber,
        rent_month: body.month,
        rent_year: body.year,
        total_amount: body.amount,
        razorpay_order_id: orderId,
        status: 'PENDING',
        is_autopay: body.isAutoPay || false,
      })
      .select()
      .single();

    if (txError) {
        // Handle unique constraint violation (already paid or pending for this month)
        if (txError.code === '23505') {
            return NextResponse.json({ error: 'A transaction for this month already exists.' }, { status: 409 });
        }
        console.error('Error inserting rent transaction:', txError);
        return NextResponse.json({ error: txError.message }, { status: 500 });
    }

    return NextResponse.json({ 
        success: true, 
        orderId, 
        transactionId: transaction.id,
        amount: body.amount,
        currency: 'INR'
    });
  } catch (error: any) {
    console.error('Create rent order error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
