import prisma from '@/lib/utils/prisma-client';
import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/middlewares/auth';
import { AuthenticatedRequest } from '@/lib/utils/request-type';
import { parse } from 'url';
import { razorpay } from '../../../../lib/razorpay';

export async function POST(req: AuthenticatedRequest) {
  return await authenticate(req, async () => {
    try {
      const { razorpay_payment_id } = await req.json();

      if (!razorpay_payment_id) {
        return NextResponse.json(
          { message: 'Missing payment ID.' },
          { status: 400 }
        );
      }

      // Fetch payment details from Razorpay
      const payment = await razorpay.payments.fetch(razorpay_payment_id);
      console.log(payment);

      if (payment.status === 'authorized') {
        // Capture the payment
        const captureResponse = await razorpay.payments.capture(
          razorpay_payment_id,
          payment.amount,
          payment.currency
        );

        if (captureResponse.status !== 'captured') {
          return NextResponse.json(
            { message: 'Payment capture failed.' },
            { status: 400 }
          );
        }
      }

      // Fetch payment again to confirm it's captured
      const verifiedPayment =
        await razorpay.payments.fetch(razorpay_payment_id);

      if (verifiedPayment.status !== 'captured') {
        return NextResponse.json(
          { message: 'Payment not successful.' },
          { status: 400 }
        );
      }

      return NextResponse.json(
        {
          success: true,
          message: 'Payment verified and booking confirmed.',
          payment: verifiedPayment
        },
        { status: 200 }
      );
    } catch (error: any) {
      return NextResponse.json(
        { message: 'Error verifying payment.', error: error.message },
        { status: 500 }
      );
    }
  });
}
