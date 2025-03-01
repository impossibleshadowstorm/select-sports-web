// import prisma from '@/lib/utils/prisma-client';
// import { NextRequest, NextResponse } from 'next/server';
// import { authenticate } from '@/middlewares/auth';
// import { AuthenticatedRequest } from '@/lib/utils/request-type';

// export async function PATCH(req: AuthenticatedRequest) {
//     return await authenticate(req, async () => {
//         try {
//             const { id: userId } = req.user as { id: string };
//             const body = await req.json();

//             const {
//                 name,
//                 phone,
//                 dob,
//                 gender,
//                 nearby,
//                 street,
//                 city,
//                 state,
//                 postalCode
//             } = body;

//             // Validate required fields
//             if (!name || !phone || !gender || !street || !city || !state || !postalCode) {
//                 return NextResponse.json(
//                     { message: 'Missing required fields.' },
//                     { status: 400 }
//                 );
//             }

//             // Fetch the user's current addressId
//             const user = await prisma.user.findUnique({
//                 where: { id: userId },
//                 select: { addressId: true }
//             });

//             let updatedUser;

//             if (user?.addressId) {
//                 // Update existing address
//                 updatedUser = await prisma.user.update({
//                     where: { id: userId },
//                     data: {
//                         name,
//                         phone,
//                         dob: dob ? new Date(dob) : undefined,
//                         gender,
//                         address: {
//                             update: {
//                                 street,
//                                 city,
//                                 state,
//                                 postalCode,
//                                 nearby,
//                                 country: 'INDIA' // Default country
//                             }
//                         }
//                     },
//                     include: { address: true }
//                 });
//             } else {
//                 // Create a new address and link it
//                 updatedUser = await prisma.user.update({
//                     where: { id: userId },
//                     data: {
//                         name,
//                         phone,
//                         dob: dob ? new Date(dob) : undefined,
//                         gender,
//                         address: {
//                             create: {
//                                 street,
//                                 city,
//                                 state,
//                                 postalCode,
//                                 nearby,
//                                 country: 'INDIA' // Default country
//                             }
//                         }
//                     },
//                     include: { address: true }
//                 });
//             }

//             return NextResponse.json({ message: 'User updated successfully.', user: updatedUser });
//         } catch (error) {
//             console.error('Error updating user:', error);
//             return NextResponse.json(
//                 { message: 'Failed to update user.', error: error.message },
//                 { status: 500 }
//             );
//         }
//     });
// }

// import prisma from '@/lib/utils/prisma-client';
// import { NextResponse } from 'next/server';
// import { authenticate } from '@/middlewares/auth';
// import { AuthenticatedRequest } from '@/lib/utils/request-type';

// export async function PATCH(req: AuthenticatedRequest) {
//     return await authenticate(req, async () => {
//         try {
//             const { id: userId } = req.user as { id: string };
//             const body = await req.json();

//             const {
//                 name,
//                 phone,
//                 dob,
//                 gender,
//                 nearby,  // Keep it for frontend use, but remove it before updating DB
//                 street,
//                 city,
//                 state,
//                 postalCode
//             } = body;

//             // Validate required fields
//             if (!name || !phone || !gender || !street || !city || !state || !postalCode) {
//                 return NextResponse.json(
//                     { message: 'Missing required fields.' },
//                     { status: 400 }
//                 );
//             }

//             // Check if user has an address
//             const user = await prisma.user.findUnique({
//                 where: { id: userId },
//                 select: { addressId: true }
//             });

//             let updatedUser;

//             if (user?.addressId) {
//                 // Update existing address (Exclude 'nearby')
//                 updatedUser = await prisma.user.update({
//                     where: { id: userId },
//                     data: {
//                         name,
//                         phone,
//                         dob: dob ? new Date(dob) : undefined,
//                         gender,
//                         address: {
//                             update: {
//                                 street,
//                                 city,
//                                 state,
//                                 postalCode
//                             }
//                         }
//                     },
//                     include: { address: true }
//                 });
//             } else {
//                 // Create a new address and link it (Exclude 'nearby')
//                 updatedUser = await prisma.user.update({
//                     where: { id: userId },
//                     data: {
//                         name,
//                         phone,
//                         dob: dob ? new Date(dob) : undefined,
//                         gender,
//                         address: {
//                             create: {
//                                 street,
//                                 city,
//                                 state,
//                                 postalCode
//                             }
//                         }
//                     },
//                     include: { address: true }
//                 });
//             }

//             return NextResponse.json({ message: 'User updated successfully.', user: updatedUser });
//         } catch (error) {
//             console.error('Error updating user:', error);
//             return NextResponse.json(
//                 {
//                     message: 'Failed to update user.',
//                     error: error instanceof Error ? error.message : 'Unknown error'
//                 },
//                 { status: 500 }
//             );
//         }
//     });
// }

import prisma from '@/lib/utils/prisma-client';
import { NextResponse } from 'next/server';
import { authenticate } from '@/middlewares/auth';
import { AuthenticatedRequest } from '@/lib/utils/request-type';

export async function PATCH(req: AuthenticatedRequest) {
  return await authenticate(req, async () => {
    try {
      const { id: userId } = req.user as { id: string };
      const body = await req.json();

      const {
        name,
        phone,
        dob, // Keep in request, but process separately
        gender,
        street,
        city,
        state,
        postalCode
      } = body;

      // Validate required fields
      if (
        !name ||
        !phone ||
        !gender ||
        !street ||
        !city ||
        !state ||
        !postalCode
      ) {
        return NextResponse.json(
          { message: 'Missing required fields.' },
          { status: 400 }
        );
      }

      // Build update object dynamically to avoid type errors
      const updateData: Record<string, any> = {
        name,
        phone,
        gender
      };

      // Only add dob if it's provided and valid
      if (dob) {
        const parsedDob = new Date(dob);
        if (!isNaN(parsedDob.getTime())) {
          updateData.dob = parsedDob;
        }
      }

      // Check if the user has an existing address
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { addressId: true }
      });

      if (user?.addressId) {
        updateData.address = {
          update: {
            street,
            city,
            state,
            postalCode
          }
        };
      } else {
        updateData.address = {
          create: {
            street,
            city,
            state,
            postalCode
          }
        };
      }

      // Perform the update
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: updateData,
        include: { address: true }
      });

      return NextResponse.json({
        message: 'User updated successfully.',
        user: updatedUser
      });
    } catch (error) {
      return NextResponse.json(
        {
          message: 'Failed to update user.',
          error: error instanceof Error ? error.message : 'Unknown error'
        },
        { status: 500 }
      );
    }
  });
}
