import prisma from '@/lib/utils/prisma-client';
import bcrypt from 'bcryptjs';
import {
  isValidEmail,
  isValidIndianPhoneNumber,
  validateRequiredFields
} from '@/lib/utils/validator';
import { NextResponse } from 'next/server';
import { Role, Gender } from '@prisma/client';
import {
  RegisterRequestBody,
  RegisterResponse
} from '@/app/api/auth/register/route';
import moment from 'moment-timezone';
import { addNotification } from './add-notification';
import { sendMail } from './nodemailer-setup';

export const register = async (
  body: RegisterRequestBody,
  role: Role
): Promise<NextResponse> => {
  const { name, email, password, phone, dob, gender } = body;

  // Define required fields
  const requiredFields = [
    'name',
    'email',
    'password',
    'phone',
    'dob',
    'gender'
  ];

  // Validate fields
  const { isValid, missingFields } = validateRequiredFields(
    body,
    requiredFields
  );

  if (!isValid) {
    return NextResponse.json<RegisterResponse>(
      {
        message: `The following fields are missing: ${missingFields.join(', ')}`
      },
      { status: 400 }
    );
  }

  try {
    // Validate email
    if (!isValidEmail(email)) {
      return NextResponse.json<RegisterResponse>(
        { message: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate Indian phone number
    if (!isValidIndianPhoneNumber(phone)) {
      return NextResponse.json<RegisterResponse>(
        { message: 'Invalid Indian phone number' },
        { status: 400 }
      );
    }

    // Check if the state is part of AvailableStates enum
    if (!Object.values(Gender).includes(gender as Gender)) {
      return NextResponse.json(
        {
          message: `Invalid Gender. Allowed values are: ${Object.values(
            Gender
          ).join(', ')}.`
        },
        { status: 400 }
      );
    }

    // Parse DOB (format: "24-01-2002")
    const parsedDob = moment
      .utc(dob, 'DD-MM-YYYY', true)
      .startOf('day')
      .toDate();

    if (!moment(parsedDob).isValid()) {
      return NextResponse.json<RegisterResponse>(
        { message: 'Invalid date format. Use DD-MM-YYYY.' },
        { status: 400 }
      );
    }

    // Check if the email already exists in the database
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });
    if (existingUser) {
      return NextResponse.json<RegisterResponse>(
        { message: 'Email is already registered' },
        { status: 400 }
      );
    }

    // Hash the password before saving it to the database
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        phone,
        password: hashedPassword,
        dob: parsedDob,
        gender,
        role: body?.role ?? role,
        wallet: {
          create: {}
        }
      }
    });

    // Remove the password before sending the response
    const { password: _, ...userWithoutPassword } = user; //eslint-disable-line
    await addNotification({
      title: 'User Registration',
      message: `Dear ${name}, your registration on Saurhub.com was successful. Enjoy the game!`,
      type: 'SYSTEM', // type (example: SYSTEM or whatever your NotificationType enum expects)
      target: 'SPECIFIC_USER',
      userId: user.id // userId (optional depending on target)
    });

    const mailRes = await sendMail({
      to: user?.email as string,
      subject: `Welcome to SelectSportss.com, ${user?.name}!`,
      text: `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
      <title>Welcome to SelectSportss.com</title>
    </head>
    <body style="font-family: Arial, sans-serif; background-color: #f6f9fc; margin: 0; padding: 0;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f6f9fc; padding: 30px 0;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; padding: 40px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
              <tr>
                <td style="text-align: center; padding-bottom: 30px;">
                  <h2 style="color: #333333;">Welcome to SelectSportss.com!</h2>
                  <p style="color: #555555; font-size: 16px;">We're thrilled to have you onboard.</p>
                </td>
              </tr>
              <tr>
                <td>
                  <p style="color: #333333; font-size: 16px;"><strong>Dear ${user?.name},</strong></p>
                  <p style="color: #555555; font-size: 15px; line-height: 1.6;">
                    Thank you for registering on <strong>SelectSportss.com</strong>. Your journey towards exciting sports activities starts here!
                  </p>
    
                  <h3 style="color: #333333; margin-top: 30px;">Your Details:</h3>
                  <ul style="color: #555555; font-size: 15px; line-height: 1.6;">
                    <li><strong>Name:</strong> ${user?.name}</li>
                    <li><strong>Email:</strong> ${user?.email}</li>
                    <li><strong>Phone:</strong> ${user?.phone}</li>
                  </ul>
    
                  <p style="color: #555555; font-size: 15px; margin-top: 30px;">
                    Start exploring and booking your favorite slots today!
                  </p>
    
                  <p style="color: #555555; font-size: 15px;">
                    Best wishes,<br/>
                    <strong>The SelectSportss.com Team</strong>
                  </p>
                </td>
              </tr>
              <tr>
                <td style="text-align: center; padding-top: 40px; font-size: 13px; color: #999999;">
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

    return NextResponse.json<RegisterResponse>(
      { message: 'User registered successfully', data: userWithoutPassword },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json<RegisterResponse>(
      { message: 'Internal Server Error', error: `Error: ${error.message}` },
      { status: 500 }
    );
  }
};
