import { authenticate } from '@/middlewares/auth';
import { NextResponse } from 'next/server';
import { AuthenticatedRequest } from '@/lib/utils/request-type';
import { PreferredFoot, PreferredPosition, SkillLevel } from '@prisma/client';

export async function GET(req: AuthenticatedRequest) {
  return await authenticate(req, async () => {
    try {
      return NextResponse.json(
        {
          data: {
            skillLevel: SkillLevel,
            preferredFoot: PreferredFoot,
            preferredPosition: PreferredPosition
          }
        },
        { status: 200 }
      );
    } catch (error: any) {
      return NextResponse.json(
        { message: 'Failed to fetch sports profile.', error: error.message },
        { status: 500 }
      );
    }
  });
}
