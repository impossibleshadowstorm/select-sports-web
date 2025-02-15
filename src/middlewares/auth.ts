import { headers } from 'next/headers';
import { verifyToken } from '@/lib/utils/jwt-config';
import prisma from '@/lib/utils/prisma-client';
import { NextResponse } from 'next/server';
import { AuthenticatedRequest } from '@/lib/utils/request-type';

interface Next {
  (): Promise<NextResponse>;
}

// Authenticate and check for admin role
export const authenticateAdmin = async (
  req: AuthenticatedRequest,
  next: Next
) => {
  const requestHeader = await headers();
  const token = requestHeader.get('Authorization');

  if (!token) {
    return NextResponse.json(
      { message: 'Unauthorized, no token provided' },
      { status: 401 }
    );
  }

  try {
    // Decode the token to get user information
    const decoded = verifyToken(token.split(' ')[1]);
    console.log(decoded);
    if (!decoded) {
      return NextResponse.json(
        { message: 'Unauthorized, invalid token' },
        { status: 401 }
      );
    }

    // Fetch the user from the database to check their role
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { role: true } // Only select the role field
    });

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Forbidden, Only Admin can perform this action!' },
        { status: 403 }
      );
    }

    req.user = decoded; // Attach the decoded user info to the request
    return next(); // Proceed to the next middleware or route handler
  } catch (error: any) {
    return NextResponse.json(
      {
        message: 'Server error during authentication',
        error: `Error: ${error.message}`
      },
      { status: 500 }
    );
  }
};

export const authenticate = async (req: AuthenticatedRequest, next: Next) => {
  const requestHeader = await headers();
  const token = requestHeader.get('Authorization');

  if (!token) {
    return NextResponse.json(
      { message: 'Unauthorized, no token provided' },
      { status: 401 }
    );
  }

  try {
    const decoded = verifyToken(token.split(' ')[1]);
    if (!decoded) {
      return NextResponse.json(
        { message: 'Unauthorized, invalid token' },
        { status: 401 }
      );
    }
    req.user = decoded;
    return next();
  } catch (error: any) {
    return NextResponse.json(
      {
        message: 'Unauthorized, invalid token',
        error: `Error: ${error.message}`
      },
      { status: 401 }
    );
  }
};
