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
import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/middlewares/auth';
import { AuthenticatedRequest } from '@/lib/utils/request-type';
import { parse } from 'url';

// Fetch a single slot with authentication
export async function GET(req: NextRequest) {
  try {
    const slotId = req.nextUrl.pathname.split('/').pop();

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
        venue: {
          include: {
            address: true
          }
        },
        sport: true,
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
}

export async function POST(req: AuthenticatedRequest) {
  return await authenticate(req, async () => {
    try {
      const { id: userId } = req.user as { id: string };
      const { pathname } = parse(req.url, true);
      const slotId = pathname?.split('/').pop();

      if (!slotId) {
        return NextResponse.json(
          { message: 'Slot ID is required in the URL.' },
          { status: 400 }
        );
      }

      // Fetch the slot details
      const slot = await prisma.slot.findUnique({
        where: { id: slotId },
        include: { team1: true, team2: true, bookings: true }
      });

      if (!slot) {
        return NextResponse.json(
          { message: 'Slot not found.' },
          { status: 404 }
        );
      }

      const currentTime = new Date();
      const slotTime = new Date(slot.startTime);
      const timeDiffHours =
        (slotTime.getTime() - currentTime.getTime()) / (1000 * 60 * 60);
      if (timeDiffHours < 3) {
        return NextResponse.json(
          {
            message:
              'Booking must be made at least 3 hours before the slot starts.'
          },
          { status: 400 }
        );
      }

      // Check if the user has already booked this slot
      const existingBooking = await prisma.booking.findFirst({
        where: { userId, slotId, status: 'CONFIRMED' }
      });

      if (existingBooking) {
        return NextResponse.json(
          { message: 'You have already booked this slot.' },
          { status: 400 }
        );
      }

      const team1Count = slot.team1Id
        ? await prisma.team.findUnique({
            where: { id: slot.team1Id },
            select: { _count: { select: { users: true } } }
          })
        : { _count: { users: 0 } };

      const team2Count = slot.team2Id
        ? await prisma.team.findUnique({
            where: { id: slot.team2Id },
            select: { _count: { select: { users: true } } }
          })
        : { _count: { users: 0 } };

      const totalPlayers =
        (team1Count?._count.users || 0) + (team2Count?._count.users || 0);

      // Check if slot is full
      if (totalPlayers >= slot.maxPlayer) {
        //   * * * * * **  Future Purpose * * * * * ** * //
        // For Loging the Amount will be refunded to the user due to Slot Full
        // const booking = await prisma.refund.create({
        //   data: {
        //     status: 'REFUNDED',
        //     slotId,
        //     userId,
        //     remarks,
        //     isRefundes :'NO'
        //   }
        // });
        return NextResponse.json(
          {
            success: false,
            message:
              'Slot is full. Your pay amount will be refunded in App Wallet in 2-3 working days.',
            bookingStatus: 'CANCELLED'
          },
          { status: 400 }
        );
      }

      // **Round-robin logic for fair distribution**
      let assignedTeamId = null;

      if (!slot.team1Id) {
        assignedTeamId = slot.team1?.id;
      } else if (!slot.team2Id) {
        assignedTeamId = slot.team2?.id;
      } else if (
        (team1Count?._count.users || 0) < (team2Count?._count.users || 0)
      ) {
        assignedTeamId = slot.team1Id;
      } else if (
        (team2Count?._count.users || 0) < (team1Count?._count.users || 0)
      ) {
        assignedTeamId = slot.team2Id;
      } else {
        assignedTeamId = slot.team1Id;
      }

      // Create new booking
      const booking = await prisma.booking.create({
        data: {
          status: 'CONFIRMED',
          slotId,
          userId
        }
      });

      // Assign user to the chosen team
      await prisma.user.update({
        where: { id: userId },
        data: { teams: { connect: { id: assignedTeamId } } }
      });

      // Update user's bookings
      await prisma.user.update({
        where: { id: userId },
        data: { bookings: { connect: { id: booking.id } } }
      });

      return NextResponse.json(
        {
          success: true,
          message: 'Booking successful',
          bookingId: booking.id,
          assignedTeam: assignedTeamId === slot.team1Id ? 'team1' : 'team2'
        },
        { status: 201 }
      );
    } catch (error: any) {
      return NextResponse.json(
        { message: 'An error occurred.', error: error.message },
        { status: 500 }
      );
    }
  });
}

export async function PATCH(req: AuthenticatedRequest) {
  return await authenticate(req, async () => {
    try {
      const { id: userId } = req.user as { id: string };
      const { pathname } = parse(req.url, true);
      const slotId = pathname?.split('/').pop();

      if (!slotId) {
        return NextResponse.json(
          { message: 'Slot ID is required in the URL.' },
          { status: 400 }
        );
      }

      // Fetch slot details along with both teams
      const slot = await prisma.slot.findUnique({
        where: { id: slotId },
        include: { team1: true, team2: true }
      });

      if (!slot) {
        return NextResponse.json(
          { message: 'Slot not found.' },
          { status: 404 }
        );
      }

      // Find user's active booking for the slot
      const existingBooking = await prisma.booking.findFirst({
        where: { userId, slotId, status: 'CONFIRMED' }
      });

      if (!existingBooking) {
        return NextResponse.json(
          { message: 'No active booking found for this slot.' },
          { status: 400 }
        );
      }

      // Get current time & slot time
      const currentTime = new Date();
      const slotTime = new Date(slot.startTime);
      const timeDifference =
        (slotTime.getTime() - currentTime.getTime()) / (1000 * 60 * 60);

      if (timeDifference < 6) {
        return NextResponse.json(
          { message: 'Cancellation is only allowed 6+ hours before the slot.' },
          { status: 400 }
        );
      }

      // Determine refund amount
      let refundPercentage = timeDifference >= 12 ? 100 : 50;

      // Cancel the booking
      await prisma.booking.update({
        where: { id: existingBooking.id },
        data: { status: 'CANCELLED' }
      });

      // **Identify which team the user is part of and remove them**
      let teamToDisconnect = null;

      if (slot.team1Id) {
        const isUserInTeam1 = await prisma.team.findFirst({
          where: { id: slot.team1Id, users: { some: { id: userId } } }
        });
        if (isUserInTeam1) teamToDisconnect = slot.team1Id;
      }

      if (!teamToDisconnect && slot.team2Id) {
        const isUserInTeam2 = await prisma.team.findFirst({
          where: { id: slot.team2Id, users: { some: { id: userId } } }
        });
        if (isUserInTeam2) teamToDisconnect = slot.team2Id;
      }

      if (teamToDisconnect) {
        await prisma.team.update({
          where: { id: teamToDisconnect },
          data: { users: { disconnect: { id: userId } } }
        });
      }
      //   * * * * * **  Future Purpose * * * * * ** * //
      // For Loging the Amount will be refunded to the user due to Slot Full
      // const booking = await prisma.refund.create({
      //   data: {
      //     status: 'REFUNDED',
      //     slotId,
      //     userId,
      //     remarks,
      //     isRefundes :'NO'
      //   }
      // });

      return NextResponse.json(
        {
          success: true,
          message:
            'Booking cancelled successfully. You have been removed from your team.',
          refund: `You will receive a ${refundPercentage}% refund.`,
          bookingStatus: 'CANCELLED'
        },
        { status: 200 }
      );
    } catch (error: any) {
      return NextResponse.json(
        {
          message: 'An error occurred.',
          error: error?.message || 'Unknown error'
        },
        { status: 500 }
      );
    }
  });
}

//        Logic-Behind

// Booking a Slot (POST Request)
// Step 1: Authenticate the user.
// Step 2: Extract slotId from the URL.
// Step 3: Fetch slot details, including the teams and existing bookings.
// Step 4: Check if the slot starts at least 3 hours later. If not, reject the booking.
// Step 5: Check if the user has already booked this slot. If yes, reject the booking.
// Step 6: Check if the slot has space for more players. If full, reject the booking and inform the user about a refund.
// Step 7: Assign the user to a team using round-robin logic (balance both teams).
// Step 8: Save the booking in the database as CONFIRMED.
// Step 9: Add the user to the selected team.
// Step 10: Return a success response with booking details.
// 2. Cancel a Booking (PATCH Request)
// Step 1: Authenticate the user.
// Step 2: Extract slotId from the URL.
// Step 3: Fetch the slot and check if it exists.
// Step 4: Check if the user has an active booking for this slot. If not, reject the request.
// Step 5: Check if the current time is at least 6 hours before the slot starts. If not, reject the request.
// Step 6: Determine the refund percentage:
// If canceled 12+ hours before, 100% refund.
// If canceled between 6-12 hours before, 50% refund.
// Step 7: Update the booking status to CANCELLED.
// Step 8: Remove the user from their assigned team.
// Step 9: Return a success response with cancellation details and refund information.
