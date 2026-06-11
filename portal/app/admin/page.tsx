import Link from 'next/link';
import { adminService, requireAdmin } from '@/lib/admin';
import Icon from '@/components/ui/Icon';
import Pill from '@/components/ui/Pill';
import GlassCard from '@/components/ui/GlassCard';
import UserRow from './UserRow';
import type { ProfileStatus } from '@/lib/auth';

export const metadata = { title: 'Admin · Pharmetriks' };
export const dynamic = 'force-dynamic';

type Search = { filter?: string; q?: string };

const FILTERS = [
  { id: 'all',              label: 'All' },
  { id: 'awaiting_payment', label: 'Awaiting review' },
  { id: 'pending',          label: 'Pending' },
  { id: 'approved',         label: 'Approved' },
  { id: 'rejected',         label: 'Rejected' },
  { id: 'revoked',          label: 'Revoked' },
] as const;

type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  pharmacy_name: string | null;
  status: ProfileStatus;
  receipt_url: string | null;
  payment_reference: string | null;
  approved_at: string | null;
  notes: string | null;
  created_at: string;
  features: Record<string, boolean> | null;
  requested_features: Record<string, boolean> | null;
};

export default async function AdminDashboard({ searchParams }: { searchParams: Search }) {
  // Gate here (Node runtime) — the edge middleware that used to do this was
  // removed because it crashed on Vercel (see app/app/route.ts for why).
  await requireAdmin();

  const filter = (searchParams.filter ?? 'awaiting_payment') as typeof FILTERS[number]['id'];
  const query  = (searchParams.q ?? '').trim();

  const svc = adminService();
  let qb = svc
    .from('profiles')
    .select('id, email, full_name, pharmacy_name, status, receipt_url, payment_reference, approved_at, notes, created_at, features, requested_features')
    .order('created_at', { ascending: false })
    .limit(200);

  if (filter !== 'all') qb = qb.eq('status', filter);
  if (query) {
    qb = qb.or(
      `email.ilike.%${query}%,full_name.ilike.%${query}%,pharmacy_name.ilike.%${query}%`,
    );
  }

  const { data: rows, error } = await qb;
  const profiles = (rows ?? []) as Profile[];

  // ── Counts per status for the filter pills ────────────────────────────
  const { data: counts } = await svc
    .from('profiles')
    .select('status', { count: 'exact', head: false });
  const countsByStatus: Record<string, number> = {};
  (counts ?? []).forEach((r: { status: string | null }) => {
    if (r.status) countsByStatus[r.status] = (countsByStatus[r.status] ?? 0) + 1;
  });
  const total = (counts ?? []).length;

  return (
    <div className="space-y-6">
      <div>
        <Pill tone="blue">
          <Icon name="shield" size={11} /> Admin dashboard
        </Pill>
        <h1 className="mt-3 text-2xl sm:text-3xl font-extrabold tracking-tight">User approvals</h1>
        <p className="mt-1 text-[13.5px] font-medium text-ink-2/70">
          Manage signups, review GCash receipts, approve or reject access.
        </p>
      </div>

      {/* Filters */}
      <GlassCard className="p-3 sm:p-4">
        <div className="flex flex-wrap items-center gap-2">
          {FILTERS.map(f => {
            const isActive = filter === f.id;
            const count = f.id === 'all' ? total : countsByStatus[f.id] ?? 0;
            const params = new URLSearchParams();
            if (f.id !== 'awaiting_payment') params.set('filter', f.id);
            if (query) params.set('q', query);
            const href = params.size ? `/admin?${params}` : '/admin';
            return (
              <Link
                key={f.id}
                href={href}
                className={`inline-flex items-center gap-1.5 rounded-[10px] border px-3 py-1.5 text-[12.5px] font-bold transition ${
                  isActive
                    ? 'bg-lyna-cta border-transparent text-white shadow-glass'
                    : 'bg-white/70 border-white text-ink-2 hover:bg-white'
                }`}
              >
                {f.label}
                <span className={`rounded-full px-1.5 text-[10px] font-extrabold ${isActive ? 'bg-white/25 text-white' : 'bg-ink-2/10 text-ink-2/70'}`}>
                  {count}
                </span>
              </Link>
            );
          })}
        </div>

        <form action="/admin" method="get" className="mt-3 flex gap-2">
          <input type="hidden" name="filter" value={filter} />
          <div className="relative flex-1">
            <Icon name="search" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-2/50" />
            <input
              type="search"
              name="q"
              defaultValue={query}
              placeholder="Search by email, name, or pharmacy…"
              className="input pl-10"
            />
          </div>
          <button type="submit" className="btn-ghost text-[13px]">Search</button>
          {query && (
            <Link
              href={filter === 'awaiting_payment' ? '/admin' : `/admin?filter=${filter}`}
              className="btn-ghost text-[13px]"
            >
              Clear
            </Link>
          )}
        </form>
      </GlassCard>

      {error && (
        <GlassCard className="p-4 bg-red-50/80 border-red-200">
          <p className="text-[13px] font-semibold text-red-800">Error loading users: {error.message}</p>
        </GlassCard>
      )}

      {profiles.length === 0 ? (
        <GlassCard className="p-10 text-center">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-accent/10 text-accent">
            <Icon name="check" size={24} strokeWidth={2.6} />
          </div>
          <p className="mt-3 text-[14px] font-bold text-ink">No users in this view.</p>
          <p className="text-[12.5px] font-medium text-ink-2/70">Try another filter or clear search.</p>
        </GlassCard>
      ) : (
        <div className="space-y-3">
          {profiles.map(p => (
            <UserRow key={p.id} profile={p} />
          ))}
        </div>
      )}
    </div>
  );
}
