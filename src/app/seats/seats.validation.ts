import { z, ZodType } from 'zod';

export class SeatsValidation {
  static readonly CREATE: ZodType = z.object({
    carriage_id: z.number().min(1).positive(),
    seat_number: z.string().min(1).max(10),
  });

  static readonly GET: ZodType = z.object({
    id: z.number().min(1).positive(),
    carriage_id: z.number().min(1).positive().optional(),
  });

  static readonly UPDATE: ZodType = z.object({
    id: z.number().min(1).positive(),
    carriage_id: z.number().min(1).positive().optional(),
    seat_number: z.string().min(1).max(10).optional(),
  });

  static readonly REMOVE: ZodType = z.object({
    id: z.number().min(1).positive(),
    carriage_id: z.number().min(1).positive().optional(),
  });

  static readonly GENERATE_SEATS: ZodType = z.object({
    seat_pattern: z
      .string()
      .regex(/^\d+\+\d+$/, 'Invalid seat pattern. Use format like 2+2, 2+3'),
    rows: z.number().min(1).max(50),
    start_row: z.number().min(1).optional().default(1),
  });

  static readonly GET_BY_CARRIAGE: ZodType = z.object({
    carriage_id: z.number().min(1).positive(),
  });

  static readonly GET_AVAILABLE_BY_SCHEDULE: ZodType = z.object({
    schedule_id: z.number().min(1).positive(),
  });
}
