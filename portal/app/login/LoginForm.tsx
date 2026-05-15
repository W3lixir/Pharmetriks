'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import Icon from '@/components/ui/Icon';
import Field from '@/components/ui/Field';
import FormAlert from '@/components/ui/FormAlert';
import { loginAction } from './actions';

const REASONS: Record<string, string> = {
  unauthorized: 'Naka-log out ka — please log in ulit.',
  invalid:      'Account hindi pa approved or wala nang access.',
  revoked:      'Yung access mo ay revoked. Message us if you think this is a mistake.',
  rejected:     'Yung application mo ay hindi na-approve.',
};

export default function LoginForm() {
  const params = useSearchParams();
  const next   = params.get('next')   ?? '';
  const reason = params.get('reason') ?? '';
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(REASONS[reason] ?? null);
  const [showPw, setShowPw] = useState(false);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await loginAction(fd);
      if (res && 'ok' in res && !res.ok) setError(res.error);
    });
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
      {error && <FormAlert>{error}</FormAlert>}
      <input type="hidden" name="next" value={next} />

      <Field
        label="Email"
        name="email"
        type="email"
        required
        autoComplete="email"
        inputMode="email"
        placeholder="juan@gmail.com"
        autoFocus
      />

      <div className="relative">
        <Field
          label="Password"
          name="password"
          type={showPw ? 'text' : 'password'}
          required
          autoComplete="current-password"
          placeholder="••••••••"
        />
        <button
          type="button"
          aria-label={showPw ? 'Hide password' : 'Show password'}
          onClick={() => setShowPw(s => !s)}
          className="absolute right-2 top-[32px] grid h-9 w-9 place-items-center rounded-md text-ink-2/60 hover:text-ink"
          tabIndex={-1}
        >
          <Icon name={showPw ? 'x' : 'lock'} size={16} />
        </button>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="btn-primary mt-1 justify-center text-[14px] py-3"
      >
        {pending ? 'Logging in…' : <>Log in <Icon name="arrow-right" size={15} /></>}
      </button>

      <p className="text-center text-[12.5px] font-semibold text-ink-2/70">
        Wala pang account?{' '}
        <Link href="/signup" className="text-accent hover:underline">Mag-sign up</Link>
      </p>
    </form>
  );
}
