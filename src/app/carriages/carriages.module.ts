import { Module } from '@nestjs/common';
import { CarriagesService } from './carriages.service';
import { CarriagesController } from './carriages.controller';
import { PrismaService } from '../../common/prisma.service';
import { ValidationService } from '../../common/validation.service';

@Module({
  providers: [CarriagesService, PrismaService, ValidationService],
  controllers: [CarriagesController],
  exports: [CarriagesService],
})
export class CarriagesModule {}