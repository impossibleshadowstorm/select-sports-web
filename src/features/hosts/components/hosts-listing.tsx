import { searchParamsCache } from '@/lib/searchparams';
import { DataTable as HostTable } from '@/components/ui/table/data-table';
import { columns, HostWithStatus } from './hosts-tables/columns'; // Change to HostWithStatus
import { authorizedGet } from '@/lib/api-client';
import { auth } from '@/lib/auth';

type HostListingPage = {};

export default async function HostListingPage({}: HostListingPage) {
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
    ...(categories && { categories })
  };

  const session = await auth();
  const response = await authorizedGet('/host/', session?.user?.id!); // Fetch hosts instead of slots
  const hosts: HostWithStatus[] = response.data;
  const filteredHosts = hosts.filter((host) => {
    const matchesSearch = search
      ? host.user?.name.toLowerCase().includes(search.toLowerCase()) ||
        host.status.toLowerCase().includes(search.toLowerCase()) ||
        host.currentLocation.toLowerCase().includes(search.toLowerCase())
      : true;

    return matchesSearch;
  });

  return (
    <HostTable<HostWithStatus, unknown>
      columns={columns}
      data={filteredHosts}
      totalItems={hosts.length}
    />
  );
}
