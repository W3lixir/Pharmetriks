// POST /api/verify-license
//
// Phase 6 will plug Supabase auth + profiles check into this. For now it
// returns a stub so the in-app license check has a real endpoint to hit
// during development.

import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type VerifyResult = {
  valid: boolean;
  status: 'pending' | 'awaiting_payment' | 'approved' | 'rejected' | 'revoked' | 'no_session';
  expires_at: string | null;
};

export async function POST(): Promise<NextResponse<VerifyResult>> {
  // Phase 6 replaces this with:
  //   1. read JWT from Authorization header or cookie
  //   2. supabase.auth.getUser()
  //   3. select status, license_expires_at from profiles where id = user.id
  //   4. return { valid: status === 'approved' && (!expires_at || expires_at > now), ... }
  //
  // Phase 2 stub: pretend everyone is approved so the local PWA test passes.
  const isDev = process.env.NODE_ENV !== 'production';
  return NextResponse.json({
    valid: isDev,
    status: isDev ? 'approved' : 'no_session',
    expires_at: null,
  });
}
