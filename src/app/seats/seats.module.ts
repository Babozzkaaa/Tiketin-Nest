import { Module } from '@nestjs/common';
import { SeatsService } from './seats.service';
import { SeatsController } from './seats.controller';
import { PrismaService } from '../../common/prisma.service';
import { ValidationService } from '../../common/validation.service';

@Module({
  providers: [SeatsService, PrismaService, ValidationService],
  controllers: [SeatsController],
  exports: [SeatsService],
})
export class SeatsModule {}