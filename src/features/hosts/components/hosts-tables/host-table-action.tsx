'use client';

import { DataTableSearch } from '@/components/ui/table/data-table-search';
import { useHostTableFilters } from './use-host-table-filters';

export default function HostTableAction() {
  const { searchQuery, setPage, setSearchQuery } = useHostTableFilters();

  return (
    <div className='flex flex-wrap items-center gap-4'>
      <DataTableSearch
        searchKey='by name, location or status'
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        setPage={setPage}
      />
    </div>
  );
}
