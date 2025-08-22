export class SchedulesResponse {
  id: number;
  train_id: number;
  departure_station_id: number;
  arrival_station_id: number;
  departure_time: Date;
  arrival_time: Date;
  date: Date;
}

export class CreateSchedulesRequest {
  train_id: number;
  departure_station_id: number;
  arrival_station_id: number;
  departure_time: Date;
  arrival_time: Date;
  date: Date;
}

export class GetSchedulesRequest {
  id: number;
}

export class UpdateSchedulesRequest {
  id: number;
  train_id?: number;
  departure_station_id?: number;
  arrival_station_id?: number;
  departure_time?: Date;
  arrival_time?: Date;
  date?: Date;
}

export class RemoveSchedulesRequest {
  id: number;
}

export class SearchSchedulesRequest {
  train_id?: number;
  departure_station_id?: number;
  arrival_station_id?: number;
  page: number;
  size: number;
}
