import Link from 'next/link';
import Icon from '@/components/ui/Icon';

export default function Footer() {
  const year = new Date().getFullYear();
  const supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL;
  const messenger    = process.env.NEXT_PUBLIC_SUPPORT_MESSENGER_URL;
  const whatsapp     = process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP_URL;
  const version      = process.env.NEXT_PUBLIC_APP_VERSION || 'v1.0';

  return (
    <footer className="relative pt-14 sm:pt-20 pb-8 border-t border-white/55 bg-white/35 backdrop-blur-md">
      {/* Top CTA strip */}
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mb-12 sm:mb-16 rounded-glass border border-white/65 bg-white/60 backdrop-blur-md p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center gap-5 sm:gap-8 shadow-glass">
          <div className="flex-1">
            <div className="text-[10.5px] uppercase tracking-[1.5px] font-extrabold text-accent">
              One-time ₱249 · Lifetime access
            </div>
            <h3 className="mt-1 text-[18px] sm:text-2xl font-extrabold tracking-tight leading-tight">
              Ready to streamline your pharmacy?
            </h3>
            <p className="mt-1 text-[13px] font-medium text-ink-2/75">
              Start sa Inventory, dispense your first sale within 5 minutes.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Link href="/signup" className="btn-primary text-[14px] px-5 py-2.5 justify-center">
              Mag-sign up
              <Icon name="arrow-right" size={14} />
            </Link>
            <Link href="/login" className="btn-ghost text-[14px] px-5 py-2.5 justify-center">
              Log in
            </Link>
          </div>
        </div>

        {/* Columns */}
        <div className="grid gap-10 sm:gap-8 sm:grid-cols-2 lg:grid-cols-12">
          {/* Brand — wider */}
          <div className="lg:col-span-4">
            <Link href="/" className="inline-flex items-center gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-[10px] bg-lyna-cta text-white shadow-glass">
                <span className="font-extrabold text-[14px]">Rx</span>
              </span>
              <span className="text-[16px] font-extrabold tracking-tight">Pharmetriks</span>
            </Link>
            <p className="mt-4 text-[13px] text-ink-2/75 font-medium leading-relaxed max-w-xs">
              Offline-first pharmacy audit tool. Built for Filipino pharmacy
              staff. Walang ads, walang tracking, walang subscription.
            </p>

            {/* Trust signals */}
            <div className="mt-5 flex flex-wrap gap-3 text-[11.5px] font-bold text-ink-2/75">
              <span className="inline-flex items-center gap-1">
                <Icon name="wifi-off" size={13} className="text-accent" />
                Works offline
              </span>
              <span className="inline-flex items-center gap-1">
                <Icon name="lock" size={13} className="text-accent" />
                Privacy-first
              </span>
              <span className="inline-flex items-center gap-1">
                <Icon name="heart" size={13} className="text-accent" />
                Made in PH
              </span>
            </div>
          </div>

          <FooterCol
            title="Product"
            links={[
              { href: '/#features',  label: 'Features' },
              { href: '/#preview',   label: 'Preview' },
              { href: '/#how',       label: 'How it works' },
              { href: '/#pricing',   label: 'Pricing' },
              { href: '/#faq',       label: 'FAQ' },
              { href: '/install-guide', label: 'Install guide' },
            ]}
          />

          <FooterCol
            title="Account"
            links={[
              { href: '/signup', label: 'Sign up' },
              { href: '/login',  label: 'Log in' },
              { href: '/pending', label: 'Approval status' },
              { href: '/upload-receipt', label: 'Upload receipt' },
            ]}
          />

          <FooterCol
            title="Company"
            links={[
              { href: '/about',   label: 'About' },
              { href: '/contact', label: 'Contact' },
            ]}
          />

          <FooterCol
            title="Legal"
            links={[
              { href: '/privacy',        label: 'Privacy Policy' },
              { href: '/terms',          label: 'Terms of Service' },
              { href: '/refund-policy',  label: 'No Refund Policy' },
            ]}
          />
        </div>

        {/* Support contact strip */}
        {(supportEmail || messenger || whatsapp) && (
          <div className="mt-12 pt-8 border-t border-white/60">
            <div className="text-[10.5px] uppercase tracking-[1.5px] font-extrabold text-accent mb-3">
              Get in touch
            </div>
            <div className="flex flex-wrap gap-x-5 gap-y-2 text-[13px] font-semibold text-ink-2/80">
              {supportEmail && (
                <a href={`mailto:${supportEmail}`} className="inline-flex items-center gap-1.5 hover:text-ink">
                  <Icon name="help" size={14} className="text-accent" />
                  {supportEmail}
                </a>
              )}
              {messenger && (
                <a href={messenger} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 hover:text-ink">
                  <Icon name="phone" size={14} className="text-accent" />
                  Messenger
                </a>
              )}
              {whatsapp && (
                <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 hover:text-ink">
                  <Icon name="phone" size={14} className="text-accent" />
                  WhatsApp
                </a>
              )}
            </div>
          </div>
        )}

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-white/55 flex flex-col-reverse sm:flex-row items-center justify-between gap-3 text-center">
          <p className="text-[11.5px] text-ink-2/60 font-semibold">
            © {year} Pharmetriks · {version} · All rights reserved.
          </p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 justify-center text-[11.5px] font-semibold text-ink-2/60">
            <Link href="/privacy" className="hover:text-ink">Privacy</Link>
            <span className="opacity-50">·</span>
            <Link href="/terms" className="hover:text-ink">Terms</Link>
            <span className="opacity-50">·</span>
            <Link href="/refund-policy" className="hover:text-ink">No Refunds</Link>
            <span className="opacity-50">·</span>
            <span>Walang ads. Walang tracking.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: { href: string; label: string }[];
}) {
  return (
    <div className="lg:col-span-2">
      <div className="text-[10.5px] uppercase tracking-[1.5px] font-extrabold text-accent">
        {title}
      </div>
      <ul className="mt-3 space-y-2 text-[13px] font-semibold text-ink-2/80">
        {links.map(l => (
          <li key={l.href}>
            <Link href={l.href} className="hover:text-ink transition">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
