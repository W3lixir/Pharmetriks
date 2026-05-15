import Nav from '@/components/landing/Nav';
import Footer from '@/components/landing/Footer';
import Icon from '@/components/ui/Icon';
import Pill from '@/components/ui/Pill';
import GlassCard from '@/components/ui/GlassCard';

export const metadata = {
  title: 'Contact · RXaudit',
  description: 'Get in touch with RXaudit support — email, Messenger, or WhatsApp.',
};

export default function ContactPage() {
  const email = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || '';
  const msgr  = process.env.NEXT_PUBLIC_SUPPORT_MESSENGER_URL;
  const wa    = process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP_URL;

  return (
    <>
      <Nav />
      <main className="relative">
        <section className="relative py-12 sm:py-16">
          <div aria-hidden className="pointer-events-none absolute -top-10 -left-10 h-72 w-72 rounded-full bg-pink/50 blur-3xl opacity-60" />
          <div aria-hidden className="pointer-events-none absolute top-20 right-[-60px] h-72 w-72 rounded-full bg-accent-soft/40 blur-3xl opacity-60" />
          <div className="relative mx-auto max-w-2xl px-4 sm:px-6 text-center">
            <Pill tone="blue">
              <Icon name="help" size={11} /> Contact
            </Pill>
            <h1 className="mt-4 text-[28px] sm:text-4xl font-extrabold tracking-tight">
              Maintained by humans. <br className="sm:hidden" />Sasagot kami.
            </h1>
            <p className="mt-3 text-[14.5px] font-medium text-ink-2/80 leading-relaxed">
              Walang chatbot, walang ticket queue. Direct email or message — usually
              within 24 hours kami sumasagot.
            </p>
          </div>
        </section>

        <section className="pb-20">
          <div className="mx-auto max-w-2xl px-4 sm:px-6">
            <div className="grid gap-4">
              {email && (
                <a
                  href={`mailto:${email}`}
                  className="block rounded-glass border border-white/65 bg-white/80 backdrop-blur-md shadow-glass p-5 flex items-center gap-4 hover:bg-white transition"
                >
                  <div className="grid h-12 w-12 place-items-center rounded-[12px] bg-lyna-cta text-white shadow-glass shrink-0">
                    <Icon name="help" size={22} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[10.5px] uppercase tracking-[1.5px] font-extrabold text-accent">
                      Email
                    </div>
                    <div className="font-mono text-[14px] font-bold text-ink truncate">{email}</div>
                    <div className="text-[12.5px] text-ink-2/70 font-medium mt-0.5">
                      Best for detailed questions or refund requests
                    </div>
                  </div>
                  <Icon name="arrow-right" size={18} className="text-accent shrink-0" />
                </a>
              )}

              {msgr && (
                <a
                  href={msgr}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block rounded-glass border border-white/65 bg-white/80 backdrop-blur-md shadow-glass p-5 flex items-center gap-4 hover:bg-white transition"
                >
                  <div className="grid h-12 w-12 place-items-center rounded-[12px] bg-lyna-cta text-white shadow-glass shrink-0">
                    <Icon name="phone" size={22} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[10.5px] uppercase tracking-[1.5px] font-extrabold text-accent">
                      Messenger
                    </div>
                    <div className="text-[14px] font-bold text-ink">Chat sa Facebook Messenger</div>
                    <div className="text-[12.5px] text-ink-2/70 font-medium mt-0.5">
                      Fastest response during business hours
                    </div>
                  </div>
                  <Icon name="arrow-right" size={18} className="text-accent shrink-0" />
                </a>
              )}

              {wa && (
                <a
                  href={wa}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block rounded-glass border border-white/65 bg-white/80 backdrop-blur-md shadow-glass p-5 flex items-center gap-4 hover:bg-white transition"
                >
                  <div className="grid h-12 w-12 place-items-center rounded-[12px] bg-lyna-cta text-white shadow-glass shrink-0">
                    <Icon name="phone" size={22} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[10.5px] uppercase tracking-[1.5px] font-extrabold text-accent">
                      WhatsApp
                    </div>
                    <div className="text-[14px] font-bold text-ink">Chat sa WhatsApp</div>
                    <div className="text-[12.5px] text-ink-2/70 font-medium mt-0.5">
                      For international users
                    </div>
                  </div>
                  <Icon name="arrow-right" size={18} className="text-accent shrink-0" />
                </a>
              )}

              {!email && !msgr && !wa && (
                <GlassCard tone="strong" className="p-6 text-center">
                  <p className="text-[14px] font-semibold text-ink-2">
                    Contact channels hindi pa configured. Pakitignan ang admin para ma-setup ang support env vars.
                  </p>
                </GlassCard>
              )}

              <GlassCard className="p-5">
                <div className="text-[10.5px] uppercase tracking-[1.5px] font-extrabold text-accent">
                  Response time
                </div>
                <ul className="mt-3 space-y-2 text-[13.5px] font-medium text-ink-2/85">
                  <li className="flex items-start gap-2">
                    <Icon name="check" size={13} className="mt-1 text-accent shrink-0" strokeWidth={2.6} />
                    <span><strong>Account approvals</strong>: usually within a few hours during business time</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Icon name="check" size={13} className="mt-1 text-accent shrink-0" strokeWidth={2.6} />
                    <span><strong>Technical issues</strong>: within 24 hours, business days</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Icon name="check" size={13} className="mt-1 text-accent shrink-0" strokeWidth={2.6} />
                    <span><strong>Refund requests</strong>: 1-3 business days for processing</span>
                  </li>
                </ul>
              </GlassCard>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
