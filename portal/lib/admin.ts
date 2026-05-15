// Admin guard utilities. The `admins` table is the single source of truth
// — service-role only writes go there. RLS already restricts data access,
// but pages/actions must explicitly gate on admin status too.

import { redirect } from 'next/navigation';
import { getServerClient, getServiceClient } from '@/lib/supabase/server';

export type AdminContext = {
  userId: string;
  email: string;
};

/**
 * Throws via redirect() if the caller is not authenticated AND in the
 * admins table. Use at the top of every admin page / server action.
 */
export async function requireAdmin(): Promise<AdminContext> {
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
}

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
