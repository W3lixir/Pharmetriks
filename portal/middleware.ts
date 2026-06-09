// TEMPORARY DIAGNOSTIC no-op middleware.
// No imports beyond next/server, no Supabase, no env access. This CANNOT throw
// at the Edge. If the live site still returns MIDDLEWARE_INVOCATION_FAILED with
// this in place, the production domain is NOT serving the latest deployment
// (a Vercel alias/promotion issue). If the site loads, the Supabase client in
// the real middleware was failing in the Edge runtime.
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(_request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/|favicon|icons/|manifest.json|sw.js|robots.txt|sitemap.xml).*)',
  ],
};
