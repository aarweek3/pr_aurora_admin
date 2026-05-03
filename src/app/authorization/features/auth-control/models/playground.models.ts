export interface PlaygroundRequest {
  id: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  endpoint: string;
  body?: any;
  headers?: Record<string, string>;
  withCredentials: boolean;
  name?: string; // For templates
  timestamp: number;
}

export interface PlaygroundResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: any;
  duration: number; // ms
  timestamp: number;
}
