import Icon from './Icon';

type Props = {
  tone?: 'error' | 'success' | 'info';
  children: React.ReactNode;
};

export default function FormAlert({ tone = 'error', children }: Props) {
  const toneCls =
    tone === 'success'
      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
      : tone === 'info'
        ? 'bg-pink/30 text-ink-2 border-pink'
        : 'bg-red-50 text-red-800 border-red-200';
  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={`flex items-start gap-2 rounded-[10px] border px-3 py-2.5 text-[13px] font-semibold ${toneCls}`}
    >
      <Icon
        name={tone === 'success' ? 'check-circle' : tone === 'info' ? 'help' : 'x'}
        size={15}
        className="mt-0.5 shrink-0"
        strokeWidth={2.4}
      />
      <span className="leading-snug">{children}</span>
    </div>
  );
}
