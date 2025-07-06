'use client';

import { DataTableSearch } from '@/components/ui/table/data-table-search';
import { useNotificationTableFilters } from './use-notification-table-filters';

export default function NotificationTableAction() {
  const { searchQuery, setPage, setSearchQuery } =
    useNotificationTableFilters();
  return (
    <div className='flex flex-wrap items-center gap-4'>
      <DataTableSearch
        searchKey='message'
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        setPage={setPage}
      />
    </div>
  );
}
