import { authenticate } from '../../../middlewares/auth';
import { NextResponse } from 'next/server';
import prisma from '@/lib/utils/prisma-client';
import { AuthenticatedRequest } from '@/lib/utils/request-type';

export async function GET(req: AuthenticatedRequest) {
  return await authenticate(req, async () => {
    try {
      // const { id } = req.user as { id: string }; // Explicitly type `req.user`
      // Fetch user data from the database
      const hosts = await prisma.host.findMany({
        include: {
          user: {
            include: {
              address: true
            }
          }
        }
      });
      if (!hosts) {
        return NextResponse.json({ message: 'No Host Found' }, { status: 404 });
      }

      return NextResponse.json(
        {
          data: hosts
        },
        { status: 200 }
      );
    } catch (error: any) {
      return NextResponse.json(
        {
          message: 'Failed to retrieve hosts data',
          error: `Error: ${error.message}`
        },
        { status: 500 }
      );
    }
  });
}

export async function POST(req: AuthenticatedRequest) {
  return await authenticate(req, async () => {
    try {
      const { id: userId } = req.user as { id: string }; // Get authenticated user ID
      const body = await req.json(); // Parse request body
      // Required fields
      const requiredFields = [
        'occupation', // Dropdown [Enum Occupation]
        'playFootball', // Boolean
        'car', // Boolean
        'bike', // Boolean
        'usedThisApp', // Boolean
        'experienceInOrgCS', // Boolean
        'commitHours', // Dropdown [Enum CommitHours]
        'preferredSchedule', // Multi Dropdown [Enum Schedule]
        'keyHighlights', // Textfield
        'currentLocation' // Dropdown [Enum AvailableStates]
      ];

      for (const field of requiredFields) {
        if (!(field in body)) {
          return NextResponse.json(
            { message: `Missing required field: ${field}` },
            { status: 400 }
          );
        }
      }

      // Check if user exists in User table
      const existingUser = await prisma.user.findUnique({
        where: { id: userId }
      });
      if (!existingUser) {
        return NextResponse.json(
          { message: 'User does not exist' },
          { status: 400 }
        );
      }

      // Check if user already exists as a host
      const existingHost = await prisma.host.findUnique({ where: { userId } });
      if (existingHost) {
        return NextResponse.json(
          { message: 'User is already registered as a host' },
          { status: 400 }
        );
      }

      // Create new Host entry
      const newHost = await prisma.host.create({
        data: {
          userId: userId,
          occupation: body.occupation,
          playFootball: body.playFootball,
          car: body.car,
          bike: body.bike,
          usedThisApp: body.usedThisApp,
          experienceInOrgCS: body.experienceInOrgCS,
          commitHours: body.commitHours,
          preferredSchedule: body.preferredSchedule,
          keyHighlights: body.keyHighlights,
          currentLocation: body.currentLocation
        }
      });

      return NextResponse.json(
        { message: 'Host registered successfully', data: newHost },
        { status: 201 }
      );
    } catch (error: any) {
      return NextResponse.json(
        {
          message: 'Failed to register host',
          error: `Error: ${error.message}`
        },
        { status: 400 }
      );
    }
  });
}
