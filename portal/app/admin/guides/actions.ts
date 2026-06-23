'use server';

import { revalidatePath } from 'next/cache';
import { requireAdmin, adminService } from '@/lib/admin';

export type GuideResult = { ok: true } | { ok: false; error: string };

function fieldsFrom(fd: FormData) {
  const t = (k: string) => String(fd.get(k) ?? '').trim();
  return {
    condition: t('condition'),
    category: t('category') || null,
    aliases: t('aliases') || null,
    meds: t('meds') || null,
    dosage: t('dosage') || null,
    redflags: t('redflags') || null,
    interactions: t('interactions') || null,
    contraindications: t('contraindications') || null,
  };
}

export async function saveGuideAction(fd: FormData): Promise<GuideResult> {
  await requireAdmin();
  const id = String(fd.get('id') ?? '');
  const f = fieldsFrom(fd);
  if (!f.condition) return { ok: false, error: 'Sintomas / sakit ay kailangan.' };

  const svc = adminService();
  const { error } = id
    ? await svc.from('dispense_guides').update(f).eq('id', id)
    : await svc.from('dispense_guides').insert(f);
  if (error) return { ok: false, error: error.message };

  revalidatePath('/admin/guides');
  return { ok: true };
}

export async function deleteGuideAction(fd: FormData): Promise<GuideResult> {
  await requireAdmin();
  const id = String(fd.get('id') ?? '');
  if (!id) return { ok: false, error: 'Missing id.' };

  const svc = adminService();
  const { error } = await svc.from('dispense_guides').delete().eq('id', id);
  if (error) return { ok: false, error: error.message };

  revalidatePath('/admin/guides');
  return { ok: true };
}
