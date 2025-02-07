import prisma from '@/lib/utils/prisma-client';
import { authenticateAdmin } from '../../../../middlewares/auth';
import { NextResponse } from 'next/server';
import { validateRequiredFields } from '@/lib/utils/validator';
import { SlotStatus } from '@prisma/client';
import { AuthenticatedRequest } from '@/lib/utils/request-type';

interface SlotRequestBody {
  startTime: string;
  endTime: string;
  sportId: string;
  venueId: string;
}

// Expected Format: YYYY-MM-DDTHH:mm:ss
const dateTimeFormat = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/;

// Function to validate the date-time format
function validateDateTimeFormat(
  startTime: string,
  endTime: string
): { isValid: boolean; message?: string } {
  if (!dateTimeFormat.test(startTime) || !dateTimeFormat.test(endTime)) {
    return {
      isValid: false,
      message: 'Invalid date-time format. Use YYYY-MM-DDTHH:mm:ss'
    };
  }

  // Convert to Date objects
  const parsedStartTime = new Date(startTime);
  const parsedEndTime = new Date(endTime);

  // Ensure valid dates
  if (isNaN(parsedStartTime.getTime()) || isNaN(parsedEndTime.getTime())) {
    return {
      isValid: false,
      message: 'Invalid date values. Ensure correct format and valid date-time.'
    };
  }

  // Ensure startTime is before endTime
  if (parsedStartTime >= parsedEndTime) {
    return {
      isValid: false,
      message: 'startTime must be earlier than endTime.'
    };
  }

  return { isValid: true };
}

// Function to check if the sport exists
async function checkSportExistence(sportId: string) {
  const sport = await prisma.sport.findUnique({ where: { id: sportId } });
  if (!sport) {
    return { isValid: false, message: `Sport with ID ${sportId} not found.` };
  }
  return { isValid: true };
}

// Function to check if the venue exists
async function checkVenueExistence(venueId: string) {
  const venue = await prisma.venue.findUnique({ where: { id: venueId } });
  if (!venue) {
    return { isValid: false, message: `Venue with ID ${venueId} not found.` };
  }
  return { isValid: true };
}

export async function POST(req: AuthenticatedRequest) {
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

      // Validate date-time format
      const dateTimeValidation = validateDateTimeFormat(startTime, endTime);
      if (!dateTimeValidation.isValid) {
        return NextResponse.json(
          { message: dateTimeValidation.message },
          { status: 400 }
        );
      }

      // Validate sport existence
      const sportValidation = await checkSportExistence(sportId);
      if (!sportValidation.isValid) {
        return NextResponse.json(
          { message: sportValidation.message },
          { status: 404 }
        );
      }

      // Validate venue existence
      const venueValidation = await checkVenueExistence(venueId);
      if (!venueValidation.isValid) {
        return NextResponse.json(
          { message: venueValidation.message },
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
