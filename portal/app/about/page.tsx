import Link from 'next/link';
import Nav from '@/components/landing/Nav';
import Footer from '@/components/landing/Footer';
import Icon from '@/components/ui/Icon';
import Pill from '@/components/ui/Pill';
import GlassCard from '@/components/ui/GlassCard';

export const metadata = {
  title: 'About · RXaudit',
  description: 'The story behind RXaudit — why we built an offline-first pharmacy audit tool.',
};

const PRINCIPLES = [
  {
    icon: 'wifi-off' as const,
    title: 'Offline-first, hindi luxury',
    body: "Sa Pilipinas, hindi assumption ang internet. Mga lugar na kailangan ng pharmacy hindi laging may signal — barangay clinics, rural na bayan, even urban areas na may brownout. Gumagana muna offline, then sync kung available.",
  },
  {
    icon: 'lock' as const,
    title: 'Privacy by default',
    body: "Pharmacy data is sensitive — patient info, sales patterns, supplier costs. Pinaka-private way ang to keep it on the device. Walang cloud sync ibig sabihin walang sino mag-aaccess accidentally.",
  },
  {
    icon: 'zap' as const,
    title: 'No subscriptions',
    body: "Tired tayong magbayad ng monthly fees sa software na minsan lang naman natin gagamitin. One-time ₱249, lifetime access. Simple at honest.",
  },
  {
    icon: 'heart' as const,
    title: 'Made para sa Pilipino',
    body: "Taglish interface, peso prices, GCash payment, Philippine drug names. Hindi siya US tool na sinubukan namin i-translate — built from scratch for the local context.",
  },
];

export default function AboutPage() {
  return (
    <>
      <Nav />
      <main>
        <section className="relative py-16 sm:py-24">
          <div aria-hidden className="pointer-events-none absolute -top-10 -left-10 h-80 w-80 rounded-full bg-pink/60 blur-3xl opacity-60" />
          <div aria-hidden className="pointer-events-none absolute top-20 right-[-60px] h-80 w-80 rounded-full bg-accent-soft/50 blur-3xl opacity-60" />

          <div className="relative mx-auto max-w-3xl px-4 sm:px-6 text-center">
            <Pill tone="pink">
              <Icon name="sparkle" size={11} /> About RXaudit
            </Pill>
            <h1 className="mt-4 text-[32px] sm:text-5xl font-extrabold tracking-tight leading-[1.1]">
              Built by people who've actually{' '}
              <span className="bg-clip-text text-transparent bg-lyna-cta">used</span>{' '}
              pharmacy audit tools.
            </h1>
            <p className="mt-5 text-[15px] sm:text-base font-medium text-ink-2/80 leading-relaxed">
              RXaudit is a small, focused tool for Filipino pharmacy staff and owners.
              Walang complicated enterprise features na hindi mo naman gagamitin.
              Yung essentials lang — dispensing, inventory, OPEX — done right at usable
              kahit offline.
            </p>
          </div>
        </section>

        <section className="py-16 sm:py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <Pill tone="blue">
                <Icon name="shield" size={11} /> Our principles
              </Pill>
              <h2 className="mt-4 text-[26px] sm:text-4xl font-extrabold tracking-tight">
                4 simpleng ideas, walang fluff.
              </h2>
            </div>

            <div className="grid gap-4 sm:gap-5 sm:grid-cols-2">
              {PRINCIPLES.map(p => (
                <GlassCard key={p.title} className="p-6">
                  <div className="grid h-11 w-11 place-items-center rounded-[12px] bg-lyna-cta text-white shadow-glass">
                    <Icon name={p.icon} size={22} />
                  </div>
                  <h3 className="mt-4 text-[17px] font-extrabold tracking-tight">{p.title}</h3>
                  <p className="mt-2 text-[14px] leading-relaxed text-ink-2/80 font-medium">
                    {p.body}
                  </p>
                </GlassCard>
              ))}
            </div>
          </div>
        </section>

        <section className="py-12 sm:py-16">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <GlassCard tone="strong" className="p-8 sm:p-10 text-center">
              <h2 className="text-[22px] sm:text-3xl font-extrabold tracking-tight">
                Made in the Philippines
              </h2>
              <p className="mt-3 text-[14.5px] font-medium text-ink-2/80 leading-relaxed max-w-xl mx-auto">
                Small team, mostly hindi traditional software engineers. Yung mga
                pharmacy operators namin ang nagde-design — kaya alam namin yung mga
                small frustrations na nire-resolve ng tool.
              </p>
              <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/signup" className="btn-primary text-[15px] px-5 py-3">
                  Try RXaudit — ₱249
                  <Icon name="arrow-right" size={16} />
                </Link>
                <Link href="/contact" className="btn-ghost text-[15px] px-5 py-3">
                  <Icon name="help" size={16} /> Get in touch
                </Link>
              </div>
            </GlassCard>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
