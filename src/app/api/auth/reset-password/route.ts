import prisma from '@/lib/utils/prisma-client';
import { validateRequiredFields } from '@/lib/utils/validator';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';

// Type definitions
interface ResetPasswordRequestBody {
  email: string;
  otp: string;
  newPassword: string;
}

interface ResetPasswordResponse {
  message: string;
  error?: string;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const body: ResetPasswordRequestBody = await req.json();
  const { email, otp, newPassword } = body;

  // Define required fields
  const requiredFields = ['email', 'otp', 'newPassword'];

  // Validate fields
  const { isValid, missingFields } = validateRequiredFields(
    body,
    requiredFields
  );

  if (!isValid) {
    return NextResponse.json<ResetPasswordResponse>(
      {
        message: `The following fields are missing: ${missingFields.join(', ')}`
      },
      { status: 400 }
    );
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (
      !user ||
      user.otp !== otp ||
      !user.otpExpiresAt ||
      user.otpExpiresAt < new Date()
    ) {
      return NextResponse.json<ResetPasswordResponse>(
        { message: 'Invalid OTP or OTP expired' },
        { status: 400 }
      );
    }

    if (!newPassword) {
      return NextResponse.json<ResetPasswordResponse>(
        { message: 'New Password not provided!' },
        { status: 400 }
      );
    }

    // Generate new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { email },
      data: {
        password: hashedPassword,
        otp: null, // Clear OTP
        otpExpiresAt: null
      }
    });

    return NextResponse.json<ResetPasswordResponse>(
      { message: 'Password reset successful' },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json<ResetPasswordResponse>(
      { message: 'Internal Server Error', error: `Error: ${error.message}` },
      { status: 500 }
    );
  }
}
