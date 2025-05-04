import { Metadata } from 'next';
import SignInViewPage from '@/features/auth/components/sigin-view';
import PrivacyPolicyPage from '@/features/privacy-policy/privacy-policy';
// import dynamic from "next/dynamic";
// import { Suspense } from 'react';

// const SignInViewPage = dynamic(
//   () => import("@/features/auth/components/sigin-view"),
//   { ssr: false }
// );

export const metadata: Metadata = {
  title: 'Privacy Policy | Select Sports',
  description: 'Privacy Policy page of SelectSports .'
};

export default async function Page() {
  return (
    // <Suspense fallback={<div>Loading...</div>}>
    <PrivacyPolicyPage />
    // </Suspense>
  );
}
