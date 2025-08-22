import { CarriageType } from '@prisma/client';

export class CarriagesResponse {
  id: number;
  train_id: number;
  carriage_number: number;
  carriage_type: CarriageType;
  seat_capacity: number;
  price: number;
}

export class CreateCarriagesRequest {
  train_id: number;
  carriage_number: number;
  carriage_type: CarriageType;
  seat_capacity: number;
  price: number;
}

export class GetCarriagesRequest {
  id: number;
}

export class UpdateCarriagesRequest {
  id: number;
  train_id?: number;
  carriage_number?: number;
  carriage_type?: CarriageType;
  seat_capacity?: number;
  price: number;
}

export class RemoveCarriagesRequest {
  id: number;
}

export class SearchCarriagesRequest {
  train_id?: number;
  carriage_number?: number;
  carriage_type?: CarriageType;
  page: number;
  size: number;
}
