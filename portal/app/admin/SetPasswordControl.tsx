'use client';

import { useState, useTransition } from 'react';
import Icon from '@/components/ui/Icon';
import { setUserPasswordAction } from './actions';

export default function SetPasswordControl({ userId, email }: { userId: string; email: string }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [pw, setPw] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  function submit() {
    setError(null);
    const fd = new FormData();
    fd.set('target_user_id', userId);
    fd.set('password', pw);
    startTransition(async () => {
      const res = await setUserPasswordAction(fd);
      if (res.ok) { setResult(res.password); setPw(''); }
      else setError(res.error);
    });
  }

  function copyCreds() {
    if (!result) return;
    navigator.clipboard
      .writeText(`Pharmetriks login\nEmail: ${email}\nPassword: ${result}`)
      .then(() => { setCopied(true); setTimeout(() => setCopied(false), 2500); })
      .catch(() => {});
  }

  return (
    <div className="rounded-[12px] border border-accent/25 bg-accent/5 p-3">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between gap-2 text-left"
      >
        <span className="inline-flex items-center gap-1.5 text-[11.5px] font-extrabold uppercase tracking-wider text-accent">
          <Icon name="lock" size={13} /> I-encode / palitan ang password
        </span>
        <Icon name="chevron-down" size={14} className={`text-ink-2/50 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="mt-2.5">
          {result ? (
            <div className="rounded-[10px] border border-emerald-200 bg-emerald-50/80 p-2.5">
              <div className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-800">
                Na-set ang password — i-copy ngayon
              </div>
              <div className="mt-1.5 rounded-[8px] bg-white/80 border border-emerald-200 px-2.5 py-1.5 font-mono text-[12.5px] text-ink">
                <div><span className="text-ink-2/60">Email:</span> {email}</div>
                <div><span className="text-ink-2/60">Password:</span> {result}</div>
              </div>
              <div className="mt-2 flex gap-2">
                <button type="button" onClick={copyCreds} className="btn-primary text-[12px] px-3 py-1.5">
                  {copied ? 'Na-copy ✓' : 'Copy credentials'}
                </button>
                <button type="button" onClick={() => setResult(null)} className="btn-ghost text-[12px] px-3 py-1.5">
                  Tapos
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {error && (
                <div className="rounded-[8px] border border-red-200 bg-red-50 px-2.5 py-1.5 text-[12px] font-semibold text-red-800">
                  {error}
                </div>
              )}
              <div className="flex gap-2">
                <input
                  value={pw}
                  onChange={e => setPw(e.target.value)}
                  placeholder="Bagong password (blangko = auto-generate)"
                  className="input text-[12.5px] flex-1"
                  autoComplete="off"
                />
                <button type="button" onClick={submit} disabled={pending} className="btn-primary text-[12.5px] px-3 py-2 whitespace-nowrap">
                  {pending ? 'Saving…' : 'I-set'}
                </button>
              </div>
              <p className="text-[11px] font-semibold text-ink-2/55">
                Pipindutin nito ang password ng account na alam mo — para ma-access/ma-import mo, o ma-share sa botika.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
