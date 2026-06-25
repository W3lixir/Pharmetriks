// Server-side GCash receiver info shown on /signup and /upload-receipt.
// The QR image is resolved from portal/public/img/ at render time (node:fs);
// number + account name come from env (masked placeholders if unset).

import { existsSync } from 'node:fs';
import path from 'node:path';

// Order of preference: gcash-qr.png → .jpg → .jpeg → .webp → placeholder.
const QR_CANDIDATES = ['gcash-qr.png', 'gcash-qr.jpg', 'gcash-qr.jpeg', 'gcash-qr.webp'] as const;

export type GcashInfo = {
  qrSrc: string;
  isRealQr: boolean;
  gcashNumber: string;
  gcashName: string;
};

export function resolveGcash(): GcashInfo {
  const dir = path.join(process.cwd(), 'public', 'img');
  let qrSrc = '/img/gcash-qr-placeholder.svg';
  let isRealQr = false;
  for (const f of QR_CANDIDATES) {
    if (existsSync(path.join(dir, f))) {
      qrSrc = `/img/${f}`;
      isRealQr = true;
      break;
    }
  }
  return {
    qrSrc,
    isRealQr,
    gcashNumber: process.env.NEXT_PUBLIC_GCASH_NUMBER || '+63 991 381 ••••',
    gcashName: process.env.NEXT_PUBLIC_GCASH_NAME || 'KA*L TR****N O.',
  };
}
