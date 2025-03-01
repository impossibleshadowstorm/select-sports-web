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
          // include: {
          //   user: {
          //     select: {
          //       id: true,
          //       name: true,
          //       email: true
          //     }
          //   }
          // }
        }
      },
      where: {
        status: {
          in: ['AVAILABLE', 'BOOKED']
        },
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

export async function POST(req: NextRequest): Promise<NextResponseType> {
  try {
    const slots = await prisma.slot.findMany({
      include: {
        sport: true,
        venue: true
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
