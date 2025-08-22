export class TicketsResponse {
  id: number;
  user_id: number;
  schedule_id: number;
  booking_reference?: string;
  seat_id: number;
  passenger_name: string;
  passenger_id_num: string;
  passenger_email?: string;
  passenger_phone?: string;
  status: string; // 'booked', 'cancelled', 'completed'
}

export class CreateTicketsRequest {
  schedule_id: number;
  seat_id: number;
  passenger_name: string;
  passenger_id_num: string;
  passenger_email?: string;
  passenger_phone?: string;
}

export class GetTicketsRequest {
  id: number;
}

export class UpdateTicketsRequest {
  id: number;
  schedule_id?: number;
  seat_id?: number;
  passenger_name?: string;
  passenger_id_num?: string;
  passenger_email?: string;
  passenger_phone?: string;
  status?: string; // 'booked', 'cancelled', 'completed'
}
export class SearchTicketsRequest {
  user_id?: number;
  schedule_id?: number;
  booking_reference?: string;
  seat_id?: number;
  passenger_name?: string;
  status?: string; // 'booked', 'cancelled', 'completed'
  page: number;
  size: number;
}
export class RemoveTicketsRequest {
  id: number;
}
