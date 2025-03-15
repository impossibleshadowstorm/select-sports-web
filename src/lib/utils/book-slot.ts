import prisma from '@/lib/utils/prisma-client';

export async function bookSlot(
  userId: string,
  slotId: string,
  transactionId: string
) {
  try {
    if (!slotId) {
      return {
        success: false,
        message: 'Slot ID is required in the URL.',
        status: 400
      };
    }

    // Fetch the slot details
    const slot = await prisma.slot.findUnique({
      where: { id: slotId },
      include: { team1: true, team2: true, bookings: true }
    });

    if (!slot) {
      return { success: false, message: 'Slot not found.', status: 404 };
    }

    const currentTime = new Date();
    const slotTime = new Date(slot.startTime);
    const timeDiffHours =
      (slotTime.getTime() - currentTime.getTime()) / (1000 * 60 * 60);
    if (timeDiffHours < 3) {
      return {
        success: false,
        message:
          'Booking must be made at least 3 hours before the slot starts.',
        status: 400
      };
    }

    // Check if the user has already booked this slot
    const existingBooking = await prisma.booking.findFirst({
      where: { userId, slotId, status: 'CONFIRMED' }
    });

    if (existingBooking) {
      return {
        success: false,
        message: 'You have already booked this slot.',
        status: 400
      };
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
      return {
        success: false,
        message:
          'Slot is full. Your pay amount will be refunded in App Wallet in 2-3 working days.',
        bookingStatus: 'CANCELLED',
        status: 400
      };
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
        userId,
        transactionId: transactionId
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

    return {
      success: true,
      message: 'Booking successful',
      bookingId: booking.id,
      assignedTeam: assignedTeamId === slot.team1Id ? 'team1' : 'team2',
      status: 201
    };
  } catch (error: any) {
    return {
      success: false,
      message: 'An error occurred.',
      error: error.message,
      status: 500
    };
  }
}
