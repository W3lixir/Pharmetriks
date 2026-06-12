'use client';

import { useState, useTransition } from 'react';
import Icon from '@/components/ui/Icon';
import GlassCard from '@/components/ui/GlassCard';
import Toggle from '@/components/ui/Toggle';
import {
  FEATURES,
  featureActive,
  featureDaysLeft,
  nextExpiry,
  type FeatureMap,
} from '@/lib/features';
import { APP_PRICE_PHP, ADDON_PRICE_PHP, peso } from '@/lib/pricing';
import {
  approveUserAction,
  rejectUserAction,
  revokeUserAction,
  restoreUserAction,
  setFeatureAction,
  applyRequestedFeaturesAction,
  getReceiptSignedUrl,
} from './actions';
import type { ProfileStatus } from '@/lib/auth';

type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  pharmacy_name: string | null;
  status: ProfileStatus;
  receipt_url: string | null;
  payment_reference: string | null;
  approved_at: string | null;
  notes: string | null;
  created_at: string;
  features: FeatureMap | null;
  requested_features: Record<string, boolean> | null;
};

const STATUS_TONE: Record<ProfileStatus, string> = {
  pending:          'bg-amber-100  text-amber-800  border-amber-200',
  awaiting_payment: 'bg-accent/12  text-accent     border-accent/30',
  approved:         'bg-emerald-100 text-emerald-800 border-emerald-200',
  rejected:         'bg-red-100    text-red-800    border-red-200',
  revoked:          'bg-red-100    text-red-800    border-red-200',
};

const STATUS_LABEL: Record<ProfileStatus, string> = {
  pending:          'Pending (no receipt)',
  awaiting_payment: 'Awaiting review',
  approved:         'Approved',
  rejected:         'Rejected',
  revoked:          'Revoked',
};

