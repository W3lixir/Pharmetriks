// Read-only feed of the central dispensing guides for the app. Gated by the
// dispense_guide add-on (like /api/sync gates cloud_sync). The app caches the
// result in localStorage so the Gabay tab still works offline after one fetch.

import { NextResponse } from 'next/server';
import { getServerClient } from '@/lib/supabase/server';
import { hasFeature, type FeatureMap } from '@/lib/features';
import { listGuides } from '@/lib/guides';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const supabase = getServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'no_session' }, { status: 401 });

  const { data: profile } = await supabase
    .from('profiles')
    .select('features')
    .eq('id', user.id)
    .maybeSingle();
  if (!hasFeature((profile?.features ?? {}) as FeatureMap, 'dispense_guide')) {
    return NextResponse.json({ error: 'not_entitled' }, { status: 403 });
  }

  return NextResponse.json({ guides: await listGuides() });
}
