'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Icon from '@/components/ui/Icon';
import GlassCard from '@/components/ui/GlassCard';
import { createFromRequestAction, rejectRequestAction } from './actions';

export type SignupRequestView = {
  id: string;
  fullName: string;
  pharmacyName: string;
  email: string;
  password: string;
  paymentReference: string;
  createdAt: string;
  receiptUrl: string | null;
};

export default function RequestsManager({ requests }: { requests: SignupRequestView[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [zoom, setZoom] = useState<string | null>(null);

  function run(id: string, fn: typeof createFromRequestAction) {
    setError(null); setBusy(id);
    const fd = new FormData(); fd.set('id', id);
    startTransition(async () => {
      const res = await fn(fd);
      setBusy(null);
      if (res.ok) router.refresh(); else setError(res.error);
    });
  }

  if (!requests.length) {
    return (
      <GlassCard className="p-8 text-center text-[13.5px] font-semibold text-ink-2/60">
        Walang pending request. 🎉 Lalabas dito ang mga bagong signup.
      </GlassCard>
    );
  }

  return (
    <div className="space-y-3">
      {error && <div className="rounded-[10px] border border-red-200 bg-red-50 px-3 py-2 text-[13px] font-semibold text-red-800">{error}</div>}

      {requests.map(r => (
        <GlassCard key={r.id} className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Receipt preview */}
            <button
              type="button"
              onClick={() => r.receiptUrl && setZoom(r.receiptUrl)}
              className="shrink-0 self-start overflow-hidden rounded-[10px] border border-white/60 bg-white/40"
              style={{ width: 96, height: 96 }}
              title="I-click para palakihin"
            >
              {r.receiptUrl
                ? <img src={r.receiptUrl} alt="Resibo" className="h-full w-full object-cover" />
                : <span className="grid h-full w-full place-items-center text-[10px] font-bold text-ink-2/50">walang resibo</span>}
            </button>

            {/* Details */}
            <div className="min-w-0 flex-1">
              <div className="text-[15px] font-extrabold text-ink">{r.pharmacyName}</div>
              <div className="mt-0.5 text-[12.5px] font-semibold text-ink-2/75">{r.fullName}</div>
              <div className="mt-2 grid gap-1 text-[12.5px]">
                <div><span className="font-bold text-ink-2/60">Email:</span> {r.email}</div>
                <div><span className="font-bold text-ink-2/60">Suggested password:</span> <code className="rounded bg-ink/5 px-1.5 py-0.5 font-mono text-[12px]">{r.password || '—'}</code></div>
                {r.paymentReference && <div><span className="font-bold text-ink-2/60">GCash ref:</span> {r.paymentReference}</div>}
                <div className="text-[11.5px] text-ink-2/50">{new Date(r.createdAt).toLocaleString('en-PH')}</div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-row sm:flex-col gap-2 shrink-0">
              <button
                onClick={() => run(r.id, createFromRequestAction)}
                disabled={pending}
                className="btn-primary text-[12.5px] px-3 py-2 whitespace-nowrap"
              >
                {busy === r.id ? 'Ginagawa…' : <>Create account</>}
              </button>
              <button
                onClick={() => { if (confirm(`I-reject ang request ni ${r.pharmacyName}?`)) run(r.id, rejectRequestAction); }}
                disabled={pending}
                className="btn-ghost text-[12.5px] px-3 py-2 text-red-600 whitespace-nowrap"
              >
                Reject
              </button>
            </div>
          </div>
        </GlassCard>
      ))}

      {/* Zoom overlay */}
      {zoom && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-6"
          onClick={() => setZoom(null)}
        >
          <img src={zoom} alt="Resibo" className="max-h-[90vh] max-w-[90vw] rounded-[12px] object-contain" />
        </div>
      )}
    </div>
  );
}
