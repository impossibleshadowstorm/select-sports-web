import { Metadata } from 'next';
import DeleteAccountPage from '@/features/delete-account/delete-account';

export const metadata: Metadata = {
  title: 'Delete Account| Select Sports',
  description: 'Delete account and user data page of SelectSports .'
};

export default async function Page() {
  return <DeleteAccountPage />;
}
