import FormCardSkeleton from '@/components/form-card-skeleton';
import PageContainer from '@/components/layout/page-container';
import { Suspense } from 'react';
import NotificationViewPage from '@/features/notification/notification-view-page';

export const metadata = {
  title: 'Dashboard : Notification View'
};

type PageProps = { params: Promise<{ notificationId: string }> };

export default async function Page(props: PageProps) {
  const params = await props.params;
  return (
    <PageContainer scrollable>
      <div className='flex-1 space-y-4'>
        <Suspense fallback={<FormCardSkeleton />}>
          <NotificationViewPage notificationId={params.notificationId} />
        </Suspense>
      </div>
    </PageContainer>
  );
}
