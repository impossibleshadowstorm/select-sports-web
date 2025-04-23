import { searchParamsCache } from '@/lib/searchparams';
import { DataTable as VenueTable } from '@/components/ui/table/data-table';
import { columns } from './venues-tables/columns';
import { Venue } from '@prisma/client';
import { get } from '@/lib/api-client';

type VenueListingPage = {};

export default async function VenueListingPage({}: VenueListingPage) {
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

  const response = await get('/venues/');
  const venues: Venue[] = response.data;

  const filteredVenues = venues.filter((venue) => {
    if (!search) return true;

    const searchLower = search.toLowerCase();
    const searchNumber = parseFloat(search);

    const matchesSearch = venue.name.toLowerCase().includes(search);
    return matchesSearch;
  });
  return (
    <VenueTable<Venue, unknown>
      columns={columns}
      data={filteredVenues}
      totalItems={venues.length}
    />
  );
}
