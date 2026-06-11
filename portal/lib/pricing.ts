// Single source of truth for prices shown across the portal.
//
// NEXT_PUBLIC_* vars are inlined at build time, so these constants work in
// both server and client components. Changing them requires a dev-server
// restart locally / a rebuild on Vercel.

export const APP_PRICE_PHP   = Number(process.env.NEXT_PUBLIC_APP_PRICE_PHP   ?? 249);
export const ADDON_PRICE_PHP = Number(process.env.NEXT_PUBLIC_ADDON_PRICE_PHP ?? 99);

/** ₱1,234 — peso formatting used everywhere a price is rendered. */
export function peso(n: number): string {
  return `₱${n.toLocaleString('en-PH')}`;
}
