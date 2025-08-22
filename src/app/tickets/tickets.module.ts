import { Module } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { TicketsController } from './tickets.controller';
import { PrismaService } from '../../common/prisma.service';
import { ValidationService } from '../../common/validation.service';

@Module({
  providers: [TicketsService, PrismaService, ValidationService],
  controllers: [TicketsController],
  exports: [TicketsService],
})
export class TicketsModule {}