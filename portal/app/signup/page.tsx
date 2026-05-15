import AuthShell from '@/components/auth/AuthShell';
import HelpButton from '@/components/ui/HelpButton';
import SignupForm from './SignupForm';

export const metadata = { title: 'Sign up · RXaudit' };

export default function SignupPage() {
  return (
    <>
      <AuthShell
        pill={{ tone: 'pink', label: '₱249 one-time, lifetime access' }}
        title={<>Gumawa ng account</>}
        subtitle="30 seconds lang. Pagkatapos, magbabayad ka via GCash."
      >
        <SignupForm />
      </AuthShell>
      <HelpButton />
    </>
  );
}
