// Single source of truth for prices shown across the portal.
//
// The core app price is a plain constant, NOT an env var. It used to read
// NEXT_PUBLIC_APP_PRICE_PHP, but a stale value left in the Vercel dashboard
// silently won over the code and shipped a landing page that said ₱499 in the
// copy and ₱249 in the pricing card. Editing the number here is now the whole
// change — nothing to remember in the dashboard.

export const APP_PRICE_PHP = 499;

// NEXT_PUBLIC_* vars are inlined at build time, so this works in both server
// and client components. Changing it requires a dev-server restart locally /
// a rebuild on Vercel.
export const ADDON_PRICE_PHP = Number(process.env.NEXT_PUBLIC_ADDON_PRICE_PHP ?? 99);

/** ₱1,234 — peso formatting used everywhere a price is rendered. */
export function peso(n: number): string {
  return `₱${n.toLocaleString('en-PH')}`;
}
