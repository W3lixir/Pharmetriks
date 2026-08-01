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
  const [done, setDone] = useState(false);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await signupAction(fd);
      if (res && 'ok' in res && !res.ok) setError(res.error);
      else setDone(true);
    });
  }

  if (done) {
    return (
      <div className="flex flex-col items-center gap-3 py-4 text-center">
        <div className="grid h-14 w-14 place-items-center rounded-full bg-emerald-100 text-emerald-700">
          <Icon name="check" size={26} />
        </div>
        <h2 className="text-[18px] font-extrabold text-ink">Naipasa na ang request mo! 🎉</h2>
        <p className="text-[13.5px] font-medium text-ink-2/75 leading-relaxed">
          Ire-review namin ang resibo mo at gagawin namin ang account mo. Aabisuhan ka sa email
          kapag handa na — gamitin mo ang email at password na inilagay mo para mag-login.
        </p>
        <Link href="/login" className="btn-ghost mt-2 text-[13px] px-4 py-2.5">
          Pumunta sa Login <Icon name="arrow-right" size={14} />
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
      {error && <FormAlert>{error}</FormAlert>}

      <Field label="Full name" name="full_name" type="text" required autoComplete="name" placeholder="Juan Dela Cruz" autoFocus />
      <Field label="Pharmacy name" name="pharmacy_name" type="text" required autoComplete="organization" placeholder="St. Luke's Pharmacy" />
      <Field label="Email" name="email" type="email" required autoComplete="email" inputMode="email" placeholder="juan@gmail.com" />

      <div className="relative">
        <Field
          label="Password"
          name="password"
          type={showPw ? 'text' : 'password'}
          required
          autoComplete="new-password"
          minLength={8}
          placeholder="At least 8 characters"
          hint="Ito ang gagamitin mong password kapag na-approve na ang account mo."
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

      <label className="flex flex-col gap-1">
        <span className="text-[13px] font-extrabold text-ink">Resibo / GCash payment <span className="text-accent">*</span></span>
        <input
          type="file"
          name="receipt"
          accept="image/png,image/jpeg,image/webp,image/heic,image/heif"
          required
          className="text-[13px] text-ink-2 file:mr-3 file:rounded-lg file:border-0 file:bg-accent/10 file:px-3 file:py-2 file:text-[12.5px] file:font-bold file:text-accent hover:file:bg-accent/15"
        />
        <span className="text-[11.5px] text-ink-2/55 font-medium">Screenshot ng ₱499 GCash payment. Image lang (max 5 MB).</span>
      </label>

      <Field label="GCash reference # (optional)" name="payment_reference" type="text" autoComplete="off" placeholder="hal. 1234 567 8901" />

      <button type="submit" disabled={pending} className="btn-primary mt-1 justify-center text-[14px] py-3">
        {pending ? 'Ipinapasa…' : <>Ipasa ang request <Icon name="arrow-right" size={15} /></>}
      </button>

      <p className="text-center text-[12.5px] font-semibold text-ink-2/70">
        May account ka na?{' '}
        <Link href="/login" className="text-accent hover:underline">Log in</Link>
      </p>

      <p className="text-[11.5px] text-center text-ink-2/55 font-medium leading-relaxed">
        Sa pag-sign up, sumasang-ayon kang magbayad ng ₱499 one-time via GCash. Ire-review namin ang
        resibo bago gawin ang account mo.
      </p>
    </form>
  );
}
