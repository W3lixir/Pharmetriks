import { Suspense } from 'react';
import AuthShell from '@/components/auth/AuthShell';
import HelpButton from '@/components/ui/HelpButton';
import LoginForm from './LoginForm';

export const metadata = { title: 'Log in · RXaudit' };

export default function LoginPage() {
  return (
    <>
      <AuthShell
        pill={{ tone: 'blue', label: 'Welcome back' }}
        title={<>Log in sa account mo</>}
        subtitle="I-access ang RXaudit app, manage receipts, or check approval status."
      >
        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
      </AuthShell>
      <HelpButton />
    </>
  );
}
