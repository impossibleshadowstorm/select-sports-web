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

// const OTP_EXPIRATION_MINUTES:number = process.env.OTP_EXPIRATION_MINUTES ?? '600';
const OTP_EXPIRATION_MINUTES: number = parseInt(
  process.env.OTP_EXPIRATION_MINUTES ?? '600',
  10
);

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
      Date.now() + (OTP_EXPIRATION_MINUTES || 10) * 60000
    ); // Default to 10 minutes if no env variable

    // Update user with OTP and expiration
    await prisma.user.update({
      where: { email },
      data: { otp, otpExpiresAt }
    });

    // Send OTP to user's email
    await sendMail({
      to: email,
      subject: 'Your OTP for Password Reset',
      text: `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
      <title>Password Reset OTP</title>
    </head>
    <body style="font-family: Arial, sans-serif; background-color: #f4f6f8; margin: 0; padding: 0;">
      <table width="100%" cellpadding="0" cellspacing="0" style="padding: 40px 0; background-color: #f4f6f8;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; padding: 40px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
              <tr>
                <td style="text-align: center; padding-bottom: 20px;">
                  <h2 style="color: #2d3748;">Password Reset Request</h2>
                  <p style="color: #4a5568; font-size: 16px;">You recently requested to reset your password for your <strong>SelectSportss.com</strong> account.</p>
                </td>
              </tr>
              <tr>
                <td style="text-align: center; padding: 30px 0;">
                  <div style="display: inline-block; font-size: 28px; font-weight: bold; letter-spacing: 6px; color: #1a202c; background: #edf2f7; padding: 15px 30px; border-radius: 6px;">
                    ${otp}
                  </div>
                </td>
              </tr>
              <tr>
                <td style="text-align: center; padding: 10px 0;">
                  <p style="color: #718096; font-size: 15px;">This OTP is valid for <strong>${OTP_EXPIRATION_MINUTES / 60} minutes</strong>.</p>
                </td>
              </tr>
              <tr>
                <td style="padding-top: 20px; font-size: 15px; color: #4a5568; text-align: center;">
                  If you did not request this password reset, please ignore this email or contact our support team immediately.
                </td>
              </tr>
              <tr>
                <td style="text-align: center; padding-top: 40px; font-size: 13px; color: #a0aec0;">
                  © ${new Date().getFullYear()} SelectSportss.com — All Rights Reserved.
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
    `
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
