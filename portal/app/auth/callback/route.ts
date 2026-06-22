// Auth callback — completes an email link (password recovery, magic link, etc.)
// by exchanging the one-time code/token for a session cookie, then forwards the
// user to `next` (a relative path we control). Used by the password-reset flow:
// the recovery email points here, and we land the user on /reset-password with a
// short-lived session that authorizes updateUser({ password }).

import { NextResponse } from 'next/server';
import { getServerClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const tokenHash = url.searchParams.get('token_hash');
  const type = url.searchParams.get('type');
  const nextParam = url.searchParams.get('next') || '/';
  const next = nextParam.startsWith('/') && !nextParam.startsWith('//') ? nextParam : '/';

  const supabase = getServerClient();
  try {
    if (code) {
      await supabase.auth.exchangeCodeForSession(code);          // PKCE flow
    } else if (tokenHash && type) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await supabase.auth.verifyOtp({ token_hash: tokenHash, type: type as any }); // OTP/token flow
    }
  } catch {
    // Invalid/expired link → reset-password will show "humiling ulit".
  }

  return NextResponse.redirect(new URL(next, url.origin));
}
