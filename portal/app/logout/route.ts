import { NextResponse } from 'next/server';
import { getServerClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function signOutAndRedirect() {
  const supabase = getServerClient();
  await supabase.auth.signOut({ scope: 'local' });

  const res = NextResponse.redirect(new URL('/login', getOrigin()), { status: 303 });

  // Clear all Supabase auth cookies explicitly
  const cookieNames = [
    'sb-access-token',
    'sb-refresh-token',
    `sb-${process.env.NEXT_PUBLIC_SUPABASE_URL?.split('//')[1]?.split('.')[0]}-auth-token`,
  ];
  cookieNames.forEach(name => {
    res.cookies.set(name, '', { maxAge: 0, path: '/' });
  });

  // Tell browser + SW not to cache this redirect
  res.headers.set('Cache-Control', 'no-store');

  return res;
}

function getOrigin() {
  return process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
}

export async function POST() { return signOutAndRedirect(); }
export async function GET()  { return signOutAndRedirect(); }
