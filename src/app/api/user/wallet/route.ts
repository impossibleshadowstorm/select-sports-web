import { authenticate } from '@/middlewares/auth';
import { NextResponse } from 'next/server';
import prisma from '@/lib/utils/prisma-client';
import { AuthenticatedRequest } from '@/lib/utils/request-type';

export async function GET(req: AuthenticatedRequest) {
  return await authenticate(req, async () => {
    try {
      const { id } = req.user as { id: string };

      const userWalletDetails = await prisma.wallet.findUnique({
        where: {
          userId: id
        },
        include: {
          transactions: {
            include: {
              transaction: {
                include: {
                  razorpay: true,
                  walletTxn: true
                }
              }
            }
          }
        }
      });

      return NextResponse.json(
        {
          message: 'Wallet Data Fetched successfully.',
          data: { userWalletDetails }
        },
        { status: 200 }
      );
    } catch (error: any) {
      return NextResponse.json(
        {
          message: 'Failed to add the address.',
          error: `Error: ${error.message}`
        },
        { status: 500 }
      );
    }
  });
}
