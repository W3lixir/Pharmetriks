import AuthShell from '@/components/auth/AuthShell';
import HelpButton from '@/components/ui/HelpButton';
import GcashCard from '@/app/upload-receipt/GcashCard';
import { resolveGcash } from '@/lib/gcash';
import SignupForm from './SignupForm';

export const metadata = { title: 'Sign up · Pharmetriks' };
export const dynamic = 'force-dynamic';

export default function SignupPage() {
  const { qrSrc, isRealQr, gcashNumber, gcashName } = resolveGcash();

  return (
    <>
      <AuthShell
        pill={{ tone: 'pink', label: '₱499 one-time, lifetime access' }}
        title={<>Mag-apply ng account</>}
        subtitle="Magbayad ng ₱499 via GCash, i-upload ang resibo, at ire-review namin bago gawin ang account mo."
        width="md"
      >
        <div className="space-y-5">
          <GcashCard
            qrSrc={qrSrc}
            isRealQr={isRealQr}
            gcashNumber={gcashNumber}
            gcashName={gcashName}
            amount="₱499"
            details={false}
          />
          <SignupForm />
        </div>
      </AuthShell>
      <HelpButton />
    </>
  );
}
