// Announce Slot result with Patch request
// in body: winning team id

// on winning team id basis update the team status with win and other team as lose
// also on updating team status as per the team members update their stats internally for both teams.
import prisma from '@/lib/utils/prisma-client';
import { authenticateAdmin } from '../../../../../../middlewares/auth';
import { NextResponse } from 'next/server';
import { SlotType, SlotStatus } from '@prisma/client';
import { NextRequest, NextResponse as NextResponseType } from 'next/server';

interface SlotRequestBody {
  winningTeam?: string;
  slotType?: SlotType;
  status?: SlotStatus;
}

export async function PATCH(
  req: NextRequest
  // { params }: { params: RouteParams }
): Promise<NextResponseType> {
  return await authenticateAdmin(req, async () => {
    try {
      const slotId = req.nextUrl.pathname.split('/').pop();
      const body: SlotRequestBody = await req.json();
      const { winningTeam } = body;

      if (!slotId) {
        return NextResponse.json(
          { error: 'Slot ID is required in the route parameters.' },
          { status: 400 }
        );
      }

      if (!winningTeam) {
        return NextResponse.json(
          { error: 'Winning team ID is required.' },
          { status: 400 }
        );
      }

      // Fetch the slot with teams
      const existingSlot = await prisma.slot.findUnique({
        where: { id: slotId },
        include: { team1: true, team2: true, host: true }
      });

      if (!existingSlot) {
        return NextResponse.json(
          { message: `Slot with ID ${slotId} not found.` },
          { status: 404 }
        );
      }

      // Validate that endTime is in the past
      if (new Date(existingSlot.endTime) > new Date()) {
        return NextResponse.json(
          { error: 'Cannot update. The match has not ended yet.' },
          { status: 400 }
        );
      }

      // Ensure a host is assigned
      if (!existingSlot.host) {
        return NextResponse.json(
          { error: 'Cannot update. A host must be assigned to this slot.' },
          { status: 400 }
        );
      }

      // Identify winning and losing teams
      const { team1, team2 } = existingSlot;

      if (!team1 || !team2) {
        return NextResponse.json(
          { error: 'Both teams must be assigned to mark a winner.' },
          { status: 400 }
        );
      }

      if (winningTeam !== team1.id && winningTeam !== team2.id) {
        return NextResponse.json(
          { error: 'Winning team ID must match one of the assigned teams.' },
          { status: 400 }
        );
      }

      const losingTeamId = winningTeam === team1.id ? team2.id : team1.id;

      // Update the winning and losing team status
      await prisma.team.updateMany({
        where: { id: { in: [winningTeam, losingTeamId] } },
        data: [
          { where: { id: winningTeam }, data: { status: 'WIN' } },
          { where: { id: losingTeamId }, data: { status: 'LOSE' } }
        ]
      });

      return NextResponse.json(
        { message: 'Winning team updated successfully.' },
        { status: 200 }
      );
    } catch (error: any) {
      return NextResponse.json(
        { message: 'Failed to update the winning team.', error: error.message },
        { status: 500 }
      );
    }
  });
}

// export async function PATCH(
//     req: NextRequest,
//     { params }: { params: RouteParams }
//   ): Promise<NextResponseType> {
//     return await authenticateAdmin(req, async () => {
//       try {
//         const body: SlotRequestBody = await req.json();
//         const { winningTeam  } = body;

//         // Extract slot ID from route parameters
//         const { id: slotId } = await params;

//         if (!slotId) {
//           return NextResponse.json(
//             { error: 'Slot ID is required in the route parameters.' },
//             { status: 400 }
//           );
//         }

//         // Validate `slotType`
//         if (SlotType && !Object.values(SlotType).includes(slotType)) {
//           return NextResponse.json(
//             { message: `Invalid slot type. Allowed types: ${Object.values(SlotType).join(', ')}` },
//             { status: 400 }
//           );
//         }

//         // Validate `status`
//         if (status && !Object.values(SlotStatus).includes(status)) {
//           return NextResponse.json(
//             { message: `Invalid slot status. Allowed statuses: ${Object.values(SlotStatus).join(', ')}` },
//             { status: 400 }
//           );
//         }

//         return NextResponse.json(
//           { message: 'Slot updated successfully.', data: updatedSlot },
//           { status: 200 }
//         );
//       } catch (error: any) {
//         return NextResponse.json(
//           { message: 'Failed to update the slot.', error: `Error: ${error.message}` },
//           { status: 500 }
//         );
//       }
//     });
//   }
