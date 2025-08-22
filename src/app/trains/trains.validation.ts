import { TrainType } from '@prisma/client';
import { z, ZodType } from 'zod';

export class TrainsValidation {
  static readonly CREATE: ZodType = z.object({
    name: z.string().min(1).max(100),
    code: z.string().min(1).max(20),
    train_type: z.nativeEnum(TrainType),
  });

  static readonly GET: ZodType = z.object({
    id: z.number().min(1).positive(),
  });

  static readonly UPDATE: ZodType = z.object({
    id: z.number().min(1).positive(),
    name: z.string().min(1).max(100).optional(),
    code: z.string().min(1).max(20).optional(),
    train_type: z.nativeEnum(TrainType).optional(),
  });

  static readonly REMOVE: ZodType = z.object({
    id: z.number().min(1).positive(),
  });
}
