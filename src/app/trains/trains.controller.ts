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
import { TrainsService } from './trains.service';
import { WebResponse } from '../../model/web.model';
import {
  TrainsResponse,
  CreateTrainsRequest,
  GetTrainsRequest,
  RemoveTrainsRequest,
  UpdateTrainsRequest,
} from '../../model/trains.model';
import { User } from '@prisma/client';
import { Auth } from '../../common/auth.decorator';
import { ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { JwtGuard } from 'src/auth/guards/jwt.guard';

@UseGuards(JwtGuard)
@Controller('/api/trains')
export class TrainsController {
  constructor(private trainsService: TrainsService) {}

  @Post()
  @ApiBearerAuth()
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Argo Lawu', nullable: false },
        code: { type: 'string', example: 'ALW', nullable: false },
        train_type: { type: 'string', example: 'HIGH_SPEED', nullable: false },
      },
      required: ['name', 'code', 'train_type'],
    },
  })
  @HttpCode(200)
  async create(
    @Auth() user: User,
    @Body() request: CreateTrainsRequest,
  ): Promise<WebResponse<TrainsResponse>> {
    const result = await this.trainsService.create(user, request);
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
  ): Promise<WebResponse<TrainsResponse>> {
    const result = await this.trainsService.get(user, id);
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
        name: { type: 'string', example: 'Joglosemarkerto', nullable: true },
        code: { type: 'string', example: 'JSK', nullable: true },
        train_type: { type: 'string', example: 'PASSENGER', nullable: true },
      },
      required: [],
    },
  })
  @HttpCode(200)
  async update(
    @Auth() user: User,
    @Param('id', ParseIntPipe) id: number,
    @Body() request: UpdateTrainsRequest,
  ): Promise<WebResponse<TrainsResponse>> {
    request.id = id;
    const result = await this.trainsService.update(user, request);
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
    await this.trainsService.remove(user, id);
    return {
      data: true,
    };
  }

  @Get()
  @ApiBearerAuth()
  @HttpCode(200)
  async list(@Auth() user: User): Promise<WebResponse<TrainsResponse[]>> {
    const result = await this.trainsService.list(user);
    return {
      data: result,
    };
  }
}
