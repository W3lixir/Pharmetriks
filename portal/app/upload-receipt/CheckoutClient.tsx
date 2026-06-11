'use client';

// Owns the add-on selection state so the GCash card's "Amount" updates live
// as the user toggles add-ons. Composes: GcashCard | AddonPicker + UploadForm.

import { useState } from 'react';
import GcashCard from './GcashCard';
import AddonPicker from './AddonPicker';
import UploadForm from './UploadForm';
import { FEATURES, type FeatureMap } from '@/lib/features';
import { APP_PRICE_PHP, ADDON_PRICE_PHP, peso } from '@/lib/pricing';

type Props = {
  qrSrc: string;
  isRealQr: boolean;
  gcashNumber: string;
  gcashName: string;
  /** 'new' = first purchase (base + add-ons); 'upgrade' = add-ons only. */
  mode: 'new' | 'upgrade';
  /** Already-granted features (upgrade mode). */
  granted: FeatureMap;
  /** Previously saved selection (re-render after a failed submit / revisit). */
  initialSelected: FeatureMap;
};

export default function CheckoutClient({
  qrSrc, isRealQr, gcashNumber, gcashName, mode, granted, initialSelected,
}: Props) {
  // Keep only valid, not-yet-owned keys from the saved selection.
  const [selected, setSelected] = useState<FeatureMap>(() => {
    const out: FeatureMap = {};
    for (const f of FEATURES) {
      if (initialSelected[f.key] === true && granted[f.key] !== true) out[f.key] = true;
    }
    return out;
  });

  const pickedCount = FEATURES.filter(
    f => selected[f.key] === true && granted[f.key] !== true,
  ).length;
  const total = mode === 'new'
    ? APP_PRICE_PHP + pickedCount * ADDON_PRICE_PHP
    : pickedCount * ADDON_PRICE_PHP;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
      <GcashCard
        qrSrc={qrSrc}
        isRealQr={isRealQr}
        gcashNumber={gcashNumber}
        gcashName={gcashName}
        amount={peso(total)}
      />
      <div className="flex flex-col gap-4">
        <AddonPicker
          selected={selected}
          onChange={setSelected}
          granted={granted}
          mode={mode}
        />
        <div>
          <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-2.5 py-1 text-[10.5px] font-extrabold uppercase tracking-wider text-accent">
            Step 2 of 2
          </div>
          <UploadForm
            requestedFeatures={selected}
            submitDisabled={mode === 'upgrade' && pickedCount === 0}
          />
        </div>
      </div>
    </div>
  );
}
