import { Module } from '@nestjs/common';
import { TrainsService } from './trains.service';
import { TrainsController } from './trains.controller';
import { PrismaService } from '../../common/prisma.service';
import { ValidationService } from '../../common/validation.service';

@Module({
  providers: [TrainsService, PrismaService, ValidationService],
  controllers: [TrainsController],
  exports: [TrainsService],
})
export class TrainsModule {}
