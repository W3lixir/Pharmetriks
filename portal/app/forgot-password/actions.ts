'use server';

import { getServerClient } from '@/lib/supabase/server';

export type ForgotResult = { ok: true } | { ok: false; error: string };

function siteOrigin(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/+$/, '');
}

export async function forgotPasswordAction(formData: FormData): Promise<ForgotResult> {
  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  if (!email) return { ok: false, error: 'Ilagay ang email mo.' };

  const supabase = getServerClient();
  // Supabase intentionally does NOT reveal whether the email exists (anti-
  // enumeration), so a missing account still returns success here.
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteOrigin()}/auth/callback?next=/reset-password`,
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
