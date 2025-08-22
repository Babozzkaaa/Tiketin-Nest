import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { XenditService } from './xendit.service';
import { XenditController } from './xendit.controller';

@Module({
  imports: [ConfigModule],
  providers: [XenditService],
  controllers: [XenditController],
  exports: [XenditService],
})
export class XenditModule {}
