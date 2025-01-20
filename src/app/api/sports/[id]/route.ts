import prisma from "@/lib/utils/prisma-client";
import { Sport } from "@prisma/client";
import { NextResponse } from "next/server";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const { id } = await params;

  try {
    const sport: Sport | null = await prisma.sport.findUnique({ where: { id } });

    if (!sport) {
      return NextResponse.json(
        { message: `Sport with ID ${id} not found.` },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: sport }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      {
        message: "Failed to fetch sport details.",
        error: error
      },
      { status: 500 }
    );
  }
}
