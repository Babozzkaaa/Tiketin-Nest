import { Module } from '@nestjs/common';
import { SchedulesService } from './schedules.service';
import { SchedulesController } from './schedules.controller';
import { PrismaService } from '../../common/prisma.service';
import { ValidationService } from '../../common/validation.service';

@Module({
  providers: [SchedulesService, PrismaService, ValidationService],
  controllers: [SchedulesController],
  exports: [SchedulesService],
})
export class SchedulesModule {}