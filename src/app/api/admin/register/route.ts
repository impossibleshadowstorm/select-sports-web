import { authenticateAdmin } from '@/middlewares/auth';
import { validateRequiredFields } from '@/lib/utils/validator';
import { RegisterRequestBody } from '../../auth/register/route';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { Role } from '@prisma/client';
import { register } from '@/lib/utils/register-request';

export async function POST(req: NextRequest) {
  return await authenticateAdmin(req, async () => {
    const body: RegisterRequestBody = await req.json();

    // Define required fields
    const requiredFields = ['role'];

    // Validate fields
    const { isValid, missingFields } = validateRequiredFields(
      body,
      requiredFields
    );

    if (!isValid) {
      return NextResponse.json(
        {
          error: `The following fields are missing: ${missingFields.join(
            ', '
          )} while creating an Admin.`
        },
        { status: 400 }
      );
    }

    return register(body, Role.ADMIN);
  });
}
