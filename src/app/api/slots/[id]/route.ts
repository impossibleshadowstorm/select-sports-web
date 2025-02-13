import { authenticate } from '@/middlewares/auth';
import prisma from '@/lib/utils/prisma-client';
import { NextResponse } from 'next/server';
import { AuthenticatedRequest } from '@/lib/utils/request-type';
import { parse } from 'url';

export async function POST(req: AuthenticatedRequest) {
  return await authenticate(req, async () => {
    try {
      const { id: userId } = req.user as { id: string };
      const { pathname } = parse(req.url, true);
      const slotId = pathname?.split('/').pop();

      if (!slotId) {
        return NextResponse.json(
          { message: 'Slot ID is required in the URL.' },
          { status: 400 }
        );
      }

      // Fetch the slot details
      const slot = await prisma.slot.findUnique({
        where: { id: slotId },
        include: { team1: true, team2: true, bookings: true }
      });

      if (!slot) {
        return NextResponse.json(
          { message: 'Slot not found.' },
          { status: 404 }
        );
      }

      // Count players in each team
      const team1Count = slot.team1Id
        ? await prisma.user.count({
            where: { teams: { some: { id: slot.team1Id } } }
          })
        : 0;

      const team2Count = slot.team1Id
        ? await prisma.user.count({
            where: { teams: { some: { id: slot.team1Id } } }
          })
        : 0;

      console.log('Team1 count:', team1Count);
      console.log('Team2 count:', team2Count);

      const totalPlayers = team1Count + team2Count;

      // Check if slot is full
      if (totalPlayers >= slot.maxPlayer) {
        return NextResponse.json(
          {
            success: false,
            message:
              'Slot is full. Your pay amount will be refunded in App Wallet in 2-3 working days.',
            bookingStatus: 'CANCELLED'
          },
          { status: 400 }
        );
      }

      // Check if the user has already booked this slot
      //   const existingBooking = await prisma.booking.findFirst({
      //     where: { userId, slotId }
      //   });

      //   if (existingBooking) {
      //     return NextResponse.json(
      //       { message: "You have already booked this slot." },
      //       { status: 400 }
      //     );
      //   }

      // **Round-robin logic for fair distribution**
      let assignedTeamId = null;

      if (!slot.team1Id) {
        assignedTeamId = slot.team1?.id; // If team1 doesn't exist, assign user to it
      } else if (!slot.team2Id) {
        assignedTeamId = slot.team2?.id; // If team2 doesn't exist, assign user to it
      } else if (team1Count < team2Count) {
        assignedTeamId = slot.team1Id; // Assign to team1 if team1 has fewer players
      } else if (team2Count < team1Count) {
        assignedTeamId = slot.team2Id; // Assign to team2 if team2 has fewer players
      } else {
        // **Round-robin tiebreaker (alternate between team1 & team2)**
        assignedTeamId = totalPlayers % 2 === 0 ? slot.team1Id : slot.team2Id;
      }

      // Create new booking
      const booking = await prisma.booking.create({
        data: {
          status: 'CONFIRMED',
          slotId,
          userId
        }
      });

      // Assign user to the chosen team
      await prisma.user.update({
        where: { id: userId },
        data: { teams: { connect: { id: assignedTeamId } } }
      });

      // Update user's bookings
      await prisma.user.update({
        where: { id: userId },
        data: { bookings: { connect: { id: booking.id } } }
      });

      return NextResponse.json(
        {
          success: true,
          message: 'Booking successful',
          bookingId: booking.id,
          assignedTeam: assignedTeamId === slot.team1Id ? 'team1' : 'team2'
        },
        { status: 201 }
      );
    } catch (error: any) {
      return NextResponse.json(
        { message: 'An error occurred.', error: error.message },
        { status: 500 }
      );
    }
  });
}

// import { authenticate } from '@/middlewares/auth';
// import prisma from '@/lib/utils/prisma-client';
// import { NextResponse } from 'next/server';
// import { AuthenticatedRequest } from '@/lib/utils/request-type';
// import { parse } from 'url';

// export async function POST(req: AuthenticatedRequest) {
//   return await authenticate(req, async () => {
//     try {
//       const { id: userId } = req.user as { id: string };
//       const { pathname } = parse(req.url, true);
//       const slotId = pathname?.split('/').pop();

//       if (!slotId) {
//         return NextResponse.json(
//           { message: "Slot ID is required in the URL." },
//           { status: 400 }
//         );
//       }

