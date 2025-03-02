import { NextResponse } from 'next/server';
import { authenticate } from '@/middlewares/auth';
import { AuthenticatedRequest } from '@/lib/utils/request-type';
import { razorpay } from '@/lib/razorpay';
import crypto from 'crypto';
import { bookSlot } from '@/lib/utils/book-slot';
import { parse } from 'url';
import prisma from '@/lib/utils/prisma-client';

export async function POST(req: AuthenticatedRequest) {
  return await authenticate(req, async () => {
    try {
      const body = await req.json();
      const { id: userId } = req.user as { id: string };
      const { pathname } = parse(req.url, true);
      const razorpay_payment_id = pathname?.split('/').pop();
      const { razorpay_order_id, razorpay_signature, slotId, useWallet } = body;

      // Validate required fields
      if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        return NextResponse.json(
          { success: false, message: 'Missing required parameters.' },
          { status: 400 }
        );
      }

      const slot = await prisma.slot.findUnique({
        where: { id: slotId },
        include: { team1: true, team2: true, bookings: true }
      });

      if (!slot) {
        return NextResponse.json(
          { success: false, message: 'Slot not found.' },
          { status: 404 }
        );
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          email: true,
          phone: true,
          wallet: { select: { balance: true, id: true } }
        }
      });

      if (!user) {
        return NextResponse.json(
          { success: false, message: 'User not found.' },
          { status: 404 }
        );
      }

      const currentTime = new Date();
      const slotTime = new Date(slot.startTime);
      const timeDiffHours =
        (slotTime.getTime() - currentTime.getTime()) / (1000 * 60 * 60);
      if (timeDiffHours < 3) {
        return NextResponse.json(
          {
            success: false,
            message:
              'Booking must be made at least 3 hours before the slot starts.'
          },
          { status: 400 }
        );
      }

      // Check if the user has already booked this slot
      const existingBooking = await prisma.booking.findFirst({
        where: { userId, slotId, status: 'CONFIRMED' }
      });

      if (existingBooking) {
        return NextResponse.json(
          { success: false, message: 'You have already booked this slot.' },
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

      const slotPrice = slot.discountedPrice;
      const walletBalance = user.wallet?.balance ?? 0;
      const paidAmount: number = Number(payment.amount) / 100;

      if (useWallet) {
        if (walletBalance + paidAmount == slotPrice) {
          // Deduct slot price from wallet
          //Insert data for wallet transaction and razorpy transaction with appropriate data
          await prisma.$transaction(async (prisma) => {
            // Insert transaction
            const transaction = await prisma.transaction.create({
              data: {
                userId: userId,
                method: 'WALLET',
                amount: user.wallet!.balance,
                status: 'SUCCESS',
                currency: 'INR'
              }
            });

            // Insert wallet transaction
            const walletTransaction = await prisma.walletTransaction.create({
              data: {
                transactionId: transaction.id,
                walletId: user.wallet!.id, // Replace with actual wallet ID
                transactionType: 'DEBIT' // Adjust based on transaction type
              }
            });

            return { transaction, walletTransaction };
          });

          await prisma.$transaction(async (prisma) => {
            // Insert transaction
            const transaction = await prisma.transaction.create({
              data: {
                userId: userId,
                method: 'RAZORPAY',
                amount: paidAmount,
                status: 'SUCCESS',
                currency: 'INR'
              }
            });

            // Insert Razorpay transaction
            const razorpayTransaction = await prisma.razorpayTransaction.create(
              {
                data: {
                  transactionId: transaction.id,
                  razorpayOrderId: razorpay_order_id, // Replace with actual Razorpay order ID
                  razorpayPaymentId: razorpay_payment_id, // Replace with actual payment ID
                  razorpaySignature: razorpay_signature // Replace with actual signature
                }
              }
            );

            return { transaction, razorpayTransaction };
          });

          const wallet = await prisma.wallet.findUnique({
            where: { userId: userId },
            select: { balance: true }
          });

          if (!wallet || wallet.balance < walletBalance) {
            throw new Error('Insufficient balance');
          }

          await prisma.wallet.update({
            where: { userId: userId },
            data: { balance: { decrement: walletBalance } }
          });

          const bookingResponse = await bookSlot(userId, slotId);
          return NextResponse.json(bookingResponse, {
            status: bookingResponse.status
          });
        } else {
          // Insufficient wallet balance, calculate remaining balance
          return NextResponse.json(
            { message: 'Something went wrong please contact support team' },
            { status: 500 }
          );
        }
      }
      if (paidAmount == slotPrice) {
        //Insert data for wallet transaction and razorpy transaction with appropriate data
        await prisma.$transaction(async (prisma) => {
          // Insert transaction
          const transaction = await prisma.transaction.create({
            data: {
              userId: userId,
              method: 'RAZORPAY',
              amount: paidAmount,
              status: 'SUCCESS',
              currency: 'INR'
            }
          });

          // Insert Razorpay transaction
          const razorpayTransaction = await prisma.razorpayTransaction.create({
            data: {
              transactionId: transaction.id,
              razorpayOrderId: razorpay_order_id, // Replace with actual Razorpay order ID
              razorpayPaymentId: razorpay_payment_id, // Replace with actual payment ID
              razorpaySignature: razorpay_signature // Replace with actual signature
            }
          });

          return { transaction, razorpayTransaction };
        });
        const bookingResponse = await bookSlot(userId, slotId);
        return NextResponse.json(bookingResponse, {
          status: bookingResponse.status
        });
        // return NextResponse.json({message: 'Something went wrong please contact support team'}, { status: 200 });
      }

      //Booking user's requested slot
      // const bookingResponse = await bookSlot(userId, slotId);
      // return NextResponse.json(bookingResponse, { status: bookingResponse.status });

      return NextResponse.json(
        { message: 'Something went wrong please contact support team' },
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
