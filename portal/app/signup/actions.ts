'use server';

import { redirect } from 'next/navigation';
import { getServerClient } from '@/lib/supabase/server';

export type SignupResult = { ok: false; error: string } | { ok: true };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function signupAction(formData: FormData): Promise<SignupResult> {
  const email        = String(formData.get('email')         ?? '').trim().toLowerCase();
  const password     = String(formData.get('password')      ?? '');
  const fullName     = String(formData.get('full_name')     ?? '').trim();
  const pharmacyName = String(formData.get('pharmacy_name') ?? '').trim();

  if (!EMAIL_RE.test(email))             return { ok: false, error: 'Please enter a valid email address.' };
  if (password.length < 8)               return { ok: false, error: 'Password must be at least 8 characters.' };
  if (!fullName)                         return { ok: false, error: 'Full name is required.' };
  if (!pharmacyName)                     return { ok: false, error: 'Pharmacy name is required.' };

  const supabase = getServerClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName, pharmacy_name: pharmacyName },
    },
  });

  if (error) {
    // Surface friendly Taglish messages for common cases.
    const msg = error.message.toLowerCase();
    if (msg.includes('already registered') || msg.includes('user already')) {
      return { ok: false, error: 'May account na yang email. Try mag-login na lang.' };
    }
    if (msg.includes('password')) {
      return { ok: false, error: 'Mahina ang password. Try mas mahabang password.' };
    }
    return { ok: false, error: error.message };
  }

  // Supabase auth trigger inserts the matching profiles row with status='pending'.
  // Send the user straight to receipt upload.
  redirect('/upload-receipt');
}
