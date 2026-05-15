// Server component — at render time, checks portal/public/img/ for a real
// GCash QR file. Falls back to the placeholder SVG if none is found.
// Order of preference: gcash-qr.png → .jpg → .jpeg → .webp → placeholder

import { existsSync } from 'node:fs';
import path from 'node:path';
import Icon from '@/components/ui/Icon';
import CopyRow from './CopyRow';

type Props = {
  gcashNumber: string;
  gcashName: string;
  amount: string;
};

const QR_CANDIDATES = [
  'gcash-qr.png',
  'gcash-qr.jpg',
  'gcash-qr.jpeg',
  'gcash-qr.webp',
] as const;

function resolveQrSrc(): { src: string; isReal: boolean } {
  const dir = path.join(process.cwd(), 'public', 'img');
  for (const f of QR_CANDIDATES) {
    if (existsSync(path.join(dir, f))) {
      return { src: `/img/${f}`, isReal: true };
    }
  }
  return { src: '/img/gcash-qr-placeholder.svg', isReal: false };
}

export default function GcashCard({ gcashNumber, gcashName, amount }: Props) {
  const { src, isReal } = resolveQrSrc();

  return (
    <div className="rounded-glass border border-white/65 bg-white/80 backdrop-blur-md p-5 shadow-glass">
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-2.5 py-1 text-[10.5px] font-extrabold uppercase tracking-wider text-accent">
          <Icon name="gcash" size={11} /> GCash QR
        </span>
        <span className="text-[10.5px] font-extrabold uppercase tracking-wider text-ink-2/60">
          Step 1 of 2
        </span>
      </div>

      <div className="mt-4 grid place-items-center">
        <div className="rounded-2xl bg-white border border-pink p-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt="GCash QR code"
            className="block h-44 w-44 sm:h-52 sm:w-52 object-contain"
          />
        </div>
        {!isReal && (
          <p className="mt-2 text-[11px] text-ink-2/55 font-semibold">
            Placeholder — drop your real QR at <code className="font-mono text-[10.5px]">portal/public/img/gcash-qr.png</code>
          </p>
        )}
      </div>

      <div className="mt-5 grid gap-2">
        <CopyRow label="Amount" value={amount} highlight />
        <CopyRow label="GCash number" value={gcashNumber} />
        <div className="flex items-center justify-between rounded-[10px] bg-white/60 border border-white px-3 py-2.5">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-ink-2/60">
            Account name
          </span>
          <span className="font-mono text-[12.5px] font-bold text-ink">{gcashName}</span>
        </div>
      </div>

      <ol className="mt-5 space-y-1.5 text-[12.5px] font-semibold text-ink-2/85">
        <li className="flex items-start gap-2">
          <span className="grid h-5 w-5 place-items-center rounded-full bg-accent/10 text-accent shrink-0 text-[10px] font-extrabold">1</span>
          Buksan ang <strong className="text-ink-2">GCash app</strong> → Send Money.
        </li>
        <li className="flex items-start gap-2">
          <span className="grid h-5 w-5 place-items-center rounded-full bg-accent/10 text-accent shrink-0 text-[10px] font-extrabold">2</span>
          Scan yung QR sa taas, o i-copy ang number sa baba.
        </li>
        <li className="flex items-start gap-2">
          <span className="grid h-5 w-5 place-items-center rounded-full bg-accent/10 text-accent shrink-0 text-[10px] font-extrabold">3</span>
          Send <strong className="text-ink-2">{amount}</strong>. Tapos screenshot ang receipt page.
        </li>
      </ol>
    </div>
  );
}
