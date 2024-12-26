import ResetPasswordForm from "@/components/auth/ForgotPasswordForm";

export interface SearchParams {
  success?: string;
}

interface PageProps {
  searchParams: SearchParams;
}

export default function ResetPasswordPage({ searchParams }: PageProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-2">
      <ResetPasswordForm />
      {searchParams.success && (
        <div className="mt-4 p-4 bg-green-100 text-green-700 rounded-lg">
          {searchParams.success}
        </div>
      )}
    </div>
  );
}