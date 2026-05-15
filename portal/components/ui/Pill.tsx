import * as React from 'react';

type Props = React.HTMLAttributes<HTMLSpanElement> & {
  tone?: 'pink' | 'blue' | 'white';
};

export default function Pill({ children, tone = 'white', className = '', ...rest }: Props) {
  const toneClass =
    tone === 'pink'
      ? 'bg-pink/55 border-pink text-ink-2'
      : tone === 'blue'
        ? 'bg-accent/15 border-accent/30 text-accent'
        : 'bg-white/75 border-white text-ink-2';
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-extrabold uppercase tracking-[1px] ${toneClass} ${className}`}
      {...rest}
    >
      {children}
    </span>
  );
}
