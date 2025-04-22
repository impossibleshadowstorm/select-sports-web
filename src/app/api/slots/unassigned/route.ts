import prisma from '@/lib/utils/prisma-client';
import { NextResponse } from 'next/server';
import { NextRequest, NextResponse as NextResponseType } from 'next/server';

export async function GET(req: NextRequest): Promise<NextResponseType> {
  try {
    const currentDateTime = new Date();

    const slots = await prisma.slot.findMany({
      include: {
        sport: true,
        venue: {
          include: {
            address: true
          }
        },
        bookings: {
          where: {
            status: 'CONFIRMED'
          }
        }
      },
      where: {
        status: {
          in: ['AVAILABLE', 'BOOKED']
        },
        hostId: null, // Only unassigned slots
        OR: [
          {
            startTime: {
              gt: currentDateTime
            }
          },
          {
            endTime: {
              gt: currentDateTime
            }
          }
        ]
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
}
