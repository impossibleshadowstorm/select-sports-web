import prisma from '@/lib/utils/prisma-client';
import bcrypt from 'bcryptjs';
import { validateRequiredFields } from '@/lib/utils/validator';
import { signToken } from '@/lib/utils/jwt-config';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define the shape of the request body
interface LoginRequestBody {
  email: string;
  password: string;
}

// Define the shape of the response body
interface LoginResponse {
  message: string;
  data?: any; // Token will be returned here if login is successful
  error?: string; // Error message if something goes wrong
}

export async function POST(
  req: NextRequest
): Promise<NextResponse<LoginResponse>> {
  const body: LoginRequestBody = await req.json();
  const { email, password } = body;

  // Define required fields
  const requiredFields = ['email', 'password'];

  // Validate fields
  const { isValid, missingFields } = validateRequiredFields(
    body,
    requiredFields
  );

  if (!isValid) {
    return NextResponse.json(
      {
        message: `The following fields are missing: ${missingFields.join(', ')}`
      },
      { status: 400 }
    );
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const token = signToken({
      id: user.id,
      name: user.name,
      role: user.role,
      email: user.email
    });

    return NextResponse.json(
      {
        message: 'Login successful',
        data: { token, userId: user.id, name: user.name, email: user.email }
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { message: 'Internal Server Error', error: `Error: ${error.message}` },
      { status: 500 }
    );
  }
}
