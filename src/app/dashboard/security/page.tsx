import { SearchParams } from 'nuqs/server';
import ChangePasswordForm from '@/features/security/components/change-password-form';

export const metadata = {
  title: 'Dashboard : Security'
};

type PageProps = {
  searchParams: Promise<SearchParams>;
};

export default async function SecurityPage({ searchParams }: PageProps) {
  return (
    <div className='mx-auto max-w-2xl rounded-lg bg-white p-6 shadow-md'>
      <h1 className='mb-4 text-2xl font-bold'>Security</h1>
      <p className='mb-6 text-gray-600'>
        Update your password to keep your account secure.
      </p>

      {/* Change Password Form */}
      <ChangePasswordForm />
    </div>
  );
}
