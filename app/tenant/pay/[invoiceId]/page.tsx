import { createServerClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { TenantPaymentClient } from './TenantPaymentClient';

export default async function TenantPayPage({ params }: { params: { invoiceId: string } }) {
  const supabase = createServerClient();
  // 1. Fetch invoice details
  const { data: invoice, error } = await supabase
    .from('invoices')
    .select('*, tenant:tenants(*), hostel:hostels(*)')
    .eq('id', params.invoiceId)
    .single();

  if (error || !invoice) {
    return notFound();
  }

  // 2. Render Payment Client
  return (
    <TenantPaymentClient invoice={invoice} />
  );
}
