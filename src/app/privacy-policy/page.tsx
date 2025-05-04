import { Metadata } from 'next';
import PrivacyPolicyPage from '@/features/privacy-policy/privacy-policy';

export const metadata: Metadata = {
  title: 'Privacy Policy | Select Sports',
  description: 'Privacy Policy page of SelectSports .'
};

export default async function Page() {
  return <PrivacyPolicyPage />;
}
