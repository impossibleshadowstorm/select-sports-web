import { generateOTP } from "@/lib/utils/generate-otp";
import prisma from "@/lib/utils/prisma-client";
import { sendMail } from "@/lib/utils/nodemailer-setup";
import { validateRequiredFields } from "@/lib/utils/validator";
import { NextResponse } from "next/server";

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

export async function POST(req: Request): Promise<NextResponse> {
  const body: OTPRequestBody = await req.json();
  const { email } = body;

  // Define required fields
  const requiredFields = ["email"];

  // Validate fields
  const { isValid, missingFields } = validateRequiredFields(body, requiredFields);

  if (!isValid) {
    return NextResponse.json<OTPResponse>(
      {
        message: `The following fields are missing: ${missingFields.join(", ")}`,
      },
      { status: 400 }
    );
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return NextResponse.json<OTPResponse>({ message: "User not found" }, { status: 404 });
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpiresAt = new Date(Date.now() + OTP_EXPIRATION_MINUTES * 60000);

    // Update user with OTP and expiration
    await prisma.user.update({
      where: { email },
      data: { otp, otpExpiresAt },
    });

    // Send OTP to user's email
    await sendMail({
      to: email,
      subject: "Account Verification OTP",
      text: `Your OTP is ${otp}. It expires in ${OTP_EXPIRATION_MINUTES} minutes.`,
    });

    return NextResponse.json<OTPResponse>({ message: "OTP sent to email" }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json<OTPResponse>(
      { message: "Internal Server Error", error: `Error: ${error.message}` },
      { status: 500 }
    );
  }
}
