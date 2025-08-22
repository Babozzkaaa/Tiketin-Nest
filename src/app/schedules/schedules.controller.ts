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
import { SchedulesService } from './schedules.service';
import { WebResponse } from '../../model/web.model';
import {
  SchedulesResponse,
  CreateSchedulesRequest,
  GetSchedulesRequest,
  RemoveSchedulesRequest,
  UpdateSchedulesRequest,
} from '../../model/schedules.model';
import { User } from '@prisma/client';
import { Auth } from '../../common/auth.decorator';
import { ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { JwtGuard } from 'src/auth/guards/jwt.guard';

@UseGuards(JwtGuard)
@Controller('/api/schedules')
export class SchedulesController {
  constructor(private schedulesService: SchedulesService) {}

  @Post()
  @ApiBearerAuth()
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        train_id: { type: 'number', example: 1, nullable: false },
        departure_station_id: { type: 'number', example: 1, nullable: false },
        arrival_station_id: { type: 'number', example: 2, nullable: false },
        departure_time: {
          type: 'string',
          example: '2023-10-01T10:00:00Z',
          nullable: false,
        },
        arrival_time: {
          type: 'string',
          example: '2023-10-01T12:00:00Z',
          nullable: false,
        },
        date: { type: 'string', example: '2023-10-01', nullable: false },
        price: { type: 'number', example: 100.0, nullable: false },
      },
      required: [
        'train_id',
        'departure_station_id',
        'arrival_station_id',
        'departure_time',
        'arrival_time',
        'date',
        'price',
      ],
    },
  })
  @HttpCode(200)
  async create(
    @Auth() user: User,
    @Body() request: CreateSchedulesRequest,
  ): Promise<WebResponse<SchedulesResponse>> {
    const result = await this.schedulesService.create(user, request);
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
  ): Promise<WebResponse<SchedulesResponse>> {
    const result = await this.schedulesService.get(user, id);
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
        departure_station_id: { type: 'number', example: 1, nullable: true },
        arrival_station_id: { type: 'number', example: 2, nullable: true },
        departure_time: {
          type: 'string',
          example: '2023-10-01T10:00:00Z',
          nullable: true,
        },
        arrival_time: {
          type: 'string',
          example: '2023-10-01T12:00:00Z',
          nullable: true,
        },
        date: { type: 'string', example: '2023-10-01', nullable: true },
        price: { type: 'number', example: 100.0, nullable: true },
      },
      required: [],
    },
  })
  @HttpCode(200)
  async update(
    @Auth() user: User,
    @Param('id', ParseIntPipe) id: number,
    @Body() request: UpdateSchedulesRequest,
  ): Promise<WebResponse<SchedulesResponse>> {
    request.id = id;
    const result = await this.schedulesService.update(user, request);
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
    await this.schedulesService.remove(user, id);
    return {
      data: true,
    };
  }

  @Get()
  @ApiBearerAuth()
  @HttpCode(200)
  async list(@Auth() user: User): Promise<WebResponse<SchedulesResponse[]>> {
    const result = await this.schedulesService.list(user);
    return {
      data: result,
    };
  }
}
