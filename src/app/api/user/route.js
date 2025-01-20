import { authenticate } from "../../../middlewares/auth";
import { NextResponse } from "next/server";

export async function GET(req) {
  return await authenticate(req, async () => {
    try {
      const { userId } = req.user; // Get user ID from the authenticated request

      // Optionally, fetch user data from the database (if you need to return user details)
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          address: true,
          bookings: true,
        },
      });

      const { pass, ...otherData } = user;

      // Return the authenticated user's data
      return NextResponse.json(
        {
          data: otherData,
          authenticated: true,
        },
        { status: 200 }
      );
    } catch (error) {
      return NextResponse.json(
        {
          message: `Failed to retrieve user data`,
          error: `Error: ${error.message}`,
        },
        { status: 400 }
      );
    }
  });
}
