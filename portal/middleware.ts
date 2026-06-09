// Cheap, edge-safe route gating.
//
// IMPORTANT: this middleware intentionally does NOT import @supabase/ssr or
// @supabase/supabase-js. Creating a Supabase client here drags Node-only code
// (OpenTelemetry / ws, which reference `__dirname`) into the Edge runtime
// bundle, where `__dirname` is undefined — that crashes EVERY request with
// `MIDDLEWARE_INVOCATION_FAILED`. Instead we gate purely on the presence of the
// Supabase auth cookie. The real, authoritative session check (and any token
// refresh) happens in the Server Components / route handlers via getServerClient().
//
//   - /admin/**  → requires a session cookie (deep admin check happens in page)
//   - /app, /upload-receipt, /pending, /logout → require a session cookie
//   - /login, /signup → if already has a session, bounce to /pending
//                       (the page itself resolves to /app if approved)

import { NextResponse, type NextRequest } from 'next/server';

const AUTHED_ONLY = ['/app', '/admin', '/upload-receipt', '/pending', '/logout'];
const GUEST_ONLY  = ['/login', '/signup'];

// @supabase/ssr stores the session in cookie(s) named `sb-<project-ref>-auth-token`
// (sometimes chunked with a `.0` / `.1` suffix). Presence of a non-empty one
// means "probably logged in" — good enough for cheap pre-render gating.
function hasSessionCookie(request: NextRequest): boolean {
  return request.cookies
    .getAll()
    .some(c => /^sb-.+-auth-token(\.\d+)?$/.test(c.name) && c.value.length > 0);
}

export function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const loggedIn = hasSessionCookie(request);

  const needsAuth = AUTHED_ONLY.some(p => url.pathname === p || url.pathname.startsWith(p + '/'));
  const isGuestPage = GUEST_ONLY.some(p => url.pathname === p);

  if (needsAuth && !loggedIn) {
    const login = url.clone();
    login.pathname = '/login';
    login.searchParams.set('next', url.pathname);
    return NextResponse.redirect(login);
  }
  if (isGuestPage && loggedIn) {
    const dest = url.clone();
    dest.pathname = '/pending'; // page itself resolves to /app if approved
    dest.search = '';
    return NextResponse.redirect(dest);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Exclude static assets, manifest, sw, icons, favicons, _next, api/health.
    '/((?!_next/|favicon|icons/|manifest.json|sw.js|robots.txt|sitemap.xml).*)',
  ],
};
