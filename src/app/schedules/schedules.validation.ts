import { z, ZodType } from 'zod';

export class SchedulesValidation {
  static readonly CREATE: ZodType = z
    .object({
      train_id: z.number().min(1).positive(),
      departure_station_id: z.number().min(1).positive(),
      arrival_station_id: z.number().min(1).positive(),
      departure_time: z.coerce.date(),
      arrival_time: z.coerce.date(),
      date: z.coerce.date(),
    })
    .refine((data) => data.arrival_time > data.departure_time, {
      message: 'arrival time must be after departure time',
      path: ['arrival_time'],
    })
    .refine((data) => data.departure_station_id !== data.arrival_station_id, {
      message: 'departure station cannot be the same as arrival station',
      path: ['arrival_station_id'],
    });

  static readonly GET: ZodType = z.object({
    id: z.number().min(1).positive(),
  });

  static readonly UPDATE: ZodType = z
    .object({
      id: z.number().min(1).positive(),
      train_id: z.number().min(1).positive().optional(),
      departure_station_id: z.number().min(1).positive().optional(),
      arrival_station_id: z.number().min(1).positive().optional(),
      departure_time: z.coerce.date().optional(),
      arrival_time: z.coerce.date().optional(),
      date: z.coerce.date().optional(),
    })
    .refine(
      (data) => {
        if (data.departure_time && data.arrival_time) {
          return data.arrival_time > data.departure_time;
        }
        return true;
      },
      {
        message: 'arrival time must be after departure time',
        path: ['arrival_time'],
      },
    )
    .refine(
      (data) => {
        if (data.departure_station_id && data.arrival_station_id) {
          return data.departure_station_id !== data.arrival_station_id;
        }
        return true;
      },
      {
        message: 'departure station cannot be the same as arrival station',
        path: ['arrival_station_id'],
      },
    );

  static readonly REMOVE: ZodType = z.object({
    id: z.number().min(1).positive(),
  });
}
