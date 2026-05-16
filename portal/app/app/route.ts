// Serves the single-file RXaudit HTML at /app.
//
// In Phase 2 this is unauthenticated so we can wire and test the PWA install
// flow end-to-end. Phase 4 will wrap it with a Supabase session check that
// redirects unapproved users to /pending or /login.

import { readFile } from 'node:fs/promises';
import path from 'node:path';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
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
