import prisma from '@/lib/utils/prisma-client';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { authenticate } from '@/middlewares/auth';
import { AuthenticatedRequest } from '@/lib/utils/request-type';

export async function POST(req: AuthenticatedRequest) {
  return await authenticate(req, async () => {
    try {
      const { id: userId } = req.user as { id: string };
      const { currentPassword } = await req.json();

      // Fetch user password from DB
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { password: true }
      });

      if (!user) {
        return NextResponse.json(
          { message: 'User not found' },
          { status: 404 }
        );
      }
      // Verify password
      const isPasswordCorrect = await bcrypt.compare(
        currentPassword,
        user.password
      );
      if (!isPasswordCorrect) {
        return NextResponse.json(
          { success: false, message: 'Incorrect password' },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Password verified',
        status: 200
      });
    } catch (error) {
      return NextResponse.json(
        { message: 'Failed to verify password' },
        { status: 500 }
      );
    }
  });
}
