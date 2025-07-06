'use client';

import { notFound } from 'next/navigation';
import NotificationForm from './notification-form';
import { get } from '@/lib/api-client';

type TNotificationViewPageProps = {
  notificationId: string;
};

export default function NotificationViewPage({
  notificationId
}: TNotificationViewPageProps) {
  let notification = null;
  let pageTitle = 'Create New Notification';

  if (notificationId !== 'new') {
    const response = get(`/notifications/${notificationId}`);
    notification = response?.data;
    if (!notification) {
      notFound();
    }
    pageTitle = `Edit Notification`;
  }

  return <NotificationForm initialData={notification} pageTitle={pageTitle} />;
}
