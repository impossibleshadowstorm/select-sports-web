import { Wallet } from 'lucide-react';
import prisma from './prisma-client';

interface RefundResponse {
  success: boolean;
  message: string;
  status: number;
  refundAmount?: number;
  refundPercentage?: number;
  bookingStatus?: string;
}

export async function refundToWallet(
  userId: string,
  refundAmount: number
): Promise<RefundResponse> {
  try {
    await prisma.$transaction(async (prisma) => {
      // Create refund transaction
      const refundTransaction = await prisma.transaction.create({
        data: {
          userId,
          amount: refundAmount,
          method: 'WALLET',
          status: 'REFUND_SUCCESSFUL'
        }
      });

      const userWallet = await prisma.user.findFirst({
        where: { id: userId }, // Fixed syntax
        include: { wallet: true } // Correct way to include related Wallet data
      });

      if (!userWallet || !userWallet.wallet) {
        throw new Error('Wallet not found for this user.');
      }
      // Insert wallet transaction
      await prisma.walletTransaction.create({
        data: {
          walletId: userWallet.wallet.id,
          transactionId: refundTransaction.id,
          transactionType: 'CREDIT'
        }
      });

      // Update wallet balance
      await prisma.wallet.update({
        where: { id: userWallet.wallet.id },
        data: { balance: { increment: refundAmount } }
      });
    });

    return {
      success: true,
      message: 'Booking cancelled successfully. Refund processed.',
      status: 200,
      refundAmount,
      bookingStatus: 'CANCELLED'
    };
  } catch (error: any) {
    return {
      success: false,
      message: error?.message || 'Error processing refund.',
      status: 500
    };
  }
}
