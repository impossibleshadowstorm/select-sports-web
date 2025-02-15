// Book slot with post request
// assign team to user
// logic: check slot's team1 and team2's user count
// assign to the team having lowest user
// or in case of equal assign to team1 directly

// Cancel slot with patch request
// remove the user from that team
// if current time is greater than 6 hours then only he can cancel the booking.
// if current time is greater then 12 hours then only complete refund else 50% deduction.
// update the status as cancelled.
import prisma from '@/lib/utils/prisma-client';
import { NextRequest, NextResponse as NextResponseType } from 'next/server';
import { NextResponse } from 'next/server';

interface RouteParams {
  id: string;
}

// Fetch a single slot with authentication
export async function GET(
  req: NextRequest,
  { params }: { params: RouteParams }
): Promise<NextResponseType> {
  try {
    const { id: slotId } = params;

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
        venue: true, // Include venue details
        bookings: true // Include bookings if needed
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
}