export default function UserRow({ profile }: { profile: Profile }) {
  const [open, setOpen] = useState(profile.status === 'awaiting_payment');
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);
  const [loadingReceipt, setLoadingReceipt] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [actionLabel, setActionLabel] = useState<string | null>(null);

  // Approve/reject inline state
  const [rejectReason, setRejectReason] = useState('');
  const [revokeReason, setRevokeReason] = useState('');
  const [approveNotes, setApproveNotes] = useState('');

  // Per-account add-on grants (optimistic local copy). Values may be a boolean
  // (lifetime/off) or an ISO expiry string (monthly add-ons).
  const [features, setFeatures] = useState<FeatureMap>(profile.features ?? {});

  // Add-ons the user picked at checkout but isn't currently entitled to
  // (covers brand-new add-ons AND renewals of lapsed ones).
  const requested = profile.requested_features ?? {};
  const requestedNew = FEATURES.filter(
    f => requested[f.key] === true && !featureActive(features[f.key]),
  );
  // What the GCash screenshot amount should read:
  // new signups pay base + add-ons; approved users (upgrades) pay add-ons only.
  const isFirstPurchase = profile.status === 'pending' || profile.status === 'awaiting_payment';
  const expectedTotal = (isFirstPurchase ? APP_PRICE_PHP : 0) + requestedNew.length * ADDON_PRICE_PHP;

  function toggleFeature(key: string) {
    const turningOn = !featureActive(features[key]);
    const prev = features;
    // Optimistic: enabling grants/extends a 30-day term, disabling turns off.
    setFeatures({ ...features, [key]: turningOn ? nextExpiry(features[key]) : false });
    setError(null);
    setActionLabel(`feature:${key}`);
    const fd = new FormData();
    fd.set('target_user_id', profile.id);
    fd.set('feature_key', key);
    fd.set('enabled', String(turningOn));
    startTransition(async () => {
      const res = await setFeatureAction(fd);
      if (res && 'ok' in res && !res.ok) {
        setError(res.error);
        setFeatures(prev); // revert on failure
      }
      setActionLabel(null);
    });
  }

  async function loadReceipt() {
    if (!profile.receipt_url || receiptUrl || loadingReceipt) return;
    setLoadingReceipt(true);
    const url = await getReceiptSignedUrl(profile.receipt_url);
    setReceiptUrl(url);
    setLoadingReceipt(false);
  }

  function run(
    label: string,
    action: (fd: FormData) => Promise<{ ok: true } | { ok: false; error: string }>,
    fd: FormData,
  ) {
    setError(null);
    setActionLabel(label);
    startTransition(async () => {
      const res = await action(fd);
      if (res && 'ok' in res && !res.ok) setError(res.error);
      setActionLabel(null);
    });
  }

  function approve() {
    const fd = new FormData();
    fd.set('target_user_id', profile.id);
    if (approveNotes.trim()) fd.set('notes', approveNotes.trim());
    // The server auto-applies requested add-ons on approve — mirror it locally
    // so the toggles don't look stale until the page refreshes.
    if (requestedNew.length) {
      setFeatures(prev => {
        const next = { ...prev };
        for (const f of requestedNew) next[f.key] = nextExpiry(prev[f.key]);
        return next;
      });
    }
    run('Approving', approveUserAction, fd);
  }

  function applyRequested() {
    const prev = features;
    setFeatures(p => {
      const next = { ...p };
      for (const f of requestedNew) next[f.key] = nextExpiry(p[f.key]);
      return next;
    });
    setError(null);
    setActionLabel('ApplyRequested');
    const fd = new FormData();
    fd.set('target_user_id', profile.id);
    startTransition(async () => {
      const res = await applyRequestedFeaturesAction(fd);
      if (res && 'ok' in res && !res.ok) {
        setError(res.error);
        setFeatures(prev); // revert on failure
      }
      setActionLabel(null);
    });
  }

  function reject() {
    if (!rejectReason.trim()) {
      setError('Please add a reason — the user will see it on their /pending page.');
      return;
    }
    const fd = new FormData();
    fd.set('target_user_id', profile.id);
    fd.set('reason', rejectReason.trim());
    run('Rejecting', rejectUserAction, fd);
  }

  function revoke() {
    if (!revokeReason.trim()) {
      setError('Please add a reason — the user will see it on their /pending page.');
      return;
    }
    const fd = new FormData();
    fd.set('target_user_id', profile.id);
    fd.set('reason', revokeReason.trim());
    run('Revoking', revokeUserAction, fd);
  }

  function restore() {
    const fd = new FormData();
    fd.set('target_user_id', profile.id);
    run('Restoring', restoreUserAction, fd);
  }

  const initials = (profile.full_name || profile.email || '?')
    .split(/[\s@]/)
    .filter(Boolean)
    .slice(0, 2)
    .map(s => s[0]?.toUpperCase())
    .join('');

  return (
    <GlassCard>
      {/* Summary row */}
      <button
        type="button"
        onClick={() => { setOpen(v => !v); loadReceipt(); }}
        className="w-full flex items-center gap-3 px-4 py-3 text-left"
      >
        <div className="grid h-10 w-10 place-items-center rounded-full bg-lyna-cta text-white shadow-glass shrink-0 text-[12px] font-extrabold">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[14px] font-extrabold text-ink truncate">
              {profile.full_name || '(no name)'}
            </span>
            <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider ${STATUS_TONE[profile.status]}`}>
              {STATUS_LABEL[profile.status]}
            </span>
            {requestedNew.length > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-100 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-amber-800">
                +{requestedNew.length} add-on{requestedNew.length > 1 ? 's' : ''} requested
              </span>
            )}
          </div>
          <div className="text-[12px] font-semibold text-ink-2/70 truncate">
            {profile.email} · {profile.pharmacy_name || 'no pharmacy'}
          </div>
        </div>
        <div className="hidden sm:block text-right text-[11px] text-ink-2/60 font-semibold shrink-0">
          {new Date(profile.created_at).toLocaleDateString('en-PH', { dateStyle: 'medium' })}
        </div>
        <Icon name="chevron-down" size={16} className={`text-ink-2/60 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="border-t border-white/60 px-4 py-4 grid gap-4 lg:grid-cols-[1fr_1.1fr]">
          {/* Left: details */}
          <div className="space-y-3 text-[13px]">
            <DetailRow label="Email" value={profile.email} mono />
            <DetailRow label="Full name" value={profile.full_name ?? '—'} />
            <DetailRow label="Pharmacy" value={profile.pharmacy_name ?? '—'} />
            <DetailRow
              label="Signed up"
              value={new Date(profile.created_at).toLocaleString('en-PH', { dateStyle: 'long', timeStyle: 'short' })}
            />
            {profile.payment_reference && (
              <DetailRow label="GCash reference" value={profile.payment_reference} mono />
            )}
            {profile.notes && (
              <DetailRow label="Notes" value={profile.notes} />
            )}
            {profile.approved_at && (
              <DetailRow
                label="Approved at"
                value={new Date(profile.approved_at).toLocaleString('en-PH', { dateStyle: 'long', timeStyle: 'short' })}
              />
            )}
          </div>

          {/* Right: receipt preview */}
          <div>
            <div className="text-[11px] font-extrabold uppercase tracking-[1.5px] text-accent mb-1.5">
              Receipt
            </div>
            {profile.receipt_url ? (
              loadingReceipt ? (
                <ReceiptPlaceholder label="Loading receipt…" />
              ) : receiptUrl ? (
                <a
                  href={receiptUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block rounded-glass overflow-hidden border border-white/65 bg-white/70 backdrop-blur-md"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={receiptUrl}
                    alt={`Receipt for ${profile.email}`}
                    className="block w-full max-h-80 object-contain bg-white"
                  />
                  <div className="px-3 py-2 text-[11.5px] font-bold text-accent flex items-center gap-1.5">
                    <Icon name="arrow-right" size={12} /> Open full size in new tab
                  </div>
                </a>
              ) : (
                <ReceiptPlaceholder label="Couldn't load receipt — check console." />
              )
            ) : (
              <ReceiptPlaceholder label="No receipt uploaded yet." />
            )}

            {/* Requested add-ons + expected GCash amount, right beside the
                receipt so the amount check is unmissable. */}
            {requestedNew.length > 0 && (
              <div className="mt-3 rounded-glass border border-amber-200 bg-amber-50/70 p-3">
                <div className="text-[11px] font-extrabold uppercase tracking-[1.5px] text-amber-800">
                  Requested add-ons
                </div>
                <ul className="mt-1.5 space-y-1">
                  {requestedNew.map(f => (
                    <li key={f.key} className="flex items-center justify-between gap-2 text-[12.5px] font-semibold text-ink-2">
                      <span>{f.label}</span>
                      <span className="font-mono text-[11.5px] font-bold text-ink-2/70">{peso(ADDON_PRICE_PHP)}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-2 border-t border-amber-200 pt-2 text-[12.5px] font-extrabold text-ink">
                  Expected:{' '}
                  {isFirstPurchase
                    ? `${peso(APP_PRICE_PHP)} + ${requestedNew.length} × ${peso(ADDON_PRICE_PHP)} = ${peso(expectedTotal)}`
                    : `${requestedNew.length} × ${peso(ADDON_PRICE_PHP)} = ${peso(expectedTotal)} (new add-ons only)`}
                </div>
                {profile.status === 'approved' && (
                  <button
                    type="button"
                    onClick={applyRequested}
                    disabled={pending}
                    className="mt-2 w-full inline-flex items-center justify-center gap-1.5 rounded-[10px] bg-amber-600 px-3 py-2 text-[13px] font-bold text-white hover:bg-amber-700 disabled:opacity-60"
                  >
                    {pending && actionLabel === 'ApplyRequested'
                      ? 'Applying…'
                      : <><Icon name="check" size={14} strokeWidth={2.6} /> Apply requested add-ons</>}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Add-on features — admin toggles per account */}
          <div className="lg:col-span-2 pt-4 border-t border-white/60">
            <div className="flex items-center justify-between mb-2">
              <div className="text-[11px] font-extrabold uppercase tracking-[1.5px] text-accent">
                Add-on features
                <span className="ml-1.5 font-bold normal-case tracking-normal text-ink-2/45">
                  ({peso(ADDON_PRICE_PHP)}/buwan · toggle = +30 araw)
                </span>
              </div>
              <span className="text-[11px] font-semibold text-ink-2/55">
                {FEATURES.filter(f => featureActive(features[f.key])).length} of {FEATURES.length} active
              </span>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {FEATURES.map(f => {
                const v = features[f.key];
                const active = featureActive(v);
                const days = featureDaysLeft(v);
                const term = !active
                  ? null
                  : v === true
                    ? 'lifetime'
                    : days !== null
                      ? `${days} araw na natira`
                      : null;
                return (
                  <Toggle
                    key={f.key}
                    label={term ? `${f.label} — ${term}` : f.label}
                    description={f.description}
                    checked={active}
                    disabled={pending}
                    onChange={() => toggleFeature(f.key)}
                  />
                );
              })}
            </div>
          </div>

          {/* Bottom: actions */}
          <div className="lg:col-span-2 pt-2 border-t border-white/60">
            {error && (
              <div className="mb-3 rounded-[10px] border border-red-200 bg-red-50 px-3 py-2 text-[13px] font-semibold text-red-800">
                {error}
              </div>
            )}

            {/* Status-aware action panel */}
            {profile.status === 'awaiting_payment' || profile.status === 'pending' ? (
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-[12px] border border-emerald-200 bg-emerald-50/60 p-3">
                  <div className="text-[11.5px] font-extrabold uppercase tracking-wider text-emerald-800">
                    Approve
                  </div>
                  <input
                    type="text"
                    placeholder="Internal note (optional)"
                    value={approveNotes}
                    onChange={e => setApproveNotes(e.target.value)}
                    className="input mt-2 text-[12.5px]"
                  />
                  <button
                    type="button"
                    onClick={approve}
                    disabled={pending}
                    className="mt-2 w-full inline-flex items-center justify-center gap-1.5 rounded-[10px] bg-emerald-600 px-3 py-2 text-[13px] font-bold text-white hover:bg-emerald-700 disabled:opacity-60"
                  >
                    {pending && actionLabel === 'Approving' ? 'Approving…' : <><Icon name="check" size={14} strokeWidth={2.6} /> Approve</>}
                  </button>
                </div>

                <div className="rounded-[12px] border border-red-200 bg-red-50/60 p-3">
                  <div className="text-[11.5px] font-extrabold uppercase tracking-wider text-red-800">
                    Reject
                  </div>
                  <input
                    type="text"
                    placeholder="Internal reason (shown on /pending)"
                    value={rejectReason}
                    onChange={e => setRejectReason(e.target.value)}
                    className="input mt-2 text-[12.5px]"
                  />
                  <button
                    type="button"
                    onClick={reject}
                    disabled={pending}
                    className="mt-2 w-full inline-flex items-center justify-center gap-1.5 rounded-[10px] bg-red-600 px-3 py-2 text-[13px] font-bold text-white hover:bg-red-700 disabled:opacity-60"
                  >
                    {pending && actionLabel === 'Rejecting' ? 'Rejecting…' : <><Icon name="x" size={14} strokeWidth={2.6} /> Reject</>}
                  </button>
                </div>
              </div>
            ) : profile.status === 'approved' ? (
              <div className="rounded-[12px] border border-red-200 bg-red-50/60 p-3">
                <div className="text-[11.5px] font-extrabold uppercase tracking-wider text-red-800">
                  Revoke access
                </div>
                <input
                  type="text"
                  placeholder="Internal reason (shown on /pending)"
                  value={revokeReason}
                  onChange={e => setRevokeReason(e.target.value)}
                  className="input mt-2 text-[12.5px]"
                />
                <button
                  type="button"
                  onClick={revoke}
                  disabled={pending}
                  className="mt-2 inline-flex items-center justify-center gap-1.5 rounded-[10px] bg-red-600 px-3 py-2 text-[13px] font-bold text-white hover:bg-red-700 disabled:opacity-60"
                >
                  {pending && actionLabel === 'Revoking' ? 'Revoking…' : <><Icon name="x" size={14} strokeWidth={2.6} /> Revoke access</>}
                </button>
              </div>
            ) : (
              // rejected or revoked
              <div className="rounded-[12px] border border-emerald-200 bg-emerald-50/60 p-3">
                <div className="text-[11.5px] font-extrabold uppercase tracking-wider text-emerald-800">
                  Restore access
                </div>
                <p className="mt-1 text-[12px] font-medium text-emerald-900/80">
                  Sets back to <strong>approved</strong>. Message the user directly to let them know.
                </p>
                <button
                  type="button"
                  onClick={restore}
                  disabled={pending}
                  className="mt-2 inline-flex items-center justify-center gap-1.5 rounded-[10px] bg-emerald-600 px-3 py-2 text-[13px] font-bold text-white hover:bg-emerald-700 disabled:opacity-60"
                >
                  {pending && actionLabel === 'Restoring' ? 'Restoring…' : <><Icon name="check" size={14} strokeWidth={2.6} /> Restore as approved</>}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </GlassCard>
  );
}

function DetailRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-white/60 pb-2 last:border-0 last:pb-0">
      <div className="text-[11px] font-extrabold uppercase tracking-wider text-ink-2/60 shrink-0 pt-0.5">
        {label}
      </div>
      <div className={`text-right text-ink-2 ${mono ? 'font-mono text-[12.5px] font-bold' : 'text-[13px] font-semibold'}`}>
        {value}
      </div>
    </div>
  );
}

function ReceiptPlaceholder({ label }: { label: string }) {
  return (
    <div className="rounded-glass border border-dashed border-accent-soft/40 bg-white/60 backdrop-blur-md grid place-items-center py-12 px-4 text-center">
      <Icon name="install" size={26} className="text-ink-2/40 rotate-180" />
      <p className="mt-2 text-[12.5px] font-bold text-ink-2/70">{label}</p>
    </div>
  );
}
