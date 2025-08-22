import { HttpException, Inject, Injectable } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { PrismaService } from '../../common/prisma.service';
import { ValidationService } from '../../common/validation.service';
import { Train, User } from '@prisma/client';
import {
  TrainsResponse,
  CreateTrainsRequest,
  GetTrainsRequest,
  RemoveTrainsRequest,
  UpdateTrainsRequest,
} from '../../model/trains.model';
import { TrainsValidation } from './trains.validation';

@Injectable()
export class TrainsService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
    private prismaService: PrismaService,
    private validationService: ValidationService,
  ) {}

  async create(
    user: User,
    request: CreateTrainsRequest,
  ): Promise<TrainsResponse> {
    this.logger.debug(
      `TrainsService.create(${JSON.stringify(user)}, ${JSON.stringify(request)})`,
    );
    const createRequest: CreateTrainsRequest = this.validationService.validate(
      TrainsValidation.CREATE,
      request,
    );

    const trains = await this.prismaService.train.create({
      data: createRequest,
    });

    return this.toTrainsResponse(trains);
  }

  toTrainsResponse(trains: Train): TrainsResponse {
    return {
      id: trains.id,
      name: trains.name,
      code: trains.code,
      train_type: trains.train_type,
    };
  }

  async checkTrainsMustExists(id: number): Promise<Train> {
    const trains = await this.prismaService.train.findUnique({
      where: { id },
    });

    if (!trains) {
      throw new HttpException('Trains is not found', 404);
    }

    return trains;
  }

  async get(user: User, id: number): Promise<TrainsResponse> {
    const trains = await this.checkTrainsMustExists(id);
    return this.toTrainsResponse(trains);
  }

  async update(
    user: User,
    request: UpdateTrainsRequest,
  ): Promise<TrainsResponse> {
    const updateRequest: UpdateTrainsRequest = this.validationService.validate(
      TrainsValidation.UPDATE,
      request,
    );

    let trains = await this.checkTrainsMustExists(updateRequest.id);

    trains = await this.prismaService.train.update({
      where: { id: trains.id },
      data: updateRequest,
    });

    return this.toTrainsResponse(trains);
  }

  async remove(user: User, id: number): Promise<TrainsResponse> {
    await this.checkTrainsMustExists(id);

    const trains = await this.prismaService.train.delete({
      where: { id },
    });

    return this.toTrainsResponse(trains);
  }

  async list(user: User): Promise<TrainsResponse[]> {
    const trains = await this.prismaService.train.findMany();
    return trains.map((trains) => this.toTrainsResponse(trains));
  }
}
