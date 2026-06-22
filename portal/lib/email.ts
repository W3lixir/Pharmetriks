// Best-effort transactional email via Resend, server-side only.
//
// Used for ADMIN notifications (e.g. a new signup → email rxaudit2025@gmail.com).
// USER-facing auth email (password reset, confirmation) is sent by Supabase Auth
// through its own SMTP config, NOT this helper. Note: the default Resend sender
// (onboarding@resend.dev) can only deliver to the Resend account owner until a
// domain is verified — fine for ADMIN_NOTIFY_EMAIL.

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const ADMIN_NOTIFY_EMAIL = process.env.ADMIN_NOTIFY_EMAIL;
const RESEND_FROM = process.env.RESEND_FROM || 'Pharmetriks <onboarding@resend.dev>';

export function escapeHtml(s: unknown): string {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Email the admin. Never throws — a mail failure must not break the caller. */
export async function sendAdminNotify(subject: string, html: string): Promise<void> {
  if (!RESEND_API_KEY || !ADMIN_NOTIFY_EMAIL) return; // not configured — skip
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ from: RESEND_FROM, to: [ADMIN_NOTIFY_EMAIL], subject, html }),
    });
    if (!res.ok) console.error('[resend] notify failed:', res.status, await res.text().catch(() => ''));
  } catch (e) {
    console.error('[resend] notify error:', e);
  }
}
