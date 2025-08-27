export interface Client {
  id: number;
  name: string;
  document?: string;
  phone?: string;
  email?: string;
  address?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ClientCreateData {
  name: string;
  document?: string;
  phone?: string;
  email?: string;
  address?: string;
}

export interface ClientUpdateData extends ClientCreateData {}

export interface ClientSearchParams {
  name?: string;
  page?: number;
  pageSize?: number;
}
