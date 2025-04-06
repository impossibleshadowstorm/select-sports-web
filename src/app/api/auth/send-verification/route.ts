import { generateOTP } from '@/lib/utils/generate-otp';
import prisma from '@/lib/utils/prisma-client';
import { sendMail } from '@/lib/utils/nodemailer-setup';
import { validateRequiredFields } from '@/lib/utils/validator';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Type definitions
interface OTPRequestBody {
  email: string;
}

interface OTPResponse {
  message: string;
  error?: string;
}

const OTP_EXPIRATION_MINUTES = process.env.OTP_EXPIRATION_MINUTES
  ? parseInt(process.env.OTP_EXPIRATION_MINUTES, 10)
  : 10; // Default to 10 minutes if not set in the environment

export async function POST(req: NextRequest): Promise<NextResponse> {
  const body: OTPRequestBody = await req.json();
  const { email } = body;

  // Define required fields
  const requiredFields = ['email'];

  // Validate fields
  const { isValid, missingFields } = validateRequiredFields(
    body,
    requiredFields
  );

  if (!isValid) {
    return NextResponse.json<OTPResponse>(
      {
        message: `The following fields are missing: ${missingFields.join(', ')}`
      },
      { status: 400 }
    );
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return NextResponse.json<OTPResponse>(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpiresAt = new Date(Date.now() + OTP_EXPIRATION_MINUTES * 60000);

    // Update user with OTP and expiration
    await prisma.user.update({
      where: { email },
      data: { otp, otpExpiresAt }
    });

    // Send OTP to user's email
    await sendMail({
      to: email,
      subject: 'Your One-Time Password (OTP) for Account Verification',
      text: `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
      <title>OTP Verification</title>
    </head>
    <body style="font-family: Arial, sans-serif; background-color: #f4f6f8; margin: 0; padding: 0;">
      <table width="100%" cellpadding="0" cellspacing="0" style="padding: 40px 0; background-color: #f4f6f8;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; padding: 40px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
              <tr>
                <td style="text-align: center; padding-bottom: 20px;">
                  <h2 style="color: #2d3748;">Account Verification</h2>
                  <p style="color: #4a5568; font-size: 16px;">Use the OTP below to verify your account with <strong>SelectSportss.com</strong>.</p>
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
                  <p style="color: #718096; font-size: 15px;">This OTP will expire in <strong>${OTP_EXPIRATION_MINUTES} minutes</strong>.</p>
                </td>
              </tr>
              <tr>
                <td style="padding-top: 30px; font-size: 15px; color: #4a5568; text-align: center;">
                  If you did not request this, please ignore this email or contact our support team.
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

    return NextResponse.json<OTPResponse>(
      { message: 'OTP sent to email' },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json<OTPResponse>(
      { message: 'Internal Server Error', error: `Error: ${error.message}` },
      { status: 500 }
    );
  }
}
