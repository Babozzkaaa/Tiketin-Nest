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
import { StationsService } from './stations.service';
import { WebResponse } from '../../model/web.model';
import {
  StationsResponse,
  CreateStationsRequest,
  GetStationsRequest,
  RemoveStationsRequest,
  UpdateStationsRequest,
} from '../../model/stations.model';
import { User } from '@prisma/client';
import { Auth } from '../../common/auth.decorator';
import { ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { JwtGuard } from 'src/auth/guards/jwt.guard';

@UseGuards(JwtGuard)
@Controller('/api/stations')
export class StationsController {
  constructor(private stationsService: StationsService) {}

  @Post()
  @ApiBearerAuth()
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Central Station', nullable: false },
        code: { type: 'string', example: 'CEN123', nullable: false },
        city: { type: 'string', example: 'Metropolis', nullable: false },
        address: {
          type: 'string',
          example: '123 Main St, Metropolis',
          nullable: false,
        },
      },
      required: ['name', 'code', 'city', 'address'],
    },
  })
  @HttpCode(200)
  async create(
    @Auth() user: User,
    @Body() request: CreateStationsRequest,
  ): Promise<WebResponse<StationsResponse>> {
    const result = await this.stationsService.create(user, request);
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
  ): Promise<WebResponse<StationsResponse>> {
    const result = await this.stationsService.get(user, id);
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
        name: { type: 'string', example: 'Updated Station', nullable: true },
        code: { type: 'string', example: 'UPD123', nullable: true },
        city: { type: 'string', example: 'Updated City', nullable: true },
        address: {
          type: 'string',
          example: '456 Updated St, Updated City',
          nullable: true,
        },
      },
      required: [],
    },
  })
  @HttpCode(200)
  async update(
    @Auth() user: User,
    @Param('id', ParseIntPipe) id: number,
    @Body() request: UpdateStationsRequest,
  ): Promise<WebResponse<StationsResponse>> {
    request.id = id;
    const result = await this.stationsService.update(user, request);
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
    await this.stationsService.remove(user, id);
    return {
      data: true,
    };
  }

  @Get()
  @ApiBearerAuth()
  @HttpCode(200)
  async list(@Auth() user: User): Promise<WebResponse<StationsResponse[]>> {
    const result = await this.stationsService.list(user);
    return {
      data: result,
    };
  }
}
