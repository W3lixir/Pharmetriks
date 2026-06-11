'use client';

import { useRef, useState, useTransition } from 'react';
import Icon from '@/components/ui/Icon';
import Field from '@/components/ui/Field';
import FormAlert from '@/components/ui/FormAlert';
import { uploadReceiptAction } from './actions';
import type { FeatureMap } from '@/lib/features';

const ALLOWED = ['image/png', 'image/jpeg', 'image/webp', 'image/heic', 'image/heif'];
const MAX_MB = 5;

type Props = {
  /** Add-ons picked in the checkout — submitted alongside the receipt. */
  requestedFeatures?: FeatureMap;
  /** Extra disable condition (e.g. upgrade mode with nothing picked). */
  submitDisabled?: boolean;
};

export default function UploadForm({ requestedFeatures, submitDisabled }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hover, setHover] = useState(false);
  const [pending, startTransition] = useTransition();

  function pickFile(f: File | null) {
    if (!f) { setFile(null); setPreview(null); return; }
    if (!ALLOWED.includes(f.type)) {
      setError('Image file lang (PNG, JPG, WebP, or HEIC).');
      return;
    }
    if (f.size > MAX_MB * 1024 * 1024) {
      setError(`Sobrang laki — max ${MAX_MB} MB.`);
      return;
    }
    setError(null);
    setFile(f);
    // HEIC won't preview in most browsers; fall back to a placeholder card.
    if (f.type.startsWith('image/') && !f.type.includes('heic') && !f.type.includes('heif')) {
      const url = URL.createObjectURL(f);
      setPreview(url);
    } else {
      setPreview(null);
    }
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setHover(false);
    pickFile(e.dataTransfer.files?.[0] ?? null);
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    if (!file) { setError('Pumili ka muna ng receipt screenshot.'); return; }
    const fd = new FormData(e.currentTarget);
    fd.set('file', file);
    fd.set('requested_features', JSON.stringify(requestedFeatures ?? {}));
    startTransition(async () => {
      const res = await uploadReceiptAction(fd);
      if (res && 'ok' in res && !res.ok) setError(res.error);
    });
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      {error && <FormAlert>{error}</FormAlert>}

      <div>
        <div className="mb-1.5 text-[12.5px] font-extrabold tracking-tight text-ink-2">
          Receipt screenshot
        </div>

        <div
          onDragOver={e => { e.preventDefault(); setHover(true); }}
          onDragEnter={e => { e.preventDefault(); setHover(true); }}
          onDragLeave={() => setHover(false)}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click(); }}
          className={`relative cursor-pointer rounded-glass border-2 border-dashed p-5 text-center transition ${
            hover
              ? 'border-accent bg-accent/8'
              : file
                ? 'border-emerald-300 bg-emerald-50/60'
                : 'border-accent-soft/50 bg-white/60 hover:bg-white/80'
          }`}
        >
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={preview}
              alt="Receipt preview"
              className="mx-auto max-h-56 rounded-[10px] border border-white/80 shadow-glass"
            />
          ) : file ? (
            <div className="grid place-items-center py-6">
              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-emerald-500 text-white">
                <Icon name="check" size={28} strokeWidth={2.6} />
              </div>
              <div className="mt-3 font-extrabold">{file.name}</div>
              <div className="text-[11.5px] font-semibold text-ink-2/70">
                {(file.size / 1024).toFixed(0)} KB · ready to upload
              </div>
            </div>
          ) : (
            <div className="grid place-items-center py-4">
              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-lyna-cta text-white shadow-glass">
                <Icon name="install" size={26} className="rotate-180" />
              </div>
              <div className="mt-3 font-extrabold text-[14.5px]">
                Tap to pick or drag &amp; drop
              </div>
              <div className="text-[12px] font-semibold text-ink-2/70">
                PNG, JPG, WebP, or HEIC · up to {MAX_MB} MB
              </div>
            </div>
          )}

          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={e => pickFile(e.target.files?.[0] ?? null)}
          />
        </div>

        {file && (
          <button
            type="button"
            onClick={() => pickFile(null)}
            className="mt-2 inline-flex items-center gap-1 text-[12px] font-bold text-ink-2/70 hover:text-ink"
          >
            <Icon name="x" size={12} /> Remove and pick another
          </button>
        )}
      </div>

      <Field
        label="GCash reference number (optional)"
        name="payment_reference"
        type="text"
        placeholder="e.g. 7012345678"
        hint="Sa GCash receipt mo, makikita yan sa baba. Helpful para mabilis ma-verify."
      />

      <button
        type="submit"
        disabled={pending || !file || submitDisabled}
        className="btn-primary mt-1 justify-center text-[14px] py-3"
      >
        {pending ? 'Uploading…' : <>I-submit ang receipt <Icon name="arrow-right" size={15} /></>}
      </button>

      <p className="text-center text-[12px] font-semibold text-ink-2/65">
        Inaapprove namin ang account mo within a few hours.
      </p>
    </form>
  );
}
