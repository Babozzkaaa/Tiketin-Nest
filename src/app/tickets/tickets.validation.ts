import { z, ZodType } from 'zod';

export class TicketsValidation {
  static readonly CREATE: ZodType = z.object({
    schedule_id: z.number().min(1).positive(),
    seat_id: z.number().min(1).positive(),
    passenger_name: z.string().min(1).max(100),
    passenger_id_num: z.string().min(1).max(50),
  });

  static readonly CREATE_MULTIPLE: ZodType = z.array(
    z.object({
      schedule_id: z.number().positive(),
      seat_id: z.number().positive(),
      passenger_name: z.string().min(1).max(100),
      passenger_id_num: z.string().min(1).max(50),
    }),
  );

  static readonly GET: ZodType = z.object({
    id: z.number().min(1).positive(),
  });

  static readonly UPDATE: ZodType = z.object({
    id: z.number().min(1).positive(),
    schedule_id: z.number().min(1).positive().optional(),
    seat_id: z.number().min(1).positive().optional(),
    passenger_name: z.string().min(1).max(100).optional(),
    passenger_id_num: z.string().min(1).max(50).optional(),
    status: z.enum(['booked', 'paid', 'canceled']).optional(),
  });

  static readonly REMOVE: ZodType = z.object({
    id: z.number().min(1).positive(),
  });
}
