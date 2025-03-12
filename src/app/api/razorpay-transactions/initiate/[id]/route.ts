import prisma from '@/lib/utils/prisma-client';
import { NextResponse } from 'next/server';
import { authenticate } from '@/middlewares/auth';
import { AuthenticatedRequest } from '@/lib/utils/request-type';
import { parse } from 'url';
import { razorpay } from '@/lib/razorpay';
import { bookSlot } from '@/lib/utils/book-slot';

export async function POST(req: AuthenticatedRequest) {
  return await authenticate(req, async () => {
    try {
      const body = await req.json();
      const { useWallet } = body;
      const { id: userId } = req.user as { id: string };
      const { pathname } = parse(req.url, true);
      const slotId = pathname?.split('/').pop();
      if (!slotId) {
        return NextResponse.json(
          { success: false, message: 'Slot ID is required in the URL.' },
          { status: 400 }
        );
      }

      // Fetch slot details
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

      // Fetch user wallet balance
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          email: true,
          phone: true,
          wallet: { select: { balance: true, id: true } } // Fetch balance from Wallet table
        }
      });

      if (!user) {
        return NextResponse.json(
          { success: false, message: 'User not found.' },
          { status: 404 }
        );
      }

      const slotPrice = slot.discountedPrice;
      const walletBalance = user.wallet?.balance ?? 0;
      let amountToPay = slotPrice;

      if (useWallet) {
        if (walletBalance >= slotPrice) {
          // Sufficient wallet balance, book slot directly
          const wallet = await prisma.wallet.findUnique({
            where: { userId: userId },
            select: { balance: true }
          });

          if (!wallet || wallet.balance < slotPrice) {
            throw new Error('Insufficient balance');
          }

          await prisma.wallet.update({
            where: { userId: userId },
            data: { balance: { decrement: slotPrice } }
          });

          let transaction;
          await prisma.$transaction(async (prisma) => {
            // Insert transaction
            transaction = await prisma.transaction.create({
              data: {
                userId: userId,
                method: 'WALLET',
                amount: slotPrice,
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
          const bookingResponse = await bookSlot(
            userId,
            slotId,
            transaction!.id
          );
          return NextResponse.json(bookingResponse, {
            status: bookingResponse.status
          });
        } else {
          // Insufficient wallet balance, calculate remaining balance
          amountToPay = slotPrice - walletBalance;
        }
      }

      // Generate Razorpay order for the remaining balance (or full amount if useWallet is false)
      const razorpayOrder = await razorpay.orders.create({
        amount: amountToPay * 100, // Convert to paise
        currency: 'INR',
        receipt: `receipt_#123`, // Receipt length must be below 40 chars.
        payment_capture: true
      });

      if (useWallet) {
        return NextResponse.json(
          {
            success: false,
            message: `Insufficient wallet balance. Please pay the remaining amount ${amountToPay}.`,
            amountToPay: amountToPay,
            razorpayOptions: {
              key: process.env.RAZORPAY_KEY_ID as string,
              order_id: razorpayOrder.id,
              amount: amountToPay * 100,
              name: 'SELECT-SPORTS',
              description: `Payment for Slot #${slotId}`,
              prefill: { contact: user.phone, email: user.email },
              notes: {
                walletBalance: `User wallet balance is ₹${walletBalance}`,
                remainingAmount: `User has to pay ₹${amountToPay}`
              },
              external: { wallets: ['paytm'] }
            }
          },
          { status: 402 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          useWallet: useWallet,
          message: `Please pay the ${amountToPay} amount. To book slot`,
          amountToPay: amountToPay,
          razorpayOptions: {
            key: process.env.RAZORPAY_KEY_ID as string,
            order_id: razorpayOrder.id,
            amount: amountToPay * 100,
            name: 'SELECT-SPORTS',
            description: `Payment for Slot #${slotId}`,
            prefill: { contact: user.phone, email: user.email },
            notes: {
              walletBalance: `User wallet balance is ₹${walletBalance}`,
              remainingAmount: `User has to pay ₹${amountToPay}`
            },
            external: { wallets: ['paytm'] }
          }
        },
        { status: 402 }
      );
    } catch (error: any) {
      console.log(error);
      return NextResponse.json(
        { success: false, message: 'An error occurred.', error: error.message },
        { status: 500 }
      );
    }
  });
}
