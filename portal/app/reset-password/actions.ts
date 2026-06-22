'use server';

import { redirect } from 'next/navigation';
import { getServerClient } from '@/lib/supabase/server';

export type ResetResult = { ok: false; error: string };

export async function resetPasswordAction(formData: FormData): Promise<ResetResult | void> {
  const password = String(formData.get('password') ?? '');
  const confirm = String(formData.get('confirm') ?? '');

  if (password.length < 8) return { ok: false, error: 'Dapat 8 character pataas ang bagong password.' };
  if (password !== confirm) return { ok: false, error: 'Hindi magkatugma ang dalawang password.' };

  const supabase = getServerClient();
  // The recovery session was set by /auth/callback. No session = bad/expired link.
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, error: 'Expired o invalid na ang link. Humiling ulit ng reset sa /forgot-password.' };
  }

  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { ok: false, error: error.message };

  redirect('/login?reset=1');
}
