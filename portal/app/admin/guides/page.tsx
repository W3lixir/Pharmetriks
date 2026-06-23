import Link from 'next/link';
import Icon from '@/components/ui/Icon';
import Pill from '@/components/ui/Pill';
import { requireAdmin } from '@/lib/admin';
import { listGuides } from '@/lib/guides';
import GuidesManager from './GuidesManager';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Dispensing guides · Pharmetriks Admin' };

export default async function AdminGuidesPage() {
  await requireAdmin();
  const guides = await listGuides();

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin" className="inline-flex items-center gap-1 text-[12.5px] font-semibold text-ink-2/70 hover:text-ink mb-2">
          <Icon name="arrow-right" size={13} className="rotate-180" /> Balik sa admin
        </Link>
        <Pill tone="blue"><Icon name="help" size={11} /> Dispensing guides</Pill>
        <h1 className="mt-3 text-2xl sm:text-3xl font-extrabold tracking-tight">Gabay sa Dispensing</h1>
        <p className="mt-1 text-[13.5px] font-medium text-ink-2/70">
          Central na gabay — nakikita ng <strong>lahat ng botika</strong> sa kanilang Gabay tab (read-only).
          Ikaw lang ang nag-e-edit dito.
        </p>
        <p className="mt-1 text-[12px] font-semibold text-amber-700">
          ⚠️ Medikal na content — ikaw ang may pananagutan. Hindi kapalit ng doktor/parmasyutiko.
        </p>
      </div>
      <GuidesManager guides={guides} />
    </div>
  );
}
