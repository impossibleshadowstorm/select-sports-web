'use client';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';

interface BookingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  loading: boolean;
}

export const BookingsModal: React.FC<BookingsModalProps> = ({
  isOpen,
  onClose,
  loading
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
      description='Confirmed bookings for Slot #{id}.'
      isOpen={isOpen}
      onClose={onClose}
    >
      <div className='flex w-full items-center justify-end space-x-2 pt-6'>
        <Button disabled={loading} variant='outline' onClick={onClose}>
          Close
        </Button>
      </div>
    </Modal>
  );
};
