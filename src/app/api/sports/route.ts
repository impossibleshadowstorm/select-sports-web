import prisma from '@/lib/utils/prisma-client';
import { Sport } from '@prisma/client';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Fetch all sports from the database
    const sports: Sport[] = await prisma.sport.findMany({});
    return NextResponse.json({ data: sports }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      {
        message: 'Unable to get the list of sports',
        error: `Error: ${error.message}`
      },
      { status: 500 }
    );
  }
}
