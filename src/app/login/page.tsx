import { Metadata } from 'next';
import SignInViewPage from '@/features/auth/components/sigin-view';
// import dynamic from "next/dynamic";
// import { Suspense } from 'react';

// const SignInViewPage = dynamic(
//   () => import("@/features/auth/components/sigin-view"),
//   { ssr: false }
// );

export const metadata: Metadata = {
  title: 'Authentication | Select Sports',
  description: 'Sign In page for authentication.'
};

export default async function Page() {
  return (
    // <Suspense fallback={<div>Loading...</div>}>
    <SignInViewPage />
    // </Suspense>
  );
}
