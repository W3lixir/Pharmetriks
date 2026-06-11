// Cloud sync endpoint for the "Offline + Online Sync" add-on.
//
//   GET  → pull the user's three collections (inv/sales/exp), each as
//          { items, tombstones, version }.
//   POST → push one collection with optimistic concurrency. Body:
//          { collection, items, tombstones, baseVersion }. If the stored
//          version no longer matches baseVersion, returns 409 with the current
//          server state so the client can re-merge and retry.
//
// Auth mirrors /api/verify-license (Supabase session cookie). All DB access
// uses the user-scoped client, so RLS guarantees a user only touches their own
// rows. Entitlement (the cloud_sync feature flag) is enforced here too — a
// server-side gate, not just UI.

import { NextResponse } from 'next/server';
import { getServerClient } from '@/lib/supabase/server';
import { hasFeature, type FeatureMap } from '@/lib/features';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const COLLECTIONS = ['inv', 'sales', 'exp', 'suki', 'utang'] as const;
type Collection = (typeof COLLECTIONS)[number];

type Authed =
  | { ok: true; supabase: ReturnType<typeof getServerClient>; userId: string }
  | { ok: false; res: NextResponse };

async function authorize(): Promise<Authed> {
  const supabase = getServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, res: NextResponse.json({ error: 'no_session' }, { status: 401 }) };
  }
  const { data: profile } = await supabase
    .from('profiles')
    .select('features')
    .eq('id', user.id)
    .maybeSingle();
  if (!hasFeature((profile?.features ?? {}) as FeatureMap, 'cloud_sync')) {
    return { ok: false, res: NextResponse.json({ error: 'not_entitled' }, { status: 403 }) };
  }
  return { ok: true, supabase, userId: user.id };
}

export async function GET() {
  const auth = await authorize();
  if (!auth.ok) return auth.res;

  const { data, error } = await auth.supabase
    .from('user_data')
    .select('collection, items, tombstones, version')
    .eq('user_id', auth.userId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const out: Record<string, { items: unknown[]; tombstones: Record<string, string>; version: number }> = {};
  for (const c of COLLECTIONS) out[c] = { items: [], tombstones: {}, version: 0 };
  for (const row of data ?? []) {
    out[row.collection] = {
      items: (row.items ?? []) as unknown[],
      tombstones: (row.tombstones ?? {}) as Record<string, string>,
      version: Number(row.version ?? 0),
    };
  }
  return NextResponse.json(out);
}

export async function POST(request: Request) {
  const auth = await authorize();
  if (!auth.ok) return auth.res;

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: 'bad_json' }, { status: 400 });
  }

  const collection = body.collection as Collection;
  if (!COLLECTIONS.includes(collection)) {
    return NextResponse.json({ error: 'bad_collection' }, { status: 400 });
  }
  const items = Array.isArray(body.items) ? body.items : [];
  const tombstones =
    body.tombstones && typeof body.tombstones === 'object' ? body.tombstones : {};
  const baseVersion = Number(body.baseVersion ?? 0);

  // Optimistic concurrency: the stored version must still equal baseVersion.
  const { data: existing } = await auth.supabase
    .from('user_data')
    .select('items, tombstones, version')
    .eq('user_id', auth.userId)
    .eq('collection', collection)
    .maybeSingle();

  const currentVersion = Number(existing?.version ?? 0);
  if (currentVersion !== baseVersion) {
    return NextResponse.json(
      {
        conflict: true,
        current: {
          items: existing?.items ?? [],
          tombstones: existing?.tombstones ?? {},
          version: currentVersion,
        },
      },
      { status: 409 },
    );
  }

  const nextVersion = currentVersion + 1;
  const { error } = await auth.supabase.from('user_data').upsert(
    {
      user_id: auth.userId,
      collection,
      items,
      tombstones,
      version: nextVersion,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,collection' },
  );
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, version: nextVersion });
}
