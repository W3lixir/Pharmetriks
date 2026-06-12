'use server';

import { revalidatePath } from 'next/cache';
import { requireAdmin, adminService } from '@/lib/admin';
import { FEATURES, featureActive, nextExpiry, ADDON_TERM_DAYS, type FeatureMap } from '@/lib/features';

export type ActionResult = { ok: true } | { ok: false; error: string };

async function logAction(args: {
  adminId: string;
  targetUserId: string;
  action: 'approve' | 'reject' | 'revoke' | 'extend' | 'note' | 'feature';
  notes?: string | null;
}) {
  const svc = adminService();
  await svc.from('admin_actions').insert({
    admin_id:        args.adminId,
    target_user_id:  args.targetUserId,
    action:          args.action,
    notes:           args.notes ?? null,
  });
}

// ── Approve ─────────────────────────────────────────────────────────────
// Approving implies the admin verified the GCash amount against the user's
// requested add-ons, so they're auto-applied. Add-ons are monthly: each
// requested key gets ADDON_TERM_DAYS from now (or extends a still-active
// grant — that's a renewal). Lifetime (true) grants are never downgraded.

export async function approveUserAction(formData: FormData): Promise<ActionResult> {
  const admin     = await requireAdmin();
  const targetId  = String(formData.get('target_user_id') ?? '');
  const notes     = String(formData.get('notes') ?? '').trim() || null;
  if (!targetId) return { ok: false, error: 'Missing target user.' };

  const svc = adminService();

  const { data: row, error: readErr } = await svc
    .from('profiles')
    .select('features, requested_features')
    .eq('id', targetId)
    .maybeSingle();
  if (readErr) return { ok: false, error: readErr.message };

  const granted   = (row?.features ?? {}) as FeatureMap;
  const requested = (row?.requested_features ?? {}) as FeatureMap;
  const appliedKeys = FEATURES
    .filter(f => requested[f.key] === true && granted[f.key] !== true)
    .map(f => f.key);
  const nextFeatures: FeatureMap = { ...granted };
  for (const k of appliedKeys) nextFeatures[k] = nextExpiry(granted[k]);

  const { error } = await svc
    .from('profiles')
    .update({
      status: 'approved',
      approved_at: new Date().toISOString(),
      approved_by: admin.userId,
      notes,
      features: nextFeatures,
    })
    .eq('id', targetId);
  if (error) return { ok: false, error: error.message };

  await logAction({
    adminId:      admin.userId,
    targetUserId: targetId,
    action:       'approve',
    notes: appliedKeys.length
      ? `${notes ? `${notes}; ` : ''}applied add-ons (${ADDON_TERM_DAYS}d): ${appliedKeys.join(', ')}`
      : notes,
  });

  revalidatePath('/admin');
  return { ok: true };
}

// ── Apply requested add-ons (upgrade path, user already approved) ───────

export async function applyRequestedFeaturesAction(formData: FormData): Promise<ActionResult> {
  const admin    = await requireAdmin();
  const targetId = String(formData.get('target_user_id') ?? '');
  if (!targetId) return { ok: false, error: 'Missing target user.' };

  const svc = adminService();

  const { data: row, error: readErr } = await svc
    .from('profiles')
    .select('features, requested_features')
    .eq('id', targetId)
    .maybeSingle();
  if (readErr) return { ok: false, error: readErr.message };

  const granted   = (row?.features ?? {}) as FeatureMap;
  const requested = (row?.requested_features ?? {}) as FeatureMap;
  // Apply if requested AND not already active (covers brand-new add-ons AND
  // renewals of lapsed ones, since a lapsed expiry-string is not active).
  const appliedKeys = FEATURES
    .filter(f => requested[f.key] === true && !featureActive(granted[f.key]))
    .map(f => f.key);
  if (!appliedKeys.length) return { ok: false, error: 'No new requested add-ons to apply.' };

  const nextFeatures: FeatureMap = { ...granted };
  for (const k of appliedKeys) nextFeatures[k] = nextExpiry(granted[k]);

  const { error } = await svc
    .from('profiles')
    .update({ features: nextFeatures })
    .eq('id', targetId);
  if (error) return { ok: false, error: error.message };

  await logAction({
    adminId:      admin.userId,
    targetUserId: targetId,
    action:       'feature',
    notes:        `applied requested add-ons (${ADDON_TERM_DAYS}d): ${appliedKeys.join(', ')}`,
  });

  revalidatePath('/admin');
  return { ok: true };
}

// ── Reject ─────────────────────────────────────────────────────────────

