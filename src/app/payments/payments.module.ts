import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { PrismaService } from '../../common/prisma.service';
import { ValidationService } from '../../common/validation.service';
import { XenditService } from '../../xendit/xendit.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [PaymentsService, PrismaService, ValidationService, XenditService],
  controllers: [PaymentsController],
  exports: [PaymentsService],
})
export class PaymentsModule {}
