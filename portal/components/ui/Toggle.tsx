'use client';

import * as React from 'react';

type Props = {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
};

/** A small controlled on/off switch styled to match the portal. */
export default function Toggle({ label, description, checked, onChange, disabled }: Props) {
  return (
    <label
      className={`flex items-start gap-3 rounded-[10px] border px-3 py-2.5 transition ${
        checked ? 'border-accent/30 bg-accent/[0.06]' : 'border-white bg-white/60'
      } ${disabled ? 'opacity-60' : 'cursor-pointer hover:bg-white'}`}
    >
      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-bold text-ink leading-tight">{label}</div>
        {description && (
          <p className="mt-0.5 text-[11.5px] font-medium text-ink-2/60 leading-snug">{description}</p>
        )}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={`relative mt-0.5 h-5 w-9 shrink-0 rounded-full transition-colors ${
          checked ? 'bg-lyna-cta' : 'bg-ink-2/25'
        } ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
            checked ? 'translate-x-[18px]' : 'translate-x-0.5'
          }`}
        />
      </button>
    </label>
  );
}
