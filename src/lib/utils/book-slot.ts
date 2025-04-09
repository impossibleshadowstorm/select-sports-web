import prisma from '@/lib/utils/prisma-client';
import { refundToWallet } from '@/lib/utils/refund-to-wallet';
import { sendMail } from '@/lib/utils/nodemailer-setup';

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
      refundToWallet(userId, slot.discountedPrice);

      return {
        success: false,
        message: `Slot is full. Your pay amount (${slot.discountedPrice}) will be refunded in App Wallet in 12-24 working hours.`,
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

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    await sendMail({
      to: user?.email as string,
      subject: `Booking Confirmation of slot #${slotId.substring(0, 7)}`,
      text: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Booking Confirmation</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #f6f9fc; margin: 0; padding: 0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f6f9fc; padding: 30px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; padding: 40px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <tr>
            <td style="text-align: center; padding-bottom: 30px;">
              <h2 style="color: #333333;">Booking Confirmed</h2>
              <p style="color: #555555; font-size: 16px;">Thank you for booking with <strong>SelectSportss.com</strong>.</p>
            </td>
          </tr>
          <tr>
            <td>
              <p style="color: #333333; font-size: 16px;"><strong>Dear ${user?.name},</strong></p>
              <p style="color: #555555; font-size: 15px; line-height: 1.6;">
                We are pleased to confirm your booking for <strong>slot #${slotId.substring(0, 7)}</strong>. Our team is excited to serve you and ensure a smooth experience.
              </p>

              <h3 style="color: #333333; margin-top: 30px;">Booking Details:</h3>
              <ul style="color: #555555; font-size: 15px; line-height: 1.6;">
                <li><strong>Booking ID:</strong> ${booking.id.substring(0, 7)}</li>
                <li><strong>Assigned Team:</strong> {${assignedTeamId === slot.team1Id ? 'team1' : 'team2'}}</li>
                <li><strong>Status:</strong> Confirmed</li>
              </ul>

              <h3 style="color: #333333; margin-top: 30px;">Your Contact Details:</h3>
              <ul style="color: #555555; font-size: 15px; line-height: 1.6;">
                <li><strong>Name:</strong> ${user?.name}</li>
                <li><strong>Email:</strong> ${user?.email}</li>
                <li><strong>Phone:</strong> ${user?.phone}</li>
              </ul>

              <p style="color: #555555; font-size: 15px; margin-top: 30px;">
                If you have any questions or need to make changes to your booking, feel free to contact us anytime.
              </p>

              <p style="color: #555555; font-size: 15px;">
                Best regards,<br/>
                <strong>The SelectSportss.com Team</strong>
              </p>
            </td>
          </tr>
          <tr>
            <td style="text-align: center; padding-top: 40px; font-size: 13px; color: #999999;">
              © ${new Date().getFullYear()} SelectSportss.com — All Rights Reserved.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`
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
