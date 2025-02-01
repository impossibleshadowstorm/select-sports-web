import { authenticateAdmin } from '@/middlewares/auth';
import prisma from '@/lib/utils/prisma-client';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define the request body type
interface SportRequestBody {
  name?: string;
  rules?: Record<string, any>;
  totalPlayer?: number;
}

export async function PATCH(req: NextRequest) {
  return await authenticateAdmin(req, async () => {
    // const { id } = await params;
    const id = req.nextUrl.pathname.split('/').pop();
    const { name, rules, totalPlayer }: SportRequestBody = await req.json();

    // Construct the update data object using short-circuiting
    const updateData: Record<string, any> = {
      ...(name && { name }),
      ...(rules && { rules }),
      ...(totalPlayer && { totalPlayer })
    };

    // Ensure there's something to update
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { message: 'No valid fields provided for update.' },
        { status: 400 }
      );
    }

    try {
      const sport = await prisma.sport.update({
        where: { id },
        data: updateData
      });

      return NextResponse.json(
        { data: sport, message: 'Sport Updated Successfully' },
        { status: 200 }
      );
    } catch (error: any) {
      return NextResponse.json(
        { message: 'Failed to update sport details.', error: error },
        { status: 500 }
      );
    }
  });
}
