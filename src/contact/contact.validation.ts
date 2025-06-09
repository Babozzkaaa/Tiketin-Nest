// import { z, ZodType } from 'zod';

// export class ContactValidation {
//   static readonly CREATE: ZodType = z.object({
//     first_name: z.string().min(1).max(100),
//     last_name: z.string().min(1).max(100).optional(),
//     email: z
//       .string()
//       .email('Invalid email format')
//       .optional()
//       .transform((val) => val || undefined),
//     phone: z
//       .string()
//       .regex(/^[0-9]+$/, 'Phone number must contain only digits')
//       .min(8, 'Phone number must be at least 8 digits')
//       .max(15, 'Phone number must not exceed 15 digits')
//       .optional()
//       .transform((val) => val || undefined),
//   });
//   static readonly UPDATE: ZodType = z.object({
//     id: z.number().positive(),
//     first_name: z.string().min(1).max(100),
//     last_name: z.string().min(1).max(100).optional(),
//     email: z
//       .string()
//       .email('Invalid email format')
//       .optional()
//       .transform((val) => val || undefined),
//     phone: z
//       .string()
//       .regex(/^[0-9]+$/, 'Phone number must contain only digits')
//       .min(8, 'Phone number must be at least 8 digits')
//       .max(15, 'Phone number must not exceed 15 digits')
//       .optional()
//       .transform((val) => val || undefined),
//   });
//   static readonly SEARCH: ZodType = z.object({
//     name: z.string().min(1).max(100).optional(),
//     email: z.string().min(1).max(100).optional(),
//     phone: z.string().min(1).optional(),
//     page: z.number().min(1).positive(),
//     size: z.number().min(1).max(100).positive(),
//   });
// }
