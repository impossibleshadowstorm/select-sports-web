'use client';
import { ColumnDef } from '@tanstack/react-table';
import { CellAction } from './cell-action';
import { Slot } from '@prisma/client';

type SlotWithBookings = Slot & {
  bookings: { user: { name: string; email: string } }[];
};

export const columns: ColumnDef<Slot>[] = [
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
    accessorKey: 'maxPlayer',
    header: 'Max Players'
  },
  {
    accessorKey: 'status',
    header: 'Status'
  },
  {
    accessorKey: 'bookings',
    header: 'Booked Users',
    cell: ({ row }) => {
      const bookedUsers = row.original.bookings
        .map((b) => b.user.name)
        .join(', ');
      return bookedUsers || 'No bookings';
    }
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => <CellAction data={row.original} />
  }
];
