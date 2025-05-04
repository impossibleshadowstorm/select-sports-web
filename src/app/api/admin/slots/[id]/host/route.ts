import { authenticate } from '../../../../../../middlewares/auth';
import { NextResponse } from 'next/server';
import prisma from '@/lib/utils/prisma-client';
import { AuthenticatedRequest } from '@/lib/utils/request-type';

export async function PATCH(req: AuthenticatedRequest) {
  return await authenticate(req, async () => {
    try {
      const body = await req.json(); // Parse request body
      const slotId = req.nextUrl.pathname.split('/').slice(-2, -1)[0];

      const currentTime = new Date(); // Get current time
      // Required fields
      const requiredFields = ['hostId'];
      for (const field of requiredFields) {
        if (!(field in body)) {
          return NextResponse.json(
            { message: `Missing required field: ${field}` },
            { status: 400 }
          );
        }
      }

      var existingHost;
      try {
        existingHost = await prisma.host.findUnique({
          where: { id: body.hostId }
        });
      } catch (error) {
        return NextResponse.json(
          { message: 'Host does not exist' },
          { status: 400 }
        );
      }

      if (!existingHost) {
        return NextResponse.json(
          { message: 'Host does not exist' },
          { status: 400 }
        );
      }
      if (existingHost.status !== 'APRROVED') {
        return NextResponse.json(
          { message: 'This Host Application is not Aprooved Yet.' },
          { status: 400 }
        );
      }

      var slotData;

      try {
        slotData = await prisma.slot.findUnique({
          where: { id: slotId }
        });

        if (!slotData) {
          return NextResponse.json(
            { message: 'Slot does not exist' },
            { status: 400 }
          );
        }
      } catch (error) {
        return NextResponse.json(
          { message: 'Error Occured while fetching Slot data' },
          { status: 500 }
        );
      }

      if (slotData.status !== 'AVAILABLE') {
        return NextResponse.json(
          { message: 'Slot is not available. Please choose another slot.' },
          { status: 400 }
        );
      }

      if (new Date(slotData.startTime) <= currentTime) {
        return NextResponse.json(
          {
            message: "Slot has already started. You can't change the host now."
          },
          { status: 400 }
        );
      }

      // Ensure the same host is not assigned to another available slot in the same time frame
      var conflictingSlot;

      try {
        conflictingSlot = await prisma.slot.findFirst({
          where: {
            hostId: existingHost.id,
            status: 'AVAILABLE',
            OR: [
              {
                startTime: { lte: slotData.endTime },
                endTime: { gte: slotData.startTime }
              },
              { startTime: { gte: slotData.startTime, lte: slotData.endTime } }
            ]
          }
        });
      } catch (error) {}

      if (conflictingSlot) {
        return NextResponse.json(
          {
            message:
              'The selected host is already assigned to another available slot in the same time frame.'
          },
          { status: 400 }
        );
      }

      // Update host
      const updateHost = await prisma.slot.update({
        where: { id: slotId },
        data: { hostId: existingHost.id }
      });

      return NextResponse.json(
        {
          message: `Host changed successfully to ${existingHost.id}`,
          data: updateHost
        },
        { status: 200 }
      );
    } catch (error: any) {
      return NextResponse.json(
        {
          message: 'Failed to update host',
          error: `Error: ${error.message}`
        },
        { status: 400 }
      );
    }
  });
}
