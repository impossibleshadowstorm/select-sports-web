import prisma from '@/lib/utils/prisma-client';
import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/middlewares/auth';
import { AuthenticatedRequest } from '@/lib/utils/request-type';
import { parse } from 'url';

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

      // Fetch slot details
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

      // Fetch user wallet balance
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { walletBalance: true, email: true, phone: true }
      });

      if (!user) {
        return NextResponse.json(
          { message: 'User not found.' },
          { status: 404 }
        );
      }

      const slotPrice = slot.price;
      let amountToPay = 0;

      if (user.walletBalance < slotPrice) {
        amountToPay = slotPrice - user.walletBalance;

        // Send response to initiate Razorpay payment
        return NextResponse.json(
          {
            success: false,
            message:
              'Insufficient wallet balance. Please pay the remaining amount.',
            amountToPay: amountToPay,
            razorpayOptions: {
              key: 'rzp_test_XKekcIS5FdsrRF', // Replace with your Razorpay Key ID
              amount: amountToPay * 100, // Convert to paise
              name: 'SELECT-SPORTS',
              description: `Payment for Slot #${slotId}`,
              prefill: { contact: user.phone, email: user.email },
              notes: {
                walletBalance: `User wallet balance is ₹${user.walletBalance}`,
                remainingAmount: `User has to pay ₹${amountToPay}`
              },
              external: { wallets: ['paytm'] }
            }
          },
          { status: 402 } // Payment Required
        );
      }

      // Deduct slot price from wallet
      await prisma.user.update({
        where: { id: userId },
        data: { walletBalance: { decrement: slotPrice } }
      });

      // Fetch team sizes
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

      // Round-robin logic for team assignment
      let assignedTeamId = null;
      if (!slot.team1Id) {
        assignedTeamId = slot.team1?.id;
      } else if (!slot.team2Id) {
        assignedTeamId = slot.team2?.id;
      } else if (
        (team1Count?._count.users || 0) < (team2Count?._count.users || 0)
      ) {
        assignedTeamId = slot.team1Id;
      } else {
        assignedTeamId = slot.team2Id;
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
