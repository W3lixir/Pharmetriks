'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Icon from '@/components/ui/Icon';
import GlassCard from '@/components/ui/GlassCard';
import { saveGuideAction, deleteGuideAction } from './actions';
import type { Guide } from '@/lib/guides';

type Editing = Guide | 'new' | null;

export default function GuidesManager({ guides }: { guides: Guide[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<Editing>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState('');

  const cur = editing === 'new' ? null : editing;

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await saveGuideAction(fd);
      if (res.ok) { setEditing(null); router.refresh(); }
      else setError(res.error);
    });
  }

  function remove(id: string, condition: string) {
    if (!confirm(`Burahin ang gabay na "${condition}"?`)) return;
    const fd = new FormData(); fd.set('id', id);
    startTransition(async () => {
      const res = await deleteGuideAction(fd);
      if (res.ok) router.refresh(); else setError(res.error);
    });
  }

  const filtered = guides.filter(g =>
    !q || [g.condition, g.category, g.aliases, g.meds].some(f => (f || '').toLowerCase().includes(q.toLowerCase())),
  );

  const field = (label: string, name: string, val: string, ph: string, area = false) => (
    <label className="flex flex-col gap-1">
      <span className="text-[12px] font-extrabold text-ink-2">{label}</span>
      {area
        ? <textarea name={name} defaultValue={val} placeholder={ph} rows={2} className="input" style={{ resize: 'vertical' }} />
        : <input name={name} defaultValue={val} placeholder={ph} className="input" autoComplete="off" />}
    </label>
  );

  return (
    <div className="space-y-4">
      {editing ? (
        <GlassCard className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[15px] font-extrabold">{cur ? 'Edit guide' : 'Bagong guide'}</h2>
            <button onClick={() => setEditing(null)} className="btn-ghost text-[12.5px] px-3 py-1.5">Cancel</button>
          </div>
          {error && <div className="mb-3 rounded-[10px] border border-red-200 bg-red-50 px-3 py-2 text-[13px] font-semibold text-red-800">{error}</div>}
          <form onSubmit={submit} className="grid gap-3 sm:grid-cols-2">
            {cur && <input type="hidden" name="id" value={cur.id} />}
            <div className="sm:col-span-2">{field('Sintomas / Sakit *', 'condition', cur?.condition || '', 'e.g. Lagnat (Fever)')}</div>
            {field('Category', 'category', cur?.category || '', 'e.g. Lagnat')}
            {field('Iba pang tawag (search)', 'aliases', cur?.aliases || '', 'e.g. fever, init, mainit')}
            <div className="sm:col-span-2">{field('💊 Karaniwang OTC (generics, comma)', 'meds', cur?.meds || '', 'e.g. Paracetamol, Ibuprofen')}</div>
            <div className="sm:col-span-2">{field('📋 Paalala sa paggamit', 'dosage', cur?.dosage || '', 'e.g. 500mg kada 4-6 oras, kasama-kain', true)}</div>
            <div className="sm:col-span-2">{field('🚫 Bawal isabay', 'interactions', cur?.interactions || '', 'e.g. Huwag isabay sa Aspirin — dagdag panganib sa bleeding', true)}</div>
            <div className="sm:col-span-2">{field('⛔ Bawal sa (kondisyon)', 'contraindications', cur?.contraindications || '', 'e.g. Buntis, may ulcer, asthma', true)}</div>
            <div className="sm:col-span-2">{field('⚠️ Kailangan ng doktor kung…', 'redflags', cur?.redflags || '', 'e.g. lagnat 3+ araw, 39°C+, hirap huminga', true)}</div>
            <div className="sm:col-span-2 flex justify-end">
              <button type="submit" disabled={pending} className="btn-primary text-[13px] px-4 py-2.5">
                {pending ? 'Saving…' : 'Save guide'}
              </button>
            </div>
          </form>
        </GlassCard>
      ) : (
        <div className="flex items-center gap-2">
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Hanapin ang gabay…" className="input flex-1" />
          <button onClick={() => { setError(null); setEditing('new'); }} className="btn-primary text-[13px] px-4 py-2.5 whitespace-nowrap">
            <Icon name="install" size={14} className="rotate-180" /> Add guide
          </button>
        </div>
      )}

      {error && !editing && <div className="rounded-[10px] border border-red-200 bg-red-50 px-3 py-2 text-[13px] font-semibold text-red-800">{error}</div>}

      {!editing && (
        <div className="space-y-2.5">
          {filtered.length === 0 && (
            <GlassCard className="p-6 text-center text-[13px] font-semibold text-ink-2/60">
              {guides.length ? 'Walang tugmang gabay.' : 'Wala pang gabay. I-click ang “Add guide”.'}
            </GlassCard>
          )}
          {filtered.map(g => (
            <GlassCard key={g.id} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-[15px] font-extrabold text-ink">{g.condition}</div>
                  {g.category && <span className="inline-block mt-1 rounded-[6px] bg-accent/10 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-accent">{g.category}</span>}
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => { setError(null); setEditing(g); }} className="btn-ghost text-[12px] px-3 py-1.5">Edit</button>
                  <button onClick={() => remove(g.id, g.condition)} disabled={pending} className="btn-ghost text-[12px] px-3 py-1.5 text-red-600">Delete</button>
                </div>
              </div>
              {g.meds && <div className="mt-2 text-[12.5px]"><b className="text-accent-soft">💊 OTC:</b> {g.meds}</div>}
              {g.dosage && <div className="mt-1.5 text-[12.5px] text-ink-2/85"><b>📋</b> {g.dosage}</div>}
              {g.interactions && <div className="mt-1.5 text-[12.5px] text-orange-800"><b>🚫 Bawal isabay:</b> {g.interactions}</div>}
              {g.contraindications && <div className="mt-1.5 text-[12.5px] text-orange-800"><b>⛔ Bawal sa:</b> {g.contraindications}</div>}
              {g.redflags && <div className="mt-1.5 rounded-[8px] bg-amber-50 px-3 py-2 text-[12px] text-amber-900"><b>⚠️ Sa doktor kung:</b> {g.redflags}</div>}
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}
