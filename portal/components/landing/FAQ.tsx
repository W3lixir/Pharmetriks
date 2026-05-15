'use client';

import { useState } from 'react';
import Icon from '@/components/ui/Icon';
import Pill from '@/components/ui/Pill';
import GlassCard from '@/components/ui/GlassCard';

const FAQS: { q: string; a: string }[] = [
  {
    q: 'Talagang offline ba talaga? Walang internet kailangan?',
    a: "Oo. After mo i-install bilang app sa phone mo (Add to Home Screen sa iOS, or Install sa Android Chrome), gumagana na siya offline forever. Internet kailangan lang sa unang install at occasional license check (once a week max).",
  },
  {
    q: 'Saan napupunta ang data ng pharmacy ko?',
    a: "Sa phone mo lang — gamit yung browser's localStorage. Walang cloud, walang server. Wala kahit kami may access sa data mo. Pero ibig sabihin nun din, kung mag-clear ka ng browser data or i-uninstall mo yung app, mawawala. So we have built-in CSV export para may backup ka.",
  },
  {
    q: 'Paano ako magbabayad?',
    a: "Sa /signup page, ipapakita namin ang GCash QR code. I-scan mo siya sa GCash app mo, send ₱249, screenshot mo ang receipt, then i-upload mo sa account mo. Within a few hours, ina-approve namin ang account mo.",
  },
  {
    q: 'Anong oras kayo nag-aapprove? Ano kung tulog kayo?',
    a: "Sinusubukan naming i-approve within a few hours. Pero realistically, kung mag-bayad ka ng gabi, baka kinabukasan na natin ma-approve. Once approved, may email ka na makukuha at pwede mo nang gamitin agad ang app.",
  },
  {
    q: 'May refund ba kung hindi gumana sa phone ko?',
    a: "Oo. Kung hindi gumana ang app sa device mo within 7 days of purchase, message lang kami at i-refund namin ang ₱249 mo via GCash. Pero hindi pa kami nakakatanggap ng refund request — usually gumagana naman sa lahat ng modern Android (2019+) at iPhone (2018+).",
  },
  {
    q: 'Kaya bang i-install sa multiple phones?',
    a: 'Yes, kasi licensed per user, hindi per device. Mag-login ka lang sa parehong account sa ibang device, tapos i-install mo. Pero tandaan: yung data hindi sync — bawat phone may sariling localStorage. Per-device ang data.',
  },
  {
    q: 'May team feature ba? Like multi-staff sa isang botika?',
    a: "Wala pa sa current version. Yung app is single-user per device. Kung kailangan mo ng team access, multi-device sync, cloud backup, message lang us — meron kaming planned paid plan for that.",
  },
  {
    q: 'Paano kung may bug or kailangan ko ng tulong?',
    a: 'Message kami via Messenger or email. Sasagot kami within 24 hours. May "Need help?" button sa portal at sa /pending page — direct chat sa amin yun.',
  },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="relative py-16 sm:py-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <div className="text-center">
          <Pill tone="pink">
            <Icon name="help" size={11} /> FAQ
          </Pill>
          <h2 className="mt-4 text-[28px] sm:text-4xl font-extrabold tracking-tight">
            Common questions, may sagot.
          </h2>
        </div>

        <div className="mt-10 space-y-3">
          {FAQS.map((f, i) => {
            const isOpen = open === i;
            return (
              <GlassCard key={i} className="overflow-hidden">
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="w-full flex items-start gap-3 px-5 py-4 text-left"
                  aria-expanded={isOpen}
                >
                  <span className="flex-1 text-[14.5px] font-extrabold text-ink leading-snug tracking-tight">
                    {f.q}
                  </span>
                  <span
                    className={`grid h-7 w-7 place-items-center rounded-full bg-accent/10 text-accent transition-transform shrink-0 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  >
                    <Icon name="chevron-down" size={14} strokeWidth={2.5} />
                  </span>
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 -mt-1">
                    <p className="text-[13.5px] leading-relaxed text-ink-2/85 font-medium">
                      {f.a}
                    </p>
                  </div>
                )}
              </GlassCard>
            );
          })}
        </div>
      </div>
    </section>
  );
}
