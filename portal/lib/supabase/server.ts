// Server-side Supabase client for Server Components, Route Handlers,
// and Server Actions. Reads/writes the auth cookie via Next's cookies() API.
//
// For privileged operations (e.g. admin actions, license verification with
// row-level reads regardless of RLS), use getServiceClient() — it bypasses
// RLS and MUST never be exposed to the browser.

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

type CookieToSet = { name: string; value: string; options: CookieOptions };

export function getServerClient() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet: CookieToSet[]) => {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Server Components cannot set cookies — silently ignore. The
            // refresh will happen on the next response from a Server Action
            // or Route Handler.
          }
        },
      },
    },
  );
}

/**
 * Service-role client. Bypasses RLS. Use only in server-side admin paths.
 * Never imported from a Client Component.
 */
export function getServiceClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set');
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
