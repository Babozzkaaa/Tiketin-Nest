import { Module } from '@nestjs/common';
import { StationsService } from './stations.service';
import { StationsController } from './stations.controller';
import { PrismaService } from '../../common/prisma.service';
import { ValidationService } from '../../common/validation.service';

@Module({
  providers: [StationsService, PrismaService, ValidationService],
  controllers: [StationsController],
  exports: [StationsService],
})
export class StationsModule {}