import { searchParamsCache } from '@/lib/searchparams';
import { DataTable as SlotTable } from '@/components/ui/table/data-table';
import { columns, SlotWithBookings } from './slots-tables/columns';
import { authorizedGet } from '@/lib/api-client';
import { auth } from '@/lib/auth';

type SlotListingPage = {};

export default async function SlotListingPage({}: SlotListingPage) {
  // Showcasing the use of search params cache in nested RSCs
  const page = searchParamsCache.get('page');
  const search = searchParamsCache.get('q');
  const pageLimit = searchParamsCache.get('limit');
  const categories = searchParamsCache.get('categories');

  // eslint-disable-next-line
  const filters = {
    page,
    limit: pageLimit,
    ...(search && { search }),
    ...(categories && { categories: categories })
  };

  const session = await auth();
  const response = await authorizedGet('/admin/slots/', session?.user?.id!);
  const slots: SlotWithBookings[] = response.data;
  return (
    <SlotTable<SlotWithBookings, unknown>
      columns={columns}
      data={slots}
      totalItems={slots.length}
    />
  );
}