export async function rejectUserAction(formData: FormData): Promise<ActionResult> {
  const admin    = await requireAdmin();
  const targetId = String(formData.get('target_user_id') ?? '');
  const reason   = String(formData.get('reason') ?? '').trim() || null;
  if (!targetId) return { ok: false, error: 'Missing target user.' };

  const svc = adminService();
  const { error } = await svc
    .from('profiles')
    .update({ status: 'rejected', notes: reason })
    .eq('id', targetId);
  if (error) return { ok: false, error: error.message };

  await logAction({
    adminId:      admin.userId,
    targetUserId: targetId,
    action:       'reject',
    notes:        reason,
  });

  revalidatePath('/admin');
  return { ok: true };
}

// ── Revoke (approved → revoked) ─────────────────────────────────────────

export async function revokeUserAction(formData: FormData): Promise<ActionResult> {
  const admin    = await requireAdmin();
  const targetId = String(formData.get('target_user_id') ?? '');
  const reason   = String(formData.get('reason') ?? '').trim() || null;
  if (!targetId) return { ok: false, error: 'Missing target user.' };

  const svc = adminService();
  const { error } = await svc
    .from('profiles')
    .update({ status: 'revoked', notes: reason })
    .eq('id', targetId);
  if (error) return { ok: false, error: error.message };

  await logAction({
    adminId:      admin.userId,
    targetUserId: targetId,
    action:       'revoke',
    notes:        reason,
  });

  revalidatePath('/admin');
  return { ok: true };
}

// ── Restore (revoked/rejected → approved) ───────────────────────────────
// Useful when admin rejected/revoked by mistake.

export async function restoreUserAction(formData: FormData): Promise<ActionResult> {
  const admin    = await requireAdmin();
  const targetId = String(formData.get('target_user_id') ?? '');
  if (!targetId) return { ok: false, error: 'Missing target user.' };

  const svc = adminService();
  const { error } = await svc
    .from('profiles')
    .update({
      status: 'approved',
      approved_at: new Date().toISOString(),
      approved_by: admin.userId,
    })
    .eq('id', targetId);
  if (error) return { ok: false, error: error.message };

  await logAction({
    adminId:      admin.userId,
    targetUserId: targetId,
    action:       'approve',
    notes:        'restored from revoked/rejected',
  });

  revalidatePath('/admin');
  return { ok: true };
}

// ── Toggle a per-account add-on feature ─────────────────────────────────

// `mode`:
//   'toggle'   — enabled=true grants/renews ADDON_TERM_DAYS, false turns off
//   'lifetime' — enabled=true grants forever (comps); false turns off
export async function setFeatureAction(formData: FormData): Promise<ActionResult> {
  const admin      = await requireAdmin();
  const targetId   = String(formData.get('target_user_id') ?? '');
  const featureKey = String(formData.get('feature_key') ?? '');
  const enabled    = String(formData.get('enabled') ?? '') === 'true';
  const mode       = String(formData.get('mode') ?? 'toggle');
  if (!targetId || !featureKey) return { ok: false, error: 'Missing target user or feature.' };
  if (!FEATURES.some(f => f.key === featureKey)) {
    return { ok: false, error: `Unknown feature: ${featureKey}` };
  }

  const svc = adminService();

  // Read current map, merge the single key, write back.
  const { data: row, error: readErr } = await svc
    .from('profiles')
    .select('features')
    .eq('id', targetId)
    .maybeSingle();
  if (readErr) return { ok: false, error: readErr.message };

  const current = (row?.features ?? {}) as FeatureMap;
  const value: boolean | string = !enabled
    ? false
    : mode === 'lifetime'
      ? true
      : nextExpiry(current[featureKey]); // +30d, extends an active grant
  const next: FeatureMap = { ...current, [featureKey]: value };

  const { error } = await svc.from('profiles').update({ features: next }).eq('id', targetId);
  if (error) return { ok: false, error: error.message };

  await logAction({
    adminId:      admin.userId,
    targetUserId: targetId,
    action:       'feature',
    notes:        `${featureKey}=${enabled ? (mode === 'lifetime' ? 'lifetime' : `+${ADDON_TERM_DAYS}d`) : 'off'}`,
  });

  revalidatePath('/admin');
  return { ok: true };
}

// ── Get signed URL for the receipt (admin only) ─────────────────────────

export async function getReceiptSignedUrl(receiptPath: string): Promise<string | null> {
  await requireAdmin();
  if (!receiptPath) return null;
  const svc = adminService();
  const { data, error } = await svc.storage
    .from('receipts')
    .createSignedUrl(receiptPath, 60 * 10); // 10-minute link
  if (error) return null;
  return data?.signedUrl ?? null;
}
