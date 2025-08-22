import { HttpException, Inject, Injectable } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { PrismaService } from '../../common/prisma.service';
import { Payment, User } from '@prisma/client';
import {
  CreatePaymentsRequest,
  PaymentsResponse,
  XenditWebhookRequest,
} from '../../model/payments.model';
import { Decimal } from '@prisma/client/runtime/library';
import { XenditService } from '../../xendit/xendit.service';
import { RawBodyRequest } from '@nestjs/common';

@Injectable()
export class PaymentsService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
    private prismaService: PrismaService,
    private xenditService: XenditService,
  ) {}

  toPaymentsResponse(payment: Payment): PaymentsResponse {
    return {
      id: payment.id,
      booking_reference: payment.booking_reference,
      payment_method: payment.payment_method,
      payment_status: payment.payment_status,
      payment_date: payment.payment_date,
      amount: new Decimal(payment.amount).toNumber(),
      xendit_invoice_id: payment.xendit_invoice_id,
      xendit_payment_id: payment.xendit_payment_id,
      payment_url: payment.payment_url,
    };
  }

  async createPayment(
    user: User,
    request: CreatePaymentsRequest,
  ): Promise<PaymentsResponse> {
    this.logger.debug(
      `Creating payment for user: ${user.id}, booking: ${request.booking_reference}`,
    );

    const tickets = await this.prismaService.ticket.findMany({
      where: {
        booking_reference: request.booking_reference,
        user_id: user.id,
      },
    });

    if (tickets.length === 0) {
      throw new HttpException('Booking not found or not owned by user', 404);
    }

    const bookingReference = request.booking_reference;

    const existingPayment = await this.prismaService.payment.findFirst({
      where: { booking_reference: bookingReference },
    });

    if (existingPayment) {
      return this.toPaymentsResponse(existingPayment);
    }

    const payment = await this.prismaService.payment.create({
      data: {
        booking_reference: bookingReference,
        payment_method: request.payment_method,
        payment_status: 'pending',
        payment_date: new Date(),
        amount: request.amount,
      },
    });

    return this.toPaymentsResponse(payment);
  }

  async getPaymentByBookingRef(
    bookingReference: string,
  ): Promise<PaymentsResponse> {
    const payment = await this.prismaService.payment.findFirst({
      where: { booking_reference: bookingReference },
    });

    if (!payment) {
      throw new HttpException('Payment not found', 404);
    }

    return this.toPaymentsResponse(payment);
  }

  async list(user: User): Promise<PaymentsResponse[]> {
    const payments = await this.prismaService.payment.findMany({
      where: {
        booking_reference: {
          in: await this.getUserBookingReferences(user.id),
        },
      },
    });

    return payments.map((payment) => this.toPaymentsResponse(payment));
  }

  private async getUserBookingReferences(userId: number): Promise<string[]> {
    const tickets = await this.prismaService.ticket.findMany({
      where: { user_id: userId },
      select: { booking_reference: true },
      distinct: ['booking_reference'],
    });

    return tickets.map((ticket) => ticket.booking_reference);
  }

  async handleXenditWebhook(
    req: RawBodyRequest<Request>,
    signature: string,
    webhookData: XenditWebhookRequest,
  ): Promise<{ success: boolean; message: string; data?: any }> {
    this.logger.info('=== XENDIT WEBHOOK RECEIVED ===');
    this.logger.info(`Webhook data: ${JSON.stringify(webhookData, null, 2)}`);
    this.logger.info('===============================');

    try {
      const isDevelopment = process.env.NODE_ENV === 'development';
      if (!isDevelopment) {
        const rawBody = req.rawBody?.toString() || JSON.stringify(webhookData);
        const isValid = this.xenditService.verifyWebhookSignature(
          rawBody,
          signature,
        );
        if (!isValid) {
          throw new HttpException('Invalid webhook signature', 400);
        }
      }

      let payment = await this.prismaService.payment.findFirst({
        where: {
          OR: [
            { xendit_invoice_id: webhookData.id },
            { xendit_invoice_id: webhookData.invoice_id },
          ],
        },
      });

      if (!payment && webhookData.external_id?.includes('tiketin_')) {
        const bookingRefMatch =
          webhookData.external_id.match(/tiketin_(.+?)_\d+$/);
        if (bookingRefMatch) {
          const bookingRef = bookingRefMatch[1];
          payment = await this.prismaService.payment.findFirst({
            where: { booking_reference: bookingRef },
          });
        }
      }

      if (!payment) {
        this.logger.error(
          `Payment not found for webhook: ${webhookData.external_id}`,
        );
        throw new HttpException('Payment not found', 404);
      }

      let paymentStatus = 'pending';
      let ticketStatus = 'booked';

      switch (webhookData.status.toLowerCase()) {
        case 'paid':
        case 'settled':
          paymentStatus = 'success';
          ticketStatus = 'paid';
          break;
        case 'expired':
        case 'failed':
          paymentStatus = 'failed';
          ticketStatus = 'canceled';
          break;
        default:
          paymentStatus = 'pending';
          ticketStatus = 'pending_payment';
          break;
      }

      const result = await this.prismaService.$transaction(async (prisma) => {
        const updatedPayment = await prisma.payment.update({
          where: { id: payment.id },
          data: {
            payment_status: paymentStatus,
            xendit_payment_id:
              webhookData.payment_id || payment.xendit_payment_id,
          },
        });

        const updatedTickets = await prisma.ticket.updateMany({
          where: { booking_reference: payment.booking_reference },
          data: { status: ticketStatus },
        });

        return { updatedPayment, ticketCount: updatedTickets.count };
      });

      return {
        success: true,
        message: 'Webhook processed successfully',
        data: {
          payment_id: payment.id,
          booking_reference: payment.booking_reference,
          payment_status: paymentStatus,
          ticket_count: result.ticketCount,
        },
      };
    } catch (error) {
      this.logger.error(`❌ Webhook error: ${error.message}`);
      return {
        success: false,
        message: `Webhook processing failed: ${error.message}`,
      };
    }
  }

  // async testWebhook(
  //   bookingReference: string,
  //   status: 'PAID' | 'EXPIRED' | 'FAILED' = 'PAID',
  // ): Promise<{ success: boolean; message: string }> {
  //   const payment = await this.prismaService.payment.findFirst({
  //     where: { booking_reference: bookingReference },
  //   });

  //   if (!payment) {
  //     throw new HttpException('Payment not found', 404);
  //   }

  //   const mockWebhookData: XenditWebhookRequest = {
  //     id: payment.xendit_invoice_id || `test_invoice_${payment.id}`,
  //     external_id: `tiketin_${bookingReference}_${Date.now()}`,
  //     status: status,
  //     amount: new Decimal(payment.amount).toNumber(),
  //     payment_id: `test_payment_${payment.id}`,
  //     invoice_id: payment.xendit_invoice_id,
  //   };

  //   const result = await this.handleXenditWebhook(
  //     null as any,
  //     'test-signature',
  //     mockWebhookData,
  //   );

  //   return result;
  // }
}
