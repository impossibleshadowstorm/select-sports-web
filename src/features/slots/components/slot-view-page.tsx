import { notFound } from 'next/navigation';
import VenueForm from './slot-form';
import { get } from '@/lib/api-client';

type TSlotViewPageProps = {
  venueId: string;
};

export default async function SlotViewPage({ venueId }: TSlotViewPageProps) {
  let venue = null;
  let pageTitle = 'Create New Slot';

  const { data: availableSports } = await get(`/sports`);

  if (venueId !== 'new') {
    const response = await get(`/slots/${venueId}`);
    venue = response.data;
    if (!venue) {
      notFound();
    }
    pageTitle = `Edit Slot`;
  }

  return (
    <VenueForm
      initialData={venue}
      availableSports={availableSports}
      pageTitle={pageTitle}
    />
  );
}
