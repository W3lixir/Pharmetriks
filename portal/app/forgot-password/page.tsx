import AuthShell from '@/components/auth/AuthShell';
import HelpButton from '@/components/ui/HelpButton';
import ForgotPasswordForm from './ForgotPasswordForm';

export const metadata = { title: 'Nakalimutan ang password · Pharmetriks' };

export default function ForgotPasswordPage() {
  return (
    <>
      <AuthShell
        pill={{ tone: 'blue', label: 'Reset password' }}
        title={<>Nakalimutan ang password?</>}
        subtitle="Ilagay ang email mo at padadalhan ka namin ng link para gumawa ng bagong password."
      >
        <ForgotPasswordForm />
      </AuthShell>
      <HelpButton />
    </>
  );
}
