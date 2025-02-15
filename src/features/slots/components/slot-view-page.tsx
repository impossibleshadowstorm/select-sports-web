import { notFound } from 'next/navigation';
import SlotForm from './slot-form';
import { get } from '@/lib/api-client';
import { SlotType } from '@prisma/client';

type TSlotViewPageProps = {
  slotId: string;
};

export default async function SlotViewPage({ slotId }: TSlotViewPageProps) {
  let slot = null;
  let pageTitle = 'Create New Slot';

  const { data: availableSports } = await get(`/sports`);
  if (slotId !== 'new') {
    const response = await get(`/slots/${slotId}`);
    slot = response.data;
    if (!SlotType) {
      notFound();
    }
    pageTitle = `Edit Slot`;
  }

  return (
    <SlotForm
      initialData={slot}
      availableSports={availableSports}
      pageTitle={pageTitle}
    />
  );
}
