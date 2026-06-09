// Serves the single-file RXaudit HTML at /app — for approved users only.
//
// Auth gating lives here (Node runtime) instead of in middleware: Next.js
// middleware always runs on the Edge runtime, where Vercel's injected
// OpenTelemetry references `__dirname` and crashes every request
// (MIDDLEWARE_INVOCATION_FAILED). Gating in this Node route handler avoids the
// Edge entirely.

import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { NextResponse } from 'next/server';
import { getServerClient } from '@/lib/supabase/server';
import { isCallerAdmin } from '@/lib/admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const supabase = getServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.redirect(new URL('/login?next=/app', request.url));
  }

  // Must be approved. Admins are seeded with status='approved', but check the
  // admins table too so a manually-added admin is never locked out.
  const { data: profile } = await supabase
    .from('profiles')
    .select('status')
    .eq('id', user.id)
    .maybeSingle();

  if (profile?.status !== 'approved' && !(await isCallerAdmin())) {
    return NextResponse.redirect(new URL('/pending', request.url));
  }

  // The HTML file is copied to public/ at build time so Vercel can serve it.
  const htmlPath = path.join(process.cwd(), 'public', 'rxaudit-local.html');
  const html = await readFile(htmlPath, 'utf8');
  return new Response(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      // Always revalidate so the SW picks up new versions.
      'Cache-Control': 'public, max-age=0, must-revalidate',
    },
  });
}
