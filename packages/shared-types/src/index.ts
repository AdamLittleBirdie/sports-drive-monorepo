export interface HealthResponse {
  status: 'ok' | 'error';
  timestamp: string;
  version: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  statusCode: number;
}
