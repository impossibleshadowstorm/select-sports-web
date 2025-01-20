import { authenticateAdmin } from "@/middlewares/auth";
import prisma from "@/lib/utils/prisma-client";
import { validateRequiredFields } from "@/lib/utils/validator";
import { NextResponse } from "next/server";
import { AvailableStates } from "@prisma/client";
import {Address, Sport} from "@prisma/client";

interface VenueRequestBody {
  name: string;
  address: Address;
  sports: Sport[];
}

export async function POST(req: Request) {
  return await authenticateAdmin(req, async () => {
    const { name, address, sports }: VenueRequestBody = await req.json();

    // Validate required fields
    if (!name || !address || !Array.isArray(sports) || sports.length === 0) {
      return NextResponse.json(
        {
          message:
            "Missing or invalid required fields: name, address, or sports.",
        },
        { status: 400 }
      );
    }

    // Define required fields for address validation
    const requiredFields = ["street", "city", "state", "postalCode", "country"];

    // Validate address fields
    const { isValid, missingFields } = validateRequiredFields(address, requiredFields);

    if (!isValid) {
      return NextResponse.json(
        {
          message: `The following fields are missing from Venue address: ${missingFields.join(", ")} while creating a Venue.`,
        },
        { status: 400 }
      );
    }

    // Check if the state is part of AvailableStates enum
    if (!Object.values(AvailableStates).includes(address.state as AvailableStates)) {
      return NextResponse.json(
        {
          message: `Invalid state. Allowed values are: ${Object.values(AvailableStates).join(", ")}.`,
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
            create: {
              street: address.street,
              city: address.city,
              state: address.state,
              postalCode: address.postalCode,
              country: address.country,
            },
          },
          sports: {
            connect: sports.map((sportId) => ({ id: sportId })),
          },
        },
        include: {
          address: true,
          sports: true,
        },
      });

      return NextResponse.json(
        { data: venue, message: "Venue Added Successfully" },
        { status: 201 }
      );
    } catch (error: any) {
      const isUniqueConstraintError = error.message.includes("Unique constraint failed");
      return NextResponse.json(
        {
          message: isUniqueConstraintError
            ? "Venue with the provided address already exists."
            : "Unable to Add Venue",
          error: `Failed to create venue: ${error.message}`,
        },
        { status: 500 }
      );
    }
  });
}
