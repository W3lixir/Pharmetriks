// Single source of truth for the per-account add-on features.
//
// These are OPT-IN add-ons: a key absent from a profile's `features` map (or
// set to false) means the feature is OFF for that account. The three core app
// tabs (dispensing / inventory / opex) are NOT listed here — they stay free
// for every approved user.
//
// All 10 add-ons are DEFINED here, but only `cloud_sync` and `discount` are
// built into the app so far. The rest are sellable/grantable now and get
// gated in the app with `window.PHARMETRIKS_HAS('<key>')` as each one ships.
// Keys are stable once shipped — they're persisted per account.

export type FeatureDef = {
  key: string;
  label: string;
  description: string;
};

export type FeatureMap = Record<string, boolean>;

export const FEATURES: FeatureDef[] = [
  { key: 'cloud_sync',      label: 'Offline + Online Sync',        description: 'Cloud backup + multi-device sync of inventory, sales, and expenses.' },
  { key: 'discount',        label: 'Dispense Discounts',           description: 'Apply Senior / PWD / Wholesale discounts (% or fixed ₱) at checkout.' },
  { key: 'utang_tracker',   label: 'Utang & Suki Tracker',         description: 'Digital listahan ng utang — sino, magkano, kailan nagbayad. May suki profiles para kabisado mo ang bawat customer.' },
  { key: 'smart_alerts',    label: 'Smart Alerts & Reorder List',  description: 'Hindi ka na mabibigla: expiry warnings, low-stock alerts, at auto reorder list para alam mo agad ang dapat orderin.' },
  { key: 'charts_insights', label: 'Charts & Insights',            description: 'Sales trends, best sellers, at profit charts — may printable reports para kita mo ang totoong lakad ng botika.' },
  { key: 'staff_pins',      label: 'Staff PINs & Accountability',  description: 'PIN per staff at log kung sino nag-dispense ng ano. May tiwala ka sa staff — may proof ka pa.' },
  { key: 'suppliers_po',    label: 'Supplier & Purchase Orders',   description: 'Supplier list, paggawa ng PO, at pag-receive ng stock — lahat naka-record, walang nakakalimutan.' },
  { key: 'stock_audit',     label: 'Stock Audit Mode',             description: 'Guided physical count kapag mag-iinventory. Makikita agad ang system-vs-actual na variance.' },
  { key: 'pricing_advisor', label: 'Margin & Pricing Advisor',     description: 'Per-product margin view at markup calculator. Fina-flag ang mga produktong sobrang nipis ang kita.' },
  { key: 'loss_tracker',    label: 'Loss & Expiry Tracker',        description: 'I-log ang expired, damaged, o pull-out items. Monthly peso-loss report para mabawasan ang lugi next month.' },
];

/** Keys in `map` that are explicitly true. */
export function enabledKeys(map: FeatureMap | null | undefined): string[] {
  if (!map) return [];
  return FEATURES.filter(f => map[f.key] === true).map(f => f.key);
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

/** True if `map` has `key` explicitly enabled. */
export function hasFeature(map: FeatureMap | null | undefined, key: string): boolean {
  return !!map && map[key] === true;
}
