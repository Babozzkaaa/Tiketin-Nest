import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Req,
  Headers,
  RawBodyRequest,
  HttpException,
} from '@nestjs/common';
import {
  XenditService,
  CreateInvoiceRequest,
  CreateVARequest,
} from './xendit.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

export interface XenditWebhookRequest {
  id: string;
  external_id: string;
  status: string;
  amount: number;
  paid_amount?: number;
  payment_method?: string;
  payment_channel?: string;
  paid_at?: string;
}

@ApiTags('Xendit')
@Controller('/api/xendit')
export class XenditController {
  constructor(private xenditService: XenditService) {}

  @Post('/invoice')
  @ApiOperation({ summary: 'Create payment invoice' })
  @ApiResponse({ status: 200, description: 'Invoice created successfully' })
  @HttpCode(200)
  async createInvoice(@Body() request: CreateInvoiceRequest) {
    try {
      const invoice = await this.xenditService.createInvoice(request);

      const response = {
        success: true,
        data: invoice,
      };
      return response;
    } catch (error) {
      console.error('❌ === XENDIT CONTROLLER ERROR ===');
      console.error('🔧 Error details:', error);
      console.error('=====================================');
      throw new HttpException(error.message, 400);
    }
  }

  @Post('/virtual-account')
  @ApiOperation({ summary: 'Create virtual account' })
  @ApiResponse({
    status: 200,
    description: 'Virtual account created successfully',
  })
  @HttpCode(200)
  async createVirtualAccount(@Body() request: CreateVARequest) {
    try {
      const va = await this.xenditService.createVirtualAccount(request);
      const response = {
        success: true,
        data: va,
      };
      return response;
    } catch (error) {
      console.error('❌ === XENDIT CONTROLLER VA ERROR ===');
      console.error('❗ VA Error message:', error.message);
      console.error('========================================');
      throw new HttpException(error.message, 400);
    }
  }

  @Get('/invoice/:invoiceId')
  @ApiOperation({ summary: 'Get invoice details' })
  @ApiResponse({
    status: 200,
    description: 'Invoice details retrieved successfully',
  })
  @HttpCode(200)
  async getInvoice(@Param('invoiceId') invoiceId: string) {
    try {
      const invoice = await this.xenditService.getInvoice(invoiceId);

      const response = {
        success: true,
        data: invoice,
      };

      return response;
    } catch (error) {
      console.error('❌ === XENDIT CONTROLLER GET INVOICE ERROR ===');

      console.error('❗ Get Invoice Error message:', error.message);
      console.error('================================================');

      throw new HttpException(error.message, 400);
    }
  }

  @Post('/webhook')
  @ApiOperation({ summary: 'Handle Xendit webhook' })
  @ApiResponse({ status: 200, description: 'Webhook processed successfully' })
  @HttpCode(200)
  async handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('x-callback-token') signature: string,
    @Body() webhookData: XenditWebhookRequest,
  ) {
    try {
      const rawBody = req.rawBody?.toString() || JSON.stringify(webhookData);

      const isValid = this.xenditService.verifyWebhookSignature(
        rawBody,
        signature,
      );

      const response = {
        success: true,
        message: 'Webhook processed successfully',
        processed_data: {
          external_id: webhookData.external_id,
          status: webhookData.status,
          amount: webhookData.amount,
          timestamp: new Date().toISOString(),
        },
      };

      return response;
    } catch (error) {
      console.error('❌ === XENDIT CONTROLLER WEBHOOK ERROR ===');
      console.error('❗ Webhook Error message:', error.message);
      console.error('=============================================');

      throw new HttpException(error.message, 400);
    }
  }
}
