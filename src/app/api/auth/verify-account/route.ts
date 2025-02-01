import prisma from '@/lib/utils/prisma-client';
import { validateRequiredFields } from '@/lib/utils/validator';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Type definitions
interface VerifyAccountRequestBody {
  email: string;
  otp: string;
}

interface ResponseMessage {
  message: string;
  error?: string;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const body: VerifyAccountRequestBody = await req.json();
  const { email, otp } = body;

  // Define required fields
  const requiredFields = ['email', 'otp'];

  // Validate fields
  const { isValid, missingFields } = validateRequiredFields(
    body,
    requiredFields
  );

  if (!isValid) {
    return NextResponse.json<ResponseMessage>(
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
      !user.otp ||
      user.otp !== otp ||
      user.otpExpiresAt! < new Date()
    ) {
      return NextResponse.json<ResponseMessage>(
        { message: 'Invalid OTP or OTP expired' },
        { status: 400 }
      );
    }

    // Mark user as verified
    await prisma.user.update({
      where: { email },
      data: {
        isVerified: true,
        otp: null, // Clear OTP
        otpExpiresAt: null // Clear OTP expires
      }
    });

    return NextResponse.json<ResponseMessage>(
      { message: 'Account verified successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json<ResponseMessage>(
      { message: 'Internal Server Error', error: `Error: ${error.message}` },
      { status: 500 }
    );
  }
}
