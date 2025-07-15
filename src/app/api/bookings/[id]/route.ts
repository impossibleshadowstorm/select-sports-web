// import prisma from '@/lib/utils/prisma-client';
// import { NextResponse } from 'next/server';
// import { authenticate } from '@/middlewares/auth';
// import { AuthenticatedRequest } from '@/lib/utils/request-type';
// import { parse } from 'url';

// export async function GET(req: AuthenticatedRequest) {
//   return await authenticate(req, async () => {
//     try {
//       const { id: userId } = req.user as { id: string };
//       const { pathname } = parse(req.url, true);
//       const bookingId = pathname?.split('/').pop();

//     //   const bookingData = await prisma.booking.findUnique({
//     //     where: { id: bookingId },
//     //     include: {
//     //       slot: {
//     //         include: {
//     //           venue: {
//     //             include: {
//     //               address: true,
//     //               sports: true,
//     //             }
//     //           },
//     //           sport: true,
//     //         }
//     //       },
//     //       user: true,
//     //       transaction: {
//     //         include: {
//     //           razorpay: true,
//     //           walletTxn: true,
//     //         }
//     //       }
//     //     }
//     //   });

//     // const team = await prisma.booking.findUnique({
//     //   where: { id: bookingId },
//     //   select: {
//     //     slot: {
//     //       select: {
//     //         team1: {
//     //           where: { users: { some: { id: userId } } }, // Check if user is in team1
//     //         },
//     //         team2: {
//     //           where: { users: { some: { id: userId } } }, // Check if user is in team2
//     //         }
//     //       }
//     //     }
//     //   }
//     // });

//     // const bookingData = await prisma.booking.findUnique({
//     //     where: { id: bookingId },
//     //     include: {
//     //       slot: {
//     //         include: {
//     //           venue: {
//     //             include: {
//     //               address: true, // Venue address
//     //               sports: true,  // Available sports at the venue
//     //             }
//     //           },
//     //           sport: true,  // Sport for the slot
//     //           team1: {
//     //             include: {
//     //               users: true  // Include all users in team1
//     //             }
//     //           },
//     //           team2: {
//     //             include: {
//     //               users: true  // Include all users in team2
//     //             }
//     //           }
//     //         }
//     //       },
//     //       user: true,  // User who booked
//     //       transaction: {
//     //         include: {
//     //           razorpay: true,
//     //           walletTxn: true,
//     //         }
//     //       }
//     //     }
//     //   });

//     //   // Determine the team the user belongs to
//     //   const userTeamData = bookingData?.slot?.team1?.users?.some(user => user.id === userId)
//     //     ? { team: bookingData.slot.team1 }
//     //     : bookingData?.slot?.team2?.users?.some(user => user.id === userId)
//     //     ? { team: bookingData.slot.team2 }
//     //     : { team: null };

//     //   // Final response
//     //   const responseData = {
//     //     ...bookingData,
//     //     team: userTeamData.team // Only includes team1 or team2, not both
//     //   };

//     //   console.log(responseData);

//     const bookingData = await prisma.booking.findUnique({
//         where: { id: bookingId },
//         include: {
//           slot: {
//             include: {
//               venue: {
//                 include: {
//                   address: true, // Venue address
//                   sports: true,  // Available sports at the venue
//                 }
//               },
//               sport: true,  // Sport for the slot
//               team1: {
//                 include: {
//                   users: true // Include all users in team1
//                 }
//               },
//               team2: {
//                 include: {
//                   users: true // Include all users in team2
//                 }
//               }
//             }
//           },
//           user: true, // User who booked
//           transaction: {
//             include: {
//               razorpay: true,
//               walletTxn: true,
//             }
//           }
//         }
//       });

//       // Determine which team the user belongs to
//       let userTeam = null;

//       if (bookingData?.slot?.team1?.users?.some(user => user.id === userId)) {
//         userTeam = { ...bookingData.slot.team1 }; // Send full team1 details
//       } else if (bookingData?.slot?.team2?.users?.some(user => user.id === userId)) {
//         userTeam = { ...bookingData.slot.team2 }; // Send full team2 details
//       }

