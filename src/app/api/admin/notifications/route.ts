// app/api/admin/add-notification/route.ts
import { authenticateAdmin } from '@/middlewares/auth';
import { NextRequest, NextResponse } from 'next/server';
import { addNotification } from '@/lib/utils/add-notification';

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
