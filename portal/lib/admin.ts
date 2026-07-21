// Admin guard utilities. The `admins` table is the single source of truth
// — service-role only writes go there. RLS already restricts data access,
// but pages/actions must explicitly gate on admin status too.

import { cache } from 'react';
import { redirect } from 'next/navigation';
import { getServerClient, getServiceClient } from '@/lib/supabase/server';

export type AdminContext = {
  userId: string;
  email: string;
};

/**
 * Throws via redirect() if the caller is not authenticated AND in the
 * admins table. Use at the top of every admin page / server action.
 *
 * Wrapped in React's cache() so that when both the admin LAYOUT and the admin
 * PAGE call it during the same request, the getUser() auth round-trip + admins
 * lookup run once, not twice. (cache() memoizes only within a single server
 * render pass — it never leaks an auth check across requests.)
 */
export const requireAdmin = cache(async function requireAdmin(): Promise<AdminContext> {
  const supabase = getServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login?reason=unauthorized');

  const { data: adminRow } = await supabase
    .from('admins')
    .select('user_id')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!adminRow) redirect('/pending');

  return { userId: user.id, email: user.email ?? '' };
});

/**
 * Returns whether the current caller is an admin. Useful for conditional
 * UI (e.g. showing a "Go to admin" link on /pending).
 */
export async function isCallerAdmin(): Promise<boolean> {
  const supabase = getServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  const { data } = await supabase
    .from('admins')
    .select('user_id')
    .eq('user_id', user.id)
    .maybeSingle();
  return !!data;
}

/** Service-role client. Bypasses RLS — use only after requireAdmin(). */
export function adminService() {
  return getServiceClient();
}
