import { NextResponse } from 'next/server';
import { authenticate } from '@/middlewares/auth';
import { AuthenticatedRequest } from '@/lib/utils/request-type';
import { razorpay } from '@/lib/razorpay';
import crypto from 'crypto';

export async function POST(req: AuthenticatedRequest) {
  return await authenticate(req, async () => {
    try {
      const body = await req.json();
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
        body;

      // Validate required fields
      if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        return NextResponse.json(
          { success: false, message: 'Missing required parameters.' },
          { status: 400 }
        );
      }

      // Fetch payment details from Razorpay
      const payment = await razorpay.payments.fetch(razorpay_payment_id);
      if (!payment) {
        return NextResponse.json(
          { success: false, message: 'Payment not found.' },
          { status: 404 }
        );
      }

      // Generate expected signature
      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET as string)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');

      // Compare signatures
      if (expectedSignature !== razorpay_signature) {
        return NextResponse.json(
          {
            success: false,
            message: 'Invalid payment signature.',
            errorCode: 'INVALID_SIGNATURE'
          },
          { status: 401 }
        );
      }

      // Payment verification successful
      return NextResponse.json(
        {
          success: true,
          message: 'Payment verified successfully.',
          payment: {
            id: payment.id,
            status: payment.status,
            method: payment.method,
            amount: (Number(payment.amount) || 0) / 100, // Convert to rupees
            currency: payment.currency
          }
        },
        { status: 200 }
      );
    } catch (error: any) {
      return NextResponse.json(
        {
          success: false,
          message: 'Internal server error. Please try again later.',
          error: error.message
        },
        { status: 500 }
      );
    }
  });
}
