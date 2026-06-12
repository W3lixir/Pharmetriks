// Single source of truth for the per-account add-on features.
//
// These are OPT-IN add-ons: a key absent from a profile's `features` map (or
// set to false) means the feature is OFF for that account. The three core app
// tabs (dispensing / inventory / opex) are NOT listed here — they stay free
// for every approved user.
//
// PRICING MODEL (June 2026): add-ons are ₱99/month. A feature's value in the
// map is either:
//   true            — lifetime grant (grandfathered accounts, comps)
//   ISO date string — active until that expiry; admin grants/renewals add
//                     ADDON_TERM_DAYS from now (or from the current expiry)
//   false / absent  — off
// The app itself still sees plain booleans: /api/verify-license collapses the
// map to "active right now" before returning it.
//
// Keys are stable once shipped — they're persisted per account.

export type FeatureDef = {
  key: string;
  label: string;
  description: string;
};

/** Per-account grant map: true = lifetime, string = ISO expiry, false/absent = off. */
export type FeatureMap = Record<string, boolean | string>;

/** Days granted per ₱99 payment / admin toggle-on. */
export const ADDON_TERM_DAYS = 30;

/** True if a single grant value is active right now. */
export function featureActive(v: boolean | string | undefined | null): boolean {
  if (v === true) return true;
  if (typeof v === 'string') {
    const t = Date.parse(v);
    return Number.isFinite(t) && t > Date.now();
  }
  return false;
}

/** Expiry helpers for admin display. null = lifetime or off. */
export function featureExpiry(v: boolean | string | undefined | null): Date | null {
  if (typeof v !== 'string') return null;
  const t = Date.parse(v);
  return Number.isFinite(t) ? new Date(t) : null;
}

/** Days remaining (ceil). null = lifetime; <= 0 = lapsed. Off keys return null too — check featureActive first. */
export function featureDaysLeft(v: boolean | string | undefined | null): number | null {
  const exp = featureExpiry(v);
  if (!exp) return null;
  return Math.ceil((exp.getTime() - Date.now()) / 86_400_000);
}

/** Next expiry when granting/renewing: extends an active grant, restarts a lapsed one. */
export function nextExpiry(current: boolean | string | undefined | null): string {
  const base = featureActive(current) && typeof current === 'string'
    ? Date.parse(current)
    : Date.now();
  return new Date(base + ADDON_TERM_DAYS * 86_400_000).toISOString();
}

/** Collapse a grant map to plain booleans of what's active right now. */
export function activeFeatureBooleans(map: FeatureMap | null | undefined): Record<string, boolean> {
  const out: Record<string, boolean> = {};
  if (!map) return out;
  for (const f of FEATURES) {
    if (featureActive(map[f.key])) out[f.key] = true;
  }
  return out;
}

export const FEATURES: FeatureDef[] = [
  { key: 'cloud_sync',      label: 'Offline + Online Sync',        description: 'Cloud backup + multi-device sync of inventory, sales, and expenses.' },
  { key: 'discount',        label: 'Dispense Discounts',           description: 'Apply Senior / PWD / Wholesale discounts (% or fixed ₱) at checkout.' },
  { key: 'utang_tracker',   label: 'Utang & Suki Tracker',         description: 'Digital listahan ng utang — sino, magkano, kailan nagbayad. May suki profiles para kabisado mo ang bawat customer.' },
  { key: 'smart_alerts',    label: 'Smart Alerts & Reorder List',  description: 'Hindi ka na mabibigla: expiry warnings, low-stock alerts, at auto reorder list para alam mo agad ang dapat orderin.' },
  { key: 'charts_insights', label: 'Charts & Insights',            description: 'Sales trends, best sellers, at profit charts — may printable reports para kita mo ang totoong lakad ng botika.' },
  { key: 'price_list',      label: 'Price List / Catalog',         description: 'Gumawa ng printable o shareable na listahan ng presyo — hindi na paulit-ulit sasagutin ang "magkano po ito?". Reference din ng tindera.' },
  { key: 'suppliers_po',    label: 'Supplier & Purchase Orders',   description: 'Supplier list, paggawa ng PO, at pag-receive ng stock — lahat naka-record, walang nakakalimutan.' },
  { key: 'stock_audit',     label: 'Stock Audit Mode',             description: 'Guided physical count kapag mag-iinventory. Makikita agad ang system-vs-actual na variance.' },
  { key: 'pricing_advisor', label: 'Margin & Pricing Advisor',     description: 'Per-product margin view at markup calculator. Fina-flag ang mga produktong sobrang nipis ang kita.' },
  { key: 'reports_pack',    label: 'Reports & Sulit Pack',         description: 'Daily Sulit (end-of-day summary), Monthly P&L (kita = benta − COGS − OPEX), at one-tap print/share ng buwanang report.' },
  { key: 'vale_sahod',      label: 'Vale & Sahod ng Staff',        description: 'I-log ang bawat vale ng helper at auto-bawas sa sahod — malinaw ang computation, walang awayan, walang nakakalimutan.' },
  { key: 'bodega_stock',    label: 'Bodega Stock',                 description: 'Hiwalay ang bilang ng nasa estante at nasa bodega. Kapag ubos sa display, sasabihin ng app kung may makukuha pa sa likod.' },
];

/** Keys in `map` that are active right now (lifetime or unexpired). */
export function enabledKeys(map: FeatureMap | null | undefined): string[] {
  if (!map) return [];
  return FEATURES.filter(f => featureActive(map[f.key])).map(f => f.key);
}

/** Parse + sanitize a client-provided JSON feature selection: keeps only
 *  registry keys explicitly set to true. Returns {} on any garbage input. */
export function sanitizeFeatureSelection(raw: unknown): FeatureMap {
  let obj: unknown = raw;
  if (typeof raw === 'string') {
    try { obj = JSON.parse(raw); } catch { return {}; }
  }
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return {};
  const out: FeatureMap = {};
  for (const f of FEATURES) {
    if ((obj as Record<string, unknown>)[f.key] === true) out[f.key] = true;
  }
  return out;
}

/** True if `map` has `key` active right now (lifetime or unexpired). */
export function hasFeature(map: FeatureMap | null | undefined, key: string): boolean {
  return !!map && featureActive(map[key]);
}