//       // Fetch the slot details with teams and bookings
//       const slot = await prisma.slot.findUnique({
//         where: { id: slotId },
//         include: { team1: true, team2: true, bookings: true }
//       });

//       if (!slot) {
//         return NextResponse.json(
//           { message: "Slot not found." },
//           { status: 404 }
//         );
//       }

//       // Count total players in each team
//       const team1Count = slot.team1Id
//         ? await prisma.user.count({
//             where: { teams: { some: { id: slot.team1Id } } }
//           })
//         : 0;

//       const team2Count = slot.team2Id
//         ? await prisma.user.count({
//             where: { teams: { some: { id: slot.team2Id } } }
//           })
//         : 0;

//       console.log("Team1 count:", team1Count);
//       console.log("Team2 count:", team2Count);

//       const totalPlayers = team1Count + team2Count;

//       // If slot is full, return cancellation message
//       if (totalPlayers >= slot.maxPlayer) {
//         return NextResponse.json(
//           {
//             success: false,
//             message: "Slot is full. Your pay amount will be refunded in App Wallet in 2-3 working days.",
//             bookingStatus: "CANCELLED"
//           },
//           { status: 400 }
//         );
//       }

//       // Check if the user has already booked this slot
//     //   const existingBooking = await prisma.booking.findFirst({
//     //     where: { userId, slotId }
//     //   });

//     //   if (existingBooking) {
//     //     return NextResponse.json(
//     //       { message: "You have already booked this slot." },
//     //       { status: 400 }
//     //     );
//     //   }

//       // Determine team assignment
//       let assignedTeamId = null;

//       if (!slot.team1Id) {
//         assignedTeamId = slot.team1?.id; // If team1 doesn't exist, assign user to it
//       } else if (!slot.team2Id) {
//         assignedTeamId = slot.team2?.id; // If team2 doesn't exist, assign user to it
//       } else if (team1Count < team2Count) {
//         assignedTeamId = slot.team1Id; // Assign to team1 if team1 has fewer players
//       } else {
//         assignedTeamId = slot.team2Id; // Assign to team2 otherwise
//       }

//       // Create new booking
//       const booking = await prisma.booking.create({
//         data: {
//           status: "CONFIRMED",
//           slotId,
//           userId
//         }
//       });

//       // Assign user to the chosen team
//       await prisma.user.update({
//         where: { id: userId },
//         data: { teams: { connect: { id: assignedTeamId } } }
//       });

//       // Update user's bookings
//       await prisma.user.update({
//         where: { id: userId },
//         data: { bookings: { connect: { id: booking.id } } }
//       });

//       return NextResponse.json(
//         {
//           success: true,
//           message: "Booking successful",
//           bookingId: booking.id,
//           assignedTeam: assignedTeamId === slot.team1Id ? "team1" : "team2"
//         },
//         { status: 201 }
//       );
//     } catch (error: any) {
//       return NextResponse.json(
//         { message: "An error occurred.", error: error.message },
//         { status: 500 }
//       );
//     }
//   });
// }

// import { authenticate } from '@/middlewares/auth';
// import prisma from '@/lib/utils/prisma-client';
// import { NextResponse } from 'next/server';
// import { AuthenticatedRequest } from '@/lib/utils/request-type';
// import { parse } from 'url';

// export async function POST(req: AuthenticatedRequest) {
//   return await authenticate(req, async () => {
//     try {
//       const { id: userId } = req.user as { id: string };
//       const { pathname } = parse(req.url, true); // Use `parse(req.url)` to extract the path
//       const slotId = pathname?.split('/').pop(); // Get the last part of the path

//       if (!slotId) {
//         return NextResponse.json(
//           { message: "Slot ID is required in the URL." },
//           { status: 400 }
//         );
//       }

//       // Fetch the slot details along with teams and bookings
//       const slot = await prisma.slot.findUnique({
//         where: { id: slotId },
//         include: { team1: true, team2: true, bookings: true }
//       });

//       if (!slot) {
//         return NextResponse.json(
//           { message: "Slot not found." },
//           { status: 404 }
//         );
//       }

//       // Count players in each team
//       const team1Count = slot.team1Id
//         ? await prisma.user.count({
//             where: { teams: { some: { id: slot.team1Id } } }
//           })
//         : 0;

