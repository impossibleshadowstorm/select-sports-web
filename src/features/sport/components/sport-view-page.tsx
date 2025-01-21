import { notFound } from 'next/navigation';
import SportForm from './sport-form';
import { get } from '@/lib/api-client';
import { AvailableSports, Sport } from '@prisma/client';

type TSportViewPageProps = {
  sportId: string;
};

export default async function SportViewPage({ sportId }: TSportViewPageProps) {
  let sport = null;
  let pageTitle = 'Create New Sport';

  if (sportId !== 'new') {
    const response = await get<{ data: Sport }>(`/sports/${sportId}`);
    sport = response.data;
    if (!sport) {
      notFound();
    }
    pageTitle = `Edit Sport`;
  }

  return <SportForm initialData={sport} pageTitle={pageTitle} />;
}
