import Link from 'next/link';
import Nav from '@/components/landing/Nav';
import Footer from '@/components/landing/Footer';
import Icon from '@/components/ui/Icon';
import Pill from '@/components/ui/Pill';

type Section = { id: string; label: string };

type Props = {
  pill: string;
  title: string;
  subtitle?: string;
  updatedAt: string; // ISO date string e.g. "2026-05-15"
  sections?: Section[];
  children: React.ReactNode;
};

export default function LegalShell({
  pill,
  title,
  subtitle,
  updatedAt,
  sections,
  children,
}: Props) {
  const updated = new Date(updatedAt).toLocaleDateString('en-PH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <>
      <Nav />
      <main className="relative">
        {/* hero */}
        <section className="relative py-12 sm:py-16">
          <div aria-hidden className="pointer-events-none absolute -top-10 -left-10 h-72 w-72 rounded-full bg-pink/50 blur-3xl opacity-60" />
          <div aria-hidden className="pointer-events-none absolute top-20 right-[-60px] h-72 w-72 rounded-full bg-accent-soft/40 blur-3xl opacity-60" />
          <div className="relative mx-auto max-w-3xl px-4 sm:px-6 text-center">
            <Pill tone="blue">
              <Icon name="lock" size={11} /> {pill}
            </Pill>
            <h1 className="mt-4 text-[28px] sm:text-4xl font-extrabold tracking-tight">{title}</h1>
            {subtitle && (
              <p className="mt-3 text-[14px] sm:text-[15px] text-ink-2/80 font-medium leading-relaxed">
                {subtitle}
              </p>
            )}
            <p className="mt-3 text-[12px] font-semibold text-ink-2/60">
              Last updated: {updated}
            </p>
          </div>
        </section>

        <section className="pb-20">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <div className="grid gap-8 lg:grid-cols-[180px_1fr]">
              {/* sidebar */}
              {sections && sections.length > 0 && (
                <aside className="hidden lg:block">
                  <div className="sticky top-20">
                    <div className="text-[10.5px] uppercase tracking-[1.5px] font-extrabold text-accent mb-3">
                      Contents
                    </div>
                    <nav className="flex flex-col gap-1.5 text-[13px] font-semibold text-ink-2/80">
                      {sections.map(s => (
                        <a
                          key={s.id}
                          href={`#${s.id}`}
                          className="hover:text-ink hover:translate-x-0.5 transition px-2 py-1 rounded-md"
                        >
                          {s.label}
                        </a>
                      ))}
                    </nav>
                  </div>
                </aside>
              )}

              {/* prose */}
              <article className="legal-prose">{children}</article>
            </div>

            <div className="mt-12 pt-8 border-t border-white/60 flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
              <p className="text-[12.5px] text-ink-2/70 font-semibold">
                Tanong? Email{' '}
                <a
                  href={`mailto:${process.env.NEXT_PUBLIC_SUPPORT_EMAIL || ''}`}
                  className="text-accent hover:underline"
                >
                  {process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'support'}
                </a>
                .
              </p>
              <Link href="/" className="btn-ghost text-[13px]">
                <Icon name="arrow-right" size={13} className="rotate-180" />
                Back to home
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
