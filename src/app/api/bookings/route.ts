import prisma from '@/lib/utils/prisma-client';
import { authenticate } from '../../../middlewares/auth';
import { NextResponse } from 'next/server';
import { SlotStatus, BookingStatus } from '@prisma/client';
import { validateRequiredFields } from '@/lib/utils/validator';

interface RequestBody {
  slotId: string;
  userId: string;
}

export async function POST(req: Request): Promise<NextResponse> {
  return await authenticate(req, async () => {
    try {
      const body: RequestBody = await req.json();
      const requiredFields = ['slotId', 'userId'];
      const { isValid, missingFields } = validateRequiredFields(
        body,
        requiredFields
      );

      if (!isValid) {
        return NextResponse.json(
          { error: `Missing fields: ${missingFields.join(', ')}` },
          { status: 400 }
        );
      }

      const { slotId, userId } = body;

      // Check if slot exists and is available
      const slot = await prisma.slot.findUnique({
        where: { id: slotId }
      });

      if (!slot || slot.status !== SlotStatus.AVAILABLE) {
        return NextResponse.json(
          { error: `Slot is not available for booking.` },
          { status: 400 }
        );
      }

      // Create the booking with `PENDING` status
      const booking = await prisma.booking.create({
        data: {
          slot: { connect: { id: slotId } },
          user: { connect: { id: userId } },
          status: BookingStatus.PENDING
        }
      });
      // TODO: Update slot status to `BOOKED` once the payment is confirmed (you can trigger this part after payment)
      const updatedBooking = await prisma.booking.update({
        where: { id: booking.id },
        data: {
          status: BookingStatus.CONFIRMED
        },
        include: {
          transaction: true // Including the slot details if you want
        }
      });

      return NextResponse.json(
        {
          message: 'Booking created successfully. Please proceed with payment.',
          booking: updatedBooking // Pass the booking ID so that it can be used to finalize the payment
        },
        { status: 201 }
      );
    } catch (error: any) {
      return NextResponse.json(
        { error: `Failed to create booking: ${error.message}` },
        { status: 500 }
      );
    }
  });
}
