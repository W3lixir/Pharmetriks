import { existsSync } from 'node:fs';
import path from 'node:path';
import { redirect } from 'next/navigation';
import { getServerClient } from '@/lib/supabase/server';
import AuthShell from '@/components/auth/AuthShell';
import HelpButton from '@/components/ui/HelpButton';
import Icon from '@/components/ui/Icon';
import CheckoutClient from './CheckoutClient';
import type { ProfileStatus } from '@/lib/auth';
import type { FeatureMap } from '@/lib/features';

export const metadata = { title: 'Upload receipt · Pharmetriks' };
export const dynamic = 'force-dynamic';

// At render time, check portal/public/img/ for a real GCash QR file.
// Order of preference: gcash-qr.png → .jpg → .jpeg → .webp → placeholder.
const QR_CANDIDATES = ['gcash-qr.png', 'gcash-qr.jpg', 'gcash-qr.jpeg', 'gcash-qr.webp'] as const;

function resolveQrSrc(): { src: string; isReal: boolean } {
  const dir = path.join(process.cwd(), 'public', 'img');
  for (const f of QR_CANDIDATES) {
    if (existsSync(path.join(dir, f))) {
      return { src: `/img/${f}`, isReal: true };
    }
  }
  return { src: '/img/gcash-qr-placeholder.svg', isReal: false };
}

export default async function UploadReceiptPage({
  searchParams,
}: {
  searchParams?: { submitted?: string };
}) {
  const supabase = getServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('status, full_name, features, requested_features')
    .eq('id', user.id)
    .maybeSingle();

  const status = (profile?.status ?? 'pending') as ProfileStatus;
  const mode: 'new' | 'upgrade' = status === 'approved' ? 'upgrade' : 'new';

  const gcashNumber = process.env.NEXT_PUBLIC_GCASH_NUMBER || '+63 991 381 ••••';
  const gcashName   = process.env.NEXT_PUBLIC_GCASH_NAME   || 'KA*L TR****N O.';
  const { src: qrSrc, isReal: isRealQr } = resolveQrSrc();

  const greeting = profile?.full_name?.split(' ')[0];
  const granted   = (profile?.features ?? {}) as FeatureMap;
  const requested = (profile?.requested_features ?? {}) as FeatureMap;
  const justSubmitted = searchParams?.submitted === '1';

  return (
    <>
      <AuthShell
        pill={
          mode === 'upgrade'
            ? { tone: 'blue', label: 'Mag-add ng add-ons' }
            : { tone: 'pink', label: 'Step 2: Submit your receipt' }
        }
        title={
          mode === 'upgrade'
            ? 'Mag-add ng add-ons'
            : greeting ? `Salamat, ${greeting}!` : 'Salamat sa pag-signup!'
        }
        subtitle={
          mode === 'upgrade'
            ? 'Bayaran lang ang bagong add-ons — piliin sa baba, magbayad via GCash, tapos i-upload ang screenshot.'
            : 'Piliin ang add-ons na gusto mo (optional), magbayad via GCash, tapos i-upload ang screenshot dito.'
        }
        width="lg"
      >
        {justSubmitted && (
          <div className="mb-5 flex items-start gap-2.5 rounded-glass border border-emerald-200 bg-emerald-50/80 px-4 py-3 text-[13px] font-semibold text-emerald-900">
            <Icon name="check" size={16} className="mt-0.5 shrink-0" />
            <span>
              Na-submit na ang request mo! Ia-apply namin ang bagong add-ons
              after ma-verify ang bayad — usually within a few hours. Tuloy ka
              lang gumamit ng app habang hinihintay.
            </span>
          </div>
        )}
        <CheckoutClient
          qrSrc={qrSrc}
          isRealQr={isRealQr}
          gcashNumber={gcashNumber}
          gcashName={gcashName}
          mode={mode}
          granted={granted}
          initialSelected={requested}
        />
      </AuthShell>
      <HelpButton />
    </>
  );
}
