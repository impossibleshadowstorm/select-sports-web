import { authenticate } from '@/middlewares/auth';
import prisma from '@/lib/utils/prisma-client';
import { NextResponse } from 'next/server';
import { validateRequiredFields } from '@/lib/utils/validator';
import { AuthenticatedRequest } from '@/lib/utils/request-type';
import { PreferredFoot, PreferredPosition, SkillLevel } from '@prisma/client';

interface SportsProfileRequestBody {
  skillLevel: SkillLevel;
  preferredPosition: PreferredPosition;
  strength: string;
  weakness: string;
  preferredFoot: PreferredFoot;
  favoriteNumber?: number;
  favoritePlayer?: string;
  favoriteClub?: string;
}

export async function GET(req: AuthenticatedRequest) {
  return await authenticate(req, async () => {
    try {
      const { id } = req.user as { id: string };

      const sportsProfile = await prisma.sportsProfile.findUnique({
        where: { userId: id }
      });

      if (!sportsProfile) {
        return NextResponse.json(
          { message: 'Sports profile not found.' },
          { status: 404 }
        );
      }

      return NextResponse.json({ data: sportsProfile }, { status: 200 });
    } catch (error: any) {
      return NextResponse.json(
        { message: 'Failed to fetch sports profile.', error: error.message },
        { status: 500 }
      );
    }
  });
}

export async function POST(req: AuthenticatedRequest) {
  return await authenticate(req, async () => {
    const body: SportsProfileRequestBody = await req.json();
    const { id } = req.user as { id: string };

    // Define required fields
    const requiredFields = [
      'skillLevel',
      'preferredPosition',
      'strength',
      'weakness',
      'preferredFoot'
    ];

    // Validate fields
    const { isValid, missingFields } = validateRequiredFields(
      body,
      requiredFields
    );

    if (!isValid) {
      return NextResponse.json(
        {
          message: `The following fields are missing: ${missingFields.join(', ')}`
        },
        { status: 400 }
      );
    }

    try {
      // Check if the user already has a sports profile
      const existingProfile = await prisma.sportsProfile.findUnique({
        where: { userId: id }
      });

      if (existingProfile) {
        return NextResponse.json(
          { message: 'Sports profile already exists.' },
          { status: 400 }
        );
      }

      const sportsProfile = await prisma.sportsProfile.create({
        data: {
          ...body,
          user: {
            connect: {
              id
            }
          }
          // userId: userId
        }
      });

      return NextResponse.json(
        {
          message: 'Sports profile created successfully.',
          data: sportsProfile
        },
        { status: 201 }
      );
    } catch (error: any) {
      return NextResponse.json(
        { message: 'Failed to create sports profile.', error: error.message },
        { status: 500 }
      );
    }
  });
}

export async function PATCH(req: AuthenticatedRequest) {
  return await authenticate(req, async () => {
    const body = await req.json();
    const { id } = req.user as { id: string };
    try {
      const updateData = {
        ...(body.skillLevel && { skillLevel: body.skillLevel }),
        ...(body.preferredPosition && {
          preferredPosition: body.preferredPosition
        }),
        ...(body.strength && { strength: body.strength }),
        ...(body.weakness && { weakness: body.weakness }),
        ...(body.preferredFoot && { preferredFoot: body.preferredFoot }),
        ...(body.favoriteNumber && { favoriteNumber: body.favoriteNumber }),
        ...(body.favoritePlayer && { favoritePlayer: body.favoritePlayer }),
        ...(body.favoriteClub && { favoriteClub: body.favoriteClub })
      };

      // Ensure there is at least one field to update
      if (Object.keys(updateData).length === 0) {
        return NextResponse.json(
          { message: 'No valid fields provided for update.' },
          { status: 400 }
        );
      }

      const updatedProfile = await prisma.sportsProfile.update({
        where: { userId: id },
        data: updateData
      });

      return NextResponse.json(
        {
          message: 'Sports profile updated successfully.',
          data: updatedProfile
        },
        { status: 200 }
      );
    } catch (error: any) {
      return NextResponse.json(
        { message: 'Failed to update sports profile.', error: error.message },
        { status: 500 }
      );
    }
  });
}
