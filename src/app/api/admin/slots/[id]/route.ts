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
  team1?: string;
  team2?: string;
  hostId?: string;
}

interface RouteParams {
  id: string;
}

// Fetch a single slot with authentication
export async function GET(
  req: NextRequest,
  { params }: { params: RouteParams }
): Promise<NextResponseType> {
  return await authenticateAdmin(req, async () => {
    try {
      const { id: slotId } = await params;

      // Ensure slot ID is provided
      if (!slotId) {
        return NextResponse.json(
          { error: 'Slot ID is required in the route parameters.' },
          { status: 400 }
        );
      }

      // Fetch the slot from the database
      const slot = await prisma.slot.findUnique({
        where: { id: slotId },
        include: {
          venue: true,
          bookings: true,
          team1: true,
          team2: true,
          host: {
            include: {
              user: true
            }
          }
        }
      });

      if (!slot) {
        return NextResponse.json(
          { message: `Slot with ID ${slotId} not found.` },
          { status: 404 }
        );
      }

      return NextResponse.json({ data: slot }, { status: 200 });
    } catch (error: any) {
      return NextResponse.json(
        {
          message: 'Failed to fetch the slot.',
          error: `Error: ${error.message}`
        },
        { status: 500 }
      );
    }
  });
}

// Update a Slot
export async function PATCH(
  req: NextRequest,
  { params }: { params: RouteParams }
): Promise<NextResponseType> {
  return await authenticateAdmin(req, async () => {
    try {
      const body: SlotRequestBody = await req.json();
      const { startTime, endTime, slotType, status, team1, team2, hostId } =
        body;

      // Extract slot ID from route parameters
      const { id: slotId } = await params;

      if (!slotId) {
        return NextResponse.json(
          { error: 'Slot ID is required in the route parameters.' },
          { status: 400 }
        );
      }

      // Validate `slotType`
      if (slotType && !Object.values(SlotType).includes(slotType)) {
        return NextResponse.json(
          {
            message: `Invalid slot type. Allowed types: ${Object.values(SlotType).join(', ')}`
          },
          { status: 400 }
        );
      }

      // Validate `status`
      if (status && !Object.values(SlotStatus).includes(status)) {
        return NextResponse.json(
          {
            message: `Invalid slot status. Allowed statuses: ${Object.values(SlotStatus).join(', ')}`
          },
          { status: 400 }
        );
      }

      // Get existing slot details
      const existingSlot = await prisma.slot.findUnique({
        where: { id: slotId },
        include: { team1: true, team2: true }
      });

      if (!existingSlot) {
        return NextResponse.json(
          { message: `Slot with ID ${slotId} not found.` },
          { status: 404 }
        );
      }

      // Ensure host is not assigned to another slot with the same time
      if (hostId) {
        const existingHostSlot = await prisma.slot.findFirst({
          where: {
            id: { not: slotId },
            hostId: hostId,
            startTime: new Date(startTime || existingSlot.startTime),
            endTime: new Date(endTime || existingSlot.endTime)
          }
        });

        if (existingHostSlot) {
          return NextResponse.json(
            {
              message:
                'This host is already assigned to another slot at the same time.'
            },
            { status: 400 }
          );
        }
      }

      // Update team details
      if (team1) {
        await prisma.team.update({
          where: { id: existingSlot.team1Id! },
          data: {
            ...(team1.name && { name: team1.name }),
            ...(team1.color && { color: team1.color })
          }
        });
      }

      if (team2) {
        await prisma.team.update({
          where: { id: existingSlot.team2Id! },
          data: {
            ...(team2.name && { name: team2.name }),
            ...(team2.color && { color: team2.color })
          }
        });
      }

      // Update the slot
      const updatedSlot = await prisma.slot.update({
        where: { id: slotId },
        data: {
          ...(slotType && { slotType }),
          ...(status && { status }),
          ...(hostId && { hostId })
        }
      });

      return NextResponse.json(
        { message: 'Slot updated successfully.', data: updatedSlot },
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
      const { id: slotId } = await params;

      // Ensure slot ID is provided
      if (!slotId) {
        return NextResponse.json(
          { error: 'Slot ID is required in the route parameters.' },
          { status: 400 }
        );
      }

      // Check if the slot exists and fetch associated bookings
      const existingSlot = await prisma.slot.findUnique({
        where: { id: slotId },
        include: { bookings: true, team1: true, team2: true }
      });

      if (!existingSlot) {
        return NextResponse.json(
          { message: `Slot with ID ${slotId} not found.` },
          { status: 404 }
        );
      }

      // Check if the slot is already cancelled
      if (existingSlot.status === SlotStatus.CANCELLED) {
        return NextResponse.json(
          { message: 'Slot is already cancelled.' },
          { status: 200 }
        );
      }

      // If the slot has bookings, do NOT update status or delete teams
      if (existingSlot.bookings && existingSlot.bookings.length > 0) {
        return NextResponse.json(
          {
            message: `Cannot cancel slot with ID ${slotId} as it has active bookings.`
          },
          { status: 400 }
        );
      }

      // Update slot status to CANCELLED
      await prisma.slot.update({
        where: { id: slotId },
        data: { status: SlotStatus.CANCELLED }
      });

      // Delete associated teams since no bookings exist
      await prisma.team.deleteMany({
        where: {
          id: {
            in: [existingSlot.team1Id!, existingSlot.team2Id!].filter(Boolean)
          }
        }
      });

      return NextResponse.json(
        { message: 'Slot cancelled successfully.' },
        { status: 200 }
      );
    } catch (error: any) {
      return NextResponse.json(
        {
          message: 'Failed to cancel the slot.',
          error: `Error: ${error.message}`
        },
        { status: 500 }
      );
    }
  });
}
