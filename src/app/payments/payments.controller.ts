import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  UseGuards,
  Headers,
  Req,
  RawBodyRequest,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { WebResponse } from '../../model/web.model';
import {
  CreatePaymentsRequest,
  PaymentsResponse,
  XenditWebhookRequest,
} from '../../model/payments.model';
import { User } from '@prisma/client';
import { Auth } from '../../common/auth.decorator';
import { ApiBearerAuth, ApiBody, ApiTags, ApiOperation } from '@nestjs/swagger';
import { JwtGuard } from '../../auth/guards/jwt.guard';

@ApiTags('Payments')
@Controller('/api/payments')
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @Get('/booking/:bookingReference')
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get payment by booking reference' })
  @HttpCode(200)
  async getPaymentByBookingRef(
    @Param('bookingReference') bookingReference: string,
  ): Promise<WebResponse<PaymentsResponse>> {
    const result =
      await this.paymentsService.getPaymentByBookingRef(bookingReference);
    return { data: result };
  }

  @Get()
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all user payments' })
  @HttpCode(200)
  async list(@Auth() user: User): Promise<WebResponse<PaymentsResponse[]>> {
    const result = await this.paymentsService.list(user);
    return { data: result };
  }

  @Post('create-payment')
  @ApiBearerAuth()
  @HttpCode(200)
  async createPayment(
    @Auth() user: User,
    @Body() request: CreatePaymentsRequest,
  ): Promise<WebResponse<PaymentsResponse>> {
    const result = await this.paymentsService.createPayment(user, request);
    return {
      data: result,
    };
  }

  @Post('/webhook/xendit')
  @ApiOperation({ summary: 'Handle Xendit webhook notifications' })
  @ApiBody({
    description: 'Xendit webhook payload',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: 'inv_123' },
        external_id: {
          type: 'string',
          example: 'tiketin_BOOK-20250806-ABC123_1733472000000',
        },
        status: { type: 'string', example: 'PAID' },
        amount: { type: 'number', example: 200000 },
        payment_method: { type: 'string', example: 'CREDIT_CARD' },
        paid_at: { type: 'string', example: '2025-08-06T10:30:00Z' },
      },
    },
  })
  @HttpCode(200)
  async handleXenditWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('x-callback-token') signature: string,
    @Body() webhookData: XenditWebhookRequest,
  ): Promise<{ success: boolean; message: string }> {
    const result = await this.paymentsService.handleXenditWebhook(
      req,
      signature,
      webhookData,
    );
    return result;
  }

  // @Post('/test-webhook')
  // @UseGuards(JwtGuard)
  // @ApiBearerAuth()
  // @ApiOperation({ summary: 'Test webhook processing (Development only)' })
  // @ApiBody({
  //   schema: {
  //     type: 'object',
  //     properties: {
  //       booking_reference: {
  //         type: 'string',
  //         example: 'BOOK-20250806-ABC123',
  //         description: 'Booking reference to test',
  //       },
  //       status: {
  //         type: 'string',
  //         example: 'PAID',
  //         enum: ['PAID', 'EXPIRED', 'FAILED'],
  //         description: 'Test payment status',
  //       },
  //     },
  //     required: ['booking_reference', 'status'],
  //   },
  // })
  // @HttpCode(200)

  // async testWebhook(
  //   @Body()
  //   testData: {
  //     booking_reference: string;
  //     status: 'PAID' | 'EXPIRED' | 'FAILED';
  //   },
  // ): Promise<{ success: boolean; message: string }> {
  //   const result = await this.paymentsService.testWebhook(
  //     testData.booking_reference,
  //     testData.status,
  //   );
  //   return result;
  // }
}
