'use client';

import { DataTableSearch } from '@/components/ui/table/data-table-search';
import { useSlotTableFilters } from './use-slot-table-filters';

export default function SlotTableAction() {
  const { searchQuery, setPage, setSearchQuery } = useSlotTableFilters();
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
