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

import prisma from '@/lib/utils/prisma-client';
import { NextResponse } from 'next/server';
import { authenticate } from '@/middlewares/auth';
import { AuthenticatedRequest } from '@/lib/utils/request-type';

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
