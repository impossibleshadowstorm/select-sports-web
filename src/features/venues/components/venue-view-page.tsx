import { notFound } from 'next/navigation';
import VenueForm from './venue-form';
import { get } from '@/lib/api-client';
import { Venue } from '@prisma/client';
// import { Venue } from "@prisma/client";

type TVenueViewPageProps = {
  venueId: string;
};

export default async function VenueViewPage({ venueId }: TVenueViewPageProps) {
  let venue = null;
  let pageTitle = 'Create New Product';

  if (venueId !== 'new') {
    const response = await get<{ data: Venue }>(`/venues/${venueId}`);
    venue = response.data;
    if (!venue) {
      notFound();
    }
    pageTitle = `Edit Venue`;
  }

  return <VenueForm initialData={venue} pageTitle={pageTitle} />;
}
