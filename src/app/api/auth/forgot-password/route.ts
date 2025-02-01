import { generateOTP } from '@/lib/utils/generate-otp';
import prisma from '@/lib/utils/prisma-client';
import { validateRequiredFields } from '@/lib/utils/validator';
import { sendMail } from '@/lib/utils/nodemailer-setup';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Type definitions
interface RequestBody {
  email: string;
}

interface ResponseMessage {
  message: string;
  error?: string;
}

const OTP_EXPIRATION_MINUTES = process.env.OTP_EXPIRATION_MINUTES ?? '600';

export async function POST(req: NextRequest): Promise<NextResponse> {
  const body: RequestBody = await req.json();
  const { email } = body;

  // Define required fields
  const requiredFields = ['email'];

  // Validate fields
  const { isValid, missingFields } = validateRequiredFields(
    body,
    requiredFields
  );

  if (!isValid) {
    return NextResponse.json<ResponseMessage>(
      {
        message: `The following fields are missing: ${missingFields.join(', ')}`,
        error: 'Validation Error'
      },
      { status: 400 }
    );
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return NextResponse.json<ResponseMessage>(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpiresAt = new Date(
      Date.now() + (parseInt(OTP_EXPIRATION_MINUTES) || 10) * 60000
    ); // Default to 10 minutes if no env variable

    // Update user with OTP and expiration
    await prisma.user.update({
      where: { email },
      data: { otp, otpExpiresAt }
    });

    // Send OTP to user's email
    await sendMail({
      to: email,
      subject: 'Password Reset OTP',
      text: `Your OTP is ${otp}. It expires in ${OTP_EXPIRATION_MINUTES} minutes.`
    });

    return NextResponse.json<ResponseMessage>(
      { message: 'OTP sent to email' },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json<ResponseMessage>(
      {
        message: 'Internal Server Error',
        error: `Error: ${error.message}`
      },
      { status: 500 }
    );
  }
}
