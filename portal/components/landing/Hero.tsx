import Link from 'next/link';
import Icon from '@/components/ui/Icon';
import Pill from '@/components/ui/Pill';
import GlassCard from '@/components/ui/GlassCard';
import AppPreview from './AppPreview';

export default function Hero() {
  return (
    <section className="relative pt-10 pb-16 sm:pt-16 sm:pb-24">
      {/* decorative blobs */}
      <div aria-hidden className="pointer-events-none absolute -top-20 -left-20 h-72 w-72 rounded-full bg-pink/60 blur-3xl opacity-70" />
      <div aria-hidden className="pointer-events-none absolute top-32 right-[-60px] h-80 w-80 rounded-full bg-accent-soft/55 blur-3xl opacity-70" />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          {/* copy */}
          <div className="text-center lg:text-left">
            <Pill tone="pink" className="mx-auto lg:mx-0">
              <Icon name="sparkle" size={11} /> Para sa mga botika sa Pilipinas
            </Pill>

            <h1 className="mt-5 text-[34px] leading-[1.05] font-extrabold tracking-[-1px] sm:text-5xl lg:text-[56px]">
              Pharmacy audit{' '}
              <span className="bg-clip-text text-transparent bg-lyna-cta">na walang internet</span>{' '}
              kailangan.
            </h1>

            <p className="mt-5 mx-auto lg:mx-0 max-w-xl text-[15px] sm:text-base leading-relaxed text-ink-2/85 font-medium">
              Track dispensing, inventory, at OPEX sa phone mo — kahit offline. Walang
              monthly fee, walang subscription. <strong className="text-ink-2 font-extrabold">₱249 one-time, lifetime access.</strong>
            </p>

            <div className="mt-7 flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              <Link href="/signup" className="btn-primary text-[15px] px-5 py-3">
                Mag-sign up — ₱249
                <Icon name="arrow-right" size={16} />
              </Link>
              <a href="#preview" className="btn-ghost text-[15px] px-5 py-3">
                <Icon name="phone" size={16} /> See it in action
              </a>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 justify-center lg:justify-start text-[12.5px] text-ink-2/80 font-semibold">
              <span className="inline-flex items-center gap-1.5"><Icon name="wifi-off" size={14} /> Works offline</span>
              <span className="inline-flex items-center gap-1.5"><Icon name="lock" size={14} /> Data stays on your phone</span>
              <span className="inline-flex items-center gap-1.5"><Icon name="check-circle" size={14} /> No subscription</span>
            </div>
          </div>

          {/* app preview */}
          <div className="relative">
            <GlassCard tone="strong" className="p-3 sm:p-5">
              <AppPreview />
            </GlassCard>
            <div aria-hidden className="absolute -inset-4 -z-10 rounded-[40px] bg-lyna-cta opacity-25 blur-3xl" />
          </div>
        </div>
      </div>
    </section>
  );
}
