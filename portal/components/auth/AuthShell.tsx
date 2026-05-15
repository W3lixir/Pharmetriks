import Link from 'next/link';
import GlassCard from '@/components/ui/GlassCard';
import Pill from '@/components/ui/Pill';
import Icon from '@/components/ui/Icon';

type Props = {
  pill?: { tone?: 'pink' | 'blue' | 'white'; label: string };
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
  /** Width preset for the card. */
  width?: 'sm' | 'md' | 'lg';
};

export default function AuthShell({ pill, title, subtitle, children, width = 'sm' }: Props) {
  const maxW = width === 'lg' ? 'max-w-3xl' : width === 'md' ? 'max-w-xl' : 'max-w-md';
  return (
    <div className="min-h-dvh flex flex-col">
      <header className="px-4 sm:px-6 pt-6">
        <div className="mx-auto max-w-6xl flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-[10px] bg-lyna-cta text-white shadow-glass">
              <span className="font-extrabold text-[13px]">Rx</span>
            </span>
            <span className="text-[15px] font-extrabold tracking-tight">RXaudit</span>
          </Link>
          <Link
            href="/"
            className="text-[12.5px] font-semibold text-ink-2/70 hover:text-ink inline-flex items-center gap-1"
          >
            <Icon name="arrow-right" size={13} className="rotate-180" />
            Back to home
          </Link>
        </div>
      </header>

      <main className="flex-1 px-4 sm:px-6 py-10 sm:py-14 grid place-items-center">
        <div className={`w-full ${maxW}`}>
          <div className="text-center mb-6">
            {pill && (
              <Pill tone={pill.tone ?? 'pink'} className="mb-4">
                {pill.label}
              </Pill>
            )}
            <h1 className="text-[26px] sm:text-3xl font-extrabold tracking-tight leading-tight">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-2 text-[13.5px] text-ink-2/80 font-medium leading-relaxed">
                {subtitle}
              </p>
            )}
          </div>
          <GlassCard tone="strong" className="p-6 sm:p-8">
            {children}
          </GlassCard>
        </div>
      </main>
    </div>
  );
}
