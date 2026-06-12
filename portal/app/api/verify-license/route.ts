import { NextResponse } from 'next/server';
import { getServerClient } from '@/lib/supabase/server';
import { activeFeatureBooleans, type FeatureMap } from '@/lib/features';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type VerifyResult = {
  valid: boolean;
  status: 'pending' | 'awaiting_payment' | 'approved' | 'rejected' | 'revoked' | 'no_session';
  expires_at: string | null;
  features: Record<string, boolean>;
};

export async function POST(): Promise<NextResponse<VerifyResult>> {
  const supabase = getServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ valid: false, status: 'no_session', expires_at: null, features: {} });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('status, license_expires_at, features')
    .eq('id', user.id)
    .maybeSingle();

  if (!profile) {
    return NextResponse.json({ valid: false, status: 'no_session', expires_at: null, features: {} });
  }

  const expired = profile.license_expires_at
    ? new Date(profile.license_expires_at) < new Date()
    : false;

  const valid = profile.status === 'approved' && !expired;

  return NextResponse.json({
    valid,
    status: profile.status as VerifyResult['status'],
    expires_at: profile.license_expires_at ?? null,
    // Add-ons are monthly: grants may carry an expiry date. The app only ever
    // sees plain booleans of what's active at verify time; a lapsed add-on
    // simply disappears on the next app load.
    features: activeFeatureBooleans((profile.features ?? {}) as FeatureMap),
  });
}
