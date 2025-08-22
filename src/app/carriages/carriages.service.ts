import { HttpException, Inject, Injectable } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { PrismaService } from '../../common/prisma.service';
import { ValidationService } from '../../common/validation.service';
import { Carriage, User } from '@prisma/client';
import {
  CarriagesResponse,
  CreateCarriagesRequest,
  GetCarriagesRequest,
  RemoveCarriagesRequest,
  UpdateCarriagesRequest,
} from '../../model/carriages.model';
import { CarriagesValidation } from './carriages.validation';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class CarriagesService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
    private prismaService: PrismaService,
    private validationService: ValidationService,
  ) {}

  async create(
    user: User,
    request: CreateCarriagesRequest,
  ): Promise<CarriagesResponse> {
    this.logger.debug(
      `CarriagesService.create(${JSON.stringify(user)}, ${JSON.stringify(request)})`,
    );
    const createRequest: CreateCarriagesRequest =
      this.validationService.validate(CarriagesValidation.CREATE, request);

    const carriages = await this.prismaService.carriage.create({
      data: createRequest,
    });

    return this.toCarriagesResponse(carriages);
  }

  toCarriagesResponse(carriages: Carriage): CarriagesResponse {
    return {
      id: carriages.id,
      train_id: carriages.train_id,
      carriage_number: carriages.carriage_number,
      carriage_type: carriages.carriage_type,
      seat_capacity: carriages.seat_capacity,
      price: new Decimal(carriages.price).toNumber(),
    };
  }

  async checkCarriagesMustExists(id: number): Promise<Carriage> {
    const carriages = await this.prismaService.carriage.findUnique({
      where: { id },
    });

    if (!carriages) {
      throw new HttpException('Carriages is not found', 404);
    }

    return carriages;
  }

  async get(user: User, id: number): Promise<CarriagesResponse> {
    const carriages = await this.checkCarriagesMustExists(id);
    return this.toCarriagesResponse(carriages);
  }

  async update(
    user: User,
    request: UpdateCarriagesRequest,
  ): Promise<CarriagesResponse> {
    const updateRequest: UpdateCarriagesRequest =
      this.validationService.validate(CarriagesValidation.UPDATE, request);

    let carriages = await this.checkCarriagesMustExists(updateRequest.id);

    carriages = await this.prismaService.carriage.update({
      where: { id: carriages.id },
      data: updateRequest,
    });

    return this.toCarriagesResponse(carriages);
  }

  async remove(user: User, id: number): Promise<CarriagesResponse> {
    await this.checkCarriagesMustExists(id);

    const carriages = await this.prismaService.carriage.delete({
      where: { id },
    });

    return this.toCarriagesResponse(carriages);
  }

  async list(user: User): Promise<CarriagesResponse[]> {
    const carriages = await this.prismaService.carriage.findMany();
    return carriages.map((carriages) => this.toCarriagesResponse(carriages));
  }
}
