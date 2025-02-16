import { searchParamsCache } from '@/lib/searchparams';
import { DataTable as SlotTable } from '@/components/ui/table/data-table';
import { columns, SlotWithBookings } from './slots-tables/columns';
import { get } from '@/lib/api-client';

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

  const response = await get('/slots/');
  const slots: SlotWithBookings[] = response.data;
  return (
    <SlotTable<SlotWithBookings, unknown>
      columns={columns}
      data={slots}
      totalItems={slots.length}
    />
  );
}
