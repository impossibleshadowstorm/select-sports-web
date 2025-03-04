import prisma from '@/lib/utils/prisma-client';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { authenticate } from '@/middlewares/auth';
import { AuthenticatedRequest } from '@/lib/utils/request-type';

export async function PATCH(req: AuthenticatedRequest) {
  return await authenticate(req, async () => {
    try {
      const { id: userId } = req.user as { id: string };
      const { currentPassword, newPassword } = await req.json();

      // Fetch the current user
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

      // Verify current password
      const isPasswordCorrect = await bcrypt.compare(
        currentPassword,
        user.password
      );
      if (!isPasswordCorrect) {
        return NextResponse.json(
          { message: 'Incorrect current password' },
          { status: 400 }
        );
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update password in database
      await prisma.user.update({
        where: { id: userId },
        data: { password: hashedPassword }
      });

      return NextResponse.json({
        status: 200,
        message: 'Password updated successfully'
      });
    } catch (error) {
      console.error('Error updating password:', error);
      return NextResponse.json(
        { message: 'Failed to update password' },
        { status: 500 }
      );
    }
  });
}
