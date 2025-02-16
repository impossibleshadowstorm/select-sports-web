// import { authenticate } from "../../../middlewares/auth";
// import { NextResponse } from "next/server";

// export async function GET(req) {
//   return await authenticate(req, async () => {
//     try {
//       const { id } = req.user; // Get user ID from the authenticated request

//       // Optionally, fetch user data from the database (if you need to return user details)
//       const user = await prisma.user.findUnique({
//         where: { id: id },
//         include: {
//           address: true,
//           bookings: true,
//         },
//       });

//       const { pass, ...otherData } = user;

//       // Return the authenticated user's data
//       return NextResponse.json(
//         {
//           data: otherData,
//           authenticated: true,
//         },
//         { status: 200 }
//       );
//     } catch (error) {
//       return NextResponse.json(
//         {
//           message: `Failed to retrieve user data`,
//           error: `Error: ${error.message}`,
//         },
//         { status: 400 }
//       );
//     }
//   });
// }

import { authenticate } from '../../../middlewares/auth';
import { NextResponse } from 'next/server';
import prisma from '@/lib/utils/prisma-client';
import { AuthenticatedRequest } from '@/lib/utils/request-type';

export async function GET(req: AuthenticatedRequest) {
  return await authenticate(req, async () => {
    try {
      const { id } = req.user as { id: string }; // Explicitly type `req.user`

      // Fetch user data from the database
      const user = await prisma.user.findUnique({
        where: { id },
        include: {
          address: true,
          bookings: true
        }
      });

      if (!user) {
        return NextResponse.json(
          { message: 'User not found' },
          { status: 404 }
        );
      }

      // Exclude sensitive information like `pass`
      const { password, ...otherData } = user; // eslint-disable-line

      // Return the authenticated user's data
      return NextResponse.json(
        {
          data: otherData,
          authenticated: true
        },
        { status: 200 }
      );
    } catch (error: any) {
      return NextResponse.json(
        {
          message: 'Failed to retrieve user data',
          error: `Error: ${error.message}`
        },
        { status: 400 }
      );
    }
  });
}
