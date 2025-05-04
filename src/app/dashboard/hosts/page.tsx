import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';
import HostListingPage from '@/features/hosts/components/hosts-listing'; // Create this component for host listing
import HostTableAction from '@/features/hosts/components/hosts-tables/host-table-action'; // Actions for approve/reject
import { searchParamsCache, serialize } from '@/lib/searchparams';
import { SearchParams } from 'nuqs/server';
import { Suspense } from 'react';

export const metadata = {
  title: 'Dashboard: Hosts'
};

type pageProps = {
  searchParams: Promise<SearchParams>;
};

export default async function Page(props: pageProps) {
  const searchParams = await props.searchParams;
  // Allow nested RSCs to access the search params (in a type-safe way)
  searchParamsCache.parse(searchParams);

  // This key is used for invoke suspense if any of the search params changed (used for filters).
  const key = serialize({ ...searchParams });

  return (
    <PageContainer scrollable={false}>
      <div className='flex flex-1 flex-col space-y-4'>
        <div className='flex items-start justify-between'>
          <Heading
            title='Hosts'
            description='Manage pending, approved, and rejected hosts'
          />
          {/* <Link
            href='/dashboard/hosts/new' // Link to a new page where admins can add new hosts
            className={cn(buttonVariants(), 'text-xs md:text-sm')}
          >
            <Plus className='mr-2 h-4 w-4' /> Add New Host
          </Link> */}
        </div>
        <Separator />
        <HostTableAction />
        <Suspense
          key={key}
          fallback={<DataTableSkeleton columnCount={5} rowCount={10} />}
        >
          <HostListingPage />
          {/* This component will list the hosts */}
        </Suspense>
      </div>
    </PageContainer>
  );
}
