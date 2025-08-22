export class PaymentsResponse {
  id: number;
  booking_reference: string;
  payment_method: string;
  payment_status: string;
  payment_date: Date;
  amount: number;
  xendit_invoice_id?: string;
  xendit_payment_id?: string;
  payment_url?: string;
}

export class CreatePaymentsRequest {
  booking_reference: string;
  payment_method: string;
  amount: number;
  xendit_invoice_id?: string;
  xendit_payment_id?: string;
  payment_url?: string;
  payment_status?: string; // e.g., 'pending', 'completed', 'failed'
  payment_date?: Date;
}

export class CreateInvoicePaymentRequest {
  booking_reference: string;
  payment_method: string; // 'xendit_invoice', 'xendit_va', etc.
}

export class GetPaymentsRequest {
  id: number;
}

export class UpdatePaymentsRequest {
  id: number;
  payment_status?: string;
  xendit_payment_id?: string;
}

export class RemovePaymentsRequest {
  id: number;
}

export interface CreateInvoiceRequest {
  external_id: string; //  Unique identifier
  amount: number; // Payment amount
  payer_email: string; //  Customer email
  description: string; //  Payment description
  customer?: {
    given_names: string;
    email: string;
    mobile_number?: string;
  };
  customer_notification_preference?: {
    invoice_created?: string[];
    invoice_reminder?: string[];
    invoice_paid?: string[];
    invoice_expired?: string[];
  };
  success_redirect_url?: string;
  failure_redirect_url?: string;
  payment_methods?: string[];
  currency?: string;
}

export class CreateVARequest {
  external_id: string; // Unique identifier
  bank_code: string; // Bank code (BCA, BNI, BRI, etc.)
  name: string; //  Account holder name
  amount: number; //  Payment amount
  is_closed: boolean; //  true for fixed amount
}

export class XenditWebhookRequest {
  id: string;
  external_id: string;
  status: string;
  amount: number;
  paid_amount?: number;
  payment_method?: string;
  payment_channel?: string;
  paid_at?: string;

  user_id?: string;
  invoice_id?: string;
  invoice_url?: string;
  currency?: string;
  payment_id?: string;
  created?: string;
  updated?: string;
}

export class SearchPaymentsRequest {
  booking_reference?: string;
  payment_method?: string; // e.g., 'credit_card', 'bank_transfer'
  payment_status?: string; // e.g., 'pending', 'completed', 'failed'
  page: number;
  size: number;
}
