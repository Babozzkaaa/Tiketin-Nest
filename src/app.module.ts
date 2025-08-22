import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { WinstonModule } from 'nest-winston';
import { JwtModule, JwtService } from '@nestjs/jwt';
import * as winston from 'winston';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { PrismaService } from './common/prisma.service';
import { APP_GUARD } from '@nestjs/core';
import { JwtGuard } from './auth/guards/jwt.guard';
// import { CacheModule } from '@nestjs/cache-manager';
import { AppService } from './app.service';
import { AppController } from './app.controller';
import { TrainsModule } from './app/trains/trains.module';
import { StationsModule } from './app/stations/stations.module';
import { CarriagesModule } from './app/carriages/carriages.module';
import { SeatsModule } from './app/seats/seats.module';
import { SchedulesModule } from './app/schedules/schedules.module';
import { XenditModule } from './xendit/xendit.module';
import { PaymentsModule } from './app/payments/payments.module';
import { TicketsModule } from './app/tickets/tickets.module';
import { BookingModule } from './booking/booking.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    JwtModule.register({
      global: true,
      secret: process.env.jwtSecretKey,
      signOptions: { expiresIn: '1h' },
    }),
    WinstonModule.forRoot({
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(winston.format.timestamp()),
        }),
      ],
    }),
    // CacheModule.register({
    //   ttl: 60000,
    //   max: 109,
    //   isGlobal: true,
    // }),
    UserModule,
    AuthModule,
    TrainsModule,
    StationsModule,
    CarriagesModule,
    SeatsModule,
    SchedulesModule,
    TicketsModule,
    PaymentsModule,
    XenditModule,
    BookingModule,
  ],
  controllers: [AppController],
  providers: [PrismaService, JwtService, AppService],
})
export class AppModule {}
