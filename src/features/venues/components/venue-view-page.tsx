import { notFound } from 'next/navigation';
import VenueForm from './venue-form';
import { get } from '@/lib/api-client';

type TVenueViewPageProps = {
  slotId: string;
};

export default async function VenueViewPage({ slotId }: TVenueViewPageProps) {
  let slot = null;
  let pageTitle = 'Create New Venue';

  const { data: availableSports } = await get(`/sports`);

  if (slotId !== 'new') {
    const response = await get(`/venues/${slotId}`);
    slot = response.data;
    if (!slot) {
      notFound();
    }
    pageTitle = `Edit Venue`;
  }

  return (
    <VenueForm
      initialData={slot}
      availableSports={availableSports}
      pageTitle={pageTitle}
    />
  );
}
