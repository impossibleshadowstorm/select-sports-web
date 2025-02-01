import { authenticate } from '@/middlewares/auth';
import { NextResponse } from 'next/server';
import prisma from '@/lib/utils/prisma-client';
import { AuthenticatedRequest } from '@/lib/utils/request-type';

// Type definitions
interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface ResponseMessage {
  message: string;
  error?: string;
  data?: AuthenticatedUser;
  authenticated?: boolean;
}

export async function GET(req: AuthenticatedRequest) {
  return await authenticate(req, async () => {
    try {
      const { id } = req.user as { id: string }; // Get user ID from the authenticated request

      // Fetch user data from the database (if you need to return user details)
      const user = await prisma.user.findUnique({
        where: { id },
        select: { id: true, name: true, email: true, role: true } // Specify fields to return
      });

      if (!user) {
        return NextResponse.json<ResponseMessage>(
          {
            message: 'User not found',
            authenticated: false
          },
          { status: 404 }
        );
      }

      // Return the authenticated user's data
      return NextResponse.json<ResponseMessage>(
        {
          data: user,
          authenticated: true,
          message: 'Authenticated Successfully'
        },
        { status: 200 }
      );
    } catch (error: any) {
      return NextResponse.json<ResponseMessage>(
        {
          message: 'Failed to retrieve user data',
          error: `Error: ${error.message}`
        },
        { status: 400 }
      );
    }
  });
}
