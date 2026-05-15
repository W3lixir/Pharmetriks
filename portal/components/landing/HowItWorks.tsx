import Link from 'next/link';
import Icon from '@/components/ui/Icon';
import Pill from '@/components/ui/Pill';
import GlassCard from '@/components/ui/GlassCard';

type Step = {
  n: number;
  iconName: 'rocket' | 'gcash' | 'check-circle' | 'install';
  title: string;
  body: string;
};

const STEPS: Step[] = [
  {
    n: 1,
    iconName: 'rocket',
    title: 'Mag-sign up',
    body: 'Email, password, pharmacy name. 30 segundo lang.',
  },
  {
    n: 2,
    iconName: 'gcash',
    title: 'Bayad via GCash',
    body: '₱249 sa naka-display na QR code. I-scan, send, screenshot ng receipt.',
  },
  {
    n: 3,
    iconName: 'check-circle',
    title: 'Hintayin ang approval',
    body: 'Usually within a few hours, mag-aapprove kami. Mag-eemail kami pag tapos na.',
  },
  {
    n: 4,
    iconName: 'install',
    title: 'Install sa phone',
    body: 'Add to Home Screen sa iOS, or "Install app" sa Android. Tapos na — gamitin mo na offline.',
  },
];

export default function HowItWorks() {
  return (
    <section id="how" className="relative py-16 sm:py-24">
      <div aria-hidden className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[60%] rounded-full bg-pink/30 blur-3xl" />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto">
          <Pill tone="pink">
            <Icon name="sparkle" size={11} /> 4 simpleng steps
          </Pill>
          <h2 className="mt-4 text-[28px] sm:text-4xl font-extrabold tracking-tight">
            Mula sign-up hanggang offline na app.
          </h2>
          <p className="mt-3 text-[14.5px] text-ink-2/80 font-medium leading-relaxed">
            Walang complicated setup. Walang kailangang IT person. Kaya mo mag-isa.
          </p>
        </div>

        <ol className="mt-12 grid gap-4 sm:gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map(s => (
            <li key={s.n}>
              <GlassCard tone="strong" className="p-5 h-full">
                <div className="flex items-start gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-[10px] bg-lyna-cta text-white shadow-glass shrink-0">
                    <Icon name={s.iconName} size={20} />
                  </div>
                  <div className="text-[11px] font-extrabold uppercase tracking-[1.5px] text-accent">
                    Step {s.n}
                  </div>
                </div>
                <h3 className="mt-3 text-[16px] font-extrabold tracking-tight">{s.title}</h3>
                <p className="mt-1.5 text-[13px] leading-relaxed text-ink-2/80 font-medium">
                  {s.body}
                </p>
              </GlassCard>
            </li>
          ))}
        </ol>

        <div className="mt-10 text-center">
          <Link href="/signup" className="btn-primary text-[15px] px-5 py-3 inline-flex">
            I'm ready — sign up
            <Icon name="arrow-right" size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
