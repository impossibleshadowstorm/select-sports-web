import { authenticateAdmin } from '@/middlewares/auth';
import prisma from '@/lib/utils/prisma-client';
import { validateRequiredFields } from '@/lib/utils/validator';
import { NextResponse } from 'next/server';
import { AvailableStates } from '@prisma/client';
import { Address, Sport } from '@prisma/client';

interface VenueRequestBody {
  name: string;
  address: Address;
  sports: string[];
  description: string;
}

// export async function POST(req: Request) {
//   return await authenticateAdmin(req, async () => {
//     const {
//       name,
//       address,
//       sports,
//       description,
//     }: VenueRequestBody = await req.json();
//     // Define required fields for Venue validation
//     const requiredFields = ["name", "address", "sports", "description"];

//     // Validate address fields
//     const { isValid, missingFields } = validateRequiredFields(
//       {
//         name,
//         address,
//         sports,
//         description,
//       },
//       requiredFields
//     );

//     if (!isValid) {
//       return NextResponse.json(
//         {
//           message: `The following fields are missing from Venue: ${missingFields.join(
//             ", "
//           )}, while creating a Venue.`,
//         },
//         { status: 400 }
//       );
//     }

//     // Define required fields for address validation
//     const addressRequiredFields = ["name", "address", "sports", "description"];

//     // Validate address fields
//     const {
//       isValid: isAddrValid,
//       missingFields: missingAddrFields,
//     } = validateRequiredFields(address, addressRequiredFields);

//     if (!isAddrValid) {
//       return NextResponse.json(
//         {
//           message: `The following fields are missing from Venue address: ${missingAddrFields.join(
//             ", "
//           )}, while creating a Venue.`,
//         },
//         { status: 400 }
//       );
//     }

//     // Check if the state is part of AvailableStates enum
//     if (
//       !Object.values(AvailableStates).includes(address.state as AvailableStates)
//     ) {
//       return NextResponse.json(
//         {
//           message: `Invalid state. Allowed values are: ${Object.values(
//             AvailableStates
//           ).join(", ")}.`,
//         },
//         { status: 400 }
//       );
//     }

//     try {
//       // Create the venue and associate sports
//       const venue = await prisma.venue.create({
//         data: {
//           name,
//           address: {
//             create: address,
//           },
//           sports: {
//             connect: sports.map((sportId) => ({ id: sportId })),
//           },
//         },
//         include: {
//           address: true,
//           sports: true,
//         },
//       });

//       return NextResponse.json(
//         { data: venue, message: "Venue Added Successfully" },
//         { status: 201 }
//       );
//     } catch (error) {
//       const isUniqueConstraintError = error.message.includes(
//         "Unique constraint failed"
//       );
//       return NextResponse.json(
//         {
//           message: isUniqueConstraintError
//             ? "Venue with the provided address already exists."
//             : "Unable to Add Venue",
//           error: `Failed to create venue: ${error.message}`,
//         },
//         { status: 500 }
//       );
//     }
//   });
// }

export async function POST(req: Request) {
  return await authenticateAdmin(req, async () => {
    const { name, address, sports, description }: VenueRequestBody =
      await req.json();

    // Define required fields for Venue and Address validation
    const requiredFields = [
      'name',
      'description',
      'address.street',
      'address.city',
      'address.state',
      'address.postalCode',
      'sports'
    ];

    // Validate all fields (including nested address fields)
    const { isValid, missingFields } = validateRequiredFields(
      { name, address, sports, description },
      requiredFields
    );

    if (!isValid) {
      return NextResponse.json(
        {
          message: `The following fields are missing or invalid: ${missingFields.join(
            ', '
          )}`
        },
        { status: 400 }
      );
    }

    // Check if the state is part of AvailableStates enum
    if (
      !Object.values(AvailableStates).includes(address.state as AvailableStates)
    ) {
      return NextResponse.json(
        {
          message: `Invalid state. Allowed values are: ${Object.values(
            AvailableStates
          ).join(', ')}.`
        },
        { status: 400 }
      );
    }

    try {
      // Create the venue and associate sports
      const venue = await prisma.venue.create({
        data: {
          name,
          address: {
            create: address
          },
          sports: {
            connect: sports.map((id) => ({ id: id }))
          },
          description
        },
        include: {
          address: true,
          sports: true
        }
      });

      return NextResponse.json(
        { data: venue, message: 'Venue Added Successfully' },
        { status: 201 }
      );
    } catch (error) {
      const isUniqueConstraintError = error.message.includes(
        'Unique constraint failed'
      );
      return NextResponse.json(
        {
          message: isUniqueConstraintError
            ? 'Venue with the provided address already exists.'
            : 'Unable to Add Venue',
          error: `Failed to create venue: ${error.message}`
        },
        { status: 500 }
      );
    }
  });
}
