import { z, ZodType } from 'zod';

export class PaymentsValidation {
  static readonly CREATE: ZodType = z.object({
    booking_reference: z.string().min(1).max(100).optional(),
    payment_method: z.string().min(1).max(50),
    payment_status: z.string().min(1).max(20),
    payment_date: z.coerce.date(),
    amount: z.coerce.number().min(0),
    xendit_invoice_id: z.string().max(100).optional().nullable(),
    xendit_payment_id: z.string().max(100).optional().nullable(),
    payment_url: z.string().max(500).optional().nullable(),
  });

  static readonly CREATE_INVOICE_PAYMENT: ZodType = z.object({
    booking_reference: z.string().min(1).max(100).optional(),
    payment_method: z.string().min(1).max(50),
  });

  static readonly GET: ZodType = z.object({
    id: z.number().min(1).positive(),
  });

  static readonly UPDATE: ZodType = z.object({
    id: z.number().min(1).positive(),
    payment_method: z.string().min(1).max(50).optional(),
    payment_status: z.string().min(1).max(20).optional(),
    payment_date: z.coerce.date().optional(),
    amount: z.coerce.number().min(0).optional(),
    xendit_invoice_id: z.string().max(100).optional().nullable(),
    xendit_payment_id: z.string().max(100).optional().nullable(),
    payment_url: z.string().max(500).optional().nullable(),
  });

  static readonly REMOVE: ZodType = z.object({
    id: z.number().min(1).positive(),
  });

  static readonly WEBHOOK: ZodType = z.object({
    id: z.string().min(1),
    external_id: z.string().min(1),
    status: z.string().min(1),
    amount: z.number().min(0),
    paid_amount: z.number().min(0).optional(),
    payment_method: z.string().optional(),
    payment_channel: z.string().optional(),
    paid_at: z.string().optional(),
    user_id: z.string().optional(),
    invoice_id: z.string().optional(),
    invoice_url: z.string().optional(),
    currency: z.string().optional(),
    payment_id: z.string().optional(),
    created: z.string().optional(),
    updated: z.string().optional(),
  });
}
