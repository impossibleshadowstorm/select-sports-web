import prisma from '@/lib/utils/prisma-client';
import { Venue } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const venues: Venue[] = await prisma.venue.findMany({
      include: {
        address: true,
        sports: true
      }
    });

    return NextResponse.json({ data: venues }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      {
        message: 'Unable to get the list of venues',
        error: `Error: ${error.message}`
      },
      { status: 500 }
    );
  }
}
