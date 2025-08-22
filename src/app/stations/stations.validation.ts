import { z, ZodType } from 'zod';

export class StationsValidation {
  static readonly CREATE: ZodType = z.object({
    name: z.string().min(1).max(100),
    code: z.string().min(1).max(100),
    city: z.string().min(1).max(100),
    address: z.string().min(1).max(200),
  });

  static readonly GET: ZodType = z.object({
    id: z.number().min(1).positive(),
  });

  static readonly UPDATE: ZodType = z.object({
    id: z.number().min(1).positive(),
    name: z.string().min(1).max(100).optional(),
    code: z.string().min(1).max(100).optional(),
    city: z.string().min(1).max(100).optional(),
    address: z.string().min(1).max(200).optional(),
  });

  static readonly REMOVE: ZodType = z.object({
    id: z.number().min(1).positive(),
  });
}
