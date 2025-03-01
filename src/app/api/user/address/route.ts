// import { authenticate } from '../../../../middlewares/auth';
// import { NextResponse } from 'next/server';
// import { AvailableStates } from '@prisma/client';
// import { validateRequiredFields } from '@/lib/utils/validator';

// export async function POST(req) {
//   return await authenticate(req, async () => {
//     try {
//       const { id } = req.user; // Get authenticated user ID
//       const body = await req.json();

//       // Define required fields
//       const requiredFields = ['street', 'city', 'state', 'postalCode'];

//       // Validate fields
//       const { isValid, missingFields } = validateRequiredFields(
//         body,
//         requiredFields
//       );

//       if (!isValid) {
//         return NextResponse.json(
//           {
//             error: `The following fields are missing: ${missingFields.join(
//               ', '
//             )} while adding address to Profile.`
//           },
//           { status: 400 }
//         );
//       }

//       // Ensure the state is valid
//       if (!Object.values(AvailableStates).includes(body.state)) {
//         return NextResponse.json(
//           {
//             message: `Invalid state. Allowed states are: ${Object.values(
//               AvailableStates
//             ).join(', ')}`
//           },
//           { status: 400 }
//         );
//       }

//       // Check if the user already has an address
//       const userWithAddress = await prisma.user.findUnique({
//         where: { id: id },
//         select: { addressId: true }
//       });

//       if (userWithAddress?.addressId) {
//         return NextResponse.json(
//           { message: 'Address already exists. Use PATCH to update it.' },
//           { status: 400 }
//         );
//       }

//       // Create a new address and associate it with the user
//       const address = await prisma.address.create({
//         data: {
//           ...body,
//           User: { connect: { id: id } }
//         }
//       });

//       // Update the user's `addressId`
//       await prisma.user.update({
//         where: { id: id },
//         data: { addressId: address.id }
//       });

//       return NextResponse.json(
//         { message: 'Address added successfully.', data: { ...address } },
//         { status: 201 }
//       );
//     } catch (error) {
//       return NextResponse.json(
//         {
//           message: 'Failed to add the address.',
//           error: `Error: ${error.message}`
//         },
//         { status: 500 }
//       );
//     }
//   });
// }

// export async function PATCH(req) {
//   return await authenticate(req, async () => {
//     try {
//       const { id } = req.user; // Get authenticated user ID
//       const body = await req.json();

//       // Ensure at least one field is provided for the update
//       const { street, city, state, postalCode } = body;
//       if (!street && !city && !state && !postalCode) {
//         return NextResponse.json(
//           {
//             message:
//               'At least one field (street, city, state, or postalCode) must be provided.'
//           },
//           { status: 400 }
//         );
//       }

//       // Ensure the state is valid if it's provided
//       if (state && !Object.values(AvailableStates).includes(state)) {
//         return NextResponse.json(
//           {
//             message: `Invalid state. Allowed states are: ${Object.values(
//               AvailableStates
//             ).join(', ')}`
//           },
//           { status: 400 }
//         );
//       }

//       // Check if the user already has an address
//       const userWithAddress = await prisma.user.findUnique({
//         where: { id: id },
//         select: { addressId: true }
//       });

//       if (!userWithAddress?.addressId) {
//         return NextResponse.json(
//           { message: 'No address found. Use POST to create one.' },
//           { status: 400 }
//         );
//       }

//       // Prepare the data object for the update
//       const updateData = {};
//       if (street) updateData.street = street;
//       if (city) updateData.city = city;
//       if (state) updateData.state = state;
//       if (postalCode) updateData.postalCode = postalCode;

//       // Update the existing address
//       const address = await prisma.address.update({
//         where: { id: userWithAddress.addressId },
//         data: updateData
//       });

//       return NextResponse.json(
//         { message: 'Address updated successfully.', data: { ...address } },
//         { status: 200 }
//       );
//     } catch (error) {
//       return NextResponse.json(
//         {
//           message: 'Failed to update the address.',
//           error: `Error: ${error.message}`
//         },
//         { status: 500 }
//       );
//     }
//   });
// }

