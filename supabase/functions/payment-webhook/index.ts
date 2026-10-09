import { createClient } from 'npm:@supabase/supabase-js@2.58.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false },
    });

    const rawBody = await req.text();
    const provider = req.headers.get('x-payment-provider') || 'razorpay';
    const secretName = provider === 'stripe' ? 'STRIPE_WEBHOOK_SECRET' : 'RAZORPAY_WEBHOOK_SECRET';
    const webhookSecret = Deno.env.get(secretName);
    const signature = provider === 'stripe'
      ? req.headers.get('stripe-signature')
      : req.headers.get('x-razorpay-signature');

    if (!webhookSecret || !signature) {
      return new Response(JSON.stringify({ error: 'Webhook verification is not configured' }), {
        status: 503,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(webhookSecret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign'],
    );
    const signedPayload = provider === 'stripe'
      ? signature.split(',').find((part) => part.startsWith('t='))?.slice(2) + '.' + rawBody
      : rawBody;
    const digest = await crypto.subtle.sign('HMAC', key, encoder.encode(signedPayload));
    const expectedSignature = Array.from(new Uint8Array(digest))
      .map((byte) => byte.toString(16).padStart(2, '0'))
      .join('');
    const suppliedSignature = provider === 'stripe'
      ? signature.split(',').find((part) => part.startsWith('v1='))?.slice(3)
      : signature;

    if (provider === 'stripe') {
      const timestamp = Number(signature.split(',').find((part) => part.startsWith('t='))?.slice(2));
      if (!Number.isFinite(timestamp) || Math.abs(Date.now() / 1000 - timestamp) > 300) {
        return new Response(JSON.stringify({ error: 'Expired webhook signature' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    if (!suppliedSignature || suppliedSignature !== expectedSignature) {
      return new Response(JSON.stringify({ error: 'Invalid webhook signature' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = JSON.parse(rawBody);
    const event = body.event || body.type;
    const payload = body.payload || body.data;

    if (!event) {
      return new Response(JSON.stringify({ error: 'Missing event type' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let invoiceId: string | null = null;
    let amount: number = 0;
    let transactionId: string | null = null;

    if (provider === 'razorpay') {
      if (event === 'payment.captured' || event === 'payment.authorized') {
        const payment = payload?.payment?.entity || payload?.payment || payload;
        invoiceId = payment?.notes?.invoice_id || null;
        amount = (payment?.amount || 0) / 100;
        transactionId = payment?.id || null;
      }
    } else if (provider === 'stripe') {
      if (event === 'payment_intent.succeeded' || event === 'checkout.session.completed') {
        const data = payload?.object || payload;
        invoiceId = data?.metadata?.invoice_id || null;
        amount = (data?.amount_total || data?.amount || 0) / 100;
        transactionId = data?.id || null;
      }
    }

    if (!invoiceId || !transactionId || !Number.isFinite(amount) || amount <= 0) {
      return new Response(JSON.stringify({ error: 'Invalid payment payload' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: invoice, error: invError } = await supabase
      .from('invoices')
      .select('*')
      .eq('id', invoiceId)
      .maybeSingle();

    if (invError || !invoice) {
      return new Response(JSON.stringify({ error: 'Invoice not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: duplicatePayment } = await supabase
      .from('payments')
      .select('id')
      .eq('transaction_id', transactionId)
      .maybeSingle();

    if (duplicatePayment) {
      return new Response(JSON.stringify({ success: true, duplicate: true, invoice_id: invoice.id }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const remaining = Number(invoice.amount) - Number(invoice.amount_paid);
    if (amount > remaining) {
      return new Response(JSON.stringify({ error: 'Payment exceeds invoice balance' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { error: payError } = await supabase.from('payments').insert({
      invoice_id: invoice.id,
      tenant_id: invoice.tenant_id,
      hostel_id: invoice.hostel_id,
      amount,
      method: provider,
      status: 'completed',
      transaction_id: transactionId,
    });

    if (payError) throw payError;

    const newPaid = Number(invoice.amount_paid) + amount;
    const newStatus = newPaid >= Number(invoice.amount) ? 'paid' : 'partial';

    const { error: updateError } = await supabase
      .from('invoices')
      .update({ amount_paid: newPaid, status: newStatus })
      .eq('id', invoice.id);

    if (updateError) throw updateError;

    return new Response(JSON.stringify({
      success: true,
      invoice_id: invoice.id,
      amount,
      new_status: newStatus,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
