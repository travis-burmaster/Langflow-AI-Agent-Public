import { Metadata } from 'next';
import ResetPasswordForm from "@/components/auth/ForgotPasswordForm";

export const metadata: Metadata = {
  title: 'Reset Password',
  description: 'Reset your password',
};

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-2">
      <ResetPasswordForm />
    </div>
  );
}