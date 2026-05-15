'use server';

import { redirect } from 'next/navigation';
import { getServerClient } from '@/lib/supabase/server';
import { destinationForStatus, type ProfileStatus } from '@/lib/auth';

export type LoginResult = { ok: false; error: string } | { ok: true };

export async function loginAction(formData: FormData): Promise<LoginResult> {
  const email    = String(formData.get('email')    ?? '').trim().toLowerCase();
  const password = String(formData.get('password') ?? '');
  const next     = String(formData.get('next')     ?? '');

  if (!email || !password) {
    return { ok: false, error: 'Email and password are required.' };
  }

  const supabase = getServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    const msg = error.message.toLowerCase();
    if (msg.includes('invalid') || msg.includes('credentials')) {
      return { ok: false, error: 'Mali ang email or password. Try ulit.' };
    }
    if (msg.includes('not confirmed') || msg.includes('confirm')) {
      return { ok: false, error: 'Account hindi pa confirmed. Check your email muna.' };
    }
    return { ok: false, error: error.message };
  }

  // Honor ?next= if it's a safe relative path; otherwise route by status.
  if (next && next.startsWith('/') && !next.startsWith('//')) {
    redirect(next);
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('status')
    .eq('id', user.id)
    .maybeSingle();

  redirect(destinationForStatus(profile?.status as ProfileStatus | undefined));
}
