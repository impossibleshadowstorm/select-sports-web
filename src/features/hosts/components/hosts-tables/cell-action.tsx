'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Host } from '@prisma/client';
import { useRouter } from 'next/navigation';
import { authorizedPatch } from '@/lib/api-client'; // Assuming authorizedPut for status update
import { useSession } from 'next-auth/react';
import AssignHostModal from './assign-host-modal'; // 🔁 Make sure the path is correct

// interface CellActionProps {
//   data: Host & {
//     user: {
//       name: string;
//       email: string;
//       phone: string;
//     };
//   };
// }

export const CellAction: React.FC<any> = ({ data }) => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { data: session } = useSession();
  const [modalOpen, setModalOpen] = useState(false); // 🔑 Control modal visibility

  const onStatusChange = async (newStatus: string) => {
    try {
      setLoading(true);
      await authorizedPatch(`/host/${data.id}`, session?.user?.id!, {
        currentStatus: data.status,
        changeStatus: newStatus
      });
      toast.success(`Host status updated to ${newStatus}`);
      router.refresh();
    } catch (error) {
      toast.error('Failed to update host status.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant='ghost' className='h-8 w-8 p-0'>
            <span className='sr-only'>Open menu</span>
            <MoreHorizontal className='h-4 w-4' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end'>
          <DropdownMenuLabel>Actions</DropdownMenuLabel>

          <DropdownMenuItem
            onClick={() => onStatusChange('APRROVED')}
            disabled={loading}
          >
            Approve
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => onStatusChange('REJECTED')}
            disabled={loading}
          >
            Reject
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => onStatusChange('REVOKED')}
            disabled={loading}
          >
            Revoke
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setModalOpen(true)}>
            Assign Host
          </DropdownMenuItem>
          {/* <DropdownMenuItem
          onClick={() => router.push(`/host/${data.id}`)}
        >
          Edit
        </DropdownMenuItem> */}
        </DropdownMenuContent>
      </DropdownMenu>
      <AssignHostModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        hostId={data.id}
        hostName={data.user.name}
      />
    </>
  );
};
