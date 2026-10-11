import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';
import { supabase } from '@/lib/supabase/client';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { tenantId, hostelId, tenantData } = body;

    if (!tenantId && !tenantData) {
      return NextResponse.json({ error: 'tenantId or tenantData is required' }, { status: 400 });
    }

    // 1. Fetch tenant details (or use passed tenantData)
    let tenant: any = tenantData || null;
    if (!tenant && tenantId) {
      const { data, error: tenantErr } = await supabase
        .from('tenants')
        .select('*')
        .eq('id', tenantId)
        .single();

      if (tenantErr || !data) {
        console.error('Error fetching tenant for onboarding email:', tenantErr);
        return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
      }
      tenant = data;
    }

    if (!tenant || !tenant.email) {
      return NextResponse.json({ error: 'Tenant does not have an email address' }, { status: 400 });
    }

    // 2. Fetch assigned bed and room if available
    let roomDisplay = 'Allocated Bed';
    let roomType = 'Standard';
    if (tenant.assigned_bed_id) {
      const { data: bed } = await supabase
        .from('beds')
        .select('*, room:rooms(*)')
        .eq('id', tenant.assigned_bed_id)
        .single();
      
      if (bed) {
        const room = bed.room as any;
        if (room?.room_number) {
          roomDisplay = `Room #${room.room_number} (Bed ${bed.bed_label || 'A'})`;
          roomType = room.room_type || 'Standard';
        }
      }
    }

    // 3. Fetch hostel details
    const targetHostelId = hostelId || tenant.hostel_id;
    const { data: hostel } = await supabase
      .from('hostels')
      .select('*')
      .eq('id', targetHostelId)
      .single();

    const hostelName = hostel?.name || 'Kupera Hostel';
    const hostelAddress = hostel?.address || 'Hostel Campus';
    const hostelPhone = hostel?.phone || 'Manager Office';

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const portalUrl = `${baseUrl}/tenant/view/${tenant.id}`;

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to ${hostelName}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 24px; color: #0f172a; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 18px; overflow: hidden; box-shadow: 0 12px 30px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; }
    .header { background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 36px 28px; text-align: center; color: #ffffff; }
    .header h1 { margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.5px; }
    .header p { margin: 8px 0 0; opacity: 0.92; font-size: 15px; }
    .body { padding: 32px 28px; }
    .badge { display: inline-block; padding: 6px 14px; border-radius: 9999px; background: #ecfdf5; color: #047857; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 20px; }
    .section-title { font-size: 13px; font-weight: 700; text-transform: uppercase; color: #64748b; letter-spacing: 0.5px; margin: 24px 0 12px; border-bottom: 1px solid #f1f5f9; padding-bottom: 6px; }
    .table-details { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    .table-details td { padding: 10px 0; border-bottom: 1px solid #f8fafc; font-size: 14px; }
    .table-details td.label { color: #64748b; font-weight: 500; width: 45%; }
    .table-details td.val { color: #0f172a; font-weight: 700; text-align: right; }
    .highlight-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 18px; margin: 20px 0; }
    .btn-portal { display: block; text-align: center; background: #4f46e5; color: #ffffff !important; text-decoration: none; padding: 16px 24px; border-radius: 12px; font-weight: 700; font-size: 15px; margin: 28px 0 12px; box-shadow: 0 4px 14px rgba(79, 70, 229, 0.3); }
    .notice { font-size: 12px; color: #64748b; line-height: 1.5; text-align: center; margin: 0; }
    .footer { padding: 24px 28px; background: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center; font-size: 12px; color: #94a3b8; line-height: 1.6; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Welcome to ${hostelName}! 🏠</h1>
      <p>Your tenant onboarding is officially confirmed.</p>
    </div>
    <div class="body">
      <div class="badge">Active Resident</div>
      
      <p style="font-size: 17px; font-weight: 600; margin: 0 0 10px;">Hello ${tenant.full_name},</p>
      <p style="font-size: 14px; color: #475569; line-height: 1.6; margin: 0 0 20px;">
        You have been successfully onboarded as a resident at <strong>${hostelName}</strong>. Below are your official accommodation and billing details:
      </p>

      <div class="section-title">Accommodation & Allocation</div>
      <table class="table-details">
        <tr>
          <td class="label">Assigned Bed</td>
          <td class="val" style="color: #4f46e5;">${roomDisplay}</td>
        </tr>
        <tr>
          <td class="label">Room Type</td>
          <td class="val">${roomType}</td>
        </tr>
        <tr>
          <td class="label">Primary Phone</td>
          <td class="val">${tenant.phone}</td>
        </tr>
        <tr>
          <td class="label">Hostel Address</td>
          <td class="val" style="font-size: 12px; max-width: 200px;">${hostelAddress}</td>
        </tr>
      </table>

      <div class="section-title">Rent & Billing Schedule</div>
      <div class="highlight-card">
        <table class="table-details" style="margin: 0;">
          <tr>
            <td class="label">Monthly Rent</td>
            <td class="val" style="font-size: 18px; color: #0f172a;">₹${Number(tenant.monthly_rent || 0).toLocaleString('en-IN')}</td>
          </tr>
          <tr>
            <td class="label">Advance / Security Deposit</td>
            <td class="val">₹${Number(tenant.security_deposit || 0).toLocaleString('en-IN')}</td>
          </tr>
          <tr>
            <td class="label">Monthly Rent Due Date</td>
            <td class="val" style="color: #d97706;">Day ${tenant.rent_due_day || 1} of every month</td>
          </tr>
          <tr>
            <td class="label">Agreement Start</td>
            <td class="val">${tenant.agreement_start ? new Date(tenant.agreement_start).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Joining date'}</td>
          </tr>
        </table>
      </div>

      <a href="${portalUrl}" class="btn-portal">
        View My Resident Profile & Rent History →
      </a>
      
      <p class="notice">
        🔒 <strong>Read-Only Notice:</strong> This personal resident portal allows you to review your verified details, track payment due dates, and view your monthly rent payment history. For any updates, please consult your hostel manager.
      </p>
    </div>

    <div class="footer">
      <p style="margin: 0; font-weight: 600; color: #64748b;">${hostelName} • Managed on Kupera</p>
      <p style="margin: 4px 0 0;">Helpline: ${hostelPhone} | Generated securely via Kupera System</p>
      <p style="margin: 8px 0 0; font-size: 11px;">Direct Portal URL: <a href="${portalUrl}" style="color: #4f46e5;">${portalUrl}</a></p>
    </div>
  </div>
</body>
</html>
    `;

    const sendRes = await sendEmail({
      to: tenant.email,
      hostelName: hostelName,
      subject: `[${hostelName}] Welcome! Your Resident Details & Rent Schedule`,
      body: `Hello ${tenant.full_name}, You have been successfully onboarded at ${hostelName}. Assigned Room: ${roomDisplay}. Monthly Rent: ₹${tenant.monthly_rent}. Rent Due Date: Day ${tenant.rent_due_day} of every month. View your details and payment history here: ${portalUrl}`,
      html: htmlContent,
    });

    return NextResponse.json({
      success: true,
      portalUrl,
      emailSent: sendRes.success,
      messageId: sendRes.messageId,
      error: sendRes.error,
    });
  } catch (error: any) {
    console.error('Error sending onboarding email:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
