import { HttpException, Inject, Injectable } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { PrismaService } from '../../common/prisma.service';
import { ValidationService } from '../../common/validation.service';
import { Schedule, User } from '@prisma/client';
import {
  SchedulesResponse,
  CreateSchedulesRequest,
  GetSchedulesRequest,
  RemoveSchedulesRequest,
  UpdateSchedulesRequest,
} from '../../model/schedules.model';
import { SchedulesValidation } from './schedules.validation';

@Injectable()
export class SchedulesService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
    private prismaService: PrismaService,
    private validationService: ValidationService,
  ) {}

  async create(
    user: User,
    request: CreateSchedulesRequest,
  ): Promise<SchedulesResponse> {
    this.logger.debug(
      `SchedulesService.create(${JSON.stringify(user)}, ${JSON.stringify(request)})`,
    );
    const createRequest: CreateSchedulesRequest =
      this.validationService.validate(SchedulesValidation.CREATE, request);

    const schedules = await this.prismaService.schedule.create({
      data: createRequest,
    });

    return this.toSchedulesResponse(schedules);
  }

  toSchedulesResponse(schedules: Schedule): SchedulesResponse {
    return {
      id: schedules.id,
      train_id: schedules.train_id,
      departure_station_id: schedules.departure_station_id,
      arrival_station_id: schedules.arrival_station_id,
      departure_time: schedules.departure_time,
      arrival_time: schedules.arrival_time,
      date: schedules.date,
    };
  }

  async checkSchedulesMustExists(id: number): Promise<Schedule> {
    const schedules = await this.prismaService.schedule.findUnique({
      where: { id },
    });

    if (!schedules) {
      throw new HttpException('Schedules is not found', 404);
    }

    return schedules;
  }

  async get(user: User, id: number): Promise<SchedulesResponse> {
    const schedules = await this.checkSchedulesMustExists(id);
    return this.toSchedulesResponse(schedules);
  }

  async update(
    user: User,
    request: UpdateSchedulesRequest,
  ): Promise<SchedulesResponse> {
    const updateRequest: UpdateSchedulesRequest =
      this.validationService.validate(SchedulesValidation.UPDATE, request);

    let schedules = await this.checkSchedulesMustExists(updateRequest.id);

    schedules = await this.prismaService.schedule.update({
      where: { id: schedules.id },
      data: updateRequest,
    });

    return this.toSchedulesResponse(schedules);
  }

  async remove(user: User, id: number): Promise<SchedulesResponse> {
    await this.checkSchedulesMustExists(id);

    const schedules = await this.prismaService.schedule.delete({
      where: { id },
    });

    return this.toSchedulesResponse(schedules);
  }

  async list(user: User): Promise<SchedulesResponse[]> {
    const schedules = await this.prismaService.schedule.findMany();
    return schedules.map((schedules) => this.toSchedulesResponse(schedules));
  }
}
