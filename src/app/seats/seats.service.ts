import { HttpException, Inject, Injectable } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { PrismaService } from '../../common/prisma.service';
import { ValidationService } from '../../common/validation.service';
import { Seat, User } from '@prisma/client';
import {
  SeatsResponse,
  CreateSeatsRequest,
  GetSeatsRequest,
  RemoveSeatsRequest,
  UpdateSeatsRequest,
  SeatAvailabilityResponse,
  SeatLayoutResponse,
  TrainSeatAvailabilityResponse,
  GenerateSeatsRequest,
} from '../../model/seats.model';
import { SeatsValidation } from './seats.validation';

@Injectable()
export class SeatsService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
    private prismaService: PrismaService,
    private validationService: ValidationService,
  ) {}

  async create(
    user: User,
    request: CreateSeatsRequest,
  ): Promise<SeatsResponse> {
    this.logger.debug(
      `SeatsService.create(${JSON.stringify(user)}, ${JSON.stringify(request)})`,
    );
    const createRequest: CreateSeatsRequest = this.validationService.validate(
      SeatsValidation.CREATE,
      request,
    );

    const seats = await this.prismaService.seat.create({
      data: createRequest,
    });

    return this.toSeatsResponse(seats);
  }

  toSeatsResponse(seats: Seat): SeatsResponse {
    return {
      id: seats.id,
      carriage_id: seats.carriage_id,
      seat_number: seats.seat_number,
    };
  }

  async checkSeatsMustExists(id: number): Promise<Seat> {
    const seats = await this.prismaService.seat.findUnique({
      where: { id },
    });

    if (!seats) {
      throw new HttpException('Seats is not found', 404);
    }

    return seats;
  }

  async get(user: User, id: number): Promise<SeatsResponse> {
    const seats = await this.checkSeatsMustExists(id);
    return this.toSeatsResponse(seats);
  }

  async update(
    user: User,
    request: UpdateSeatsRequest,
  ): Promise<SeatsResponse> {
    const updateRequest: UpdateSeatsRequest = this.validationService.validate(
      SeatsValidation.UPDATE,
      request,
    );

    let seats = await this.checkSeatsMustExists(updateRequest.id);

    seats = await this.prismaService.seat.update({
      where: { id: seats.id },
      data: updateRequest,
    });

    return this.toSeatsResponse(seats);
  }

  async remove(user: User, id: number): Promise<SeatsResponse> {
    await this.checkSeatsMustExists(id);

    const seats = await this.prismaService.seat.delete({
      where: { id },
    });

    return this.toSeatsResponse(seats);
  }

  async list(user: User): Promise<SeatsResponse[]> {
    const seats = await this.prismaService.seat.findMany();
    return seats.map((seats) => this.toSeatsResponse(seats));
  }

  async getSeatsByCarriage(
    user: User,
    carriageId: number,
  ): Promise<SeatsResponse[]> {
    this.logger.debug(
      `SeatsService.getSeatsByCarriage(${JSON.stringify(user)}, ${carriageId})`,
    );

    const carriage = await this.prismaService.carriage.findUnique({
      where: { id: carriageId },
    });

    if (!carriage) {
      throw new HttpException('Carriage not found', 404);
    }

    const seats = await this.prismaService.seat.findMany({
      where: { carriage_id: carriageId },
      orderBy: { seat_number: 'asc' },
    });

    return seats.map((seat) => this.toSeatsResponse(seat));
  }

  async getAvailableSeatsBySchedule(
    user: User,
    scheduleId: number,
  ): Promise<SeatAvailabilityResponse[]> {
    this.logger.debug(
      `SeatsService.getAvailableSeatsBySchedule(${JSON.stringify(user)}, ${scheduleId})`,
    );

    const schedule = await this.prismaService.schedule.findUnique({
      where: { id: scheduleId },
      include: { train: true },
    });

    if (!schedule) {
      throw new HttpException('Schedule not found', 404);
    }

    const seats = await this.prismaService.seat.findMany({
      where: {
        carriage: {
          train_id: schedule.train_id,
        },
      },
      include: {
        carriage: true,
        tickets: {
          where: {
            schedule_id: scheduleId,
          },
          select: {
            id: true,
            user_id: true,
          },
        },
      },
      orderBy: [
        { carriage: { carriage_number: 'asc' } },
        { seat_number: 'asc' },
      ],
    });

    return seats.map((seat) => ({
      id: seat.id,
      carriage_id: seat.carriage_id,
      seat_number: seat.seat_number,
      is_available: seat.tickets.length === 0,
      is_booked: seat.tickets.length > 0,
      ticket_id: seat.tickets.length > 0 ? seat.tickets[0].id : undefined,
      carriage: {
        id: seat.carriage.id,
        carriage_number: seat.carriage.carriage_number,
        carriage_type: seat.carriage.carriage_type,
      },
    }));
  }

  async getSeatLayout(
    user: User,
    carriageId: number,
  ): Promise<SeatLayoutResponse> {
    this.logger.debug(
      `SeatsService.getSeatLayout(${JSON.stringify(user)}, ${carriageId})`,
    );

    const carriage = await this.prismaService.carriage.findUnique({
      where: { id: carriageId },
      include: {
        seats: {
          orderBy: { seat_number: 'asc' },
        },
      },
    });

    if (!carriage) {
      throw new HttpException('Carriage not found', 404);
    }

    const layoutPattern = this.determineLayoutPattern(carriage.seats);

    return {
      carriage_id: carriage.id,
      carriage_type: carriage.carriage_type,
      seat_capacity: carriage.seat_capacity,
      layout_pattern: layoutPattern,
      seats: carriage.seats.map((seat) => {
        const { row, position } = this.parseSeatNumber(seat.seat_number);
        return {
          id: seat.id,
          seat_number: seat.seat_number,
          row: row,
          position: position,
          is_window: this.isWindowSeat(position, layoutPattern),
          is_aisle: this.isAisleSeat(position, layoutPattern),
        };
      }),
    };
  }

  async generateSeatsForCarriage(
    user: User,
    carriageId: number,
    request: GenerateSeatsRequest,
  ): Promise<SeatsResponse[]> {
    this.logger.debug(
      `SeatsService.generateSeatsForCarriage(${JSON.stringify(user)}, ${carriageId}, ${JSON.stringify(request)})`,
    );

    const generateRequest: GenerateSeatsRequest =
      this.validationService.validate(SeatsValidation.GENERATE_SEATS, request);

    const carriage = await this.prismaService.carriage.findUnique({
      where: { id: carriageId },
    });

    if (!carriage) {
      throw new HttpException('Carriage not found', 404);
    }

    const existingSeats = await this.prismaService.seat.findMany({
      where: { carriage_id: carriageId },
    });

    if (existingSeats.length > 0) {
      throw new HttpException('Seats already exist for this carriage', 400);
    }

    const [leftSeats, rightSeats] = generateRequest.seat_pattern
      .split('+')
      .map(Number);
    const totalSeatsPerRow = leftSeats + rightSeats;

    const seatPositions: string[] = [];
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

    for (let i = 0; i < leftSeats; i++) {
      seatPositions.push(letters[i]);
    }
    for (let i = 0; i < rightSeats; i++) {
      seatPositions.push(letters[leftSeats + i]);
    }

    const seatsToCreate = [];
    const startRow = generateRequest.start_row || 1;

    for (let row = startRow; row < startRow + generateRequest.rows; row++) {
      for (const position of seatPositions) {
        seatsToCreate.push({
          carriage_id: carriageId,
          seat_number: `${row}${position}`,
        });
      }
    }

    const createdSeats = await this.prismaService.$transaction(
      seatsToCreate.map((seatData) =>
        this.prismaService.seat.create({
          data: seatData,
        }),
      ),
    );

    await this.prismaService.carriage.update({
      where: { id: carriageId },
      data: { seat_capacity: createdSeats.length },
    });

    return createdSeats.map((seat) => this.toSeatsResponse(seat));
  }

  async getTrainSeatAvailability(
    user: User,
    trainId: number,
    scheduleId?: number,
  ): Promise<TrainSeatAvailabilityResponse> {
    this.logger.debug(
      `SeatsService.getTrainSeatAvailability(${JSON.stringify(user)}, ${trainId}, ${scheduleId})`,
    );

    const train = await this.prismaService.train.findUnique({
      where: { id: trainId },
      include: {
        carriages: {
          include: {
            seats: {
              include: {
                tickets: scheduleId
                  ? {
                      where: { schedule_id: scheduleId },
                      select: { id: true, user_id: true },
                    }
                  : false,
              },
            },
          },
          orderBy: { carriage_number: 'asc' },
        },
      },
    });

    if (!train) {
      throw new HttpException('Train not found', 404);
    }

    let totalSeats = 0;
    let bookedSeats = 0;

    const carriages = train.carriages.map((carriage) => {
      const carriageSeats = carriage.seats.length;
      const carriageBookedSeats = scheduleId
        ? carriage.seats.filter((seat) => seat.tickets.length > 0).length
        : 0;

      totalSeats += carriageSeats;
      bookedSeats += carriageBookedSeats;

      const seats: SeatAvailabilityResponse[] = carriage.seats.map((seat) => ({
        id: seat.id,
        carriage_id: seat.carriage_id,
        seat_number: seat.seat_number,
        is_available: scheduleId ? seat.tickets.length === 0 : true,
        is_booked: scheduleId ? seat.tickets.length > 0 : false,
        ticket_id:
          scheduleId && seat.tickets.length > 0
            ? seat.tickets[0].id
            : undefined,
        carriage: {
          id: carriage.id,
          carriage_number: carriage.carriage_number,
          carriage_type: carriage.carriage_type,
        },
      }));

      return {
        id: carriage.id,
        carriage_number: carriage.carriage_number,
        carriage_type: carriage.carriage_type,
        total_seats: carriageSeats,
        available_seats: carriageSeats - carriageBookedSeats,
        seats,
      };
    });

    return {
      train_id: trainId,
      total_seats: totalSeats,
      available_seats: totalSeats - bookedSeats,
      booked_seats: bookedSeats,
      carriages,
    };
  }

  private determineLayoutPattern(seats: any[]): string {
    if (seats.length === 0) return '2+2';

    const seatLetters = seats
      .map((seat) => seat.seat_number.slice(-1))
      .filter((v, i, a) => a.indexOf(v) === i);
    const uniqueLetters = seatLetters.length;

    if (uniqueLetters <= 4) return '2+2';
    if (uniqueLetters <= 5) return '2+3';
    return '3+3';
  }

  private parseSeatNumber(seatNumber: string): {
    row: number;
    position: string;
  } {
    const match = seatNumber.match(/^(\d+)([A-Z])$/);
    if (!match) {
      return { row: 1, position: 'A' };
    }
    return {
      row: parseInt(match[1]),
      position: match[2],
    };
  }

  private isWindowSeat(position: string, layoutPattern: string): boolean {
    const [left] = layoutPattern.split('+').map(Number);
    const positionIndex = position.charCodeAt(0) - 65;

    return (
      positionIndex === 0 ||
      positionIndex === left + layoutPattern.split('+').map(Number)[1] - 1
    );
  }

  private isAisleSeat(position: string, layoutPattern: string): boolean {
    const [left] = layoutPattern.split('+').map(Number);
    const positionIndex = position.charCodeAt(0) - 65;

    return positionIndex === left - 1 || positionIndex === left;
  }
}
