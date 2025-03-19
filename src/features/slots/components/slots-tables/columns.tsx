'use client';
import { ColumnDef } from '@tanstack/react-table';
import { CellAction } from './cell-action';
import { Slot } from '@prisma/client';

export type SlotWithBookings = Slot & {
  bookings: { user: { name: string; email: string } }[];
};

export const columns: ColumnDef<SlotWithBookings>[] = [
  // {
  //   accessorKey: 'name',
  //   header: 'Name'
  // },
  // {
  //   accessorKey: 'description',
  //   header: 'Description'
  // },
  // {
  //   accessorKey: 'address.city',
  //   header: 'CITY'
  // },
  // {
  //   accessorKey: 'address.postalCode',
  //   header: 'ZIP'
  // },
  // {
  //   accessorKey: 'address.state',
  //   header: 'STATE'
  // },
  // {
  //   id: 'actions',
  //   header: 'Actions',
  //   cell: ({ row }) => <CellAction data={row.original} />
  // }
  {
    accessorKey: 'sport.name',
    header: 'Sport'
  },
  {
    accessorKey: 'venue.name',
    header: 'Venue'
  },
  {
    accessorKey: 'startTime',
    header: 'Start Time',
    cell: ({ row }) => new Date(row.original.startTime).toLocaleString()
  },
  {
    accessorKey: 'endTime',
    header: 'End Time',
    cell: ({ row }) => new Date(row.original.endTime).toLocaleString()
  },
  {
    accessorKey: 'bookings',
    header: 'Booked Users',
    cell: ({ row }) => {
      return row.original?.bookings?.length;
    }
  },
  {
    accessorKey: 'maxPlayer',
    header: 'Max Players'
  },
  {
    accessorKey: 'price',
    header: 'Price',
    cell: ({ row }) => {
      return row.original?.discountedPrice;
    }
  },
  {
    accessorKey: 'status',
    header: 'Status'
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) =>
      row.original.status !== 'CANCELLED' ? (
        <CellAction data={row.original} />
      ) : (
        'N/A'
      )
  }
];
