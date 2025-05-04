'use client';

import { useEffect, useState, useTransition } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { authorizedPatch, authorizedGet } from '@/lib/api-client';
import { useSession } from 'next-auth/react';

interface Slot {
  id: string;
  startTime: string;
  endTime: string;
  venue: { name: string };
}

interface AssignHostModalProps {
  isOpen: boolean;
  onClose: () => void;
  hostId: string;
  hostName: string;
}

interface SlotResponse {
  message: string;
  data: Slot[];
  status: number;
}
interface SlotAssignmentResult {
  slotId: string;
  status: 'success' | 'failed';
  message?: string;
}

interface AssignHostResponse {
  message: string;
  results: SlotAssignmentResult[];
}

export default function AssignHostModal({
  isOpen,
  onClose,
  hostId,
  hostName
}: AssignHostModalProps) {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedSlotIds, setSelectedSlotIds] = useState<string[]>([]);
  const [loading, startTransition] = useTransition();
  const { data: session } = useSession();

  const fetchSlots = async () => {
    try {
      const response: SlotResponse = await authorizedGet(
        `/slots/unassigned/`,
        session?.user?.id!
      );
      if (response?.data) {
        setSlots(response.data);
      } else {
        toast.error('Failed to fetch slots');
      }
    } catch (error) {
      toast.error('Error fetching slots');
    }
  };
  useEffect(() => {
    if (isOpen && hostId) {
      fetchSlots();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, hostId, session?.user?.id]);

  const toggleSlotSelection = (slotId: string) => {
    setSelectedSlotIds((prev) =>
      prev.includes(slotId)
        ? prev.filter((id) => id !== slotId)
        : [...prev, slotId]
    );
  };

  const handleAssign = () => {
    startTransition(async () => {
      try {
        const res: AssignHostResponse = await authorizedPatch(
          `/admin/slots/assign-host`,
          session?.user?.id!,
          { hostId, slotIds: selectedSlotIds }
        );

        if (res?.results && res.results.length > 0) {
          const successCount = res.results.filter(
            (r) => r.status === 'success'
          ).length;
          const failedResults = res.results.filter(
            (r) => r.status === 'failed'
          );

          if (successCount > 0) {
            toast.success(`${successCount} slot(s) assigned successfully.`);
            await fetchSlots();
            setSelectedSlotIds([]);
          }

          if (failedResults.length > 0) {
            failedResults.forEach((fail) => {
              toast.error(`${fail.message || 'Failed to assign'}`);
            });
          }

          onClose(); // You can optionally move this inside success condition
        } else {
          toast.error(res?.message || 'No assignment attempted');
        }
      } catch (err) {
        toast.error('Error assigning slots');
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='max-w-4xl'>
        <DialogHeader>
          <DialogTitle>Assign Slots to {hostName}</DialogTitle>
        </DialogHeader>
        <div className='mt-4 flex gap-6'>
          {/* Host Info */}
          <div className='w-1/3 rounded-lg border p-4'>
            <h3 className='mb-2 text-lg font-bold'>Host</h3>
            <p>{hostName}</p>
          </div>

          {/* Slots List */}
          <div className='w-2/3 rounded-lg border p-4'>
            <h3 className='mb-2 text-lg font-bold'>Available Slots</h3>
            <ScrollArea className='h-64 pr-2'>
              {slots.length > 0 ? (
                slots.map((slot) => (
                  <div
                    key={slot.id}
                    className='flex items-center space-x-2 py-1'
                  >
                    <Checkbox
                      checked={selectedSlotIds.includes(slot.id)}
                      onCheckedChange={() => toggleSlotSelection(slot.id)}
                    />
                    <div>
                      <p className='font-medium'>
                        {new Date(slot.startTime).toLocaleString()} →{' '}
                        {new Date(slot.endTime).toLocaleTimeString()}
                      </p>
                      <p className='text-sm text-muted-foreground'>
                        Venue: {slot.venue?.name || 'N/A'}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className='text-sm text-muted-foreground'>
                  No available slots
                </p>
              )}
            </ScrollArea>
          </div>
        </div>

        {/* Actions */}
        <div className='mt-6 flex justify-end gap-2'>
          <Button variant='outline' onClick={onClose}>
            Cancel
          </Button>
          <Button
            disabled={loading || selectedSlotIds.length === 0}
            onClick={handleAssign}
          >
            Assign Selected
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
