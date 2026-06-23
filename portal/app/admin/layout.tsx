import Link from 'next/link';
import { requireAdmin, adminService } from '@/lib/admin';
import Icon from '@/components/ui/Icon';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();

  // Pending signup-request count for the nav badge. Guarded so a not-yet-applied
  // 0009 migration (missing table) never breaks the whole admin shell.
  let pendingRequests = 0;
  try {
    const { count } = await adminService()
      .from('signup_requests')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'pending');
    pendingRequests = count ?? 0;
  } catch { /* table may not exist yet */ }
  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-30 backdrop-blur-md bg-white/65 border-b border-white/60">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-[10px] bg-lyna-cta text-white shadow-glass">
              <span className="font-extrabold text-[13px]">Rx</span>
            </span>
            <div className="leading-tight">
              <div className="text-[14.5px] font-extrabold tracking-tight">Pharmetriks</div>
              <div className="text-[10px] font-extrabold uppercase tracking-[1.5px] text-accent">Admin</div>
            </div>
          </Link>

          <div className="hidden sm:flex items-center gap-2 text-[12px] font-semibold text-ink-2/70">
            <Icon name="lock" size={13} className="text-accent" /> {admin.email}
          </div>

          <div className="flex items-center gap-2">
            <Link href="/admin/requests" className="relative hidden sm:inline-flex btn-ghost text-[12.5px] px-3 py-2">
              <Icon name="gcash" size={13} /> Requests
              {pendingRequests > 0 && (
                <span className="absolute -top-1.5 -right-1.5 grid h-5 min-w-[20px] place-items-center rounded-full bg-red-500 px-1 text-[10px] font-extrabold text-white">
                  {pendingRequests}
                </span>
              )}
            </Link>
            <Link href="/admin/guides" className="hidden sm:inline-flex btn-ghost text-[12.5px] px-3 py-2">
              <Icon name="help" size={13} /> Gabay
            </Link>
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
