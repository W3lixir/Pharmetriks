'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/Icon';
import Field from '@/components/ui/Field';
import FormAlert from '@/components/ui/FormAlert';
import { resetPasswordAction } from './actions';

export default function ResetPasswordForm() {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [showPw, setShowPw] = useState(false);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await resetPasswordAction(fd); // navigates on success
      if (res && 'ok' in res && !res.ok) setError(res.error);
    });
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
      {error && <FormAlert>{error}</FormAlert>}

      <div className="relative">
        <Field
          label="Bagong password"
          name="password"
          type={showPw ? 'text' : 'password'}
          required
          autoComplete="new-password"
          minLength={8}
          placeholder="••••••••"
          hint="8 character pataas."
          autoFocus
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

      <Field
        label="Ulitin ang password"
        name="confirm"
        type={showPw ? 'text' : 'password'}
        required
        autoComplete="new-password"
        minLength={8}
        placeholder="••••••••"
      />

      <button type="submit" disabled={pending} className="btn-primary mt-1 justify-center text-[14px] py-3">
        {pending ? 'Saving…' : <>I-save ang bagong password <Icon name="check" size={15} /></>}
      </button>

      <p className="text-center text-[12.5px] font-semibold text-ink-2/70">
        Naalala mo na?{' '}
        <Link href="/login" className="text-accent hover:underline">Balik sa login</Link>
      </p>
    </form>
  );
}
