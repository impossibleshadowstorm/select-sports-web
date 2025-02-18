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
      where: { email }
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
        email,
        phone,
        password: hashedPassword,
        dob: parsedDob,
        gender,
        role: body?.role ?? role
      }
    });

    // Remove the password before sending the response
    const { password: _, ...userWithoutPassword } = user; //eslint-disable-line

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
