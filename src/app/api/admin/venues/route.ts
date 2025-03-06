import { authenticateAdmin } from '@/middlewares/auth';
import prisma from '@/lib/utils/prisma-client';
import { validateRequiredFields } from '@/lib/utils/validator';
import { NextResponse } from 'next/server';
import { AvailableStates, VenueAmenities } from '@prisma/client';
import { Address } from '@prisma/client';
import type { NextRequest } from 'next/server';

interface VenueRequestBody {
  name: string;
  address: Address;
  sports: string[];
  images: string[];
  locationUrl: string;
  amenities: VenueAmenities[];
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

export async function POST(req: NextRequest) {
  return await authenticateAdmin(req, async () => {
    // TODO: Get locationUrl and Venue Amenities as well
    // Add validation of url and amenities
    const {
      name,
      address,
      sports,
      description,
      images,
      amenities,
      locationUrl
    }: VenueRequestBody = await req.json();

    // Define required fields for Venue and Address validation
    const requiredFields = [
      'name',
      'images',
      'description',
      'address.street',
      'address.city',
      'address.state',
      'address.postalCode',
      'sports',
      'amenities',
      'locationUrl'
    ];

    // Validate all fields (including nested address fields)
    const { isValid, missingFields } = validateRequiredFields(
      { name, address, sports, images, description, amenities, locationUrl },
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

    // Validate locationUrl is a valid URL
    const urlRegex = /^(https?:\/\/)?([\w.-]+)\.([a-z]{2,})(\/\S*)?$/i;

    if (!urlRegex.test(locationUrl)) {
      return NextResponse.json(
        { message: 'Invalid location URL format.' },
        { status: 400 }
      );
    }

    // Ensure amenities is a non-empty array
    if (!Array.isArray(amenities) || amenities.length === 0) {
      return NextResponse.json(
        { message: 'At least one amenity must be provided.' },
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
          images,
          amenities,
          sports: {
            connect: sports.map((id) => ({ id: id }))
          },
          locationUrl,
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
    } catch (error: any) {
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