//       // Remove both teams and only keep the relevant one
//       const { team1, team2, ...slotWithoutTeams } = bookingData!.slot;

//       // Final response
//       const responseData = {
//         ...bookingData,
//         slot: slotWithoutTeams, // Slot details without teams
//         team: userTeam // Only includes relevant team with its details
//       };

//       console.log(responseData);

//     //   const bookingDetails = await prisma.booking.findUnique({
//     //     where: { id: bookingId },
//     //     include: {
//     //       user: true,
//     //       slot: {
//     //         include: {
//     //           sport: true,
//     //           venue: {
//     //             include: { address: true },
//     //           },
//     //           host: {
//     //             include: { user: true },
//     //           }
//     //         },
//     //       },
//     //       teamAssignment: {  // Fetch the user's team details
//     //         include: { team: true },
//     //       },
//     //       transaction: {
//     //         include: {
//     //           razorpay: true,
//     //           walletTxn: true,
//     //         },
//     //       },
//     //     },
//     //   });

//       return NextResponse.json(
//         { success: true, message: 'Data fetched successfull', data: responseData},
//         { status: 200 }
//       );

//     } catch (error: any) {

//     //   console.log(error);
//       return NextResponse.json(
//         { success: false, message: 'An error occurred.', error: error },
//         { status: 500 }
//       );
//     }
//   });
// }
import { parse } from 'url';
import prisma from '@/lib/utils/prisma-client';
import { NextResponse } from 'next/server';
import { authenticate } from '@/middlewares/auth';
import { AuthenticatedRequest } from '@/lib/utils/request-type';
import { refundToWallet } from '@/lib/utils/refund-to-wallet';
import { sendMail } from '@/lib/utils/nodemailer-setup';
import { addNotification } from '@/lib/utils/add-notification';
import { formatDateTime } from '@/lib/utils/format-date';

export async function GET(req: AuthenticatedRequest) {
  return await authenticate(req, async () => {
    try {
      const { id: userId } = req.user as { id: string };
      const url = new URL(req.url); // Use URL class instead of parse()
      const bookingId = url.pathname.split('/').pop();

      if (!bookingId) {
        return NextResponse.json(
          { success: false, message: 'Invalid Booking ID' },
          { status: 400 }
        );
      }

      const bookingData = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: {
          slot: {
            include: {
              venue: {
                include: {
                  address: true,
                  sports: true
                }
              },
              sport: true,
              team1: { include: { users: true } },
              team2: { include: { users: true } }
            }
          },
          transaction: {
            include: {
              razorpay: true,
              walletTxn: true
            }
          }
        }
      });

      if (!bookingData) {
        return NextResponse.json(
          { success: false, message: 'Booking not found' },
          { status: 404 }
        );
      }

      // Determine which team the user belongs to
      let userTeam = null;
      if (bookingData.slot?.team1?.users?.some((user) => user.id === userId)) {
        userTeam = bookingData.slot.team1; // Assign directly
      } else if (
        bookingData.slot?.team2?.users?.some((user) => user.id === userId)
      ) {
        userTeam = bookingData.slot.team2;
      }

      // Remove both teams and only keep the relevant one
      const { team1, team2, ...slotWithoutTeams } = bookingData.slot; // eslint-disable-line

      const responseData = {
        ...bookingData,
        slot: slotWithoutTeams,
        team: userTeam // Only the relevant team
      };

      return NextResponse.json(
        {
          success: true,
          message: 'Data fetched successfully',
          data: responseData
        },
        { status: 200 }
      );
    } catch (error: any) {
      return NextResponse.json(
        { success: false, message: 'An error occurred.', error: error.message },
        { status: 500 }
      );
    }
  });
}

