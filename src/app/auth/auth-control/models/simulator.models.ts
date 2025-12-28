export interface SimulationType {
  type: 'http_error' | 'token_expiry' | 'session_scenario';
  errorCode?: 401 | 403 | 500 | 0;
  target?: string;
  duration?: number; // ms
}

export interface SimulationResult {
  success: boolean;
  message: string;
  timestamp: Date;
  details?: any;
}
