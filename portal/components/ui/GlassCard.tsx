import * as React from 'react';

type Props = React.HTMLAttributes<HTMLDivElement> & {
  as?: keyof React.JSX.IntrinsicElements;
  tone?: 'default' | 'strong' | 'accent';
};

export default function GlassCard({
  as = 'div',
  tone = 'default',
  className = '',
  children,
  ...rest
}: Props) {
  const Tag = as as any;
  const toneClass =
    tone === 'strong'
      ? 'bg-white/80'
      : tone === 'accent'
        ? 'bg-white/55'
        : 'bg-white/65';
  return (
    <Tag
      className={`relative overflow-hidden rounded-glass shadow-glass border border-white/65 backdrop-blur-md ${toneClass} ${className}`}
      {...rest}
    >
      {children}
    </Tag>
  );
}
