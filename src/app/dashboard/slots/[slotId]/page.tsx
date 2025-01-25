import FormCardSkeleton from '@/components/form-card-skeleton';
import PageContainer from '@/components/layout/page-container';
import { Suspense } from 'react';
import VenueViewPage from '@/features/venues/components/venue-view-page';

export const metadata = {
  title: 'Dashboard : Slot View'
};

type PageProps = { params: Promise<{ slotId: string }> };

export default async function Page(props: PageProps) {
  const params = await props.params;
  return (
    <PageContainer scrollable>
      <div className='flex-1 space-y-4'>
        <Suspense fallback={<FormCardSkeleton />}>
          <VenueViewPage slotId={params.slotId} />
        </Suspense>
      </div>
    </PageContainer>
  );
}
