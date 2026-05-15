'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/Icon';
import Field from '@/components/ui/Field';
import FormAlert from '@/components/ui/FormAlert';
import { signupAction } from './actions';

export default function SignupForm() {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [showPw, setShowPw] = useState(false);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await signupAction(fd);
      if (res && 'ok' in res && !res.ok) setError(res.error);
    });
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
      {error && <FormAlert>{error}</FormAlert>}

      <Field
        label="Full name"
        name="full_name"
        type="text"
        required
        autoComplete="name"
        placeholder="Juan Dela Cruz"
        autoFocus
      />

      <Field
        label="Pharmacy name"
        name="pharmacy_name"
        type="text"
        required
        autoComplete="organization"
        placeholder="St. Luke's Pharmacy"
      />

      <Field
        label="Email"
        name="email"
        type="email"
        required
        autoComplete="email"
        inputMode="email"
        placeholder="juan@gmail.com"
      />

      <div className="relative">
        <Field
          label="Password"
          name="password"
          type={showPw ? 'text' : 'password'}
          required
          autoComplete="new-password"
          minLength={8}
          placeholder="At least 8 characters"
          hint="Use a mix of letters, numbers, and a symbol for safety."
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
        {pending ? 'Creating account…' : <>Create account <Icon name="arrow-right" size={15} /></>}
      </button>

      <p className="text-center text-[12.5px] font-semibold text-ink-2/70">
        May account ka na?{' '}
        <Link href="/login" className="text-accent hover:underline">Log in</Link>
      </p>

      <p className="text-[11.5px] text-center text-ink-2/55 font-medium leading-relaxed">
        By signing up, you agree to pay ₱249 one-time via GCash. Hindi pa kasama ang pagbabayad — ipapakita sa next step kung paano.
      </p>
    </form>
  );
}
