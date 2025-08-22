import { Injectable, HttpException, Inject } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { PrismaService } from '../common/prisma.service';
import { XenditService, CreateInvoiceRequest } from '../xendit/xendit.service';
import { Decimal } from '@prisma/client/runtime/library';

interface JwtUser {
  sub: number;
  email: string;
  name: string;
  iat: number;
  exp: number;
}

export interface CreateBookingRequest {
  tickets: {
    schedule_id: number;
    seat_id: number;
    passenger_name: string;
    passenger_id_num: string;
    passenger_email?: string;
    passenger_phone?: string;
  }[];
  payment_method: 'xendit_invoice' | 'bank_transfer';
}

export interface BookingResponse {
  booking_reference: string;
  amount: number;
  payment_url?: string;
  payment_id: number;
  tickets: {
    id: number;
    seat_number: string;
    passenger_name: string;
    status: string;
  }[];
}

@Injectable()
export class BookingService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
    private prismaService: PrismaService,
    private xenditService: XenditService,
  ) {}

  private generateBookingReference(): string {
    const date = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const random = Math.random().toString(36).substr(2, 6).toUpperCase();
    return `BOOK-${date}-${random}`;
  }

  async createBooking(
    user: JwtUser,
    request: CreateBookingRequest,
  ): Promise<BookingResponse> {
    const bookingReference = this.generateBookingReference();

    // this.logger.debug(
    //   `Creating booking ${bookingReference} for user ${user.sub}`,
    // );

    try {
      return await this.prismaService.$transaction(async (tx) => {
        let totalAmount = 0;
        const createdTickets = [];

        for (const ticketData of request.tickets) {
          const seat = await tx.seat.findUnique({
            where: { id: ticketData.seat_id },
            include: { carriage: true },
          });

          if (!seat) {
            throw new Error(`Seat ${ticketData.seat_id} not found`);
          }

          const existingTicket = await tx.ticket.findFirst({
            where: {
              seat_id: ticketData.seat_id,
              schedule_id: ticketData.schedule_id,
              status: { in: ['booked', 'paid', 'pending_payment'] },
            },
          });

          if (existingTicket) {
            throw new Error(`Seat ${seat.seat_number} is already booked`);
          }

          totalAmount += parseFloat(seat.carriage.price.toString());

          const ticket = await tx.ticket.create({
            data: {
              user_id: user.sub,
              schedule_id: ticketData.schedule_id,
              seat_id: ticketData.seat_id,
              booking_reference: bookingReference,
              passenger_name: ticketData.passenger_name,
              passenger_id_num: ticketData.passenger_id_num,
              passenger_email: ticketData.passenger_email,
              passenger_phone: ticketData.passenger_phone,
              status: 'booked',
            },
            include: { seat: true },
          });

          createdTickets.push(ticket);
        }

        let paymentUrl: string | undefined;
        let xenditInvoiceId: string | undefined;

        if (request.payment_method === 'xendit_invoice') {
          const externalId = `tiketin_${bookingReference}_${Date.now()}`;

          const fullUser = await tx.user.findUnique({
            where: { id: user.sub },
            select: { name: true, email: true, phone_number: true },
          });

          if (!fullUser) {
            throw new Error('User not found');
          }

          const invoiceRequest: CreateInvoiceRequest = {
            external_id: externalId,
            amount: totalAmount,
            payer_email: fullUser.email,
            description: `Train Tickets - ${bookingReference} (${request.tickets.length} tickets)`,
            booking_reference: bookingReference,
            customer: {
              given_names: fullUser.name,
              email: fullUser.email,
              mobile_number: fullUser.phone_number,
            },
          };

          const xenditInvoice =
            await this.xenditService.createInvoice(invoiceRequest);

          paymentUrl = xenditInvoice.invoice_url || xenditInvoice.invoiceUrl;
          xenditInvoiceId = xenditInvoice.id;

          // this.logger.debug(
          //   'Xendit invoice response:',
          //   JSON.stringify(xenditInvoice, null, 2),
          // );
          // this.logger.debug(
          //   `Extracted - URL: ${paymentUrl}, ID: ${xenditInvoiceId}`,
          // );

          if (!xenditInvoiceId) {
            throw new Error(
              'Xendit invoice creation failed: No invoice ID returned',
            );
          }
          if (!paymentUrl) {
            this.logger.warn(
              'No payment URL returned from Xendit - user will need to pay manually',
            );
          }
        }

        const payment = await tx.payment.create({
          data: {
            booking_reference: bookingReference,
            payment_method: request.payment_method,
            payment_status: 'pending',
            payment_date: new Date(),
            amount: totalAmount,
            xendit_invoice_id: xenditInvoiceId,
            payment_url: paymentUrl,
          },
        });

        if (request.payment_method === 'xendit_invoice') {
          await tx.ticket.updateMany({
            where: { booking_reference: bookingReference },
            data: { status: 'pending_payment' },
          });
        }

        return {
          booking_reference: bookingReference,
          amount: totalAmount,
          payment_url: paymentUrl,
          payment_id: payment.id,
          tickets: createdTickets.map((ticket) => ({
            id: ticket.id,
            seat_number: ticket.seat.seat_number,
            passenger_name: ticket.passenger_name,
            status:
              request.payment_method === 'xendit_invoice'
                ? 'pending_payment'
                : ticket.status,
          })),
        };
      });
    } catch (error) {
      this.logger.error('Booking creation failed:', error);
      throw new HttpException(`Booking creation failed: ${error.message}`, 400);
    }
  }

  async getBookingDetails(bookingReference: string) {
    const payment = await this.prismaService.payment.findFirst({
      where: { booking_reference: bookingReference },
    });

    if (!payment) {
      throw new HttpException('Booking not found', 404);
    }

    const tickets = await this.prismaService.ticket.findMany({
      where: { booking_reference: bookingReference },
      include: {
        seat: { include: { carriage: true } },
        schedule: {
          include: {
            departure_station: true,
            arrival_station: true,
            train: true,
          },
        },
      },
    });

    return {
      booking_reference: bookingReference,
      payment_status: payment.payment_status,
      amount: new Decimal(payment.amount).toNumber(),
      payment_url: payment.payment_url,
      tickets: tickets.map((ticket) => ({
        id: ticket.id,
        passenger_name: ticket.passenger_name,
        passenger_id_num: ticket.passenger_id_num,
        passenger_email: ticket.passenger_email,
        passenger_phone: ticket.passenger_phone,
        seat_number: ticket.seat.seat_number,
        carriage_type: ticket.seat.carriage.carriage_type,
        status: ticket.status,
        schedule: {
          train_name: ticket.schedule.train.name,
          departure_station: ticket.schedule.departure_station.name,
          arrival_station: ticket.schedule.arrival_station.name,
          departure_time: ticket.schedule.departure_time,
          arrival_time: ticket.schedule.arrival_time,
        },
      })),
    };
  }
}
