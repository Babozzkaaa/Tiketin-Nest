import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
const { Invoice, VirtualAcc } = require('xendit-node');

export interface CreateInvoiceRequest {
  external_id: string;
  amount: number;
  payer_email: string;
  description: string;
  booking_reference?: string;
  customer?: {
    given_names: string;
    email: string;
    mobile_number?: string;
  };
  payment_methods?: string[];
}

export interface CreateVARequest {
  external_id: string;
  bank_code: string;
  name: string;
  amount: number;
  is_closed: boolean;
  expiration_date?: Date;
}

@Injectable()
export class XenditService {
  private invoiceClient: any;

  constructor(private configService: ConfigService) {
    const secretKey = this.configService.get('XENDIT_SECRET_KEY');

    if (secretKey) {
      this.invoiceClient = new Invoice({
        secretKey: secretKey,
      });
    } else {
      this.invoiceClient = null;
    }
  }

  async createInvoice(data: CreateInvoiceRequest) {
    try {
      const secretKey = this.configService.get('XENDIT_SECRET_KEY');
      if (secretKey && secretKey.startsWith('xnd_')) {
        return await this.createRealXenditInvoice(data, secretKey);
      }
      throw new Error('Xendit secret key is missing or invalid.');
    } catch (error) {
      throw new Error(`Xendit invoice creation failed: ${error.message}`);
    }
  }

  async createVirtualAccount(data: CreateVARequest) {
    const secretKey = this.configService.get('XENDIT_SECRET_KEY');
    if (!secretKey || !secretKey.startsWith('xnd_')) {
      throw new Error('Xendit secret key is missing or invalid.');
    }

    const vaClient = new VirtualAcc({ secretKey });

    const vaData = {
      externalID: data.external_id,
      bankCode: data.bank_code,
      name: data.name,
      isClosed: data.is_closed,
      expectedAmount: data.amount,
      expirationDate: data.expiration_date?.toISOString(),
    };

    try {
      const va = await vaClient.createFixedVA({ data: vaData });
      return va;
    } catch (error) {
      throw new Error(`Xendit VA creation failed: ${error.message}`);
    }
  }

  async getInvoice(invoiceId: string) {
    try {
      if (!this.invoiceClient) {
        throw new Error('No real Xendit client available');
      }
      return await this.invoiceClient.getInvoice({
        invoiceId: invoiceId,
      });
    } catch (error) {
      throw new Error(`Failed to get invoice: ${error.message}`);
    }
  }

  verifyWebhookSignature(rawBody: string, signature: string): boolean {
    const crypto = require('crypto');
    const webhookToken = this.configService.get('XENDIT_WEBHOOK_TOKEN');

    const hash = crypto
      .createHmac('sha256', webhookToken)
      .update(rawBody)
      .digest('hex');

    return hash === signature;
  }

  private async createRealXenditInvoice(
    data: CreateInvoiceRequest,
    secretKey: string,
  ) {
    const realInvoiceClient = new Invoice({
      secretKey: secretKey,
    });

    let formattedPhone = data.customer?.mobile_number || '6281234567890';
    formattedPhone = formattedPhone.replace(/[\s\-]/g, '');
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '62' + formattedPhone.substring(1);
    }
    if (!formattedPhone.startsWith('62')) {
      formattedPhone = '62' + formattedPhone.replace(/^0+/, '');
    }

    const customerData = data.customer
      ? {
          ...data.customer,
          mobile_number: formattedPhone,
        }
      : undefined;

    const invoiceData: any = {
      externalId: data.external_id,
      amount: data.amount,
      currency: 'IDR',
      payerEmail: data.payer_email,
      description: data.description,
      invoiceDuration: 86400,
      successRedirectUrl: data.booking_reference
        ? `${this.configService.get('FRONTEND_URL')}/payment/success/${data.booking_reference}`
        : `${this.configService.get('FRONTEND_URL')}/payment/success`,
      failureRedirectUrl: data.booking_reference
        ? `${this.configService.get('FRONTEND_URL')}/payment/failed/${data.booking_reference}`
        : `${this.configService.get('FRONTEND_URL')}/payment/failed`,
      shouldSendEmail: true,
      reminderTime: 1,
      reminderTimeUnit: 'days',
    };

