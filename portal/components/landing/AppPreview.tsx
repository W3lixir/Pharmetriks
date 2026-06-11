import Icon from '@/components/ui/Icon';

/**
 * A stylized phone frame containing a faithful mini-render of the
 * Pharmetriks dispensing screen. Pure CSS/SVG — no images, scales cleanly.
 */
export default function AppPreview() {
  return (
    <div className="relative mx-auto aspect-[9/16] w-full max-w-[320px]">
      {/* phone frame */}
      <div className="absolute inset-0 rounded-[36px] bg-ink shadow-glass-lg">
        <div className="absolute inset-[6px] rounded-[30px] overflow-hidden bg-pink-soft">
          {/* notch */}
          <div className="absolute left-1/2 top-1.5 z-20 h-4 w-20 -translate-x-1/2 rounded-full bg-ink" />

          {/* status bar */}
          <div className="absolute inset-x-0 top-0 z-10 flex h-7 items-center justify-between px-5 text-[10px] font-bold text-white bg-gradient-to-b from-ink to-ink-2">
            <span>9:41</span>
            <span className="flex items-center gap-1 opacity-85">
              <Icon name="wifi-off" size={11} /> Offline
            </span>
          </div>

          {/* mobile header */}
          <div className="relative pt-7">
            <div className="flex items-center gap-2 px-3 py-2.5 bg-gradient-to-b from-ink to-ink-2 text-white">
              <div className="h-6 w-6 grid place-items-center rounded-md bg-white/15 border border-white/25">
                <span className="text-[9px] font-extrabold">Rx</span>
              </div>
              <div className="flex-1">
                <div className="text-[11px] font-extrabold leading-none">Pharmetriks</div>
                <div className="text-[8.5px] text-white/60 mt-0.5">Offline Pharmacy</div>
              </div>
              <div className="h-5 w-5 rounded-full bg-accent-soft/30 border border-white/25 grid place-items-center">
                <Icon name="help" size={10} />
              </div>
            </div>
          </div>

          {/* page content */}
          <div className="px-3 pt-3 pb-12 text-ink">
            <div className="text-[15px] font-extrabold tracking-tight leading-tight">
              Record Sale
            </div>
            <div className="text-[10px] text-accent-soft font-semibold mt-0.5">
              Search a product, add to cart
            </div>

            {/* search */}
            <div className="mt-3 flex items-center gap-2 rounded-[10px] border border-accent-soft/30 bg-white/75 px-2.5 py-2 backdrop-blur-sm">
              <Icon name="search" size={12} className="text-accent-soft" />
              <span className="text-[10.5px] text-accent-soft/80 font-medium">Search product…</span>
            </div>

            {/* product list */}
            <div className="mt-3 rounded-[12px] border border-white/65 bg-white/65 backdrop-blur-sm overflow-hidden">
              {[
                { g: 'Paracetamol', b: '500mg', s: 124, accent: false },
                { g: 'Amoxicillin', b: '250mg', s: 42,  accent: true  },
                { g: 'Loperamide',  b: '2mg',   s: 8,   warn: true    },
              ].map((p, i) => (
                <div
                  key={p.g}
                  className={`flex items-center gap-2 px-2.5 py-2 ${
                    i < 2 ? 'border-b border-accent-soft/15' : ''
                  } ${p.accent ? 'bg-accent-soft/15' : ''}`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] font-bold text-ink leading-tight">
                      {p.g}
                      <span className="ml-1 text-[10px] font-medium text-slate-400">{p.b}</span>
                    </div>
                    <div className="text-[9px] mt-0.5 font-semibold">
                      <span className={p.warn ? 'text-red-500' : 'text-accent'}>
                        Stock: {p.s}
                      </span>
                      {p.accent && (
                        <span className="ml-1 text-accent inline-flex items-center gap-0.5">
                          · <Icon name="check" size={9} /> In cart
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* cart */}
            <div className="mt-3 rounded-[12px] border border-white/65 bg-white/80 backdrop-blur-sm p-2.5">
              <div className="flex items-center justify-between text-[10.5px] font-extrabold text-ink">
                <span>Cart</span>
                <span className="text-accent">₱248.00</span>
              </div>
              <div className="mt-2 rounded-[8px] bg-white/80 border-l-2 border-accent px-2 py-1.5 flex items-center gap-2">
                <div className="flex-1">
                  <div className="text-[10px] font-extrabold leading-tight">Amoxicillin</div>
                  <div className="text-[8.5px] text-accent-soft mt-0.5 font-semibold">₱62/unit</div>
                </div>
                <div className="text-right">
                  <div className="text-[8px] font-extrabold uppercase text-accent-soft tracking-wide">Qty</div>
                  <div className="text-[18px] font-black text-accent leading-none -mt-0.5">4</div>
                </div>
              </div>
              <button className="mt-2.5 w-full rounded-[8px] py-2 text-[11px] font-bold text-white bg-lyna-cta shadow flex items-center justify-center gap-1.5">
                <Icon name="check" size={12} /> Dispense
              </button>
            </div>
          </div>

          {/* bottom tab bar */}
          <div className="absolute inset-x-0 bottom-0 z-10 flex justify-around bg-ink/85 backdrop-blur-md py-2 border-t border-accent-soft/25">
            {[
              { n: 'dispense'  as const, label: 'Dispensing', active: true  },
              { n: 'inventory' as const, label: 'Inventory',  active: false },
              { n: 'opex'      as const, label: 'OPEX',       active: false },
            ].map(t => (
              <div
                key={t.label}
                className={`flex flex-col items-center gap-0.5 ${
                  t.active ? 'text-accent-soft' : 'text-white/45'
                }`}
              >
                <Icon name={t.n} size={14} />
                <span className="text-[8px] font-bold">{t.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
