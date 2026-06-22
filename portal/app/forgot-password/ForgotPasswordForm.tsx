'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/Icon';
import Field from '@/components/ui/Field';
import FormAlert from '@/components/ui/FormAlert';
import { forgotPasswordAction } from './actions';

export default function ForgotPasswordForm() {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await forgotPasswordAction(fd);
      if (res.ok) setSent(true);
      else setError(res.error);
    });
  }

  if (sent) {
    return (
      <div className="flex flex-col gap-4">
        <FormAlert tone="success">
          Kung may account sa email na iyon, may padalang <strong>link para mag-reset ng password</strong>.
          I-check ang inbox (at spam folder).
        </FormAlert>
        <Link href="/login" className="btn-primary justify-center text-[14px] py-3">
          Balik sa login
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
      {error && <FormAlert>{error}</FormAlert>}
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
      <button type="submit" disabled={pending} className="btn-primary mt-1 justify-center text-[14px] py-3">
        {pending ? 'Sending…' : <>Magpadala ng reset link <Icon name="arrow-right" size={15} /></>}
      </button>
      <p className="text-center text-[12.5px] font-semibold text-ink-2/70">
        Naalala mo na?{' '}
        <Link href="/login" className="text-accent hover:underline">Balik sa login</Link>
      </p>
    </form>
  );
}
