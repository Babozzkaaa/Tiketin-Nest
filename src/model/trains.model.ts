import { TrainType } from '@prisma/client';

export class TrainsResponse {
  id: number;
  name: string;
  code: string;
  train_type: TrainType;
}

export class CreateTrainsRequest {
  name: string;
  code: string;
  train_type: TrainType;
}

export class GetTrainsRequest {
  id: number;
}

export class UpdateTrainsRequest {
  id: number;
  name?: string;
  code?: string;
  train_type?: TrainType;
}

export class RemoveTrainsRequest {
  id: number;
}

export class SearchTrainsRequest {
  name?: string;
  code?: string;
  train_type?: TrainType;
  page: number;
  size: number;
}
