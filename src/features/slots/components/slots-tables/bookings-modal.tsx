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
          <table className='min-w-full border-collapse border border-gray-300'>
            <thead>
              <tr className='bg-gray-100'>
                <th className='border border-gray-300 px-4 py-2 text-left'>
                  #
                </th>
                <th className='border border-gray-300 px-4 py-2 text-left'>
                  User Name
                </th>
                <th className='border border-gray-300 px-4 py-2 text-left'>
                  Email
                </th>
                0
                <th className='border border-gray-300 px-4 py-2 text-left'>
                  Created At
                </th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking, index) => (
                <tr key={booking.id}>
                  <td className='border border-gray-300 px-4 py-2'>
                    {index + 1}
                  </td>
                  <td className='border border-gray-300 px-4 py-2'>
                    {booking.user.name}
                  </td>
                  <td className='border border-gray-300 px-4 py-2'>
                    {booking.user.email}
                  </td>
                  <td className='border border-gray-300 px-4 py-2'>
                    {new Date(booking.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p>No bookings found for this slot.</p>
      )}

      <div className='flex w-full items-center justify-end space-x-2 pt-6'>
        <Button disabled={loading} variant='outline' onClick={onClose}>
          Close
        </Button>
      </div>
    </Modal>
  );
};
