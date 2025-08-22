import { CarriageType } from '@prisma/client';
import { z, ZodType } from 'zod';

export class CarriagesValidation {
  static readonly CREATE: ZodType = z.object({
    train_id: z.number().min(1).positive(),
    carriage_number: z.number().min(1).positive(),
    carriage_type: z.nativeEnum(CarriageType),
    seat_capacity: z.number().min(1).positive(),
    price: z.coerce.number().min(0),
  });

  static readonly GET: ZodType = z.object({
    id: z.number().min(1).positive(),
  });

  static readonly UPDATE: ZodType = z.object({
    id: z.number().min(1).positive(),
    train_id: z.number().min(1).positive().optional(),
    carriage_number: z.number().min(1).positive().optional(),
    carriage_type: z.nativeEnum(CarriageType),
    seat_capacity: z.number().min(1).positive().optional(),
    price: z.coerce.number().min(0).optional(),
  });

  static readonly REMOVE: ZodType = z.object({
    id: z.number().min(1).positive(),
  });
}
