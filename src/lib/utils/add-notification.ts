import prisma from '@/lib/utils/prisma-client';
import { NotificationType, TargetType } from '@prisma/client';

export interface AddNotificationOptions {
  title: string;
  message: string;
  type: NotificationType;
  target: TargetType;
  userId?: string;
  slotId?: string;
  expiresAt?: Date;
}

export async function addNotification({
  title,
  message,
  type,
  target,
  userId,
  slotId,
  expiresAt
}: AddNotificationOptions) {
  return await prisma.notification.create({
    data: {
      title,
      message,
      type,
      target,
      userId,
      slotId,
      expiresAt
    }
  });
}
