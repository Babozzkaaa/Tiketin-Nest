import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { CarriagesService } from './carriages.service';
import { WebResponse } from '../../model/web.model';
import {
  CarriagesResponse,
  CreateCarriagesRequest,
  GetCarriagesRequest,
  RemoveCarriagesRequest,
  UpdateCarriagesRequest,
} from '../../model/carriages.model';
import { User } from '@prisma/client';
import { Auth } from '../../common/auth.decorator';
import { ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { JwtGuard } from 'src/auth/guards/jwt.guard';

@UseGuards(JwtGuard)
@Controller('/api/carriages')
export class CarriagesController {
  constructor(private carriagesService: CarriagesService) {}

  @Post()
  @ApiBearerAuth()
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        train_id: { type: 'number', example: 1, nullable: false },
        carriage_number: { type: 'number', example: 1, nullable: false },
        carriage_type: { type: 'string', example: 'ECONOMY', nullable: false },
        seat_capacity: { type: 'number', example: 50, nullable: false },
        price: { type: 'number', example: 400000, nullable: false },
      },
      required: [
        'train_id',
        'carriage_number',
        'carriage_type',
        'seat_capacity',
      ],
    },
  })
  @HttpCode(200)
  async create(
    @Auth() user: User,
    @Body() request: CreateCarriagesRequest,
  ): Promise<WebResponse<CarriagesResponse>> {
    const result = await this.carriagesService.create(user, request);
    return {
      data: result,
    };
  }

  @Get('/:id')
  @ApiBearerAuth()
  @HttpCode(200)
  async get(
    @Auth() user: User,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<WebResponse<CarriagesResponse>> {
    const result = await this.carriagesService.get(user, id);
    return {
      data: result,
    };
  }

  @Put('/:id')
  @ApiBearerAuth()
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        train_id: { type: 'number', example: 1, nullable: true },
        carriage_number: { type: 'number', example: 1, nullable: true },
        carriage_type: { type: 'string', example: 'BUSINESS', nullable: true },
        seat_capacity: { type: 'number', example: 50, nullable: true },
        price: { type: 'number', example: 800000, nullable: true },
      },
      required: [],
    },
  })
  @HttpCode(200)
  async update(
    @Auth() user: User,
    @Param('id', ParseIntPipe) id: number,
    @Body() request: UpdateCarriagesRequest,
  ): Promise<WebResponse<CarriagesResponse>> {
    request.id = id;
    const result = await this.carriagesService.update(user, request);
    return {
      data: result,
    };
  }

  @Delete('/:id')
  @ApiBearerAuth()
  @HttpCode(200)
  async remove(
    @Auth() user: User,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<WebResponse<boolean>> {
    await this.carriagesService.remove(user, id);
    return {
      data: true,
    };
  }

  @Get()
  @ApiBearerAuth()
  @HttpCode(200)
  async list(@Auth() user: User): Promise<WebResponse<CarriagesResponse[]>> {
    const result = await this.carriagesService.list(user);
    return {
      data: result,
    };
  }
}
