import AuthShell from '@/components/auth/AuthShell';
import HelpButton from '@/components/ui/HelpButton';
import SignupForm from './SignupForm';

export const metadata = { title: 'Sign up · Pharmetriks' };

export default function SignupPage() {
  return (
    <>
      <AuthShell
        pill={{ tone: 'pink', label: '₱249 one-time, lifetime access' }}
        title={<>Mag-apply ng account</>}
        subtitle="Magbayad ng ₱249 via GCash, i-upload ang resibo, at ire-review namin bago gawin ang account mo."
      >
        <SignupForm />
      </AuthShell>
      <HelpButton />
    </>
  );
}
