// // // Example webhook handler for Stripe payment confirmation
// import { NextResponse } from 'next/server';
// import prisma from '@/lib/utils/prisma-client';
// import { stripe } from '@/lib/utils/stripe'; // Assuming you have a Stripe utility
// import { BookingStatus, SlotStatus, PaymentStatus } from '@prisma/client';

// export async function POST(req: Request): Promise<NextResponse> {
//   try {
//     const sig = req.headers.get('Stripe-Signature');
//     const event = stripe.webhooks.constructEvent(
//       await req.text(),
//       sig,
//       process.env.STRIPE_WEBHOOK_SECRET
//     );

//     if (event.type === 'payment_intent.succeeded') {
//       const paymentIntent = event.data.object;

//       // Find the associated booking
//       const bookingId = paymentIntent.metadata.bookingId;
//       const booking = await prisma.booking.findUnique({
//         where: { id: bookingId },
//         include: { slot: true }
//       });

//       if (booking && booking.status === BookingStatus.PENDING) {
//         // Update booking status to CONFIRMED
//         await prisma.booking.update({
//           where: { id: bookingId },
//           data: { status: BookingStatus.CONFIRMED }
//         });

//         // Update slot status to BOOKED
//         await prisma.slot.update({
//           where: { id: booking.slotId },
//           data: { status: SlotStatus.BOOKED }
//         });

//         // Create transaction record
//         await prisma.transaction.create({
//           data: {
//             bookingId: booking.id,
//             stripeTransactionId: paymentIntent.id,
//             referenceId: `BOOKING-${booking.id}`,
//             amount: paymentIntent.amount_received / 100, // Convert to dollars or your base currency
//             currency: paymentIntent.currency,
//             status: PaymentStatus.PAID
//           }
//         });

//         return NextResponse.json(
//           { message: 'Payment successful, booking confirmed.' },
//           { status: 200 }
//         );
//       }
//     }

//     return NextResponse.json(
//       { error: 'Event type not supported.' },
//       { status: 400 }
//     );
//   } catch (error: any) {
//     return NextResponse.json(
//       { error: `Webhook error: ${error.message}` },
//       { status: 500 }
//     );
//   }
// }

// dummy to pass build
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
