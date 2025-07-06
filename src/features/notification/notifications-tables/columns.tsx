'use client';

import { ColumnDef } from '@tanstack/react-table';
import { CellAction } from './cell-action';
import { Notification } from '@prisma/client';

// Helper function to format the expiration date
const formatDate = (date: string | Date) => {
  if (!date) return 'N/A';
  const formattedDate = new Date(date).toLocaleString(); // Format it as per your preference
  return formattedDate;
};

export const columns: ColumnDef<Notification>[] = [
  {
    accessorKey: 'title',
    header: 'Title',
    cell: ({ row }) => (
      <div className='line-clamp-1 w-[170px] overflow-hidden text-ellipsis whitespace-pre-wrap'>
        {row.original.title}
      </div>
    )
  },
  {
    accessorKey: 'message',
    header: 'Message',
    cell: ({ row }) => (
      <div className='line-clamp-1 overflow-hidden text-ellipsis whitespace-pre-wrap'>
        {row.original.message}
      </div>
    )
  },
  {
    accessorKey: 'type',
    header: 'Type'
  },
  {
    accessorKey: 'target',
    header: 'Target'
  },
  {
    accessorKey: 'expiresAt',
    header: 'Expires At',
    cell: ({ row }) => (
      <div className='line-clamp-1 overflow-hidden text-ellipsis'>
        {formatDate(row.original.expiresAt)}{' '}
        {/* Display the formatted expiration date */}
      </div>
    )
  }
  // {
  //   id: 'actions',
  //   header: 'Actions',
  //   cell: ({ row }) => <CellAction data={row.original} />
  // }
];
