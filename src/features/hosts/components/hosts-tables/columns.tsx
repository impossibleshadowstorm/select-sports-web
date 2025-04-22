'use client';
import { ColumnDef } from '@tanstack/react-table';
import { CellAction } from './cell-action'; // Assuming actions are similar to your Slot actions
import { Host } from '@prisma/client'; // Replace with Host type
import { Badge } from '@/components/ui/badge'; // UI component for styling tags
import { CheckCircle, XCircle } from 'lucide-react'; // Icons for Yes/No fields
import { ExpandableText } from './expandable-text';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent
} from '@/components/ui/accordion';
export type HostWithStatus = Host & {
  status: 'PENDING' | 'APRROVED' | 'REJECTED' | 'REVOKED'; // Add status to the type
  user: {
    id: string;
    name: string;
    email: string;
  };
};

export const columns: ColumnDef<HostWithStatus>[] = [
  {
    accessorKey: 'user.name',
    header: 'Host Name',
    cell: ({ row }) => row.original.user?.name || 'N/A' // Handle missing data
  },
  {
    accessorKey: 'user.email',
    header: 'Email',
    cell: ({ row }) => row.original.user?.email || 'N/A' // Handle missing data
  },
  {
    accessorKey: 'occupation',
    header: 'Occupation'
  },
  {
    accessorKey: 'currentLocation',
    header: 'Current Location'
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      // Display status in a readable format
      const status = row.original.status;
      // return <span className={`status-${status.toLowerCase()}`}>{status}</span>;
      return <Badge>{status}</Badge>;
    }
  },
  {
    accessorKey: 'playFootball',
    header: 'Plays Football',
    cell: ({ row }) =>
      row.original.playFootball === 'YES' ? (
        <CheckCircle className='text-green-500' />
      ) : (
        <XCircle className='text-red-500' />
      )
  },
  {
    accessorKey: 'car',
    header: 'Has Car',
    cell: ({ row }) =>
      row.original.car === 'YES' ? (
        <CheckCircle className='text-green-500' />
      ) : (
        <XCircle className='text-red-500' />
      )
  },
  {
    accessorKey: 'bike',
    header: 'Has Bike',
    cell: ({ row }) =>
      row.original.bike === 'YES' ? (
        <CheckCircle className='text-green-500' />
      ) : (
        <XCircle className='text-red-500' />
      )
  },
  {
    accessorKey: 'experienceInOrgCS',
    header: 'Experience in Org CS',
    cell: ({ row }) =>
      row.original.experienceInOrgCS === 'YES' ? (
        <CheckCircle className='text-green-500' />
      ) : (
        <XCircle className='text-red-500' />
      )
  },
  {
    accessorKey: 'commitHours',
    header: 'Commitment Hours',
    cell: ({ row }) => (
      <Badge>{row.original.commitHours.replace(/_/g, ' ')}</Badge>
    )
  },
  {
    accessorKey: 'preferredSchedule',
    header: 'Preferred Schedule',
    cell: ({ row }) => {
      const schedules = row.original.preferredSchedule;

      if (!schedules || schedules.length === 0) return 'N/A';

      const formattedSchedules = schedules.map(
        (schedule: string) =>
          schedule
            .replace(/_/g, ' ')
            .toLowerCase() // Convert entire string to lowercase
            .replace(/\b\w/g, (char) => char.toUpperCase()) // Capitalize first letter of each word
      );

      return <span>{formattedSchedules.join(', ')}</span>;
    }
  },
  {
    accessorKey: 'keyHighlights',
    header: 'Key Highlights',
    cell: ({ row }) => (
      <ExpandableText text={row.original.keyHighlights || 'N/A'} />
      // <Accordion type='single' collapsible>
      //   <AccordionItem value={row.original.id}>
      //     {' '}
      //     {/* Unique ID for each row */}
      //     <AccordionTrigger>View Highlights</AccordionTrigger>
      //     <AccordionContent>
      //       {row.original.keyHighlights || 'No highlights available'}
      //     </AccordionContent>
      //   </AccordionItem>
      // </Accordion>
    )
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => {
      // Only show actions if the status is not REVOKED
      // return row.original.status !== 'REVOKED' ? (
      //   <CellAction data={row.original} />
      // ) : (
      //   'N/A' // Show N/A for revoked hosts
      // );
      return <CellAction data={row.original} />;
    }
  }
];
