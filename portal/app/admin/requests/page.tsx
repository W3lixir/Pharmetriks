import Link from 'next/link';
import Icon from '@/components/ui/Icon';
import Pill from '@/components/ui/Pill';
import { requireAdmin, adminService } from '@/lib/admin';
import RequestsManager, { type SignupRequestView } from './RequestsManager';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Signup requests · Pharmetriks Admin' };

export default async function AdminRequestsPage() {
  await requireAdmin();
  const svc = adminService();

  const { data: rows } = await svc
    .from('signup_requests')
    .select('id, full_name, pharmacy_name, email, password, receipt_path, payment_reference, created_at')
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  const requests: SignupRequestView[] = await Promise.all(
    (rows ?? []).map(async r => {
      let receiptUrl: string | null = null;
      if (r.receipt_path) {
        const { data } = await svc.storage.from('receipts').createSignedUrl(r.receipt_path, 3600);
        receiptUrl = data?.signedUrl ?? null;
      }
      return {
        id: r.id,
        fullName: r.full_name,
        pharmacyName: r.pharmacy_name,
        email: r.email,
        password: r.password ?? '',
        paymentReference: r.payment_reference ?? '',
        createdAt: r.created_at,
        receiptUrl,
      };
    }),
  );

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin" className="inline-flex items-center gap-1 text-[12.5px] font-semibold text-ink-2/70 hover:text-ink mb-2">
          <Icon name="arrow-right" size={13} className="rotate-180" /> Balik sa admin
        </Link>
        <Pill tone="blue"><Icon name="gcash" size={11} /> Signup requests</Pill>
        <h1 className="mt-3 text-2xl sm:text-3xl font-extrabold tracking-tight">
          Mga Signup Request{requests.length ? ` (${requests.length})` : ''}
        </h1>
        <p className="mt-1 text-[13.5px] font-medium text-ink-2/70">
          I-review ang resibo, tapos i-click ang <strong>Create account</strong> — gagawin ang account
          gamit ang email at password na inilagay nila (alam mo na rin agad).
        </p>
      </div>
      <RequestsManager requests={requests} />
    </div>
  );
}
