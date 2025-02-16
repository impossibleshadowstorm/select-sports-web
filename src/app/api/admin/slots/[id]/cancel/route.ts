// Cancellation slot post id params

import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    return NextResponse.json({ success: true, message: `Slot cancelled.` });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Something went wrong' },
      { status: 500 }
    );
  }
}
