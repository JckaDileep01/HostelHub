import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabase } from '@/lib/supabase/client';
import { generatePdfReceipt } from '@/lib/generatePdfReceipt';

const WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET || 'rzp_test_mock_webhook_secret';

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('x-razorpay-signature');

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    // Verify HMAC SHA256 signature
    const expectedSignature = crypto
      .createHmac('sha256', WEBHOOK_SECRET)
      .update(rawBody)
      .digest('hex');

    if (expectedSignature !== signature && process.env.NODE_ENV === 'production') {
       return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const payload = JSON.parse(rawBody);

    // Handle payment.captured
    if (payload.event === 'payment.captured') {
      const payment = payload.payload.payment.entity;
      const notes = payment.notes || {};
      
      const tenant_id = notes.tenant_id;
      const hostel_id = notes.hostel_id;
      const month = notes.month;
      const year = parseInt(notes.year, 10);
      const room = notes.room;

      if (!tenant_id || !hostel_id || !month || !year) {
         console.warn('Webhook received without necessary notes:', payment.id);
         return NextResponse.json({ success: true, message: 'Ignored, missing notes' });
      }

      // 1. Update rent_transactions row to status PAID
      const { data: transaction, error: txUpdateError } = await supabase
        .from('rent_transactions')
        .update({
          status: 'PAID',
          paid_at: new Date().toISOString(),
          payment_method: payment.method || 'razorpay',
          razorpay_payment_id: payment.id,
          bank_utr: payment.acquirer_data?.bank_transaction_id || payment.acquirer_data?.rrn || null,
        })
        .eq('razorpay_order_id', payment.order_id)
        .select()
        .single();

      if (txUpdateError || !transaction) {
        console.error('Error updating rent transaction:', txUpdateError);
        return NextResponse.json({ error: 'Failed to update transaction' }, { status: 500 });
      }

      // 2. Fetch related data for PDF
      const { data: hostel } = await supabase.from('hostels').select('*').eq('id', hostel_id).single();
      const { data: tenant } = await supabase.from('tenants').select('*').eq('id', tenant_id).single();

      if (hostel && tenant) {
         // 3. Create Receipt Record
         const receiptNumber = `RCPT-${new Date().getFullYear()}-${new Date().getMonth() + 1}-${Math.floor(1000 + Math.random() * 9000)}`;
         
         const receiptData = {
            receipt_number: receiptNumber,
            transaction_id: transaction.id,
            hostel_name: hostel.name,
            hostel_address: hostel.address || 'Address Not Provided',
            hostel_phone: hostel.phone || 'Phone Not Provided',
            hostel_gstin: hostel.gstin,
            tenant_name: tenant.full_name,
            tenant_phone: tenant.phone,
            tenant_email: tenant.email,
            room_number: transaction.room_number,
            rent_month: transaction.rent_month,
            rent_year: transaction.rent_year,
            amount_paid: transaction.total_amount,
            payment_method: payment.method || 'razorpay',
            razorpay_payment_id: payment.id,
            bank_utr: transaction.bank_utr,
         };

         // Insert receipt metadata first to get ID (though we generate ID on DB)
         const { data: receiptRec, error: receiptError } = await supabase
            .from('payment_receipts')
            .insert(receiptData)
            .select()
            .single();

         if (!receiptError && receiptRec) {
            try {
                // 4. Trigger PDF generator
                const pdfBuffer = await generatePdfReceipt(receiptRec as any);
                
                // 5. Upload to Supabase Storage
                // Assuming a bucket named 'receipts' exists
                const fileName = `${receiptNumber}.pdf`;
                const { error: uploadError } = await supabase
                    .storage
                    .from('receipts')
                    .upload(fileName, pdfBuffer, {
                        contentType: 'application/pdf',
                        upsert: true
                    });

                if (!uploadError) {
                    // Update receipt with URL
                    const { data: urlData } = supabase.storage.from('receipts').getPublicUrl(fileName);
                    
                    await supabase
                        .from('payment_receipts')
                        .update({ pdf_url: urlData.publicUrl })
                        .eq('id', receiptRec.id);
                } else {
                    console.error("Failed to upload PDF:", uploadError);
                }
            } catch (pdfErr) {
                 console.error("PDF generation failed:", pdfErr);
            }
         } else {
             console.error("Failed to insert receipt:", receiptError);
         }
      }
    } else if (payload.event === 'subscription.charged' || payload.event === 'subscription.halted') {
        // Handle owner platform access management
        const subscription = payload.payload.subscription.entity;
        const status = payload.event === 'subscription.charged' ? 'ACTIVE' : 'HALTED';
        
        await supabase
            .from('owner_subscriptions')
            .update({ 
                status: status,
                current_period_end: new Date(subscription.current_end * 1000).toISOString()
            })
            .eq('razorpay_subscription_id', subscription.id);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Webhook processing error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
