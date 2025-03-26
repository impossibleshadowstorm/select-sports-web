import { authenticate } from '@/middlewares/auth';
import { NextResponse } from 'next/server';
import prisma from '@/lib/utils/prisma-client';
import { AuthenticatedRequest } from '@/lib/utils/request-type';

export async function GET(req: AuthenticatedRequest) {
  return await authenticate(req, async () => {
    try {
      const { id } = req.user as { id: string };

      const walletData = await prisma.wallet.findUnique({
        where: { userId: id }
      });

      const transactions = await prisma.transaction.findMany({
        where: { userId: id },
        include: {
          razorpay: true,
          walletTxn: true
        }
      });

      return NextResponse.json(
        {
          message: 'Wallet Data Fetched successfully.',
          data: {
            wallet: walletData,
            transactions: transactions
          }
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
