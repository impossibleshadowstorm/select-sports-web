import { searchParamsCache } from '@/lib/searchparams';
import { DataTable as SportTable } from '@/components/ui/table/data-table';
import { columns } from './sport-tables/columns';
import { Sport } from '@prisma/client';
import { get } from '@/lib/api-client';

type SportListingPage = {};

export default async function SportListingPage({}: SportListingPage) {
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

  const response = await get('/sports/');
  const sports: Sport[] = response.data;

  return (
    <SportTable<Sport, unknown>
      columns={columns}
      data={sports}
      totalItems={sports.length}
    />
  );
}
