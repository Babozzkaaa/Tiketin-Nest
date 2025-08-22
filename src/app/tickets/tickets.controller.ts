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
import { TicketsService } from './tickets.service';
import { WebResponse } from '../../model/web.model';
import {
  TicketsResponse,
  CreateTicketsRequest,
  GetTicketsRequest,
  RemoveTicketsRequest,
  UpdateTicketsRequest,
} from '../../model/tickets.model';
import { User } from '@prisma/client';
import { Auth } from '../../common/auth.decorator';
import { ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { JwtGuard } from 'src/auth/guards/jwt.guard';

interface JwtUser {
  sub: number;
  email: string;
  name: string;
  iat: number;
  exp: number;
}

@UseGuards(JwtGuard)
@Controller('/api/tickets')
export class TicketsController {
  constructor(private ticketsService: TicketsService) {}

  @Post()
  @ApiBearerAuth()
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        user_id: { type: 'integer', example: 1 },
        schedule_id: { type: 'integer', example: 1 },
        seat_id: { type: 'integer', example: 10 },
        passenger_name: { type: 'string', example: 'John Doe' },
        passenger_id_num: { type: 'string', example: 'ID123456789' },
        passenger_email: { type: 'string', example: 'john.doe@email.com' },
        passenger_phone: { type: 'string', example: '+628123456789' },
      },
      required: [
        'schedule_id',
        'seat_id',
        'passenger_name',
        'passenger_id_num',
      ],
    },
  })
  @HttpCode(200)
  async create(
    @Auth() user: JwtUser,
    @Body() request: CreateTicketsRequest | CreateTicketsRequest[],
  ): Promise<WebResponse<TicketsResponse | TicketsResponse[]>> {
    if (Array.isArray(request)) {
      const result = await this.ticketsService.createMultiple(user, request);
      return {
        data: result,
      };
    } else {
      const result = await this.ticketsService.create(user, request);
      return {
        data: result,
      };
    }
  }

  @Get('/:id')
  @ApiBearerAuth()
  @HttpCode(200)
  async get(
    @Auth() user: User,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<WebResponse<TicketsResponse>> {
    const result = await this.ticketsService.get(user, id);
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
        user_id: { type: 'integer', example: 1 },
        schedule_id: { type: 'integer', example: 1 },
        seat_id: { type: 'integer', example: 10 },
        passenger_name: { type: 'string', example: 'John Doe' },
        passenger_id_num: { type: 'string', example: 'ID123456789' },
        passenger_email: { type: 'string', example: 'john.doe@email.com' },
        passenger_phone: { type: 'string', example: '+628123456789' },
      },
      required: [
        'schedule_id',
        'seat_id',
        'passenger_name',
        'passenger_id_num',
      ],
    },
  })
  @HttpCode(200)
  async update(
    @Auth() user: User,
    @Param('id', ParseIntPipe) id: number,
    @Body() request: UpdateTicketsRequest,
  ): Promise<WebResponse<TicketsResponse>> {
    request.id = id;
    const result = await this.ticketsService.update(user, request);
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
    await this.ticketsService.remove(user, id);
    return {
      data: true,
    };
  }

  @Get()
  @ApiBearerAuth()
  @HttpCode(200)
  async list(@Auth() user: User): Promise<WebResponse<TicketsResponse[]>> {
    const result = await this.ticketsService.list(user);
    return {
      data: result,
    };
  }
}
