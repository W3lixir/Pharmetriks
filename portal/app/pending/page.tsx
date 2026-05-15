import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getServerClient } from '@/lib/supabase/server';
import { isCallerAdmin } from '@/lib/admin';
import AuthShell from '@/components/auth/AuthShell';
import HelpButton from '@/components/ui/HelpButton';
import Icon from '@/components/ui/Icon';
import GlassCard from '@/components/ui/GlassCard';
import type { ProfileStatus } from '@/lib/auth';

export const metadata = { title: 'Account status · RXaudit' };
export const dynamic = 'force-dynamic';

export default async function PendingPage() {
  const supabase = getServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('status, pharmacy_name, full_name, receipt_url, license_expires_at, approved_at')
    .eq('id', user.id)
    .maybeSingle();

  const status = (profile?.status ?? 'pending') as ProfileStatus;
  const isAdmin = await isCallerAdmin();

  // Approved → straight to the app (admins also have status='approved' from
  // the seed script). If admin, send them to /admin instead.
  if (status === 'approved') redirect(isAdmin ? '/admin' : '/app');

  // Pending without a receipt → send to upload.
  if (status === 'pending' && !profile?.receipt_url) redirect('/upload-receipt');

  return (
    <>
      <AuthShell
        pill={{
          tone: status === 'rejected' || status === 'revoked' ? 'pink' : 'blue',
          label: humanStatus(status),
        }}
        title={titleFor(status)}
        subtitle={subtitleFor(status, profile?.full_name)}
        width="md"
      >
        <div className="flex flex-col gap-4">
          {status === 'awaiting_payment' && (
            <Timeline
              steps={[
                { label: 'Signed up', done: true },
                { label: 'Receipt uploaded', done: true },
                { label: 'Admin review', done: false, active: true },
                { label: 'Access granted', done: false },
              ]}
            />
          )}

          {status === 'pending' && profile?.receipt_url && (
            <Timeline
              steps={[
                { label: 'Signed up', done: true },
                { label: 'Receipt uploaded', done: true },
                { label: 'Admin review', done: false, active: true },
                { label: 'Access granted', done: false },
              ]}
            />
          )}

          {(status === 'rejected' || status === 'revoked') && (
            <GlassCard className="p-4 bg-red-50/70 border-red-200">
              <p className="text-[13px] font-semibold text-red-800 leading-relaxed">
                {status === 'rejected'
                  ? "Hindi na-approve ang application mo. Possible reasons: hindi mabasa ang receipt, mali ang amount, or hindi tumama ang transaction. Message us — pwede natin ayusin."
                  : "Yung access mo ay na-revoke. Kung sa tingin mo mali ito, message us."}
              </p>
            </GlassCard>
          )}

          <div className="flex flex-col sm:flex-row gap-2">
            {(status === 'pending' || status === 'awaiting_payment') && (
              <Link href="/upload-receipt" className="btn-ghost flex-1 justify-center text-[13.5px]">
                <Icon name="install" size={15} className="rotate-180" />
                {profile?.receipt_url ? 'Re-upload receipt' : 'Upload receipt'}
              </Link>
            )}
            <form action="/logout" method="post" className="flex-1">
              <button className="btn-ghost w-full justify-center text-[13.5px]" type="submit">
                <Icon name="x" size={15} /> Log out
              </button>
            </form>
          </div>

          <p className="text-center text-[12px] text-ink-2/60 font-semibold">
            We email you once approved. Usually a few hours during business time.
          </p>
        </div>
      </AuthShell>
      <HelpButton />
    </>
  );
}

function humanStatus(s: ProfileStatus): string {
  switch (s) {
    case 'pending':          return 'Account created';
    case 'awaiting_payment': return 'Awaiting approval';
    case 'rejected':         return 'Application rejected';
    case 'revoked':          return 'Access revoked';
    default:                 return 'Account status';
  }
}

function titleFor(s: ProfileStatus): React.ReactNode {
  switch (s) {
    case 'awaiting_payment': return <>Hinihintay nating mag-approve.</>;
    case 'pending':          return <>I-upload muna ang receipt.</>;
    case 'rejected':         return <>Hindi na-approve ang application mo.</>;
    case 'revoked':          return <>Na-revoke ang access mo.</>;
    default:                 return <>Account status</>;
  }
}

function subtitleFor(s: ProfileStatus, name?: string | null): string {
  const who = name ? `, ${name.split(' ')[0]}` : '';
  switch (s) {
    case 'awaiting_payment':
      return `Salamat${who}! Receipt mo na-receive na. Within a few hours, ina-approve namin ang account mo.`;
    case 'pending':
      return 'Kailangan mo pang i-upload ang GCash receipt para ma-process ang access.';
    case 'rejected':
      return 'Message us so we can help — usually quick fix lang yan.';
    case 'revoked':
      return 'Kung may tanong ka, message us.';
    default:
      return '';
  }
}

function Timeline({ steps }: { steps: { label: string; done?: boolean; active?: boolean }[] }) {
  return (
    <ol className="grid gap-2.5">
      {steps.map((s, i) => (
        <li
          key={s.label}
          className={`flex items-center gap-3 rounded-[10px] px-3 py-2.5 border ${
            s.active
              ? 'bg-accent/10 border-accent/30'
              : s.done
                ? 'bg-emerald-50/60 border-emerald-200'
                : 'bg-white/55 border-white'
          }`}
        >
          <span
            className={`grid h-6 w-6 place-items-center rounded-full text-[10px] font-extrabold shrink-0 ${
              s.done
                ? 'bg-emerald-500 text-white'
                : s.active
                  ? 'bg-accent text-white'
                  : 'bg-white text-ink-2/60 border border-ink-2/20'
            }`}
          >
            {s.done ? <Icon name="check" size={12} strokeWidth={3} /> : i + 1}
          </span>
          <span className={`text-[13px] font-bold ${s.done ? 'text-emerald-800' : s.active ? 'text-accent' : 'text-ink-2/70'}`}>
            {s.label}
          </span>
          {s.active && (
            <span className="ml-auto inline-flex items-center gap-1 text-[10.5px] font-extrabold uppercase tracking-wider text-accent">
              <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" /> Now
            </span>
          )}
        </li>
      ))}
    </ol>
  );
}
