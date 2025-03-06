import { authenticateAdmin } from '@/middlewares/auth';
import prisma from '@/lib/utils/prisma-client';
import { NextRequest, NextResponse } from 'next/server';
import { Address, Sport } from '@prisma/client';
import { deleteS3Image } from '@/lib/utils/s3-operations';

interface VenueRequest {
  name?: string;
  address?: Address;
  sports?: Sport[];
  amenities: string[];
  locationUrl: string;
}

export async function PATCH(req: NextRequest) {
  return await authenticateAdmin(req, async () => {
    const id = req.nextUrl.pathname.split('/').pop();
    const { name, address, sports, amenities, locationUrl }: VenueRequest =
      await req.json();

    const updateData: { [key: string]: any } = {};

    // Update name if provided
    if (name) {
      updateData.name = name;
    }

    // Update address if provided
    if (address) {
      const { street, city, state, postalCode, country } = address;

      // Prepare address update data dynamically
      const addressUpdate: { [key: string]: any } = {};
      if (street) addressUpdate.street = street;
      if (city) addressUpdate.city = city;
      if (state) addressUpdate.state = state;
      if (postalCode) addressUpdate.postalCode = postalCode;
      if (country) addressUpdate.country = country;

      if (Object.keys(addressUpdate).length > 0) {
        updateData.address = { update: addressUpdate };
      }
    }

    // Update sports if provided
    if (Array.isArray(sports)) {
      updateData.sports = {
        connect: sports.map((sportId) => ({ id: sportId })) // Connect new sports
      };
    }

    // Update amenities if provided
    if (Array.isArray(amenities) && amenities.length > 0) {
      updateData.amenities = amenities;
    }

    // Validate and update locationUrl
    if (locationUrl) {
      const urlRegex = /^(https?:\/\/)?([\w.-]+)\.([a-z]{2,})(\/\S*)?$/i;

      if (!urlRegex.test(locationUrl.trim())) {
        return NextResponse.json(
          { message: 'Invalid location URL format.' },
          { status: 400 }
        );
      }

      updateData.locationUrl = locationUrl;
    }

    // Ensure there's something to update
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields provided for update.' },
        { status: 400 }
      );
    }

    // Update the venue and associate sports
    try {
      const updatedVenue = await prisma.venue.update({
        where: { id },
        data: updateData,
        include: {
          address: true,
          sports: true
        }
      });

      return NextResponse.json(
        { data: updatedVenue, message: 'Venue data updated successfully' },
        { status: 200 }
      );
    } catch (error: any) {
      return NextResponse.json(
        {
          error: `Failed to update venue: ${error.message}`,
          message: 'Failed to Update Venue'
        },
        { status: 500 }
      );
    }
  });
}

export async function DELETE(req: NextRequest) {
  return await authenticateAdmin(req, async () => {
    const id = req.nextUrl.pathname.split('/').pop();

    try {
      // Fetch the venue to get its related address ID
      const venue = await prisma.venue.findUnique({
        where: { id },
        select: { addressId: true, images: true }
      });

      if (!venue) {
        return NextResponse.json(
          { error: `Venue with ID ${id} not found.` },
          { status: 404 }
        );
      }
      //Delete all images from s3
      if (venue.images && venue.images.length > 0) {
        await Promise.all(
          venue.images.map(async (imageUrl) => deleteS3Image(imageUrl))
        );
      }

      // Delete the venue
      await prisma.venue.delete({
        where: { id }
      });

      // Delete the related address
      await prisma.address.delete({
        where: { id: venue.addressId }
      });

      return NextResponse.json(
        {
          message: `Venue with ID ${id} and its related address deleted successfully.`
        },
        { status: 200 }
      );
    } catch (error: any) {
      return NextResponse.json(
        {
          message: `Failed to delete venue.`,
          error: `Error: ${error.message}`
        },
        { status: 500 }
      );
    }
  });
}
