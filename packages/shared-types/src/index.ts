export interface HealthResponse {
  status: 'ok' | 'error';
  timestamp: string;
  uptime: number;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  timestamp: string;
}
