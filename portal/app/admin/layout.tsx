import Link from 'next/link';
import { requireAdmin } from '@/lib/admin';
import Icon from '@/components/ui/Icon';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-30 backdrop-blur-md bg-white/65 border-b border-white/60">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-[10px] bg-lyna-cta text-white shadow-glass">
              <span className="font-extrabold text-[13px]">Rx</span>
            </span>
            <div className="leading-tight">
              <div className="text-[14.5px] font-extrabold tracking-tight">RXaudit</div>
              <div className="text-[10px] font-extrabold uppercase tracking-[1.5px] text-accent">Admin</div>
            </div>
          </Link>

          <div className="hidden sm:flex items-center gap-2 text-[12px] font-semibold text-ink-2/70">
            <Icon name="lock" size={13} className="text-accent" /> {admin.email}
          </div>

          <div className="flex items-center gap-2">
            <Link href="/app" className="hidden sm:inline-flex btn-ghost text-[12.5px] px-3 py-2">
              <Icon name="phone" size={13} /> App
            </Link>
            <form action="/logout" method="post">
              <button type="submit" className="btn-ghost text-[12.5px] px-3 py-2">
                <Icon name="x" size={13} /> Log out
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 sm:px-6 py-6 sm:py-10">{children}</main>
    </div>
  );
}
