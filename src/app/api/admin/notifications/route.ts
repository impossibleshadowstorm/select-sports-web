// app/api/admin/add-notification/route.ts
import { authenticateAdmin } from '@/middlewares/auth';
import { NextRequest, NextResponse } from 'next/server';
import { addNotification } from '@/lib/utils/add-notification';
import prisma from '@/lib/utils/prisma-client';
import { AuthenticatedRequest } from '@/lib/utils/request-type';

export async function GET(req: AuthenticatedRequest) {
  return await authenticateAdmin(req, async () => {
    try {
      // Optional: Check if the user is admin
      const user = req.user as { role: string };
      if (user.role !== 'ADMIN') {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
      }

      const notifications = await prisma.notification.findMany({
        orderBy: { createdAt: 'desc' }
      });

      return NextResponse.json({ notifications }, { status: 200 });
    } catch (error) {
      return NextResponse.json(
        { message: 'Failed to fetch notifications' },
        { status: 500 }
      );
    }
  });
}

export async function POST(req: NextRequest) {
  return await authenticateAdmin(req, async () => {
    const body = await req.json();

    const requiredFields = ['title', 'message', 'type', 'target'];
    const missing = requiredFields.filter((f) => !body[f]);

    if (missing.length > 0) {
      return NextResponse.json(
        {
          error: `Missing required fields: ${missing.join(', ')}`
        },
        { status: 400 }
      );
    }

    const { title, message, type, target, userId, slotId, expiresAt } = body;

    try {
      const notification = await addNotification({
        title,
        message,
        type,
        target,
        userId,
        slotId,
        expiresAt: expiresAt ? new Date(expiresAt) : undefined
      });

      return NextResponse.json(
        { success: true, notification },
        { status: 200 }
      );
    } catch (error: any) {
      return NextResponse.json(
        { error: error.message || 'Failed to create notification.' },
        { status: 500 }
      );
    }
  });
}
