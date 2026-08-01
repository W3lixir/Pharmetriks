import Link from 'next/link';
import Icon from '@/components/ui/Icon';
import Pill from '@/components/ui/Pill';
import { requireAdmin, adminService } from '@/lib/admin';
import { APP_PRICE_PHP } from '@/lib/pricing';
import RequestsManager, { type SignupRequestView } from './RequestsManager';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Signup requests · Pharmetriks Admin' };

export default async function AdminRequestsPage() {
  await requireAdmin();
  const svc = adminService();

  // Both still-to-verify (pending) and already-verified (paid) requests — the
  // manager splits them into two sections. Handled/rejected ones drop off.
  const { data: rows } = await svc
    .from('signup_requests')
    .select('id, full_name, pharmacy_name, email, password, receipt_path, payment_reference, status, created_at')
    .in('status', ['pending', 'paid'])
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
        status: (r.status === 'paid' ? 'paid' : 'pending') as 'pending' | 'paid',
        createdAt: r.created_at,
        receiptUrl,
      };
    }),
  );

  const expectedAmount = APP_PRICE_PHP;

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
          I-check ang resibo → i-click ang <strong>Bayad na ✓</strong> kapag tama ang ₱{expectedAmount} →
          tapos <strong>Create account</strong> para gawin ang account nila.
        </p>
      </div>
      <RequestsManager requests={requests} expectedAmount={expectedAmount} />
    </div>
  );
}
