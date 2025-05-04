// import prisma from '@/lib/utils/prisma-client';
// import { NextResponse } from 'next/server';
// import { authenticate } from '@/middlewares/auth';
// import { AuthenticatedRequest } from '@/lib/utils/request-type';

// export async function GET(req: AuthenticatedRequest) {
//   return await authenticate(req, async () => {
//     try {
//       const { id: userId } = req.user as { id: string };

//       // Fetch user's bookings and extract all slot IDs
//       const bookings = await prisma.booking.findMany({
//         where: { userId },
//         select: { slotId: true },
//       });
//       const bookedSlotIds = bookings.map(b => b.slotId);

//       // Check if user is also a host
//       const host = await prisma.host.findUnique({
//         where: { userId },
//       });
//       const hostId = host?.id;

//       // Fetch relevant notifications using OR logic
//       const notifications = await prisma.notification.findMany({
//         where: {
//           OR: [
//             // General to all users
//             { target: 'ALL_USERS' },

//             // Specific to this user
//             { userId },

//             // If user has booked a slot and notification is for that slot
//             {
//               slotId: {
//                 in: bookedSlotIds.length > 0 ? bookedSlotIds : ['null'],
//               },
//             },
//             ...(hostId
//               ? [
//                   { type: 'ALL_HOSTS' },
//                   { hostId }, // specific host
//                 ]
//               : []),
//           ],
//         },
//         orderBy: {
//           createdAt: 'desc',
//         },
//       });

//       return NextResponse.json({ notifications }, { status: 200 });

//     } catch (error) {
//       console.error('Error fetching notifications:', error);
//       return NextResponse.json(
//         { message: 'Failed to get notifications' },
//         { status: 500 }
//       );
//     }
//   });
// }

import prisma from '@/lib/utils/prisma-client';
import { NextResponse } from 'next/server';
import { authenticate } from '@/middlewares/auth';
import { AuthenticatedRequest } from '@/lib/utils/request-type';

export async function GET(req: AuthenticatedRequest) {
  return await authenticate(req, async () => {
    try {
      const { id: userId } = req.user as { id: string };

      // 1. Get booked slot IDs
      const bookings = await prisma.booking.findMany({
        where: { userId },
        select: { slotId: true }
      });
      const bookedSlotIds = bookings.map((b) => b.slotId);

      // 2. Get hostId if the user is a host
      const host = await prisma.host.findUnique({ where: { userId } });
      const hostId = host?.id;

      // 3. Build dynamic OR conditions
      const notificationFilters: any[] = [{ target: 'ALL_USERS' }, { userId }];

      if (bookedSlotIds.length > 0) {
        notificationFilters.push({ slotId: { in: bookedSlotIds } });
      }

      if (hostId) {
        notificationFilters.push({ type: 'ALL_HOSTS' }, { hostId });
      }

      // 4. Fetch notifications
      const notifications = await prisma.notification.findMany({
        where: {
          OR: notificationFilters
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      return NextResponse.json({ notifications }, { status: 200 });
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return NextResponse.json(
        { message: 'Failed to get notifications' },
        { status: 500 }
      );
    }
  });
}