    if (customerData) {
      const fullName = customerData.given_names || 'Customer';
      const nameParts = fullName.trim().split(' ');
      const givenNames = nameParts[0] || 'Customer';
      const surname = nameParts.slice(1).join(' ') || 'User';
      invoiceData.customer = {
        given_names: givenNames,
        surname: surname,
        email: customerData.email || data.payer_email,
        mobile_number: formattedPhone,
      };
    } else {
      invoiceData.customer = {
        given_names: 'Customer',
        surname: 'User',
        email: data.payer_email,
        mobile_number: '6281234567890',
      };
    }

    invoiceData.paymentMethods = data.payment_methods || [
      'CREDIT_CARD',
      'BCA',
      'BNI',
      'BRI',
      'MANDIRI',
      'QRIS',
    ];

    try {
      let customerInfo = {};
      if (customerData) {
        const fullName = customerData.given_names || 'Customer';
        const nameParts = fullName.trim().split(' ');
        const givenNames = nameParts[0] || 'Customer';
        const surname = nameParts.slice(1).join(' ') || 'User';

        const finalGivenNames =
          givenNames || (customerData as any).name?.split(' ')[0] || 'Customer';
        const finalSurname =
          surname ||
          (customerData as any).surname ||
          (customerData as any).name?.split(' ').slice(1).join(' ') ||
          'User';
        const finalPhone =
          formattedPhone ||
          (customerData as any).phone ||
          customerData.mobile_number ||
          '+6281234567890';

        const phoneWithPlus = finalPhone.startsWith('+')
          ? finalPhone
          : `+${finalPhone}`;

        customerInfo = {
          givenNames: finalGivenNames,
          surname: finalSurname,
          email: customerData.email || data.payer_email,
          mobileNumber: phoneWithPlus,
        };
      }

      const paymentLinkData: any = {
        externalId: data.external_id,
        amount: data.amount,
        description: data.description,
        invoiceDuration: 86400,
        currency: 'IDR',
        shouldSendEmail: true,
        payerEmail: data.payer_email,
        successRedirectUrl: data.booking_reference
          ? `${this.configService.get('FRONTEND_URL')}/payment/success/${data.booking_reference}`
          : `${this.configService.get('FRONTEND_URL')}/payment/success`,
        failureRedirectUrl: data.booking_reference
          ? `${this.configService.get('FRONTEND_URL')}/payment/failed/${data.booking_reference}`
          : `${this.configService.get('FRONTEND_URL')}/payment/failed`,
      };

      if (Object.keys(customerInfo).length > 0) {
        paymentLinkData.customer = customerInfo;
      }

      const invoice = await realInvoiceClient.createInvoice({
        data: paymentLinkData,
      });

      return invoice;
    } catch (paymentLinkError) {
      if (paymentLinkError.rawResponse && paymentLinkError.rawResponse.errors) {
        paymentLinkError.rawResponse.errors.forEach((error, index) => {});
      }

      try {
        const invoice = await realInvoiceClient.createInvoice({
          data: invoiceData,
        });

        return invoice;
      } catch (invoiceError) {
        if (invoiceError.rawResponse && invoiceError.rawResponse.errors) {
          invoiceError.rawResponse.errors.forEach((error, index) => {});
        }

        try {
          const ultraMinimal = {
            externalId: data.external_id,
            amount: data.amount,
            description: data.description,
            currency: 'IDR',
          };

          const invoice = await realInvoiceClient.createInvoice({
            data: ultraMinimal,
          });

          return invoice;
        } catch (ultraError) {
          throw ultraError;
        }
      }
    }
  }
}
