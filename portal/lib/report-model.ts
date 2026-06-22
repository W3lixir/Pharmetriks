// Pure report computations, mirroring the app's report engine but operating on
// plain data arrays (so the admin can build the same Daily Report from a user's
// synced cloud data). No DOM, no globals — usable in a Server Component.

export type Product = {
  id?: string;
  generic_name?: string; brand_name?: string; dosage?: string;
  qty?: number; bodega_qty?: number; price?: number; cost?: number;
  category?: string; expiry_date?: string; reorder_level?: number | null;
};
export type SaleItem = { generic_name?: string; brand_name?: string; dosage?: string; qty?: number; price?: number; cost?: number };
export type Sale = { id?: string; date?: string; total?: number; gross_total?: number; discount_amount?: number; items?: SaleItem[] };
export type Expense = { id?: string; date?: string; category?: string; amount?: number };

export type ReportData = { inventory: Product[]; sales: Sale[]; expenses: Expense[] };

const num = (x: unknown) => (typeof x === 'number' ? x : Number(x)) || 0;

export function isoDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** 'expired' | 'near' (≤90d) | 'ok' | null, from a 'YYYY-MM' expiry. */
export function expiryStatus(expiry?: string): 'expired' | 'near' | 'ok' | null {
  if (!expiry) return null;
  const exp = new Date(expiry + '-01T00:00:00');
  const now = new Date(); now.setDate(1); now.setHours(0, 0, 0, 0);
  const diff = exp.getTime() - now.getTime();
  if (diff < 0) return 'expired';
  if (diff < 90 * 86400000) return 'near';
  return 'ok';
}
export function reorderThreshold(p: Product): number {
  const r = num(p.reorder_level);
  return r > 0 ? r : 10;
}

export function dayReport(data: ReportData, dateStr: string) {
  let net = 0, cogs = 0, txCount = 0;
  const byProduct: Record<string, number> = {};
  data.sales.forEach(t => {
    if (t.date !== dateStr) return;
    txCount++; net += num(t.total);
    (t.items || []).forEach(it => {
      const q = num(it.qty);
      cogs += num(it.cost) * q;
      const key = (it.brand_name || it.generic_name || 'Item') + (it.dosage && it.dosage !== 'N/A' ? ' ' + it.dosage : '');
      byProduct[key] = (byProduct[key] || 0) + q;
    });
  });
  const expenses = data.expenses.filter(e => e.date === dateStr).reduce((s, e) => s + num(e.amount), 0);
  return { net, cogs, grossProfit: net - cogs, expenses, txCount, byProduct };
}

export function monthReport(data: ReportData, ym: string) {
  let net = 0, cogs = 0, txCount = 0;
  data.sales.forEach(t => {
    if (!t.date || t.date.slice(0, 7) !== ym) return;
    txCount++; net += num(t.total);
    (t.items || []).forEach(it => { cogs += num(it.cost) * num(it.qty); });
  });
  const opex = data.expenses.filter(e => e.date && e.date.slice(0, 7) === ym).reduce((s, e) => s + num(e.amount), 0);
  const grossProfit = net - cogs;
  return { net, cogs, grossProfit, opex, netProfit: grossProfit - opex, txCount, margin: net > 0 ? grossProfit / net * 100 : 0 };
}

export type ReportModel = ReturnType<typeof buildReportModel>;

export function buildReportModel(data: ReportData, dateStr: string, shop: string) {
  const day = dayReport(data, dateStr);
  const prevD = new Date(dateStr + 'T00:00:00'); prevD.setDate(prevD.getDate() - 1);
  const prev = dayReport(data, isoDate(prevD));
  const pct = (cur: number, was: number) => was > 0 ? Math.round((cur - was) / was * 100) : (cur > 0 ? 100 : 0);

  const topArr = Object.keys(day.byProduct).map(n => ({ n, q: day.byProduct[n] })).sort((a, b) => b.q - a.q);

  // movement (fast ≤7d, slow ≤30d, dead >30d) from last-sold per product
  const sold: Record<string, string> = {};
  data.sales.forEach(t => (t.items || []).forEach(it => {
    const k = (it.generic_name || '') + '|' + (it.brand_name || '') + '|' + (it.dosage || '');
    if (t.date && (!sold[k] || t.date > sold[k])) sold[k] = t.date;
  }));
  const base = new Date(dateStr + 'T00:00:00');
  const daysSince = (ds?: string) => ds ? Math.floor((base.getTime() - new Date(ds + 'T00:00:00').getTime()) / 86400000) : Infinity;

  let fastVal = 0, slowVal = 0, deadVal = 0, totalVal = 0, deadCount = 0;
  data.inventory.forEach(p => {
    const val = num(p.qty) * num(p.cost); totalVal += val;
    const ds = daysSince(sold[(p.generic_name || '') + '|' + (p.brand_name || '') + '|' + (p.dosage || '')]);
    if (ds <= 7) fastVal += val; else if (ds <= 30) slowVal += val; else { deadVal += val; if (num(p.qty) > 0) deadCount++; }
  });

  const expired: Product[] = [], near: Product[] = [];
  data.inventory.forEach(p => { const es = expiryStatus(p.expiry_date); if (es === 'expired') expired.push(p); else if (es === 'near') near.push(p); });
  const expiryLoss = expired.concat(near).reduce((s, p) => s + num(p.qty) * num(p.cost), 0);
  const low = data.inventory.filter(p => num(p.qty) > 0 && num(p.qty) <= reorderThreshold(p));
  const out = data.inventory.filter(p => num(p.qty) <= 0);

  const days7: { label: string; value: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const dd = new Date(dateStr + 'T00:00:00'); dd.setDate(dd.getDate() - i);
    days7.push({ label: (dd.getMonth() + 1) + '/' + dd.getDate(), value: dayReport(data, isoDate(dd)).net });
  }
  const weekAvg = days7.reduce((s, b) => s + b.value, 0) / 7;
  const ym = dateStr.slice(0, 7);
  const month = monthReport(data, ym);

  const clamp = (x: number) => Math.max(0, Math.min(100, Math.round(x)));
  const deadPct = totalVal > 0 ? deadVal / totalVal : 0;
  const sSales = clamp(weekAvg > 0 ? (day.net / weekAvg) * 60 + 20 : (day.net > 0 ? 70 : 30));
  const sInv = clamp(100 - deadPct * 120 - (expiryLoss > 0 ? 15 : 0));
  const sCash = clamp((totalVal > 0 ? fastVal / totalVal : 0) * 100);
  const sGrowth = clamp(50 + pct(day.net, prev.net) / 2);
  const score = Math.round((sSales + sInv + sCash + sGrowth) / 4);

  return {
    dateStr, shop,
    sales: day.net, salesVsPrev: pct(day.net, prev.net),
    profit: day.grossProfit, margin: day.net > 0 ? day.grossProfit / day.net * 100 : 0,
    expenses: day.expenses, tx: day.txCount, txVsPrev: pct(day.txCount, prev.txCount),
    top: topArr[0] || null,
    totalVal, fastVal, slowVal, deadVal, deadPct, deadCount,
    expired, near, expiryLoss, low, out,
    days7, weekAvg, month,
    productCount: data.inventory.length,
    score, sSales, sInv, sCash, sGrowth,
  };
}

export function peso(n: number): string {
  return '₱' + (Math.round(num(n) * 100) / 100).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