//       const team2Count = slot.team2Id
//         ? await prisma.user.count({
//             where: { teams: { some: { id: slot.team2Id } } }
//           })
//         : 0;
//           console.log("team1-",team1Count)
//           console.log("team2-",team2Count)
//       if (team1Count >= slot.maxPlayer && team2Count >= slot.maxPlayer) {
//         return NextResponse.json(
//           {
//             success: false,
//             message: "Slot is full. Your pay amount will be refunded in 2-3 working days.",
//             bookingStatus: "CANCELLED"
//           },
//           { status: 400 }
//         );
//       }

//       // Determine which team has fewer players and assign user
//       let assignedTeamId = slot.team1Id;
//       if (team1Count > team2Count) {
//         assignedTeamId = slot.team2Id;
//       } else if (!slot.team1Id) {
//         assignedTeamId = slot.team1?.id;
//       } else if (!slot.team2Id) {
//         assignedTeamId = slot.team2?.id;
//       }

//       if (!assignedTeamId) {
//         return NextResponse.json(
//           { message: "No available teams to join." },
//           { status: 400 }
//         );
//       }

//       // Create new booking
//       const booking = await prisma.booking.create({
//         data: {
//           status: "CONFIRMED",
//           slotId,
//           userId
//         }
//       });

//       // Assign user to team
//       await prisma.user.update({
//         where: { id: userId },
//         data: { teams: { connect: { id: assignedTeamId } } }
//       });

//       return NextResponse.json(
//         {
//           success: true,
//           message: "Booking successful",
//           bookingId: booking.id,
//           assignedTeam: assignedTeamId === slot.team1Id ? "team1" : "team2"
//         },
//         { status: 201 }
//       );
//     } catch (error: any) {
//       return NextResponse.json(
//         { message: "An error occurred.", error: error.message },
//         { status: 500 }
//       );
//     }
//   });
// }

// import { authenticate } from '@/middlewares/auth';
// import prisma from '@/lib/utils/prisma-client';
// import { NextResponse } from 'next/server';
// import { AuthenticatedRequest } from '@/lib/utils/request-type';

// export async function POST(req: AuthenticatedRequest) {
//   return await authenticate(req, async () => {
//     try {
//       const { id: userId } = req.user as { id: string };

//       // ✅ Extract slot ID correctly
//       const slotId = req.nextUrl.searchParams.get("slotId");
//       if (!slotId) {
//         return NextResponse.json(
//           { message: "Slot ID is required in the URL." },
//           { status: 400 }
//         );
//       }

//       // Fetch the slot details along with teams and bookings
//       const slot = await prisma.slot.findUnique({
//         where: { id: slotId },
//         include: { team1: true, team2: true, bookings: true }
//       });

//       if (!slot) {
//         return NextResponse.json(
//           { message: "Slot not found." },
//           { status: 404 }
//         );
//       }

//       // Count players in each team
//       const team1Count = slot.team1Id
//         ? await prisma.user.count({
//             where: { teams: { some: { id: slot.team1Id } } }
//           })
//         : 0;

//       const team2Count = slot.team2Id
//         ? await prisma.user.count({
//             where: { teams: { some: { id: slot.team2Id } } }
//           })
//         : 0;

//       // ✅ Check if slot is full
//       if (team1Count >= slot.maxPlayer && team2Count >= slot.maxPlayer) {
//         return NextResponse.json(
//           {
//             success: false,
//             message: "Slot is full. Your payment will be refunded in 2-3 working days.",
//             bookingStatus: "CANCELLED"
//           },
//           { status: 400 }
//         );
//       }

//       let assignedTeamId = null;

//       // ✅ Assign user to the team with fewer players
//       if (team1Count < slot.maxPlayer) {
//         assignedTeamId = slot.team1Id;
//       } else if (team2Count < slot.maxPlayer) {
//         assignedTeamId = slot.team2Id;
//       } else {
//         return NextResponse.json(
//           { message: "No available teams to join." },
//           { status: 400 }
//         );
//       }

//       // ✅ Create new booking
//       const booking = await prisma.booking.create({
//         data: {
//           status: "CONFIRMED",
//           slotId,
//           userId
//         }
//       });

//       // ✅ Assign user to the selected team
//       await prisma.user.update({
//         where: { id: userId },
//         data: {
//           teams: {
//             connect: { id: assignedTeamId }
//           }
//         }
//       });

//       return NextResponse.json(
//         {
//           success: true,
//           message: "Booking successful",
//           bookingId: booking.id,
//           assignedTeam: assignedTeamId === slot.team1Id ? "team1" : "team2"
//         },
//         { status: 201 }
//       );
//     } catch (error: any) {
//       return NextResponse.json(
//         { message: "An error occurred.", error: error.message },
//         { status: 500 }
//       );
//     }
//   });
// }

