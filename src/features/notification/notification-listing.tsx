'use client';

import { DataTable as NotificationTable } from '@/components/ui/table/data-table';
import { columns } from './notifications-tables/columns';
import { Notification } from '@prisma/client';
import { authorizedGet, get } from '@/lib/api-client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
type NotificationListingPage = {};

export default function NotificationListingPage({}: NotificationListingPage) {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  console.log('notifications:', notifications);
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!session?.user?.id) return;
      const response = await authorizedGet(
        '/admin/notifications',
        session.user.id
      );
      console.log(response);
      setNotifications(response.notifications || []);
    };

    fetchNotifications();
  }, [session]); // Dependency array ensures it fetches when session changes

  return (
    <NotificationTable<Notification, unknown>
      columns={columns}
      data={notifications}
      totalItems={notifications.length}
    />
  );
}
