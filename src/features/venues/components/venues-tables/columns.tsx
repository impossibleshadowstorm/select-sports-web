'use client';
import { ColumnDef } from '@tanstack/react-table';
import { CellAction } from './cell-action';
import { Venue } from '@prisma/client';

export const columns: ColumnDef<Venue>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
    // size: 120,
    cell: ({ row }) => (
      <div className='line-clamp-1 w-[170px] overflow-hidden text-ellipsis whitespace-pre-wrap'>
        {row.original.name}
      </div>
    )
  },
  {
    accessorKey: 'description',
    header: 'Description',
    cell: ({ row }) => (
      <div className='line-clamp-1 overflow-hidden text-ellipsis whitespace-pre-wrap'>
        {row.original.description}
      </div>
    )
  },
  {
    accessorKey: 'address.postalCode',
    header: 'ZIP'
  },
  {
    accessorKey: 'address.state',
    header: 'STATE'
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => <CellAction data={row.original} />
  }
];
