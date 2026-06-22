import AuthShell from '@/components/auth/AuthShell';
import HelpButton from '@/components/ui/HelpButton';
import ResetPasswordForm from './ResetPasswordForm';

export const metadata = { title: 'Bagong password · Pharmetriks' };

// Reached from the recovery email via /auth/callback, which sets a short-lived
// session that authorizes the password change.
export default function ResetPasswordPage() {
  return (
    <>
      <AuthShell
        pill={{ tone: 'blue', label: 'Reset password' }}
        title={<>Gumawa ng bagong password</>}
        subtitle="Ilagay ang bagong password para sa account mo."
      >
        <ResetPasswordForm />
      </AuthShell>
      <HelpButton />
    </>
  );
}
