import Link from 'next/link';
import Nav from '@/components/landing/Nav';
import Footer from '@/components/landing/Footer';
import Icon from '@/components/ui/Icon';
import Pill from '@/components/ui/Pill';
import GlassCard from '@/components/ui/GlassCard';

export const metadata = {
  title: 'Install Guide · Pharmetriks',
  description: 'How to install Pharmetriks as an app on your phone — iOS Safari and Android Chrome.',
};

export default function InstallGuidePage() {
  return (
    <>
      <Nav />
      <main className="relative">
        <section className="relative py-12 sm:py-16">
          <div aria-hidden className="pointer-events-none absolute -top-10 -left-10 h-72 w-72 rounded-full bg-pink/50 blur-3xl opacity-60" />
          <div aria-hidden className="pointer-events-none absolute top-20 right-[-60px] h-72 w-72 rounded-full bg-accent-soft/40 blur-3xl opacity-60" />
          <div className="relative mx-auto max-w-2xl px-4 sm:px-6 text-center">
            <Pill tone="pink">
              <Icon name="install" size={11} /> Install guide
            </Pill>
            <h1 className="mt-4 text-[28px] sm:text-4xl font-extrabold tracking-tight">
              I-install ang Pharmetriks bilang app
            </h1>
            <p className="mt-3 text-[14.5px] font-medium text-ink-2/80 leading-relaxed">
              Para offline ka gumagana, kailangan i-install muna ang Pharmetriks sa
              phone mo. Step-by-step para sa iOS at Android.
            </p>
          </div>
        </section>

        <section className="pb-20">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 grid gap-5 sm:grid-cols-2">
            <GlassCard tone="strong" className="p-6">
              <div className="grid h-11 w-11 place-items-center rounded-[12px] bg-lyna-cta text-white shadow-glass">
                <Icon name="phone" size={22} />
              </div>
              <h2 className="mt-4 text-[18px] font-extrabold tracking-tight">iPhone / iPad</h2>
              <p className="text-[12px] font-bold text-accent uppercase tracking-wider mt-1">
                Safari only
              </p>
              <ol className="mt-4 space-y-3 text-[13.5px] font-medium text-ink">
                <Step n={1}>Buksan ang <strong>Safari</strong> at pumunta sa app URL.</Step>
                <Step n={2}>Tap ang <strong>Share button</strong> (yung square with arrow up).</Step>
                <Step n={3}>Scroll down at piliin ang <strong>Add to Home Screen</strong>.</Step>
                <Step n={4}>Tap <strong>Add</strong> sa top-right corner.</Step>
                <Step n={5}>Hanapin ang Pharmetriks icon sa home screen mo at i-tap para buksan.</Step>
              </ol>
            </GlassCard>

            <GlassCard tone="strong" className="p-6">
              <div className="grid h-11 w-11 place-items-center rounded-[12px] bg-lyna-cta text-white shadow-glass">
                <Icon name="phone" size={22} />
              </div>
              <h2 className="mt-4 text-[18px] font-extrabold tracking-tight">Android</h2>
              <p className="text-[12px] font-bold text-accent uppercase tracking-wider mt-1">
                Chrome / Edge
              </p>
              <ol className="mt-4 space-y-3 text-[13.5px] font-medium text-ink">
                <Step n={1}>Buksan ang <strong>Chrome</strong> at pumunta sa app URL.</Step>
                <Step n={2}>Tap ang <strong>3-dot menu</strong> sa kanang taas.</Step>
                <Step n={3}>Piliin ang <strong>Install app</strong> or <strong>Add to Home Screen</strong>.</Step>
                <Step n={4}>Tap <strong>Install</strong> sa pop-up.</Step>
                <Step n={5}>Hanapin ang Pharmetriks icon sa home screen or app drawer.</Step>
              </ol>
            </GlassCard>
          </div>

          <div className="mx-auto max-w-3xl px-4 sm:px-6 mt-6">
            <GlassCard className="p-5">
              <div className="flex items-start gap-3">
                <div className="grid h-9 w-9 place-items-center rounded-full bg-accent/15 text-accent shrink-0">
                  <Icon name="help" size={18} />
                </div>
                <div>
                  <h3 className="text-[14.5px] font-extrabold tracking-tight">
                    May problem sa installation?
                  </h3>
                  <p className="mt-1 text-[13px] font-medium text-ink-2/85 leading-relaxed">
                    Most common issues: gumagamit ng wrong browser (kailangan
                    Safari sa iOS, Chrome sa Android), o wala pang HTTPS yung
                    URL. Kung patuloy, message us — <Link href="/contact" className="text-accent hover:underline">contact page</Link>.
                  </p>
                </div>
              </div>
            </GlassCard>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

function Step({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3">
      <span className="grid h-6 w-6 place-items-center rounded-full bg-accent text-white text-[11px] font-extrabold shrink-0">
        {n}
      </span>
      <span className="leading-relaxed">{children}</span>
    </li>
  );
}
