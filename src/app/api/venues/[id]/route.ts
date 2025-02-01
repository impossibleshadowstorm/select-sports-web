import prisma from '@/lib/utils/prisma-client';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define the types for the request and response
export async function GET(req: NextRequest) {
  // const { id } = await params;
  const id = req.nextUrl.pathname.split('/').pop();

  try {
    // Fetch the venue by ID
    const venue = await prisma.venue.findUnique({
      where: { id },
      include: {
        address: true,
        sports: true
      }
    });

    if (!venue) {
      return NextResponse.json(
        { message: `Venue with ID ${id} not found.` },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: venue }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      {
        message: 'Failed to fetch venue data.',
        error: `Error: ${error.message}`
      },
      { status: 500 }
    );
  }
}
