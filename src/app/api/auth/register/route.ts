import { NextResponse } from 'next/server';
import { Role, Gender } from '@prisma/client';
import { register } from '@/lib/utils/register-request';

// Type definitions
export interface RegisterRequestBody {
  name: string;
  email: string;
  password: string;
  phone: string;
  dob: string; // Expected Format: DD-MM-YYYY
  gender: Gender;
  role?: Role;
}

export interface RegisterResponse {
  message: string;
  data?: object;
  error?: string;
}

export async function POST(req: Request): Promise<NextResponse> {
  const body: RegisterRequestBody = await req.json();
  return register(body, Role.USER);
}
