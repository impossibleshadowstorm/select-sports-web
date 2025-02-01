import { notFound } from 'next/navigation';
import SlotForm from './slot-form';
import { get } from '@/lib/api-client';

type TSlotViewPageProps = {
  slotId: string;
};

export default async function SlotViewPage({ slotId }: TSlotViewPageProps) {
  let venue = null;
  let pageTitle = 'Create New Slot';

  const { data: availableSports } = await get(`/sports`);

  if (slotId !== 'new') {
    const response = await get(`/slots/${slotId}`);
    venue = response.data;
    if (!venue) {
      notFound();
    }
    pageTitle = `Edit Slot`;
  }

  return (
    <SlotForm
      initialData={venue}
      availableSports={availableSports}
      pageTitle={pageTitle}
    />
  );
}
