import { NextResponse } from 'next/server';
import { getServerClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function signOutAndRedirect() {
  const supabase = getServerClient();
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL('/login', getOrigin()), { status: 303 });
}

function getOrigin() {
  return process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
}

export async function POST() { return signOutAndRedirect(); }
export async function GET()  { return signOutAndRedirect(); }
