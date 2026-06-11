'use server';

import { redirect } from 'next/navigation';
import { getServerClient, getServiceClient } from '@/lib/supabase/server';
import { sanitizeFeatureSelection } from '@/lib/features';

export type UploadResult = { ok: false; error: string } | { ok: true };

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED = new Set([
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/heic',
  'image/heif',
]);

function extFor(mime: string): string {
  return (
    {
      'image/png':  'png',
      'image/jpeg': 'jpg',
      'image/webp': 'webp',
      'image/heic': 'heic',
      'image/heif': 'heif',
    } as Record<string, string>
  )[mime] || 'bin';
}

export async function uploadReceiptAction(formData: FormData): Promise<UploadResult> {
  const supabase = getServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'Hindi ka logged in. Mag-login muna.' };

  const file = formData.get('file');
  if (!(file instanceof File) || !file.size) {
    return { ok: false, error: 'Walang file. Pumili ka muna ng receipt screenshot.' };
  }
  if (!ALLOWED.has(file.type)) {
    return { ok: false, error: 'Image file lang (PNG, JPG, WebP, or HEIC).' };
  }
  if (file.size > MAX_BYTES) {
    return { ok: false, error: 'Sobrang laki — max 5 MB.' };
  }

  const reference = String(formData.get('payment_reference') ?? '').trim().slice(0, 80);

  // Add-ons picked at checkout. Unknown/garbage keys are silently dropped —
  // the FEATURES registry is the source of truth.
  const requested = sanitizeFeatureSelection(formData.get('requested_features'));

  const ext  = extFor(file.type);
  const path = `${user.id}/receipt-${Date.now()}.${ext}`;

  // Upload as the user — RLS policy on storage.objects enforces the folder.
  const { error: upErr } = await supabase.storage
    .from('receipts')
    .upload(path, file, {
      contentType: file.type,
      upsert: false,
      cacheControl: '0',
    });
  if (upErr) {
    return { ok: false, error: `Hindi ma-upload: ${upErr.message}` };
  }

  // Persist the path + requested add-ons. We use the service client so the
  // status field updates regardless of the user-self-update RLS guard.
  const svc = getServiceClient();

  const { data: profile } = await svc
    .from('profiles')
    .select('status, requested_features')
    .eq('id', user.id)
    .maybeSingle();

  const isUpgrade = profile?.status === 'approved';

  if (isUpgrade) {
    // Already-approved user buying more add-ons. Merge into any pending
    // requests and DO NOT touch status — flipping it would lock them out
    // of /app (app/route.ts gates on status === 'approved').
    const merged = { ...(profile?.requested_features ?? {}), ...requested };
    const { error: updErr } = await svc
      .from('profiles')
      .update({
        receipt_url: path,
        payment_reference: reference || null,
        requested_features: merged,
      })
      .eq('id', user.id);

    if (updErr) {
      return { ok: false, error: `Na-upload, pero hindi ma-save ang request: ${updErr.message}` };
    }
    redirect('/upload-receipt?submitted=1');
  }

  const { error: updErr } = await svc
    .from('profiles')
    .update({
      receipt_url: path,
      payment_reference: reference || null,
      requested_features: requested,
      status: 'awaiting_payment',
    })
    .eq('id', user.id);

  if (updErr) {
    return { ok: false, error: `Na-upload, pero hindi ma-update ang status: ${updErr.message}` };
  }

  redirect('/pending');
}
