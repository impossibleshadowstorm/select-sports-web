import { Metadata } from 'next';
import DeleteAccountPage from '@/features/delete-account/delete-account';
// import dynamic from "next/dynamic";
// import { Suspense } from 'react';

// const SignInViewPage = dynamic(
//   () => import("@/features/auth/components/sigin-view"),
//   { ssr: false }
// );

export const metadata: Metadata = {
  title: 'Deleet Accoutn| Select Sports',
  description: 'Delete account and user data page of SelectSports .'
};

export default async function Page() {
  return (
    // <Suspense fallback={<div>Loading...</div>}>
    <DeleteAccountPage />
    // </Suspense>
  );
}
