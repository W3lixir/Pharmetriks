import * as React from 'react';

type IconName =
  | 'dispense' | 'inventory' | 'opex' | 'shield' | 'wifi-off' | 'lock'
  | 'phone' | 'sparkle' | 'check' | 'check-circle' | 'arrow-right'
  | 'arrow-down' | 'gcash' | 'rocket' | 'star' | 'menu' | 'x'
  | 'chevron-down' | 'install' | 'help' | 'heart' | 'zap' | 'cart'
  | 'chart' | 'wallet' | 'search';

type Props = React.SVGProps<SVGSVGElement> & {
  name: IconName;
  size?: number | string;
};

const PATHS: Record<IconName, React.ReactNode> = {
  dispense: (
    <>
      <path d="M6 3h12v18l-2.5-1.5L13 21l-2.5-1.5L8 21 5.5 19.5 4 21V4a1 1 0 0 1 1-1z" />
      <line x1="8" y1="8" x2="16" y2="8" />
      <line x1="8" y1="12" x2="14" y2="12" />
      <line x1="8" y1="16" x2="12" y2="16" />
    </>
  ),
  inventory: (
    <>
      <path d="M3 7l9-4 9 4v10l-9 4-9-4V7z" />
      <path d="M3 7l9 4 9-4" />
      <line x1="12" y1="11" x2="12" y2="21" />
    </>
  ),
  opex: (
    <>
      <line x1="4" y1="20" x2="20" y2="20" />
      <rect x="6" y="12" width="3" height="8" rx="0.5" />
      <rect x="11" y="7"  width="3" height="13" rx="0.5" />
      <rect x="16" y="14" width="3" height="6" rx="0.5" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z" />
      <polyline points="9,12 11,14 15,10" />
    </>
  ),
  'wifi-off': (
    <>
      <line x1="3" y1="3" x2="21" y2="21" />
      <path d="M16.5 12.4a6 6 0 0 0-7-1.4" />
      <path d="M5 9a11 11 0 0 1 4-2" />
      <path d="M20 8a15 15 0 0 0-3.5-2" />
      <circle cx="12" cy="18" r="1" fill="currentColor" stroke="none" />
    </>
  ),
  lock: (
    <>
      <rect x="4" y="11" width="16" height="10" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
      <circle cx="12" cy="16" r="1.2" fill="currentColor" stroke="none" />
    </>
  ),
  phone: (
    <>
      <rect x="6" y="3" width="12" height="18" rx="2.5" />
      <line x1="10" y1="18" x2="14" y2="18" />
    </>
  ),
  sparkle: (
    <path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8" />
  ),
  check: <polyline points="5,12 10,17 19,7" />,
  'check-circle': (
    <>
      <circle cx="12" cy="12" r="9" />
      <polyline points="8,12 11,15 16,9" />
    </>
  ),
  'arrow-right': (
    <>
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="13,6 19,12 13,18" />
    </>
  ),
  'arrow-down': (
    <>
      <line x1="12" y1="5" x2="12" y2="19" />
      <polyline points="6,13 12,19 18,13" />
    </>
  ),
  gcash: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M15 9a4 4 0 1 0 0 6h-3v-3" />
    </>
  ),
  rocket: (
    <>
      <path d="M12 2c4 0 7 3 7 7 0 4-3 7-3 7H8s-3-3-3-7c0-4 3-7 7-7z" />
      <circle cx="12" cy="9" r="2" />
      <path d="M9 16l-2 5 5-2M15 16l2 5-5-2" />
    </>
  ),
  star: <polygon points="12,3 14.5,9 21,9.5 16,14 17.5,21 12,17.5 6.5,21 8,14 3,9.5 9.5,9" />,
  menu: (
    <>
      <line x1="4" y1="7"  x2="20" y2="7" />
      <line x1="4" y1="12" x2="20" y2="12" />
      <line x1="4" y1="17" x2="20" y2="17" />
    </>
  ),
  x: (
    <>
      <line x1="6" y1="6"   x2="18" y2="18" />
      <line x1="18" y1="6"  x2="6"  y2="18" />
    </>
  ),
  'chevron-down': <polyline points="6,9 12,15 18,9" />,
  install: (
    <>
      <path d="M12 4v11" />
      <polyline points="7,10 12,15 17,10" />
      <path d="M5 20h14" />
    </>
  ),
  help: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9.5a2.5 2.5 0 0 1 5 0c0 1.5-2.5 2-2.5 3.5" />
      <circle cx="12" cy="17" r="0.6" fill="currentColor" stroke="none" />
    </>
  ),
  heart: <path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10z" />,
  zap: <polygon points="13,2 4,14 11,14 11,22 20,10 13,10" />,
  cart: (
    <>
      <path d="M3 4h2l2.5 12h11l2-8H6.5" />
      <circle cx="9"  cy="20" r="1.5" />
      <circle cx="17" cy="20" r="1.5" />
    </>
  ),
  chart: (
    <>
      <line x1="4" y1="20" x2="20" y2="20" />
      <polyline points="4,15 9,10 13,14 20,6" />
    </>
  ),
  wallet: (
    <>
      <rect x="3" y="6"  width="18" height="14" rx="2" />
      <path d="M3 9h14a2 2 0 0 1 0 4H3" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="6" />
      <line x1="20" y1="20" x2="15.5" y2="15.5" />
    </>
  ),
};

export default function Icon({ name, size = 20, className = '', strokeWidth = 2, ...rest }: Props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...rest}
    >
      {PATHS[name]}
    </svg>
  );
}
