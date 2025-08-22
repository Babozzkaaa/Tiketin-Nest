import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  BookingService,
  CreateBookingRequest,
  BookingResponse,
} from './booking.service';
import { WebResponse } from '../model/web.model';
import { Auth } from '../common/auth.decorator';
import { ApiBearerAuth, ApiBody, ApiTags, ApiOperation } from '@nestjs/swagger';
import { JwtGuard } from '../auth/guards/jwt.guard';

interface JwtUser {
  sub: number;
  email: string;
  name: string;
  iat: number;
  exp: number;
}

@ApiTags('Bookings')
@UseGuards(JwtGuard)
@Controller('/api/bookings')
export class BookingController {
  constructor(private bookingService: BookingService) {}

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create booking with multiple tickets' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        tickets: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              schedule_id: { type: 'number', example: 1 },
              seat_id: { type: 'number', example: 10 },
              passenger_name: { type: 'string', example: 'John Doe' },
              passenger_id_num: { type: 'string', example: 'ID123456789' },
              passenger_email: {
                type: 'string',
                example: 'john.doe@email.com',
              },
              passenger_phone: { type: 'string', example: '+628123456789' },
            },
            required: [
              'schedule_id',
              'seat_id',
              'passenger_name',
              'passenger_id_num',
            ],
          },
          example: [
            {
              schedule_id: 1,
              seat_id: 10,
              passenger_name: 'John Doe',
              passenger_id_num: 'ID123456789',
              passenger_email: 'john.doe@email.com',
              passenger_phone: '+628123456789',
            },
            {
              schedule_id: 1,
              seat_id: 11,
              passenger_name: 'Jane Doe',
              passenger_id_num: 'ID987654321',
              passenger_email: 'jane.doe@email.com',
              passenger_phone: '+628987654321',
            },
          ],
        },
        payment_method: {
          type: 'string',
          enum: ['xendit_invoice', 'bank_transfer'],
          example: 'xendit_invoice',
        },
      },
      required: ['tickets', 'payment_method'],
    },
  })
  @HttpCode(200)
  async createBooking(
    @Auth() user: JwtUser,
    @Body() request: CreateBookingRequest,
  ): Promise<WebResponse<BookingResponse>> {
    console.log('🎯 === BOOKING CONTROLLER START ===');
    console.log('👤 User:', {
      id: user.sub,
      email: user.email,
      name: user.name,
    });
    console.log('📋 Request:', {
      payment_method: request.payment_method,
      tickets_count: request.tickets.length,
      tickets: request.tickets.map((t) => ({
        schedule_id: t.schedule_id,
        seat_id: t.seat_id,
        passenger_name: t.passenger_name,
        passenger_email: t.passenger_email,
        passenger_phone: t.passenger_phone,
      })),
    });
    console.log('🌐 Frontend URL configured:', process.env.FRONTEND_URL);

    const result = await this.bookingService.createBooking(user, request);

    console.log('✅ === BOOKING CONTROLLER SUCCESS ===');
    console.log('📦 Result:', {
      booking_reference: result.booking_reference,
      amount: result.amount,
      payment_url: result.payment_url ? '✓ URL generated' : '❌ No URL',
      payment_id: result.payment_id,
      tickets_created: result.tickets.length,
    });
    console.log('🔗 Payment URL:', result.payment_url);
    console.log('=========================================');

    return {
      data: result,
    };
  }

  @Get('/:bookingReference')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get booking details by reference' })
  @HttpCode(200)
  async getBookingDetails(
    @Param('bookingReference') bookingReference: string,
  ): Promise<WebResponse<any>> {
    console.log('🔍 === GET BOOKING DETAILS ===');
    console.log('📋 Booking Reference:', bookingReference);

    const result =
      await this.bookingService.getBookingDetails(bookingReference);

    console.log('✅ Booking details found:', {
      booking_reference: result.booking_reference,
      tickets_count: result.tickets?.length || 0,
      payment_status: result.payment_status,
      amount: result.amount,
    });
    console.log('===============================');

    return {
      data: result,
    };
  }
}
