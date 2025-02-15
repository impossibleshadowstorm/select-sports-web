import prisma from '@/lib/utils/prisma-client';
import { NextResponse } from 'next/server';
import { NextRequest, NextResponse as NextResponseType } from 'next/server';

export async function GET(req: NextRequest): Promise<NextResponseType> {
  try {
    const slots = await prisma.slot.findMany({
      include: {
        sport: true,
        venue: true,
        bookings: {
          where: {
            status: 'CONFIRMED'
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
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
