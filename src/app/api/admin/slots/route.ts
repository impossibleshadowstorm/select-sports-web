import prisma from '@/lib/utils/prisma-client';
import { authenticateAdmin } from '../../../../middlewares/auth';
import { NextResponse } from 'next/server';
import { validateRequiredFields } from '@/lib/utils/validator';
import { SlotStatus } from '@prisma/client';
import { NextRequest, NextResponse as NextResponseType } from 'next/server';

interface SlotRequestBody {
  startTime: string;
  endTime: string;
  sportId: string;
  venueId: string;
}

export async function POST(req: NextRequest): Promise<NextResponseType> {
  return await authenticateAdmin(req, async () => {
    try {
      const body: SlotRequestBody = await req.json();

      // Validate required fields
      const requiredFields: (keyof SlotRequestBody)[] = [
        'startTime',
        'endTime',
        'sportId',
        'venueId'
      ];
      const { isValid, missingFields } = validateRequiredFields(
        body,
        requiredFields
      );

      if (!isValid) {
        return NextResponse.json(
          {
            error: `Missing fields: ${missingFields.join(', ')}`
          },
          { status: 400 }
        );
      }

      const { startTime, endTime, sportId, venueId } = body;

      // Validate sport existence
      const sport = await prisma.sport.findUnique({ where: { id: sportId } });
      if (!sport) {
        return NextResponse.json(
          { message: `Sport with ID ${sportId} not found.` },
          { status: 404 }
        );
      }

      // Validate venue existence
      const venue = await prisma.venue.findUnique({ where: { id: venueId } });
      if (!venue) {
        return NextResponse.json(
          { message: `Venue with ID ${venueId} not found.` },
          { status: 404 }
        );
      }

      // Check for overlapping slots
      const overlappingSlots = await prisma.slot.findMany({
        where: {
          venueId: venueId,
          startTime: { lte: new Date(endTime) },
          endTime: { gte: new Date(startTime) }
        }
      });

      if (overlappingSlots.length > 0) {
        return NextResponse.json(
          { message: 'The slot overlaps with an existing slot.' },
          { status: 400 }
        );
      }

      // Create the slot
      const slot = await prisma.slot.create({
        data: {
          startTime: new Date(startTime),
          endTime: new Date(endTime),
          status: SlotStatus.AVAILABLE,
          sport: { connect: { id: sportId } },
          venue: { connect: { id: venueId } }
        }
      });

      return NextResponse.json(
        {
          message: 'Slot created successfully.',
          data: slot
        },
        { status: 201 }
      );
    } catch (error: any) {
      return NextResponse.json(
        {
          message: 'Failed to create the slot.',
          error: `Error: ${error.message}`
        },
        { status: 500 }
      );
    }
  });
}
