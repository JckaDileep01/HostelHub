import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import { sendEmail } from '@/lib/email'; // We will create this utility

export async function GET(request: Request) {
  // Add authentication or cron secret check in production
  
  try {
    const { data: subscriptions, error } = await supabase
      .from('owner_subscriptions')
      .select('*, profile:profiles(email, full_name)')
      .in('status', ['ACTIVE']);

    if (error) {
      console.error('Error fetching subscriptions:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const now = new Date();
    let expiredCount = 0;
    let warningCount = 0;

    for (const sub of subscriptions || []) {
      if (!sub.current_period_end) continue;
      
      const expiryDate = new Date(sub.current_period_end);
      const diffTime = expiryDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays <= 0) {
        // Expired! Update status and immediately enforce lockout
        await supabase
          .from('owner_subscriptions')
          .update({ status: 'EXPIRED' })
          .eq('id', sub.id);
        
        // Notify owner
        if (sub.profile?.email) {
            await sendEmail({
                to: sub.profile.email,
                subject: 'HostelHub Premium Expired',
                body: `Dear ${sub.profile.full_name},\n\nYour HostelHub Premium Subscription has expired. Operations are temporarily suspended. Pay ₹599 to instantly enable all services.\n\nRenew now on your dashboard.`
            });
        }
        expiredCount++;
      } else if ([1, 2, 3].includes(diffDays)) {
        // Send warning
        if (sub.profile?.email) {
            await sendEmail({
                to: sub.profile.email,
                subject: `Action Required: HostelHub Premium expires in ${diffDays} day(s)`,
                body: `Dear ${sub.profile.full_name},\n\nYour HostelHub Premium Subscription is expiring on ${expiryDate.toDateString()}. Renew now to avoid service interruption.\n\nThank you!`
            });
        }
        warningCount++;
      }
    }

    return NextResponse.json({ success: true, expiredCount, warningCount });

  } catch (err: any) {
    console.error('Cron Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
