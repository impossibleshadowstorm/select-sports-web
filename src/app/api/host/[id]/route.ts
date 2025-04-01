import { authenticate } from '../../../../middlewares/auth';
import { NextResponse } from 'next/server';
import prisma from '@/lib/utils/prisma-client';
import { AuthenticatedRequest } from '@/lib/utils/request-type';
import { parse } from 'url';

export async function GET(req: AuthenticatedRequest) {
  return await authenticate(req, async () => {
    try {
      // const { id } = req.user as { id: string }; // Explicitly type `req.user`
      // Fetch user data from the database
      const { pathname } = parse(req.url, true);
      const hostId = pathname?.split('/').pop();
      //   const host = await prisma.host.findUnique({
      //     where: { id: hostId },
      //     include: {
      //       user: {
      //         include: {
      //           address: true
      //         }
      //       }
      //     }
      //   });

      const host = await prisma.host.findUnique({
        where: { id: hostId },
        include: {
          user: {
            include: {
              address: true
            }
          },
          slots: {
            include: {
              team1: {
                include: {
                  users: true
                }
              },
              team2: {
                include: {
                  users: true
                }
              }
            }
          }
          //true // Fetch associated slots
        }
      });

      if (!host) {
        return NextResponse.json({ message: 'No Host Found' }, { status: 404 });
      }

      return NextResponse.json(
        {
          data: host
        },
        { status: 200 }
      );
    } catch (error: any) {
      return NextResponse.json(
        {
          message: 'Failed to retrieve hosts data',
          error: `Error: ${error.message}`
        },
        { status: 400 }
      );
    }
  });
}

export async function PATCH(req: AuthenticatedRequest) {
  return await authenticate(req, async () => {
    try {
      // const { id: userId } = req.user as { id: string }; // Get authenticated admin ID
      const body = await req.json(); // Parse request body
      const { pathname } = parse(req.url, true);
      const hostId = pathname?.split('/').pop();
      // Required fields
      const requiredFields = ['currentStatus', 'changeStatus'];

      for (const field of requiredFields) {
        if (!(field in body)) {
          return NextResponse.json(
            { message: `Missing required field: ${field}` },
            { status: 400 }
          );
        }
      }

      const existingHost = await prisma.host.findUnique({
        where: { id: hostId }
      });
      if (!existingHost) {
        return NextResponse.json(
          { message: 'Host does not exist' },
          { status: 400 }
        );
      }

      if (existingHost.status !== body.currentStatus) {
        return NextResponse.json(
          { message: "Current Status of host doesn't Match" },
          { status: 400 }
        );
      }

      const updateHost = await prisma.host.update({
        where: { id: hostId },
        data: { status: body.changeStatus }
      });

      return NextResponse.json(
        {
          message: `Host status changed successfully to ${body.changeStatus}`,
          data: updateHost
        },
        { status: 200 }
      );
    } catch (error: any) {
      return NextResponse.json(
        {
          message: 'Failed to register host',
          error: `Error: ${error.message}`
        },
        { status: 400 }
      );
    }
  });
}