// Book slot with post request
// assign team to user
// logic: check slot's team1 and team2's user count
// assign to the team having lowest user
// or in case of equal assign to team1 directly

// import { authenticate } from '@/middlewares/auth';
// import prisma from '@/lib/utils/prisma-client';
// import { NextResponse } from 'next/server';
// import { AuthenticatedRequest } from '@/lib/utils/request-type';

// export async function POST(req: AuthenticatedRequest) {
//   return await authenticate(req, async () => {
//     try {
//       const { id: userId } = req.user as { id: string };

//       // ✅ Extract slot ID from the URL
//       const slotId = req.nextUrl.pathname.split('/').pop();

//       if (!slotId) {
//         return NextResponse.json(
//           { message: "Slot ID is required in the URL." },
//           { status: 400 }
//         );
//       }

//       // Fetch the slot details along with teams and bookings
//       const slot = await prisma.slot.findUnique({
//         where: { id: slotId },
//         include: { team1: true, team2: true, bookings: true }
//       });
//       console.log(slot)
//       if (!slot) {
//         return NextResponse.json(
//           { message: "Slot not found." },
//           { status: 404 }
//         );
//       }

//       // Count players in each team
//       const team1Count = slot.team1Id
//   ? await prisma.user.count({
//       where: { teams: { some: { id: slot.team1Id } } }  // ✅ Uses relation filter
//     })
//   : 0;

// const team2Count = slot.team2Id
//   ? await prisma.user.count({
//       where: { teams: { some: { id: slot.team2Id } } }  // ✅ Uses relation filter
//     })
//   : 0;

//       if (team1Count >= slot.maxPlayer && team2Count >= slot.maxPlayer) {
//         return NextResponse.json(
//           {
//             success: false,
//             message: "Slot is full. Your pay amount will be refunded in 2-3 working days.",
//             bookingStatus: "CANCELLED"
//           },
//           { status: 400 }
//         );
//       }

//       // Determine which team has fewer players and assign user
//       let assignedTeamId = slot.team1Id;
//       if (team1Count > team2Count) {
//         assignedTeamId = slot.team2Id;
//       } else if (!slot.team1Id) {
//         assignedTeamId = slot.team1?.id;
//       } else if (!slot.team2Id) {
//         assignedTeamId = slot.team2?.id;
//       }

//       if (!assignedTeamId) {
//         return NextResponse.json(
//           { message: "No available teams to join." },
//           { status: 400 }
//         );
//       }

//       // Create new booking
//       const booking = await prisma.booking.create({
//         data: {
//           status: "CONFIRMED",
//           slotId,
//           userId
//         }
//       });

//       // Assign user to team
//       await prisma.user.update({
//         where: { id: userId },
//         data: { teamId: assignedTeamId }
//       });

//       return NextResponse.json(
//         {
//           success: true,
//           message: "Booking successful",
//           bookingId: booking.id,
//           assignedTeam: assignedTeamId === slot.team1Id ? "team1" : "team2"
//         },
//         { status: 201 }
//       );
//     } catch (error: any) {
//       return NextResponse.json(
//         { message: "An error occurred.", error: error.message },
//         { status: 500 }
//       );
//     }
//   });
// }

// export async function POST(
//   req: AuthenticatedRequest,
//   { params }: { params: { slotId: string } }
// ) {
//   return await authenticate(req, async () => {
//     try {
//       const { id: userId } = req.user as { id: string }; // Get user ID from token
//       const { slotId } = params; // Get slot ID from request params

//       if (!slotId) {
//         return NextResponse.json(
//           { message: "Slot ID is required in the URL." },
//           { status: 400 }
//         );
//       }

//       // Fetch the slot along with team1 and team2
//       const slot = await prisma.slot.findUnique({
//         where: { id: slotId },
//         include: {
//           team1: { include: { users: true } },
//           team2: { include: { users: true } }
//         }
//       });

//       if (!slot) {
//         return NextResponse.json(
//           { message: "Slot not found" },
//           { status: 404 }
//         );
//       }

//       // Get total players in each team
//       const totalTeam1 = slot.team1 ? slot.team1.users.length : 0;
//       const totalTeam2 = slot.team2 ? slot.team2.users.length : 0;
//       const totalPlayers = totalTeam1 + totalTeam2;

