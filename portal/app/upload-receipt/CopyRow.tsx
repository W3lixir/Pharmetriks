'use client';

import { useState } from 'react';
import Icon from '@/components/ui/Icon';

type Props = {
  label: string;
  value: string;
  highlight?: boolean;
};

export default function CopyRow({ label, value, highlight }: Props) {
  const [copied, setCopied] = useState(false);

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = value;
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); } catch {}
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <button
      type="button"
      onClick={onCopy}
      className={`group flex items-center justify-between gap-3 rounded-[10px] border px-3 py-2.5 text-left transition ${
        highlight
          ? 'bg-accent/8 border-accent/30 hover:bg-accent/15'
          : 'bg-white/60 border-white hover:bg-white'
      }`}
    >
      <div>
        <div className="text-[10.5px] font-extrabold uppercase tracking-wider text-ink-2/60">
          {label}
        </div>
        <div className={`font-mono mt-0.5 ${highlight ? 'text-[18px] font-black text-accent' : 'text-[13.5px] font-bold text-ink'}`}>
          {value}
        </div>
      </div>
      <span
        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10.5px] font-extrabold uppercase tracking-wider transition ${
          copied
            ? 'bg-emerald-500 text-white'
            : 'bg-ink/10 text-ink-2/70 group-hover:bg-ink/20'
        }`}
      >
        <Icon name={copied ? 'check' : 'sparkle'} size={11} strokeWidth={2.6} />
        {copied ? 'Copied' : 'Tap to copy'}
      </span>
    </button>
  );
}
