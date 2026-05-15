import Link from 'next/link';
import Icon from '@/components/ui/Icon';
import Pill from '@/components/ui/Pill';
import GlassCard from '@/components/ui/GlassCard';

const INCLUDED = [
  'Dispensing module (sales + auto stock deduct)',
  'Inventory management (batches, expiry, low-stock alerts)',
  'OPEX tracking (expenses, P&L, summary)',
  'Works offline forever after install',
  'Mobile + desktop (PWA install)',
  'CSV import + export for all data',
  'Free updates — habang buhay ng app',
];

export default function Pricing() {
  return (
    <section id="pricing" className="relative py-16 sm:py-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <div className="text-center">
          <Pill tone="blue">
            <Icon name="wallet" size={11} /> Pricing
          </Pill>
          <h2 className="mt-4 text-[28px] sm:text-4xl font-extrabold tracking-tight">
            One-time payment. <br className="sm:hidden" />Lifetime access.
          </h2>
          <p className="mt-3 text-[14.5px] text-ink-2/80 font-medium leading-relaxed">
            Walang trial limits. Walang surprise fees. Bayad ka isang beses, gamitin mo habambuhay.
          </p>
        </div>

        <div className="relative mt-10">
          <div aria-hidden className="absolute -inset-6 rounded-[40px] bg-lyna-cta opacity-25 blur-3xl" />
          <GlassCard tone="strong" className="relative p-6 sm:p-9">
            <div className="absolute top-5 right-5">
              <Pill tone="pink">
                <Icon name="star" size={11} /> Best value
              </Pill>
            </div>

            <div className="flex items-end gap-1 mt-2">
              <span className="text-[56px] sm:text-[72px] font-black tracking-[-2.5px] leading-none text-accent">
                ₱249
              </span>
              <span className="mb-2 text-[13px] font-bold text-ink-2/60">one-time</span>
            </div>
            <div className="mt-1 text-[13px] font-bold text-accent-soft">
              Walang monthly. Walang renewal. Walang gulo.
            </div>

            <ul className="mt-7 space-y-2.5">
              {INCLUDED.map(item => (
                <li key={item} className="flex items-start gap-2.5 text-[13.5px] font-medium text-ink">
                  <span className="mt-0.5 grid h-5 w-5 place-items-center rounded-full bg-accent/15 text-accent shrink-0">
                    <Icon name="check" size={12} strokeWidth={2.6} />
                  </span>
                  {item}
                </li>
              ))}
            </ul>

            <Link
              href="/signup"
              className="btn-primary mt-8 w-full text-[15px] px-5 py-3.5 justify-center"
            >
              Mag-sign up — ₱249
              <Icon name="arrow-right" size={16} />
            </Link>

            <div className="mt-4 text-center text-[11.5px] font-semibold text-ink-2/70">
              Payment via GCash. Manual approval within a few hours.
            </div>
          </GlassCard>
        </div>
      </div>
    </section>
  );
}
