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
  const limit = searchParamsCache.get('limit');
  const categories = searchParamsCache.get('categories');

  // eslint-disable-next-line
  // const filters = {
  //   page,
  //   limit: pageLimit,
  //   ...(search && { search }),
  //   ...(categories && { categories: categories })
  // };

  const session = await auth();

  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString()
  });
  if (search) params.set('q', search);
  if (categories) params.set('categories', categories);

  const response = await authorizedGet(
    `/admin/slots?${params.toString()}`,
    session?.user?.id!
  );

  const slots: SlotWithBookings[] = response.data || [];
  const totalCount: number = response?.totalCount || 0;

  const filteredSlots = slots.filter((slot) => {
    // const matchesSearch = search
    //   ? slot.discountedPrice. ||
    //     slot.maxPlayer ||
    //     slot.status.toLowerCase().includes(search.toLowerCase()) ||
    //     slot.sport.name.toLowerCase().includes(search.toLowerCase()) ||
    //     slot.venue.name.toLowerCase().includes(search.toLowerCase())
    //   : true;
    // return matchesSearch;
    if (!search) return true;

    const searchLower = search.toLowerCase();
    const searchNumber = parseFloat(search);

    const matchesSearch =
      slot.status.toLowerCase().includes(searchLower) ||
      slot.sport.name.toLowerCase().includes(searchLower) ||
      slot.venue.name.toLowerCase().includes(searchLower) ||
      (!isNaN(searchNumber) &&
        (slot.maxPlayer === searchNumber ||
          slot.discountedPrice === searchNumber));

    return matchesSearch;
  });
  return (
    <SlotTable<SlotWithBookings, unknown>
      columns={columns}
      data={filteredSlots}
      totalItems={totalCount}
      pageIndex={page - 1}
      pageSize={limit}
    />
  );
}
