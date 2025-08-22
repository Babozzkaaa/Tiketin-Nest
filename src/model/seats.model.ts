export class SeatsResponse {
  id: number;
  carriage_id: number;
  seat_number: string;
}

export class CreateSeatsRequest {
  carriage_id: number;
  seat_number: string;
}

export class GetSeatsRequest {
  id: number;
}

export class UpdateSeatsRequest {
  id: number;
  carriage_id?: number;
  seat_number?: string;
}

export class RemoveSeatsRequest {
  id: number;
}

export class SearchSeatsRequest {
  carriage_id?: number;
  seat_number?: string;
  page: number;
  size: number;
}

export class SeatAvailabilityResponse {
  id: number;
  carriage_id: number;
  seat_number: string;
  is_available: boolean;
  is_booked: boolean;
  ticket_id?: number;
  carriage?: {
    id: number;
    carriage_number: number;
    carriage_type: string;
  };
}

export class SeatLayoutResponse {
  carriage_id: number;
  carriage_type: string;
  seat_capacity: number;
  layout_pattern: string; // e.g., "2+2", "2+3"
  seats: {
    id: number;
    seat_number: string;
    row: number;
    position: string; // 'A', 'B', 'C', 'D'
    is_window: boolean;
    is_aisle: boolean;
  }[];
}

export class TrainSeatAvailabilityResponse {
  train_id: number;
  total_seats: number;
  available_seats: number;
  booked_seats: number;
  carriages: {
    id: number;
    carriage_number: number;
    carriage_type: string;
    total_seats: number;
    available_seats: number;
    seats: SeatAvailabilityResponse[];
  }[];
}

export class GenerateSeatsRequest {
  seat_pattern: string; // '2+2', '2+3', '1+2'
  rows: number;
  start_row?: number;
}
