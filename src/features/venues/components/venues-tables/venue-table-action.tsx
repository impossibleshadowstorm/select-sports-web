'use client';

import { DataTableSearch } from '@/components/ui/table/data-table-search';
import { useVenueTableFilters } from './use-venue-table-filters';

export default function VenueTableAction() {
  const { searchQuery, setPage, setSearchQuery } = useVenueTableFilters();
  return (
    <div className='flex flex-wrap items-center gap-4'>
      <DataTableSearch
        searchKey='name'
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        setPage={setPage}
      />
    </div>
  );
}
