import { authenticate } from '@/middlewares/auth';
import { NextResponse } from 'next/server';
import prisma from '@/lib/utils/prisma-client';
import { AuthenticatedRequest } from '@/lib/utils/request-type';

export async function PATCH(req: AuthenticatedRequest) {
  return await authenticate(req, async () => {
    try {
      const { slotIds, hostId } = await req.json();

      if (!hostId || !Array.isArray(slotIds) || slotIds.length === 0) {
        return NextResponse.json({ message: 'Invalid input' }, { status: 400 });
      }
      const currentTime = new Date();

      // 1. Check host exists and is approved
      const host = await prisma.host.findUnique({ where: { id: hostId } });

      if (!host)
        return NextResponse.json(
          { message: 'Host does not exist' },
          { status: 400 }
        );
      if (host.status !== 'APRROVED') {
        return NextResponse.json(
          { message: 'This Host Application is not approved yet.' },
          { status: 400 }
        );
      }

      // 2. Loop through each slot ID and try to assign individually
      const results: { slotId: string; status: string; message?: string }[] =
        [];
      for (const slotId of slotIds) {
        try {
          const slot = await prisma.slot.findUnique({ where: { id: slotId } });

          if (!slot) {
            results.push({
              slotId,
              status: 'failed',
              message: 'Slot does not exist'
            });
            continue;
          }

          if (
            slot.status !== 'AVAILABLE' ||
            new Date(slot.startTime) <= currentTime
          ) {
            results.push({
              slotId,
              status: 'failed',
              message: 'Slot not available or already started'
            });
            continue;
          }

          const conflict = await prisma.slot.findFirst({
            where: {
              hostId,
              status: 'AVAILABLE',
              OR: [
                {
                  startTime: { lte: slot.endTime },
                  endTime: { gte: slot.startTime }
                }
              ]
            }
          });

          if (conflict) {
            results.push({
              slotId,
              status: 'failed',
              message: 'Time conflict with another slot'
            });
            continue;
          }

          // Finally assign host to this slot
          await prisma.slot.update({
            where: { id: slotId },
            data: { hostId }
          });

          results.push({ slotId, status: 'success' });
        } catch (error: any) {
          results.push({ slotId, status: 'failed', message: error.message });
        }
      }

      return NextResponse.json(
        {
          message: 'Slot assignment attempted',
          results
        },
        { status: 207 }
      ); // 207 = Multi-Status (some succeeded, some failed)
    } catch (error: any) {
      return NextResponse.json(
        {
          message: 'Something went wrong',
          error: error.message
        },
        { status: 500 }
      );
    }
  });
}