//       // Check if the slot is full
//       if (totalPlayers >= slot.maxPlayer) {
//         return NextResponse.json(
//           {
//             success: false,
//             message:
//               "Slot is full. Your pay amount will be refunded in 2-3 working days.",
//             bookingStatus: "CANCELLED"
//           },
//           { status: 400 }
//         );
//       }

//       // Determine the team with fewer players
//       let assignedTeam: "team1" | "team2";
//       let teamToJoinId: string | null = null;

//       if (totalTeam1 <= totalTeam2) {
//         assignedTeam = "team1";
//         teamToJoinId = slot.team1Id;
//       } else {
//         assignedTeam = "team2";
//         teamToJoinId = slot.team2Id;
//       }

//       if (!teamToJoinId) {
//         return NextResponse.json(
//           { message: `No available team to join.` },
//           { status: 400 }
//         );
//       }

//       // Insert new booking
//       const newBooking = await prisma.booking.create({
//         data: {
//           userId,
//           slotId,
//           status: "CONFIRMED"
//         }
//       });

//       // Add the user to the assigned team
//       await prisma.team.update({
//         where: { id: teamToJoinId },
//         data: {
//           users: {
//             connect: { id: userId }
//           }
//         }
//       });

//       return NextResponse.json(
//         {
//           success: true,
//           message: "Booking successful",
//           bookingId: newBooking.id,
//           assignedTeam
//         },
//         { status: 200 }
//       );
//     } catch (error: any) {
//       return NextResponse.json(
//         { message: "Failed to book slot", error: error.message },
//         { status: 500 }
//       );
//     }
//   });
// }

// export async function POST(
//   req: AuthenticatedRequest,
//   { params }: { params: { id: string } }
// ) {
//   return await authenticate(req, async () => {
//     try {
//       const { id: userId } = req.user as { id: string }; // Get user ID from token
//       const { id } = params; // Get slot ID from request params

//       if (!id) {
//         return NextResponse.json(
//           { message: "Slot ID is required in the URL." },
//           { status: 400 }
//         );
//       }

//       // Fetch slot details
//       const slot = await prisma.slot.findUnique({
//         where: { id: id }
//       });

//       if (!slot) {
//         return NextResponse.json(
//           { message: "Slot not found" },
//           { status: 404 }
//         );
//       }

//       // Calculate total players in each team
//       const totalTeam1 = slot.team1.length;
//       const totalTeam2 = slot.team2.length;
//       const totalPlayers = totalTeam1 + totalTeam2;

//       // Check if the slot is full
//       if (totalPlayers >= slot.maxPlayers) {
//         return NextResponse.json(
//           {
//             success: false,
//             message:
//               "Slot is full. Your pay amount will be refunded in 2-3 working days.",
//             bookingStatus: "CANCELLED"
//           },
//           { status: 400 }
//         );
//       }

//       // Determine the team with fewer players
//       let updatedTeam1 = slot.team1;
//       let updatedTeam2 = slot.team2;
//       let assignedTeam = "";

//       if (totalTeam1 <= totalTeam2) {
//         updatedTeam1.push(userId);
//         assignedTeam = "team1";
//       } else {
//         updatedTeam2.push(userId);
//         assignedTeam = "team2";
//       }

//       // Insert new booking
//       const newBooking = await prisma.booking.create({
//         data: {
//           userId,
//           id,
//           status: "CONFIRMED"
//         }
//       });

//       // Update slot with the new user in the assigned team
//       await prisma.slot.update({
//         where: { id: id },
//         data: {
//           team1: updatedTeam1,
//           team2: updatedTeam2
//         }
//       });

//       // Add booking to the user's bookings
//       await prisma.user.update({
//         where: { id: userId },
//         data: {
//           bookings: {
//             connect: { id: newBooking.id }
//           }
//         }
//       });

//       return NextResponse.json(
//         {
//           success: true,
//           message: "Booking successful",
//           bookingId: newBooking.id,
//           assignedTeam
//         },
//         { status: 200 }
//       );
//     } catch (error: any) {
//       return NextResponse.json(
//         { message: "Failed to book slot", error: error.message },
//         { status: 500 }
//       );
//     }
//   });
// }

// Cancel slot with patch request
// remove the user from that team
// if current time is greater than 6 hours then only he can cancel the booking.
// if current time is greater then 12 hours then only complete refund else 50% deduction.
// update the status as cancelled.
