import { authenticateAdmin } from '@/middlewares/auth';
import prisma from '@/lib/utils/prisma-client';
import { NextResponse } from 'next/server';
import { AvailableSports } from '@prisma/client';
import type { NextRequest } from 'next/server';

// Define request body type
interface SportRequestBody {
  name: AvailableSports;
  rules: any; // Assuming rules is a JSON object
  totalPlayer: number;
}

export async function POST(req: NextRequest | NextRequest) {
  return await authenticateAdmin(req, async () => {
    const { name, rules, totalPlayer }: SportRequestBody = await req.json();

    // Validate required fields
    if (!name || !rules || typeof totalPlayer !== 'number') {
      return NextResponse.json(
        {
          message:
            'Missing or invalid required fields: name, rules, or totalPlayer.'
        },
        { status: 400 }
      );
    }

    // Check if name is part of AvailableSports enum
    if (!Object.values(AvailableSports).includes(name as AvailableSports)) {
      return NextResponse.json(
        {
          message: `Invalid sport name. Allowed values are: ${Object.values(
            AvailableSports
          ).join(', ')}.`
        },
        { status: 400 }
      );
    }

    try {
      const sport = await prisma.sport.create({
        data: {
          name,
          rules,
          totalPlayer
        }
      });
      return NextResponse.json(
        { data: sport, message: 'Sport Added Successfully' },
        { status: 201 }
      );
    } catch (error: any) {
      const isUniqueConstraintError = error.message.includes(
        'Unique constraint failed'
      );
      return NextResponse.json(
        {
          message: isUniqueConstraintError
            ? `Sport with name "${name}" already exists.`
            : 'Unable to Add Sport',
          error: `Failed to create sport: ${error.message}`
        },
        { status: 500 }
      );
    }
  });
}