import { authenticate } from '@/middlewares/auth';
import { NextResponse } from 'next/server';
import { Address, AvailableStates } from '@prisma/client';
import { validateRequiredFields } from '@/lib/utils/validator';
import prisma from '@/lib/utils/prisma-client';
import { AuthenticatedRequest } from '@/lib/utils/request-type';

export async function POST(req: AuthenticatedRequest) {
  return await authenticate(req, async () => {
    try {
      const { id } = req.user as { id: string };
      const body: Address = await req.json();

      // Define required fields
      const requiredFields: (keyof Address)[] = [
        'street',
        'city',
        'state',
        'postalCode'
      ];

      // Validate fields
      const { isValid, missingFields } = validateRequiredFields(
        body,
        requiredFields
      );

      if (!isValid) {
        return NextResponse.json(
          {
            error: `The following fields are missing: ${missingFields.join(
              ', '
            )} while adding address to Profile.`
          },
          { status: 400 }
        );
      }

      // Ensure the state is valid
      if (
        !Object.values(AvailableStates).includes(body.state as AvailableStates)
      ) {
        return NextResponse.json(
          {
            message: `Invalid state. Allowed states are: ${Object.values(
              AvailableStates
            ).join(', ')}`
          },
          { status: 400 }
        );
      }

      // Check if the user already has an address
      const userWithAddress = await prisma.user.findUnique({
        where: { id: id },
        select: { addressId: true }
      });

      if (userWithAddress?.addressId) {
        return NextResponse.json(
          { message: 'Address already exists. Use PATCH to update it.' },
          { status: 400 }
        );
      }

      // Create a new address and associate it with the user
      const address = await prisma.address.create({
        data: {
          ...body,
          User: { connect: { id: id } }
        }
      });

      // Update the user's `addressId`
      await prisma.user.update({
        where: { id: id },
        data: { addressId: address.id }
      });

      return NextResponse.json(
        { message: 'Address added successfully.', data: { ...address } },
        { status: 201 }
      );
    } catch (error: any) {
      return NextResponse.json(
        {
          message: 'Failed to add the address.',
          error: `Error: ${error.message}`
        },
        { status: 500 }
      );
    }
  });
}

export async function PATCH(req: AuthenticatedRequest) {
  return await authenticate(req, async () => {
    try {
      const { id } = req.user as { id: string };
      const body: Address = await req.json();

      // Ensure at least one field is provided for the update
      const { street, city, state, postalCode } = body;
      if (!street && !city && !state && !postalCode) {
        return NextResponse.json(
          {
            message:
              'At least one field (street, city, state, or postalCode) must be provided.'
          },
          { status: 400 }
        );
      }

      // Ensure the state is valid if it's provided
      if (state && !Object.values(AvailableStates).includes(state)) {
        return NextResponse.json(
          {
            message: `Invalid state. Allowed states are: ${Object.values(
              AvailableStates
            ).join(', ')}`
          },
          { status: 400 }
        );
      }

      // Check if the user already has an address
      const userWithAddress = await prisma.user.findUnique({
        where: { id: id },
        select: { addressId: true }
      });

      if (!userWithAddress?.addressId) {
        return NextResponse.json(
          { message: 'No address found. Use POST to create one.' },
          { status: 400 }
        );
      }

      // Prepare the data object for the update
      const updateData: Partial<Address> = {};
      if (street) updateData.street = street;
      if (city) updateData.city = city;
      if (state) updateData.state = state;
      if (postalCode) updateData.postalCode = postalCode;

      // Update the existing address
      const address = await prisma.address.update({
        where: { id: userWithAddress.addressId },
        data: updateData
      });

      return NextResponse.json(
        { message: 'Address updated successfully.', data: { ...address } },
        { status: 200 }
      );
    } catch (error: any) {
      return NextResponse.json(
        {
          message: 'Failed to update the address.',
          error: `Error: ${error.message}`
        },
        { status: 500 }
      );
    }
  });
}
