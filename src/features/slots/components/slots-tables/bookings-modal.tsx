'use client';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';

interface BookingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  loading: boolean;
  bookings: any[];
}

export const BookingsModal: React.FC<BookingsModalProps> = ({
  isOpen,
  onClose,
  loading,
  bookings
}) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <Modal
      title='Bookings List'
      description={`Confirmed bookings for Slot.`}
      isOpen={isOpen}
      onClose={onClose}
    >
      {bookings.length > 0 ? (
        <div className='overflow-x-auto'>
          <table className='min-w-full border-collapse border border-border'>
            <thead>
              <tr className='bg-background dark:bg-gray-800'>
                <th className='border border-border px-4 py-2 text-left text-foreground'>
                  #
                </th>
                <th className='border border-border px-4 py-2 text-left text-foreground'>
                  User Name
                </th>
                <th className='border border-border px-4 py-2 text-left text-foreground'>
                  Email
                </th>

                <th className='border border-border px-4 py-2 text-left text-foreground'>
                  Created At
                </th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking, index) => (
                <tr
                  key={booking.id}
                  className='hover:bg-gray-100 dark:hover:bg-gray-700'
                >
                  <td className='border border-border px-4 py-2 text-foreground'>
                    {index + 1}
                  </td>
                  <td className='border border-border px-4 py-2 text-foreground'>
                    {booking.user.name}
                  </td>
                  <td className='border border-border px-4 py-2 text-foreground'>
                    {booking.user.email}
                  </td>
                  <td className='border border-border px-4 py-2 text-foreground'>
                    {new Date(booking.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className='text-foreground'>No bookings found for this slot.</p>
      )}

      <div className='flex w-full items-center justify-end space-x-2 pt-6'>
        <Button disabled={loading} variant='outline' onClick={onClose}>
          Close
        </Button>
      </div>
    </Modal>
  );
};
