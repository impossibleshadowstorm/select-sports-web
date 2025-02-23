import prisma from '@/lib/utils/prisma-client';
import { authenticateAdmin } from '../../../../middlewares/auth';
import { NextResponse } from 'next/server';
import { validateRequiredFields } from '@/lib/utils/validator';
import { SlotStatus } from '@prisma/client';
import { AuthenticatedRequest } from '@/lib/utils/request-type';

interface TeamData {
  name: string;
  color: string;
}

interface SlotRequestBody {
  startTime: string;
  endTime: string;
  sportId: string;
  maxPlayer: number;
  venueId: string;
  price: number;
  discountedPrice: number;
  team1: TeamData;
  team2: TeamData;
}

export async function GET(req: AuthenticatedRequest) {
  return await authenticateAdmin(req, async () => {
    try {
      const slots = await prisma.slot.findMany({
        include: {
          sport: true,
          venue: {
            include: {
              address: true
            }
          },
          bookings: {
            include: {
              user: true
            }
          }
        },
        orderBy: {
          startTime: 'desc'
        }
      });

      return NextResponse.json(
        {
          message: 'Slots fetched successfully.',
          data: slots
        },
        { status: 200 }
      );
    } catch (error: any) {
      return NextResponse.json(
        {
          message: 'Failed to fetch slots.',
          error: `Error: ${error.message}`
        },
        { status: 500 }
      );
    }
  });
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

  const parsedStartTime = new Date(startTime);
  const parsedEndTime = new Date(endTime);

  if (isNaN(parsedStartTime.getTime()) || isNaN(parsedEndTime.getTime())) {
    return {
      isValid: false,
      message: 'Invalid date values. Ensure correct format and valid date-time.'
    };
  }

  if (parsedStartTime >= parsedEndTime) {
    return {
      isValid: false,
      message: 'startTime must be earlier than endTime.'
    };
  }

  return { isValid: true };
}

// Function to check if sport exists
async function checkSportExistence(sportId: string) {
  const sport = await prisma.sport.findUnique({ where: { id: sportId } });
  if (!sport) {
    return { isValid: false, message: `Sport with ID ${sportId} not found.` };
  }
  return { isValid: true };
}

// Function to check if venue exists
async function checkVenueExistence(venueId: string) {
  const venue = await prisma.venue.findUnique({ where: { id: venueId } });
  if (!venue) {
    return { isValid: false, message: `Venue with ID ${venueId} not found.` };
  }
  return { isValid: true };
}

// Create a Slot with Teams
export async function POST(req: AuthenticatedRequest) {
  return await authenticateAdmin(req, async () => {
    try {
      const body: SlotRequestBody = await req.json();

      // Validate required fields
      const requiredFields: (keyof SlotRequestBody)[] = [
        'startTime',
        'endTime',
        'sportId',
        'maxPlayer',
        'venueId',
        'team1',
        'team2',
        'price',
        'discountedPrice'
      ];

      const { isValid, missingFields } = validateRequiredFields(
        body,
        requiredFields
      );
      if (!isValid) {
        return NextResponse.json(
          {
            status: 'error',
            message: `Missing fields: ${missingFields.join(', ')}`
          },
          { status: 400 }
        );
      }

      const {
        startTime,
        endTime,
        sportId,
        maxPlayer,
        venueId,
        team1,
        team2,
        discountedPrice,
        price
      } = body;

      if (price <= 0 || discountedPrice <= 0 || price <= discountedPrice) {
        return NextResponse.json(
          {
            status: 'error',
            message:
              "Prices Can't be zero or negative/ Show Price Must be greater than or equal to Actual Price"
          },
          { status: 400 }
        );
      }

      // Validate date-time format
      const dateTimeValidation = validateDateTimeFormat(startTime, endTime);
      if (!dateTimeValidation.isValid) {
        return NextResponse.json(
          {
            status: 'error',
            message: dateTimeValidation.message
          },
          { status: 400 }
        );
      }

      // Ensure the startTime is at least 1 week from now
      const now = new Date();
      const oneWeekLater = new Date(now.setDate(now.getDate() + 0));

      if (new Date(startTime) < oneWeekLater) {
        return NextResponse.json(
          {
            status: 'error',
            message: 'Start time must be at least 1 week from today.'
          },
          { status: 400 }
        );
      }

      // Validate sport existence
      const sportValidation = await checkSportExistence(sportId);
      if (!sportValidation.isValid) {
        return NextResponse.json(
          {
            status: 'error',
            message: sportValidation.message
          },
          { status: 400 }
        );
      }

      // Validate venue existence
      const venueValidation = await checkVenueExistence(venueId);
      if (!venueValidation.isValid) {
        return NextResponse.json(
          {
            status: 'error',
            message: venueValidation.message
          },
          { status: 400 }
        );
      }

      // Check for overlapping slots
      const overlappingSlots = await prisma.slot.findMany({
        where: {
          venueId: venueId,
          startTime: { lte: new Date(endTime) },
          endTime: { gte: new Date(startTime) },
          maxPlayer: maxPlayer
        }
      });
      // console.log(overlappingSlots)
      if (overlappingSlots.length > 0) {
        return NextResponse.json(
          {
            status: 'error',
            message: `The slot overlaps with an existing slot. Existing Slot id ${overlappingSlots[0].id}`
          },
          { status: 400 }
        );
      }

      // Check for duplicate slots with the same time, venueId, and maxPlayer
      const duplicateSlot = await prisma.slot.findFirst({
        where: {
          venueId: venueId,
          maxPlayer: maxPlayer,
          startTime: new Date(startTime),
          endTime: new Date(endTime)
        }
      });

      if (duplicateSlot) {
        return NextResponse.json(
          {
            status: 'error',
            message:
              'A slot with the same time, venue, and maxPlayer already exists.'
          },
          { status: 400 }
        );
      }

      // Create Team 1
      const createdTeam1 = await prisma.team.create({
        data: { name: team1.name, color: team1.color }
      });

      // Create Team 2
      const createdTeam2 = await prisma.team.create({
        data: { name: team2.name, color: team2.color }
      });

      // Create Slot
      const slot = await prisma.slot.create({
        data: {
          startTime: new Date(startTime),
          endTime: new Date(endTime),
          status: SlotStatus.AVAILABLE,
          maxPlayer: maxPlayer,
          price,
          discountedPrice,
          sport: { connect: { id: sportId } },
          venue: { connect: { id: venueId } },
          team1: { connect: { id: createdTeam1.id } },
          team2: { connect: { id: createdTeam2.id } }
        },
        include: {
          team1: true,
          team2: true
        }
      });

      return NextResponse.json(
        {
          status: 'success',
          message: 'Slot and Teams created successfully.',
          data: slot
        },
        { status: 201 }
      );
    } catch (error: any) {
      return NextResponse.json(
        {
          status: 'error',
          message: error.message
        },
        { status: 500 }
      );
    }
  });
}
