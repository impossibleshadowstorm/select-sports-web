import { notFound } from 'next/navigation';
import VenueForm from './venue-form';
import { get } from '@/lib/api-client';

type TVenueViewPageProps = {
  venueId: string;
};

export default async function VenueViewPage({ venueId }: TVenueViewPageProps) {
  let venue = null;
  let pageTitle = 'Create New Venue';

  const { data: availableSports } = await get(`/sports`);

  if (venueId !== 'new') {
    const response = await get(`/venues/${venueId}`);
    venue = response.data;
    if (!venue) {
      notFound();
    }
    pageTitle = `Edit Venue`;
  }

  return (
    <VenueForm
      initialData={venue}
      availableSports={availableSports}
      pageTitle={pageTitle}
    />
  );
}
