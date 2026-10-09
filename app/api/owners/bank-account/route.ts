import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import Razorpay from 'razorpay';
import type { OwnerBankSetupRequest } from '@/lib/types';

// IMPORTANT: In a real production app, Razorpay keys should be secret server-side env vars.
// For this prototype, we're using mock logic if the keys are missing or handling errors gracefully.
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_mock_key',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'rzp_test_mock_secret',
});

export async function POST(request: Request) {
  try {
    const body: OwnerBankSetupRequest = await request.json();

    if (!body.bank_account_number || !body.ifsc_code || !body.beneficiary_name || !body.hostel_id) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 1. Call Razorpay API to create a linked account (Mocking the response for safety in dev without real keys)
    // In production, you would do:
    // const account = await razorpay.accounts.create({
    //   type: 'route',
    //   email: body.email,
    //   phone: body.phone,
    //   legal_business_name: body.beneficiary_name,
    //   contact_name: body.beneficiary_name,
    //   profile: { category: 'real_estate' },
    //   legal_info: { pan: 'ABCDE1234F' }
    // });
    
    // For our implementation, we'll generate a mock account ID since we might not have a real Razorpay partner key
    const mockRazorpayAccountId = `acc_${Math.random().toString(36).substring(2, 15)}`;

    // 2. Save the details in Supabase
    const { data: { session } } = await supabase.auth.getSession();
    const ownerId = session?.user?.id || 'mock-owner-id'; // Fallback for testing if no auth

    const { data, error } = await supabase
      .from('owner_payment_accounts')
      .insert({
        hostel_owner_id: ownerId,
        hostel_id: body.hostel_id,
        razorpay_account_id: mockRazorpayAccountId,
        bank_account_number: body.bank_account_number,
        ifsc_code: body.ifsc_code,
        beneficiary_name: body.beneficiary_name,
        verification_status: 'ACTIVE'
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving owner payment account:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, account: data });
  } catch (error: any) {
    console.error('Owner bank setup error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
