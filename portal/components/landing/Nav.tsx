'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import Icon from '@/components/ui/Icon';

const LINKS = [
  { href: '#features', label: 'Features' },
  { href: '#preview',  label: 'Preview' },
  { href: '#pricing',  label: 'Pricing' },
  { href: '#faq',      label: 'FAQ' },
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 transition-all ${
        scrolled
          ? 'backdrop-blur-md bg-white/55 border-b border-white/60'
          : 'bg-transparent'
      }`}
    >
      <nav className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-[10px] bg-lyna-cta text-white shadow-glass">
            <span className="font-extrabold text-[13px] tracking-tight">Rx</span>
          </span>
          <span className="text-[15px] font-extrabold tracking-tight">Pharmetriks</span>
        </Link>

        <div className="hidden md:flex items-center gap-7">
          {LINKS.map(l => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm font-semibold text-ink-2/80 hover:text-ink transition"
            >
              {l.label}
            </a>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-2">
          <Link href="/login" className="text-sm font-semibold text-ink-2 hover:text-ink px-3 py-2">
            Log in
          </Link>
          <Link href="/signup" className="btn-primary text-sm">
            Get started
            <Icon name="arrow-right" size={14} />
          </Link>
        </div>

        <button
          type="button"
          aria-label="Menu"
          aria-expanded={open}
          onClick={() => setOpen(v => !v)}
          className="md:hidden grid h-9 w-9 place-items-center rounded-[10px] border border-white/70 bg-white/70 text-ink-2"
        >
          <Icon name={open ? 'x' : 'menu'} size={18} />
        </button>
      </nav>

      {open && (
        <div className="md:hidden border-t border-white/60 bg-white/85 backdrop-blur-md">
          <div className="mx-auto max-w-6xl px-4 py-3 flex flex-col gap-1">
            {LINKS.map(l => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="px-3 py-2 rounded-[10px] text-[15px] font-semibold text-ink hover:bg-white"
              >
                {l.label}
              </a>
            ))}
            <div className="flex gap-2 pt-2">
              <Link href="/login" className="btn-ghost flex-1 text-sm">Log in</Link>
              <Link href="/signup" className="btn-primary flex-1 text-sm">Get started</Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
