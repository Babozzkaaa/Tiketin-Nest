import { HttpException, Inject, Injectable } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { PrismaService } from '../../common/prisma.service';
import { ValidationService } from '../../common/validation.service';
import { Station, User } from '@prisma/client';
import {
  StationsResponse,
  CreateStationsRequest,
  GetStationsRequest,
  RemoveStationsRequest,
  UpdateStationsRequest,
} from '../../model/stations.model';
import { StationsValidation } from './stations.validation';

@Injectable()
export class StationsService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
    private prismaService: PrismaService,
    private validationService: ValidationService,
  ) {}

  async create(
    user: User,
    request: CreateStationsRequest,
  ): Promise<StationsResponse> {
    this.logger.debug(
      `StationsService.create(${JSON.stringify(user)}, ${JSON.stringify(request)})`,
    );
    const createRequest: CreateStationsRequest =
      this.validationService.validate(StationsValidation.CREATE, request);

    const stations = await this.prismaService.station.create({
      data: createRequest,
    });

    return this.toStationsResponse(stations);
  }

  toStationsResponse(stations: Station): StationsResponse {
    return {
      id: stations.id,
      name: stations.name,
      code: stations.code,
      city: stations.city,
      address: stations.address,
    };
  }

  async checkStationsMustExists(id: number): Promise<Station> {
    const stations = await this.prismaService.station.findUnique({
      where: { id },
    });

    if (!stations) {
      throw new HttpException('Stations is not found', 404);
    }

    return stations;
  }

  async get(user: User, id: number): Promise<StationsResponse> {
    const stations = await this.checkStationsMustExists(id);
    return this.toStationsResponse(stations);
  }

  async update(
    user: User,
    request: UpdateStationsRequest,
  ): Promise<StationsResponse> {
    const updateRequest: UpdateStationsRequest =
      this.validationService.validate(StationsValidation.UPDATE, request);

    let stations = await this.checkStationsMustExists(updateRequest.id);

    stations = await this.prismaService.station.update({
      where: { id: stations.id },
      data: updateRequest,
    });

    return this.toStationsResponse(stations);
  }

  async remove(user: User, id: number): Promise<StationsResponse> {
    await this.checkStationsMustExists(id);

    const stations = await this.prismaService.station.delete({
      where: { id },
    });

    return this.toStationsResponse(stations);
  }

  async list(user: User): Promise<StationsResponse[]> {
    const stations = await this.prismaService.station.findMany();
    return stations.map((stations) => this.toStationsResponse(stations));
  }
}
