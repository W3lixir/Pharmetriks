import { redirect } from 'next/navigation';
import { getServerClient } from '@/lib/supabase/server';
import AuthShell from '@/components/auth/AuthShell';
import HelpButton from '@/components/ui/HelpButton';
import GcashCard from './GcashCard';
import UploadForm from './UploadForm';
import type { ProfileStatus } from '@/lib/auth';

export const metadata = { title: 'Upload receipt · RXaudit' };
export const dynamic = 'force-dynamic';

export default async function UploadReceiptPage() {
  const supabase = getServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('status, full_name')
    .eq('id', user.id)
    .maybeSingle();

  const status = (profile?.status ?? 'pending') as ProfileStatus;
  if (status === 'approved') redirect('/app');

  const amount      = `₱${process.env.NEXT_PUBLIC_APP_PRICE_PHP || '249'}`;
  const gcashNumber = process.env.NEXT_PUBLIC_GCASH_NUMBER || '+63 991 381 ••••';
  const gcashName   = process.env.NEXT_PUBLIC_GCASH_NAME   || 'KA*L TR****N O.';

  const greeting = profile?.full_name?.split(' ')[0];

  return (
    <>
      <AuthShell
        pill={{ tone: 'pink', label: 'Step 2: Submit your receipt' }}
        title={greeting ? `Salamat, ${greeting}!` : 'Salamat sa pag-signup!'}
        subtitle="Magbayad muna via GCash, tapos i-upload ang screenshot dito."
        width="lg"
      >
        <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
          <GcashCard amount={amount} gcashNumber={gcashNumber} gcashName={gcashName} />
          <div>
            <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-2.5 py-1 text-[10.5px] font-extrabold uppercase tracking-wider text-accent">
              Step 2 of 2
            </div>
            <UploadForm />
          </div>
        </div>
      </AuthShell>
      <HelpButton />
    </>
  );
}
