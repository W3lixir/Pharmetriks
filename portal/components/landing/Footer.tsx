import Link from 'next/link';
import Icon from '@/components/ui/Icon';

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="relative pt-10 pb-10 border-t border-white/50 bg-white/30 backdrop-blur-md">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link href="/" className="flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-[10px] bg-lyna-cta text-white shadow-glass">
                <span className="font-extrabold text-[13px]">Rx</span>
              </span>
              <span className="text-[15px] font-extrabold tracking-tight">RXaudit</span>
            </Link>
            <p className="mt-3 text-[12.5px] text-ink-2/70 font-medium leading-relaxed max-w-xs">
              Offline-first pharmacy audit tool. Built for Filipino pharmacy staff.
            </p>
          </div>

          <div>
            <div className="text-[11px] uppercase tracking-[1.5px] font-extrabold text-accent">Product</div>
            <ul className="mt-3 space-y-2 text-[13px] font-semibold text-ink-2/80">
              <li><a href="#features" className="hover:text-ink">Features</a></li>
              <li><a href="#preview" className="hover:text-ink">Preview</a></li>
              <li><a href="#pricing" className="hover:text-ink">Pricing</a></li>
              <li><a href="#faq" className="hover:text-ink">FAQ</a></li>
            </ul>
          </div>

          <div>
            <div className="text-[11px] uppercase tracking-[1.5px] font-extrabold text-accent">Account</div>
            <ul className="mt-3 space-y-2 text-[13px] font-semibold text-ink-2/80">
              <li><Link href="/signup" className="hover:text-ink">Sign up</Link></li>
              <li><Link href="/login" className="hover:text-ink">Log in</Link></li>
              <li><Link href="/install-guide" className="hover:text-ink">Install guide</Link></li>
            </ul>
          </div>

          <div>
            <div className="text-[11px] uppercase tracking-[1.5px] font-extrabold text-accent">Support</div>
            <ul className="mt-3 space-y-2 text-[13px] font-semibold text-ink-2/80">
              <li className="inline-flex items-center gap-1.5">
                <Icon name="heart" size={12} className="text-accent-soft" />
                Made in Pilipinas
              </li>
              {process.env.NEXT_PUBLIC_SUPPORT_EMAIL && (
                <li>{process.env.NEXT_PUBLIC_SUPPORT_EMAIL}</li>
              )}
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/50 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[12px] text-ink-2/70 font-semibold">
            © {year} RXaudit. All rights reserved.
          </p>
          <p className="text-[12px] text-ink-2/70 font-semibold">
            Walang ads. Walang tracking. Privacy-first.
          </p>
        </div>
      </div>
    </footer>
  );
}