export async function PATCH(req: AuthenticatedRequest) {
  return await authenticate(req, async () => {
    try {
      const { id: userId } = req.user as { id: string };
      const { pathname } = parse(req.url, true);
      const bookingId = pathname?.split('/').pop();

      if (!bookingId) {
        return NextResponse.json(
          { message: 'Booking ID is required in the URL.' },
          { status: 400 }
        );
      }

      // Fetch booking details
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: { slot: true }
      });

      if (!booking) {
        return NextResponse.json(
          { message: 'Booking not found.' },
          { status: 404 }
        );
      }

      // Ensure booking belongs to the user and is active
      if (booking.userId !== userId || booking.status !== 'CONFIRMED') {
        return NextResponse.json(
          { message: 'No active booking found for this user.' },
          { status: 400 }
        );
      }

      // Fetch wallet details to get walletId
      const wallet = await prisma.wallet.findUnique({
        where: { userId }
      });

      if (!wallet) {
        return NextResponse.json(
          { message: 'Wallet not found for the user.' },
          { status: 400 }
        );
      }

      // Get current time & slot time
      const currentTime = new Date();
      const slotTime = new Date(booking.slot.startTime);
      const timeDifference =
        (slotTime.getTime() - currentTime.getTime()) / (1000 * 60 * 60);

      if (timeDifference < 6) {
        return NextResponse.json(
          { message: 'Cancellation is only allowed 6+ hours before the slot.' },
          { status: 400 }
        );
      }

      // Fetch transaction for this booking
      const transaction = await prisma.transaction.findFirst({
        where: { id: booking.transactionId as string, status: 'SUCCESS' }
      });

      if (!transaction) {
        return NextResponse.json(
          { message: 'No transaction found for this booking.' },
          { status: 400 }
        );
      }

      const slot = await prisma.slot.findFirst({
        where: { id: booking.slotId }
      });

      // Determine refund percentage
      let refundPercentage = timeDifference >= 12 ? 100 : 50;
      const refundAmount = (transaction.amount * refundPercentage) / 100;

      await prisma.$transaction(async (prisma) => {
        await prisma.booking.update({
          where: { id: bookingId },
          data: { status: 'CANCELLED' }
        });
        // Remove user from team
        let teamToDisconnect = null;

        if (slot!.team1Id) {
          const isUserInTeam1 = await prisma.team.findFirst({
            where: { id: slot!.team1Id, users: { some: { id: userId } } }
          });
          if (isUserInTeam1) teamToDisconnect = slot!.team1Id;
        }

        if (!teamToDisconnect && slot!.team2Id) {
          const isUserInTeam2 = await prisma.team.findFirst({
            where: { id: slot!.team2Id, users: { some: { id: userId } } }
          });
          if (isUserInTeam2) teamToDisconnect = slot!.team2Id;
        }

        if (teamToDisconnect) {
          await prisma.team.update({
            where: { id: teamToDisconnect },
            data: { users: { disconnect: { id: userId } } }
          });
        }
        // Mark original transaction as refunded
        await prisma.transaction.update({
          where: { id: booking.transactionId as string },
          data: { status: 'REFUND_SUCCESSFUL', updatedAt: new Date() }
        });
      });

      const cancelResponse = await refundToWallet(userId, refundAmount);

      const user = await prisma.user.findUnique({
        where: { id: userId }
      });
      await sendMail({
        to: user?.email as string,
        subject: `Cancellation & Refund Confirmation for Slot #${bookingId.substring(0, 7)}`,
        text: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <title>Booking Cancelled</title>
      </head>
      <body style="font-family: Arial, sans-serif; background-color: #f4f6f9; margin: 0; padding: 0;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f6f9; padding: 40px 0;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; padding: 40px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                <tr>
                  <td style="text-align: center; padding-bottom: 30px;">
                    <h2 style="color: #d9534f;">Booking Cancelled</h2>
                    <p style="color: #333333; font-size: 16px;">Your booking with <strong>SelectSportss.com</strong> has been successfully cancelled.</p>
                  </td>
                </tr>
                <tr>
                  <td>
                    <p style="font-size: 15px; color: #333333;"><strong>Dear ${user?.name},</strong></p>
                    <p style="font-size: 15px; color: #555555; line-height: 1.6;">
                      We’re writing to confirm that your booking for <strong>slot #${bookingId.substring(0, 7)}</strong> has been cancelled as per your request.
                    </p>
      
                    <h3 style="color: #333333; margin-top: 30px;">Cancellation Summary:</h3>
                    <ul style="font-size: 15px; color: #555555; line-height: 1.6;">
                      <li><strong>Booking ID:</strong> ${booking.id}</li>
                      <li><strong>Status:</strong> Cancelled</li>
                    </ul>
      
                    <h3 style="color: #333333; margin-top: 30px;">Refund Details:</h3>
                    <ul style="font-size: 15px; color: #555555; line-height: 1.6;">
                      <li><strong>Amount Refunded:</strong> ₹${refundAmount}</li>
                      <li><strong>Transaction ID:</strong> ${booking.transactionId?.substring(0, 7)}</li>
                      <li><strong>Refund Status:</strong> Successful</li>
                      <li><strong>Refund Method:</strong> Wallet</li>
                    </ul>
      
                    <p style="font-size: 15px; color: #555555; margin-top: 30px;">
                      The refunded amount has been successfully credited back to your wallet. You can use it for future bookings at your convenience.
                    </p>
      
                    <p style="font-size: 15px; color: #555555;">
                      If you have any questions or require assistance, feel free to reach out to our support team.
                    </p>
      
                    <p style="font-size: 15px; color: #555555;">
                      Best regards,<br/>
                      <strong>The SelectSportss.com Team</strong>
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="text-align: center; padding-top: 40px; font-size: 13px; color: #999999;">
                    © ${new Date().getFullYear()} SelectSportss.com — All Rights Reserved.
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
      `
      });

      await addNotification({
        title: 'Slot Cancellation',
        message: `Your booking on Selectsports platform for slot ${formatDateTime(booking.slot.startTime)} is cancelled.`,
        type: 'SYSTEM', // type (example: SYSTEM or whatever your NotificationType enum expects)
        target: 'SPECIFIC_USER',
        userId: userId // userId (optional depending on target)
      });

      return NextResponse.json(cancelResponse, {
        status: cancelResponse.status
      });

      // // Perform database transactions atomically
      // await prisma.$transaction(async (prisma) => {
      //   await prisma.booking.update({
      //     where: { id: bookingId },
      //     data: { status: 'CANCELLED' }
      //   });

      //   // Create refund transaction
      //   const refundTransaction = await prisma.transaction.create({
      //     data: {
      //       userId,
      //       amount: refundAmount,
      //       currency: transaction.currency,
      //       method: 'WALLET',
      //       status: 'SUCCESS',
      //     }
      //   });

      //   // Insert wallet transaction with walletId
      //   await prisma.walletTransaction.create({
      //     data: {
      //       walletId: wallet.id, // Linking the wallet ID
      //       transactionId: refundTransaction.id,
      //       transactionType: 'CREDIT',
      //     }
      //   });

      //   // Update wallet balance
      //   await prisma.wallet.update({
      //     where: { id: wallet.id },
      //     data: { balance: { increment: refundAmount } }
      //   });

      //   // Mark original transaction as refunded
      //   await prisma.transaction.update({
      //     where: { id: transaction.id },
      //     data: { status: 'REFUND_SUCCESSFUL', updatedAt: new Date() }
      //   });
      // });

      return NextResponse.json(
        {
          success: true,
          message: 'Booking cancelled successfully. Refund processed.',
          refundAmount,
          refundPercentage,
          bookingStatus: 'CANCELLED'
        },
        { status: 200 }
      );
    } catch (error: any) {
      return NextResponse.json(
        {
          message: 'An error occurred.',
          error: error?.message || 'Unknown error'
        },
        { status: 500 }
      );
    }
  });
}
