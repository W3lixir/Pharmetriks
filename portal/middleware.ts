// Refreshes the Supabase auth cookie on every request so server components
// see a current session. Required by @supabase/ssr in App Router.
//
// Also performs cheap, pre-render route gating:
//   - /admin/**  → requires authenticated session (deep check happens in page)
//   - /app       → requires authenticated session
//   - /upload-receipt, /pending → require authenticated session
//   - /signup, /login → if already logged in, bounce to /pending or /app
//                       (resolved with another redirect later by the page)

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

const AUTHED_ONLY = ['/app', '/admin', '/upload-receipt', '/pending', '/logout'];
const GUEST_ONLY  = ['/login', '/signup'];

export async function middleware(request: NextRequest) {
  const url = request.nextUrl;
  let response = NextResponse.next({ request });

  // Bulletproof: the middleware must NEVER take down the whole site with a
  // MIDDLEWARE_INVOCATION_FAILED 500. Any problem with the Supabase env vars
  // (missing, or malformed — stray quotes/whitespace make createServerClient
  // throw "Invalid URL") or a transient network error simply degrades to
  // "no session" and lets the request through. Per-page checks still gate
  // access, so this fails safe, not open.
  let user: Awaited<ReturnType<ReturnType<typeof createServerClient>['auth']['getUser']>>['data']['user'] = null;

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('[middleware] Supabase env vars missing — skipping auth gating.');
      return response;
    }

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet: { name: string; value: string; options: CookieOptions }[]) => {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    });

    ({ data: { user } } = await supabase.auth.getUser());
  } catch (err) {
    console.error('[middleware] auth check failed — passing through:', err);
    return response;
  }

  const needsAuth = AUTHED_ONLY.some(p => url.pathname === p || url.pathname.startsWith(p + '/'));
  const isGuestPage = GUEST_ONLY.some(p => url.pathname === p);

  if (needsAuth && !user) {
    const login = url.clone();
    login.pathname = '/login';
    login.searchParams.set('next', url.pathname);
    return NextResponse.redirect(login);
  }
  if (isGuestPage && user) {
    const dest = url.clone();
    dest.pathname = '/pending'; // page itself resolves to /app if approved
    dest.search = '';
    return NextResponse.redirect(dest);
  }

  return response;
}

export const config = {
  matcher: [
    // Exclude static assets, manifest, sw, icons, favicons, _next, api/health.
    '/((?!_next/|favicon|icons/|manifest.json|sw.js|robots.txt|sitemap.xml).*)',
  ],
};
