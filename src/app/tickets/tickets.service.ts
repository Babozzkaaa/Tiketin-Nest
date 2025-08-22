import { HttpException, Inject, Injectable } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { PrismaService } from '../../common/prisma.service';
import { ValidationService } from '../../common/validation.service';
import { Ticket, User } from '@prisma/client';
import {
  TicketsResponse,
  CreateTicketsRequest,
  GetTicketsRequest,
  RemoveTicketsRequest,
  UpdateTicketsRequest,
} from '../../model/tickets.model';
import { TicketsValidation } from './tickets.validation';

interface JwtUser {
  sub: number;
  email: string;
  name: string;
  iat: number;
  exp: number;
}

@Injectable()
export class TicketsService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
    private prismaService: PrismaService,
    private validationService: ValidationService,
  ) {}

  async create(
    user: JwtUser,
    request: CreateTicketsRequest,
  ): Promise<TicketsResponse> {
    this.logger.debug(
      `TicketsService.create(${JSON.stringify(user)}, ${JSON.stringify(request)})`,
    );
    const createRequest: CreateTicketsRequest = this.validationService.validate(
      TicketsValidation.CREATE,
      request,
    );

    const generatedBookingReference =
      'TCK-' + Date.now() + '-' + Math.floor(Math.random() * 1000);

    const tickets = await this.prismaService.ticket.create({
      data: {
        ...createRequest,
        user_id: user.sub,
        status: 'booked',
        booking_reference: generatedBookingReference,
      },
    });

    return this.toTicketsResponse(tickets);
  }

  async createMultiple(
    user: JwtUser,
    requests: CreateTicketsRequest[],
  ): Promise<TicketsResponse[]> {
    const generatedBookingReference =
      'TCK-' + Date.now() + '-' + Math.floor(Math.random() * 1000);

    const validateRequests = requests.map((req) =>
      this.validationService.validate(TicketsValidation.CREATE, req),
    );

    const tickets = await this.prismaService.$transaction(
      validateRequests.map((req) =>
        this.prismaService.ticket.create({
          data: {
            schedule_id: req.schedule_id,
            seat_id: req.seat_id,
            passenger_name: req.passenger_name,
            passenger_id_num: req.passenger_id_num,
            passenger_email: req.passenger_email,
            passenger_phone: req.passenger_phone,
            user_id: user.sub,
            status: 'booked',
            booking_reference: generatedBookingReference,
          },
        }),
      ),
    );

    return tickets.map((ticket) => this.toTicketsResponse(ticket));
  }

  toTicketsResponse(tickets: Ticket): TicketsResponse {
    return {
      id: tickets.id,
      user_id: tickets.user_id,
      schedule_id: tickets.schedule_id,
      booking_reference: tickets.booking_reference,
      seat_id: tickets.seat_id,
      passenger_name: tickets.passenger_name,
      passenger_id_num: tickets.passenger_id_num,
      passenger_email: tickets.passenger_email,
      passenger_phone: tickets.passenger_phone,
      status: tickets.status,
    };
  }

  async checkTicketsMustExists(id: number): Promise<Ticket> {
    const tickets = await this.prismaService.ticket.findUnique({
      where: { id },
    });

    if (!tickets) {
      throw new HttpException('Tickets is not found', 404);
    }

    return tickets;
  }

  async get(user: User, id: number): Promise<TicketsResponse> {
    const tickets = await this.checkTicketsMustExists(id);
    return this.toTicketsResponse(tickets);
  }

  async update(
    user: User,
    request: UpdateTicketsRequest,
  ): Promise<TicketsResponse> {
    const updateRequest: UpdateTicketsRequest = this.validationService.validate(
      TicketsValidation.UPDATE,
      request,
    );

    let tickets = await this.checkTicketsMustExists(updateRequest.id);

    tickets = await this.prismaService.ticket.update({
      where: { id: tickets.id },
      data: updateRequest,
    });

    return this.toTicketsResponse(tickets);
  }

  async remove(user: User, id: number): Promise<TicketsResponse> {
    await this.checkTicketsMustExists(id);

    const tickets = await this.prismaService.ticket.delete({
      where: { id },
    });

    return this.toTicketsResponse(tickets);
  }

  async list(user: User): Promise<TicketsResponse[]> {
    const tickets = await this.prismaService.ticket.findMany();
    return tickets.map((tickets) => this.toTicketsResponse(tickets));
  }
}
