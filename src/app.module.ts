import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { WinstonModule } from 'nest-winston';
import { JwtModule, JwtService } from '@nestjs/jwt';
import * as winston from 'winston';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { PrismaService } from './common/prisma.service';
// import { AddressModule } from './address/address.module';
// import { ContactModule } from './contact/contact.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtGuard } from './auth/guards/jwt.guard';
// import { CacheModule } from '@nestjs/cache-manager';
import { AppService } from './app.service';
import { AppController } from './app.controller';

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
    // ContactModule,
    // AddressModule,
  ],
  controllers: [AppController],
  providers: [PrismaService, JwtService, AppService],
})
export class AppModule {}
