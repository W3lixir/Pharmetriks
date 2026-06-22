'use client';

import { useState, useTransition } from 'react';
import Icon from '@/components/ui/Icon';
import GlassCard from '@/components/ui/GlassCard';
import { createAccountAction } from './actions';

export default function CreateAccountCard() {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<{ email: string; password: string } | null>(null);
  const [copied, setCopied] = useState(false);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const fd = new FormData(form);
    startTransition(async () => {
      const res = await createAccountAction(fd);
      if (res.ok) {
        setCreated({ email: res.email, password: res.password });
        setCopied(false);
        form.reset();
      } else {
        setError(res.error);
      }
    });
  }

  function copyCreds() {
    if (!created) return;
    navigator.clipboard
      .writeText(`Pharmetriks login\nEmail: ${created.email}\nPassword: ${created.password}`)
      .then(() => { setCopied(true); setTimeout(() => setCopied(false), 2500); })
      .catch(() => {});
  }

  return (
    <GlassCard className="p-3 sm:p-4">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between gap-2 text-left"
      >
        <span className="inline-flex items-center gap-2 text-[14px] font-extrabold text-ink">
          <span className="grid h-7 w-7 place-items-center rounded-[9px] bg-lyna-cta text-white shadow-glass">
            <Icon name="install" size={14} className="rotate-180" />
          </span>
          Gumawa ng account para sa botika
        </span>
        <Icon name="chevron-down" size={16} className={`text-ink-2/60 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="mt-3 border-t border-white/60 pt-3">
          {created ? (
            <div className="rounded-[12px] border border-emerald-200 bg-emerald-50/70 p-3">
              <div className="flex items-center gap-1.5 text-[12px] font-extrabold uppercase tracking-wider text-emerald-800">
                <Icon name="check-circle" size={14} strokeWidth={2.4} /> Account created — auto-approved
              </div>
              <p className="mt-1.5 text-[12.5px] font-semibold text-emerald-900/80">
                I-save / i-share ang credentials na ito — <strong>ipinapakita ito ngayon lang</strong> (hindi naka-store ang password).
              </p>
              <div className="mt-2 rounded-[10px] bg-white/80 border border-emerald-200 px-3 py-2 font-mono text-[13px] text-ink">
                <div><span className="text-ink-2/60">Email:</span> {created.email}</div>
                <div><span className="text-ink-2/60">Password:</span> {created.password}</div>
              </div>
              <div className="mt-2 flex gap-2">
                <button type="button" onClick={copyCreds} className="btn-primary text-[12.5px] px-3 py-2">
                  {copied ? 'Na-copy ✓' : <>Copy credentials</>}
                </button>
                <button type="button" onClick={() => setCreated(null)} className="btn-ghost text-[12.5px] px-3 py-2">
                  Gumawa ng iba pa
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="grid gap-3 sm:grid-cols-2" noValidate>
              {error && (
                <div className="sm:col-span-2 rounded-[10px] border border-red-200 bg-red-50 px-3 py-2 text-[13px] font-semibold text-red-800">
                  {error}
                </div>
              )}
              <label className="flex flex-col gap-1 sm:col-span-2">
                <span className="text-[12px] font-extrabold text-ink-2">Pharmacy name *</span>
                <input name="pharmacy_name" required placeholder="e.g. People's Pharmacy" className="input" autoComplete="off" />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-[12px] font-extrabold text-ink-2">Pangalan ng may-ari</span>
                <input name="full_name" placeholder="e.g. Aaron Damian" className="input" autoComplete="off" />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-[12px] font-extrabold text-ink-2">Email *</span>
                <input name="email" type="email" required placeholder="botika@gmail.com" className="input" autoComplete="off" inputMode="email" />
              </label>
              <label className="flex flex-col gap-1 sm:col-span-2">
                <span className="text-[12px] font-extrabold text-ink-2">Password (opsyonal — auto-generate kung blangko)</span>
                <input name="password" placeholder="Iwan blangko para sa random na password" className="input" autoComplete="off" />
              </label>
              <div className="sm:col-span-2 flex justify-end">
                <button type="submit" disabled={pending} className="btn-primary text-[13px] px-4 py-2.5">
                  {pending ? 'Ginagawa…' : <>Gumawa ng account <Icon name="arrow-right" size={14} /></>}
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </GlassCard>
  );
}
