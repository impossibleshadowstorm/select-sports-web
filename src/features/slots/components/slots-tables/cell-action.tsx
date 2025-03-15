'use client';
import { AlertModal } from '@/components/modal/alert-modal';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { authorizedDelete, get } from '@/lib/api-client';
import { Slot } from '@prisma/client';
import { Edit, MoreHorizontal, Trash } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { BookingsModal } from '@/features/slots/components/slots-tables/bookings-modal';

interface CellActionProps {
  data: Slot;
}

export const CellAction: React.FC<CellActionProps> = ({ data }) => {
  // eslint-disable-next-line
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [checkBookingsOpen, setCheckBookingsOpen] = useState(false);
  const [slotBookings, setSlotBookings] = useState([]);
  const router = useRouter();
  const { data: session } = useSession();

  const onConfirm = async () => {
    try {
      setLoading(true);
      await authorizedDelete(`/admin/slots/${data.id}`, session?.user?.id!);

      setOpen(false);
      toast.success('Slot Cancelled successfully');
      router.refresh();
    } catch (error) {
      toast.error('Unable to Delete The slot');
    }
  };

  const onCheckBookings = async () => {
    try {
      setLoading(true);
      const response = await get(`/slots/${data.id}`);
      if (!response || !response.data) {
        throw new Error('Invalid response from the server.');
      }

      const bookings = response.data.bookings || [];
      setSlotBookings(bookings);
      toast.success('Bookings loaded successfully');
    } catch (error) {
      toast.error('Failed to load bookings.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onConfirm}
        loading={loading}
      />

      <BookingsModal
        isOpen={checkBookingsOpen}
        onClose={() => setCheckBookingsOpen(false)}
        loading={loading}
        bookings={slotBookings}
      />
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
            onClick={() => {
              onCheckBookings();
              setCheckBookingsOpen(true);
            }}
            disabled={loading}
          >
            <Edit className='mr-2 h-4 w-4' /> Check Bookings
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => router.push(`/dashboard/slots/${data.id}`)}
          >
            <Edit className='mr-2 h-4 w-4' /> Update
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => setOpen(true)} disabled={loading}>
            <Trash className='mr-2 h-4 w-4' /> Cancel
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
