import Link from 'next/link';
import Icon from '@/components/ui/Icon';
import GlassCard from '@/components/ui/GlassCard';

export default function CTABand() {
  return (
    <section className="relative py-16 sm:py-20">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <div className="relative">
          <div aria-hidden className="absolute -inset-6 rounded-[40px] bg-lyna-cta opacity-30 blur-3xl" />
          <GlassCard tone="strong" className="relative p-8 sm:p-12 text-center">
            <h2 className="text-[26px] sm:text-4xl font-extrabold tracking-tight">
              Sulit na ₱249. <br className="sm:hidden" />Lifetime access.
            </h2>
            <p className="mt-3 text-[14px] sm:text-base font-medium text-ink-2/80 max-w-xl mx-auto leading-relaxed">
              Mas mura pa sa isang full meal sa fastfood. Pero gagamitin mo every day para sa botika mo.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/signup" className="btn-primary text-[15px] px-5 py-3">
                Mag-sign up — ₱249
                <Icon name="arrow-right" size={16} />
              </Link>
              <Link href="/install-guide" className="btn-ghost text-[15px] px-5 py-3">
                <Icon name="phone" size={16} /> Install guide
              </Link>
            </div>
          </GlassCard>
        </div>
      </div>
    </section>
  );
}
