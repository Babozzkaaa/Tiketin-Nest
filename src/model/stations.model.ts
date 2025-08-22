export class StationsResponse {
  id: number;
  name: string;
  code: string;
  city: string;
  address: string;
}

export class CreateStationsRequest {
  name: string;
  code: string;
  city: string;
  address: string;
}

export class GetStationsRequest {
  id: number;
}

export class UpdateStationsRequest {
  id: number;
  name?: string;
  code?: string;
  city?: string;
  address?: string;
}

export class RemoveStationsRequest {
  id: number;
}
export class SearchStationsRequest {
  name?: string;
  code?: string;
  city?: string;
  page: number;
  size: number;
}
