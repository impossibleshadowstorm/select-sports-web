import { authenticateAdmin } from "@/middlewares/auth";
import { validateRequiredFields } from "@/lib/utils/validator";
import { register, RegisterRequestBody } from "../../auth/register/route";
import { NextResponse } from "next/server";
import { Role } from "@prisma/client";

// Types for the Request and Next function
interface Request {
  user?: any;
  json: () => Promise<any>;
}

export async function POST(req: Request) {
  return await authenticateAdmin(req, async () => {
    const body: RegisterRequestBody = await req.json();

    // Define required fields
    const requiredFields = ["role"];

    // Validate fields
    const { isValid, missingFields } = validateRequiredFields(
      body,
      requiredFields
    );

    if (!isValid) {
      return NextResponse.json(
        {
          error: `The following fields are missing: ${missingFields.join(
            ", "
          )} while creating an Admin.`,
        },
        { status: 400 }
      );
    }
    
    return register(body, Role.ADMIN);
  });
}
