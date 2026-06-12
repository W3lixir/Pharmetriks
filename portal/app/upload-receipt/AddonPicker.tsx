'use client';

// Add-on selection at checkout: toggle the add-ons you want, see the live
// total. In upgrade mode, already-owned add-ons render checked + disabled.

import Toggle from '@/components/ui/Toggle';
import { FEATURES, type FeatureMap } from '@/lib/features';
import { APP_PRICE_PHP, ADDON_PRICE_PHP, peso } from '@/lib/pricing';

type Props = {
  selected: FeatureMap;
  onChange: (next: FeatureMap) => void;
  /** Add-ons the account already owns (upgrade mode) — shown locked-on. */
  granted?: FeatureMap;
  /** 'new' = base app + add-ons; 'upgrade' = new add-ons only. */
  mode: 'new' | 'upgrade';
};

export default function AddonPicker({ selected, onChange, granted, mode }: Props) {
  const ownedKeys = new Set(
    FEATURES.filter(f => granted?.[f.key] === true).map(f => f.key),
  );
  const pickedCount = FEATURES.filter(
    f => selected[f.key] === true && !ownedKeys.has(f.key),
  ).length;
  const addonsTotal = pickedCount * ADDON_PRICE_PHP;
  const total = mode === 'new' ? APP_PRICE_PHP + addonsTotal : addonsTotal;

  function toggle(key: string, on: boolean) {
    const next = { ...selected };
    if (on) next[key] = true;
    else delete next[key];
    onChange(next);
  }

  return (
    <div className="rounded-glass border border-white/65 bg-white/70 backdrop-blur-md p-4 shadow-glass">
      <div className="flex items-baseline justify-between gap-2">
        <div className="text-[12.5px] font-extrabold tracking-tight text-ink-2">
          {mode === 'new' ? 'Optional add-ons' : 'Pumili ng bagong add-ons'}
        </div>
        <div className="text-[11px] font-bold text-ink-2/60">
          {peso(ADDON_PRICE_PHP)} / buwan bawat isa
        </div>
      </div>

      <div className="mt-2.5 grid gap-1.5">
        {FEATURES.map(f => {
          const owned = ownedKeys.has(f.key);
          return (
            <Toggle
              key={f.key}
              label={owned ? `${f.label} — sa 'yo na ito` : f.label}
              description={f.description}
              checked={owned || selected[f.key] === true}
              disabled={owned}
              onChange={on => toggle(f.key, on)}
            />
          );
        })}
      </div>

      <div className="mt-3 rounded-[10px] border border-white bg-white/70 px-3 py-2.5 text-[12.5px] font-semibold text-ink-2/85">
        {mode === 'new' && (
          <div className="flex items-center justify-between">
            <span>Base app</span>
            <span className="font-mono font-bold">{peso(APP_PRICE_PHP)}</span>
          </div>
        )}
        <div className="flex items-center justify-between">
          <span>
            Add-ons{pickedCount > 0 && (
              <> · {pickedCount} × {peso(ADDON_PRICE_PHP)}/buwan</>
            )}
          </span>
          <span className="font-mono font-bold">{peso(addonsTotal)}</span>
        </div>
        <div className="mt-1.5 flex items-center justify-between border-t border-ink-2/10 pt-1.5 text-[14px] font-extrabold text-ink">
          <span>{mode === 'new' ? 'Babayaran ngayon' : 'Babayaran (unang buwan)'}</span>
          <span className="font-mono text-accent">{peso(total)}</span>
        </div>
        {pickedCount > 0 && (
          <div className="mt-1 text-right text-[10.5px] font-semibold text-ink-2/55">
            {mode === 'new'
              ? `Kasama ang ₱${APP_PRICE_PHP.toLocaleString('en-PH')} base (one-time) + ${peso(addonsTotal)}/buwan add-ons`
              : `${peso(addonsTotal)} kada buwan para sa add-ons`}
          </div>
        )}
      </div>

      {mode === 'upgrade' && pickedCount === 0 && (
        <p className="mt-2 text-[11.5px] font-semibold text-ink-2/60">
          Pumili muna ng kahit isang add-on bago magbayad.
        </p>
      )}
      <p className="mt-2 text-[11px] font-semibold text-ink-2/55 leading-relaxed">
        Base app (₱{APP_PRICE_PHP.toLocaleString('en-PH')}) ay one-time. Ang mga add-on
        ay ₱{ADDON_PRICE_PHP}/buwan kada isa — i-renew tuwing buwan para manatiling bukas.
      </p>
    </div>
  );
}
