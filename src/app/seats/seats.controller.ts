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
  Query,
} from '@nestjs/common';
import { SeatsService } from './seats.service';
import { WebResponse } from '../../model/web.model';
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
import { User } from '@prisma/client';
import { Auth } from '../../common/auth.decorator';
import { ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { JwtGuard } from 'src/auth/guards/jwt.guard';

@UseGuards(JwtGuard)
@Controller('/api/seats')
export class SeatsController {
  constructor(private seatsService: SeatsService) {}

  @Post()
  @ApiBearerAuth()
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        carriage_id: { type: 'number', example: 1, nullable: false },
        seat_number: { type: 'string', example: 'A1', nullable: false },
      },
      required: ['carriage_id', 'seat_number'],
    },
  })
  @HttpCode(200)
  async create(
    @Auth() user: User,
    @Body() request: CreateSeatsRequest,
  ): Promise<WebResponse<SeatsResponse>> {
    const result = await this.seatsService.create(user, request);
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
  ): Promise<WebResponse<SeatsResponse>> {
    const result = await this.seatsService.get(user, id);
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
        carriage_id: { type: 'number', example: 1, nullable: true },
        seat_number: { type: 'string', example: 'A1', nullable: true },
      },
      required: [],
    },
  })
  @HttpCode(200)
  async update(
    @Auth() user: User,
    @Param('id', ParseIntPipe) id: number,
    @Body() request: UpdateSeatsRequest,
  ): Promise<WebResponse<SeatsResponse>> {
    request.id = id;
    const result = await this.seatsService.update(user, request);
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
    await this.seatsService.remove(user, id);
    return {
      data: true,
    };
  }

  @Get()
  @ApiBearerAuth()
  @HttpCode(200)
  async list(@Auth() user: User): Promise<WebResponse<SeatsResponse[]>> {
    const result = await this.seatsService.list(user);
    return {
      data: result,
    };
  }

  @Get('/carriage/:carriageId')
  @ApiBearerAuth()
  @HttpCode(200)
  async getSeatsByCarriage(
    @Auth() user: User,
    @Param('carriageId', ParseIntPipe) carriageId: number,
  ): Promise<WebResponse<SeatsResponse[]>> {
    const result = await this.seatsService.getSeatsByCarriage(user, carriageId);
    return {
      data: result,
    };
  }

  @Get('/schedule/:scheduleId/available')
  @ApiBearerAuth()
  @HttpCode(200)
  async getAvailableSeats(
    @Auth() user: User,
    @Param('scheduleId', ParseIntPipe) scheduleId: number,
  ): Promise<WebResponse<SeatAvailabilityResponse[]>> {
    const result = await this.seatsService.getAvailableSeatsBySchedule(
      user,
      scheduleId,
    );
    return {
      data: result,
    };
  }

  @Get('/carriage/:carriageId/layout')
  @ApiBearerAuth()
  @HttpCode(200)
  async getSeatLayout(
    @Auth() user: User,
    @Param('carriageId', ParseIntPipe) carriageId: number,
  ): Promise<WebResponse<SeatLayoutResponse>> {
    const result = await this.seatsService.getSeatLayout(user, carriageId);
    return {
      data: result,
    };
  }

  @Post('/carriage/:carriageId/generate')
  @ApiBearerAuth()
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        seat_pattern: {
          type: 'string',
          example: '2+2',
          description: 'Seat layout pattern (2+2, 2+3, 1+2)',
        },
        rows: {
          type: 'number',
          example: 20,
          description: 'Number of seat rows',
        },
        start_row: {
          type: 'number',
          example: 1,
          description: 'Starting row number',
        },
      },
      required: ['seat_pattern', 'rows'],
    },
  })
  @HttpCode(200)
  async generateSeats(
    @Auth() user: User,
    @Param('carriageId', ParseIntPipe) carriageId: number,
    @Body() request: GenerateSeatsRequest,
  ): Promise<WebResponse<SeatsResponse[]>> {
    const result = await this.seatsService.generateSeatsForCarriage(
      user,
      carriageId,
      request,
    );
    return {
      data: result,
    };
  }

  @Get('/train/:trainId/available')
  @ApiBearerAuth()
  @HttpCode(200)
  async getAvailableSeatsByTrain(
    @Auth() user: User,
    @Param('trainId', ParseIntPipe) trainId: number,
    @Query('scheduleId') scheduleId?: number,
  ): Promise<WebResponse<TrainSeatAvailabilityResponse>> {
    const result = await this.seatsService.getTrainSeatAvailability(
      user,
      trainId,
      scheduleId,
    );
    return {
      data: result,
    };
  }
}
