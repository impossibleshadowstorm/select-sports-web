'use client';
import { ColumnDef } from '@tanstack/react-table';
import { CellAction } from './cell-action';
import { Venue } from '@prisma/client';

export const columns: ColumnDef<Venue>[] = [
  {
    accessorKey: 'name',
    header: 'Name'
  },
  {
    accessorKey: 'description',
    header: 'Description'
  },
  {
    accessorKey: 'address.city',
    header: 'CITY'
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
