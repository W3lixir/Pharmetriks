// Central, admin-managed dispensing guides (shared by all accounts). Read by the
// app via /api/guides; created/edited/deleted by admins in /admin/guides.

import { getServiceClient } from '@/lib/supabase/server';

export type Guide = {
  id: string;
  condition: string;
  category: string | null;
  aliases: string | null;
  meds: string | null;     // comma-separated generic names (for stock matching)
  dosage: string | null;
  redflags: string | null;
  interactions: string | null;      // "bawal isabay" — drug interaction warnings
  contraindications: string | null; // "bawal sa" — contraindicated conditions
  created_at: string;
  updated_at: string;
};

// Columns added in migration 0010. If that migration hasn't been applied yet,
// selecting them makes the whole query fail ("column ... does not exist") and the
// guides feed silently goes empty. So we try the full select first and fall back
// to the pre-0010 column set, returning the new fields as null — the feature keeps
// working; only the "Bawal isabay"/"Bawal sa" lines are blank until 0010 runs.
const CORE_COLS = 'id, condition, category, aliases, meds, dosage, redflags, created_at, updated_at';
const FULL_COLS = `${CORE_COLS}, interactions, contraindications`;

export async function listGuides(): Promise<Guide[]> {
  const svc = getServiceClient();

  const full = await svc
    .from('dispense_guides')
    .select(FULL_COLS)
    .order('condition', { ascending: true });
  if (!full.error) return (full.data ?? []) as unknown as Guide[];

  // 42703 = undefined_column → migration 0010 not applied. Retry without the new
  // columns so the Gabay tab still shows guides instead of going blank.
  if (full.error.code === '42703') {
    console.warn('[guides] interactions/contraindications missing — apply migration 0010. Falling back.');
    const core = await svc
      .from('dispense_guides')
      .select(CORE_COLS)
      .order('condition', { ascending: true });
    if (core.error) { console.error('[guides] list failed:', core.error.message); return []; }
    return (core.data ?? []).map(g => ({ ...g, interactions: null, contraindications: null })) as unknown as Guide[];
  }

  console.error('[guides] list failed:', full.error.message);
  return [];
}
