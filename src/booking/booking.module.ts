import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BookingService } from './booking.service';
import { BookingController } from './booking.controller';
import { PrismaService } from 'src/common/prisma.service';
import { XenditService } from 'src/xendit/xendit.service';

@Module({
  imports: [ConfigModule],
  providers: [BookingService, PrismaService, XenditService],
  controllers: [BookingController],
  exports: [BookingService],
})
export class BookingModule {}
