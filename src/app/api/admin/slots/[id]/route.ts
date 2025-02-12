import prisma from '@/lib/utils/prisma-client';
import { authenticateAdmin } from '../../../../../middlewares/auth';
import { NextResponse } from 'next/server';
import { SlotType, SlotStatus } from '@prisma/client';
import { NextRequest, NextResponse as NextResponseType } from 'next/server';

interface SlotRequestBody {
  startTime?: string;
  endTime?: string;
  slotType?: SlotType;
  status?: SlotStatus;
}

interface RouteParams {
  id: string;
}

// Update a Slot
export async function PATCH(
  req: NextRequest,
  { params }: { params: RouteParams }
): Promise<NextResponseType> {
  return await authenticateAdmin(req, async () => {
    try {
      const body: SlotRequestBody = await req.json();
      const { startTime, endTime, slotType, status } = body;

      // Extract slot ID from route parameters
      const { id: slotId } = params;

      // Ensure the slot ID is valid
      if (!slotId) {
        return NextResponse.json(
          { error: 'Slot ID is required in the route parameters.' },
          { status: 400 }
        );
      }

      // Validate `slotType` if provided
      if (slotType && !Object.values(SlotType).includes(slotType)) {
        return NextResponse.json(
          {
            message: `Invalid slot type. Allowed types: ${Object.values(SlotType).join(', ')}`
          },
          { status: 400 }
        );
      }

      // Validate `status` if provided
      if (status && !Object.values(SlotStatus).includes(status)) {
        return NextResponse.json(
          {
            message: `Invalid slot status. Allowed statuses: ${Object.values(SlotStatus).join(', ')}`
          },
          { status: 400 }
        );
      }

      // Check if the slot exists
      const existingSlot = await prisma.slot.findUnique({
        where: { id: slotId }
      });

      if (!existingSlot) {
        return NextResponse.json(
          { message: `Slot with ID ${slotId} not found.` },
          { status: 404 }
        );
      }

      // Check for overlapping slots only if `startTime` or `endTime` is updated
      if (startTime || endTime) {
        const overlappingSlots = await prisma.slot.findMany({
          where: {
            venueId: existingSlot.venueId,
            id: { not: slotId }, // Exclude the current slot from overlap check
            startTime: { lte: new Date(endTime || existingSlot.endTime) },
            endTime: { gte: new Date(startTime || existingSlot.startTime) }
          }
        });

        if (overlappingSlots.length > 0) {
          return NextResponse.json(
            { message: 'The updated slot overlaps with an existing slot.' },
            { status: 400 }
          );
        }
      }

      // Update the slot
      const updatedSlot = await prisma.slot.update({
        where: { id: slotId },
        data: {
          ...(startTime && { startTime: new Date(startTime) }),
          ...(endTime && { endTime: new Date(endTime) }),
          ...(slotType && { slotType }),
          ...(status && { status })
        }
      });

      return NextResponse.json(
        {
          message: 'Slot updated successfully.',
          data: updatedSlot
        },
        { status: 200 }
      );
    } catch (error: any) {
      return NextResponse.json(
        {
          message: 'Failed to update the slot.',
          error: `Error: ${error.message}`
        },
        { status: 500 }
      );
    }
  });
}

// Delete a Slot
export async function DELETE(
  req: NextRequest,
  { params }: { params: RouteParams }
): Promise<NextResponseType> {
  return await authenticateAdmin(req, async () => {
    try {
      // Extract slot ID from route parameters
      const { id: slotId } = params;

      // Ensure slot ID is provided
      if (!slotId) {
        return NextResponse.json(
          { error: 'Slot ID is required in the route parameters.' },
          { status: 400 }
        );
      }

      // Check if the slot exists
      const existingSlot = await prisma.slot.findUnique({
        where: { id: slotId },
        include: { bookings: true } // Include related bookings to check associations
      });

      if (!existingSlot) {
        return NextResponse.json(
          { message: `Slot with ID ${slotId} not found.` },
          { status: 404 }
        );
      }

      // Check if the slot has bookings
      if (existingSlot.bookings && existingSlot.bookings.length > 0) {
        return NextResponse.json(
          {
            message: `Cannot delete slot with ID ${slotId} as it has active bookings.`
          },
          { status: 400 }
        );
      }

      // Delete the slot
      await prisma.slot.delete({ where: { id: slotId } });

      return NextResponse.json(
        { message: 'Slot deleted successfully.' },
        { status: 200 }
      );
    } catch (error: any) {
      return NextResponse.json(
        {
          message: 'Failed to delete the slot.',
          error: `Error: ${error.message}`
        },
        { status: 500 }
      );
    }
  });
}
