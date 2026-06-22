import Link from 'next/link';
import Icon from '@/components/ui/Icon';
import { requireAdmin, adminService } from '@/lib/admin';
import { buildReportModel, peso, isoDate, type ReportData, type Product } from '@/lib/report-model';
import PrintButton from './PrintButton';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'User report · Pharmetriks Admin' };

const nameOf = (p: Product) =>
  (p.brand_name || p.generic_name || 'Item') + (p.dosage && p.dosage !== 'N/A' ? ' ' + p.dosage : '');

function Delta({ p }: { p: number }) {
  if (p === 0) return <span className="text-ink-2/40">—</span>;
  return p > 0
    ? <span className="text-emerald-600 font-bold">▲ {p}%</span>
    : <span className="text-red-600 font-bold">▼ {Math.abs(p)}%</span>;
}

export default async function UserReportPage({ params }: { params: { userId: string } }) {
  await requireAdmin();
  const svc = adminService();
  const userId = params.userId;

  const { data: profile } = await svc
    .from('profiles')
    .select('email, pharmacy_name, full_name, status')
    .eq('id', userId)
    .maybeSingle();

  const { data: rows } = await svc
    .from('user_data')
    .select('collection, items, updated_at')
    .eq('user_id', userId)
    .in('collection', ['inv', 'sales', 'exp']);

  const byCol: Record<string, unknown[]> = { inv: [], sales: [], exp: [] };
  let lastSync = '';
  (rows ?? []).forEach((r: { collection: string; items: unknown; updated_at: string }) => {
    byCol[r.collection] = Array.isArray(r.items) ? r.items : [];
    if (r.updated_at > lastSync) lastSync = r.updated_at;
  });

  const data: ReportData = {
    inventory: byCol.inv as ReportData['inventory'],
    sales: byCol.sales as ReportData['sales'],
    expenses: byCol.exp as ReportData['expenses'],
  };
  const hasData = data.inventory.length + data.sales.length + data.expenses.length > 0;
  const shop = profile?.pharmacy_name || 'Botika';
  const today = isoDate(new Date());
  const m = buildReportModel(data, today, shop);

  const kpi = (label: string, value: string, sub?: React.ReactNode, tone = '#0033FF') => (
    <div className="rounded-[12px] border border-white/70 bg-white/70 p-3">
      <div className="text-[10px] font-extrabold uppercase tracking-wider" style={{ color: tone }}>{label}</div>
      <div className="mt-0.5 text-[20px] font-extrabold text-ink">{value}</div>
      {sub && <div className="text-[11px] font-semibold text-ink-2/60 mt-0.5">{sub}</div>}
    </div>
  );

  const maxBar = Math.max(...m.days7.map(d => d.value), 1);

  return (
    <div className="space-y-4">
      {/* print rules + toolbar (hidden when printing) */}
      <style>{`@media print {
        header { display: none !important; }
        main { padding: 0 !important; max-width: none !important; }
        .no-print { display: none !important; }
        body { background: #fff !important; }
        .rep-sheet { box-shadow: none !important; border: none !important; }
      }`}</style>

      <div className="no-print flex items-center justify-between gap-3">
        <Link href="/admin" className="inline-flex items-center gap-1 text-[12.5px] font-semibold text-ink-2/70 hover:text-ink">
          <Icon name="arrow-right" size={13} className="rotate-180" /> Balik sa admin
        </Link>
        <PrintButton />
      </div>

      <div className="rep-sheet rounded-[16px] border border-white/70 bg-white/80 backdrop-blur-md p-5 sm:p-7 shadow-glass">
        {/* header */}
        <div className="flex items-center justify-between border-b-2 border-ink-2/10 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-[10px] bg-lyna-cta text-white font-extrabold text-[15px]">Rx</span>
            <div>
              <div className="text-[16px] font-extrabold tracking-tight">{shop}</div>
              <div className="text-[10px] font-extrabold uppercase tracking-[1.5px] text-accent">Pharmetriks · Daily Report</div>
            </div>
          </div>
          <div className="text-right text-[11px] text-ink-2/60">
            <div className="text-[18px] font-extrabold text-accent tracking-wide">DAILY REPORT</div>
            <div>{new Date(today + 'T00:00:00').toLocaleDateString('en-PH', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</div>
            <div className="text-ink-2/45">{profile?.email}</div>
          </div>
        </div>

        {!hasData ? (
          <div className="py-10 text-center">
            <p className="text-[14px] font-bold text-ink">Walang naka-sync na data.</p>
            <p className="mt-1 text-[12.5px] font-medium text-ink-2/60">
              Wala pang na-sync na inventory/sales sa cloud ang user na ito. Kailangan nilang may aktibong
              <strong> Cloud Sync</strong> add-on at mag-sync man lang minsan.
            </p>
          </div>
        ) : (
          <>
            {/* money line */}
            <div className="mt-4 grid gap-2.5 grid-cols-2 sm:grid-cols-4">
              {kpi("Today's Sales", peso(m.sales), <><Delta p={m.salesVsPrev} /> vs kahapon</>)}
              {kpi('Est. Profit', peso(m.profit), `Margin ${m.margin.toFixed(1)}%`, '#16a34a')}
              {kpi('Transactions', String(m.tx), <><Delta p={m.txVsPrev} /> vs kahapon</>, '#4f46e5')}
              {kpi('Products', String(m.productCount), `Halaga: ${peso(m.totalVal)}`, '#a21caf')}
            </div>

            {/* P&L (month) */}
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="rounded-[12px] border border-white/70 bg-white/60 p-4">
                <div className="text-[11px] font-extrabold uppercase tracking-wider text-accent mb-2">Monthly P&amp;L ({today.slice(0, 7)})</div>
                {[
                  ['Net Sales', peso(m.month.net), 'text-ink'],
                  ['− COGS', peso(m.month.cogs), 'text-ink-2/70'],
                  ['= Gross Profit', peso(m.month.grossProfit), m.month.grossProfit < 0 ? 'text-red-600 font-bold' : 'text-emerald-600 font-bold'],
                  ['− OPEX', peso(m.month.opex), 'text-ink-2/70'],
                  ['= Net Profit', peso(m.month.netProfit), m.month.netProfit < 0 ? 'text-red-600 font-extrabold' : 'text-emerald-600 font-extrabold'],
                ].map(([l, v, cls]) => (
                  <div key={l} className="flex justify-between py-1 text-[12.5px] border-b border-ink-2/5 last:border-0">
                    <span className="text-ink-2/70">{l}</span><span className={`font-mono ${cls}`}>{v}</span>
                  </div>
                ))}
                <div className="mt-1.5 text-[11px] text-ink-2/50">Margin: {m.month.margin.toFixed(1)}% · {m.month.txCount} transactions</div>
              </div>

              {/* sales 7-day */}
              <div className="rounded-[12px] border border-white/70 bg-white/60 p-4">
                <div className="text-[11px] font-extrabold uppercase tracking-wider text-accent mb-2">Sales (7 araw)</div>
                <div className="flex items-end gap-1.5 h-[120px]">
                  {m.days7.map((d, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center justify-end gap-1">
                      <div
                        className="w-full rounded-t"
                        style={{ height: `${Math.max((d.value / maxBar) * 96, 2)}px`, background: i === m.days7.length - 1 ? '#0033FF' : '#c7d2fe' }}
                        title={peso(d.value)}
                      />
                      <span className="text-[9px] text-ink-2/50">{d.label}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-2 flex justify-between text-[11px] text-ink-2/60">
                  <span>Ngayon: <b className="text-accent">{peso(m.sales)}</b></span>
                  <span>Week avg: <b>{peso(m.weekAvg)}</b></span>
                </div>
              </div>
            </div>

            {/* action items */}
            <div className="mt-4 grid gap-2.5 sm:grid-cols-3">
              <div className="rounded-[12px] border border-red-200 bg-red-50/60 p-3">
                <div className="text-[10px] font-extrabold uppercase text-red-600">Expiry risk</div>
                <div className="text-[18px] font-extrabold text-ink mt-0.5">{m.expired.length + m.near.length} item</div>
                <div className="text-[11px] text-ink-2/60">Panganib: {peso(m.expiryLoss)}</div>
              </div>
              <div className="rounded-[12px] border border-amber-200 bg-amber-50/60 p-3">
                <div className="text-[10px] font-extrabold uppercase text-amber-700">Restock</div>
                <div className="text-[18px] font-extrabold text-ink mt-0.5">{m.low.length + m.out.length} item</div>
                <div className="text-[11px] text-ink-2/60">Low / out of stock</div>
              </div>
              <div className="rounded-[12px] border border-violet-200 bg-violet-50/60 p-3">
                <div className="text-[10px] font-extrabold uppercase text-violet-700">Dead stock (30+ araw)</div>
                <div className="text-[18px] font-extrabold text-ink mt-0.5">{m.deadCount} item</div>
                <div className="text-[11px] text-ink-2/60">{peso(m.deadVal)} nakatengga</div>
              </div>
            </div>

            {/* recent transactions */}
            <div className="mt-5">
              <div className="text-[11px] font-extrabold uppercase tracking-wider text-accent mb-2">Recent transactions</div>
              <div className="overflow-x-auto rounded-[10px] border border-white/70">
                <table className="w-full text-[12px]">
                  <thead className="bg-white/60 text-ink-2/60 text-left">
                    <tr><th className="px-3 py-2 font-bold">Date</th><th className="px-3 py-2 font-bold">Items</th><th className="px-3 py-2 font-bold text-right">Total</th></tr>
                  </thead>
                  <tbody>
                    {[...data.sales].sort((a, b) => (b.date || '').localeCompare(a.date || '')).slice(0, 12).map((t, i) => (
                      <tr key={t.id || i} className="border-t border-ink-2/5">
                        <td className="px-3 py-1.5 font-mono text-ink-2/70">{t.date}</td>
                        <td className="px-3 py-1.5 text-ink-2/80 max-w-[320px] truncate">{(t.items || []).map(it => `${it.generic_name || it.brand_name} ×${it.qty}`).join(', ')}</td>
                        <td className="px-3 py-1.5 text-right font-mono font-bold text-emerald-700">{peso(t.total || 0)}</td>
                      </tr>
                    ))}
                    {!data.sales.length && <tr><td colSpan={3} className="px-3 py-4 text-center text-ink-2/50">Wala pang transaction.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>

            {/* score + footer */}
            <div className="mt-5 flex items-center justify-between border-t border-ink-2/10 pt-3 text-[11px] text-ink-2/55">
              <span>Pharmetriks Score: <b className="text-ink" style={{ color: m.score >= 70 ? '#16a34a' : m.score >= 45 ? '#d97706' : '#dc2626' }}>{m.score}/100</b></span>
              <span>{lastSync ? `Huling sync: ${new Date(lastSync).toLocaleString('en-PH')}` : 'Galing sa cloud-synced data'}</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
