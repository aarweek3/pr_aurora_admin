import { Injectable, signal } from '@angular/core';

export interface TraceStep {
  timestamp: Date;
  label: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'request' | 'retry';
  details?: string;
}

@Injectable({
  providedIn: 'root',
})
export class RequestTraceService {
  private _steps = signal<TraceStep[]>([]);

  // Public signal for the UI to consume
  steps = this._steps.asReadonly();

  /**
   * Add a single step to the trace
   */
  addStep(label: string, type: TraceStep['type'] = 'info', details?: string): void {
    const newStep: TraceStep = {
      timestamp: new Date(),
      label,
      type,
      details,
    };

    this._steps.update((prev) => [...prev, newStep]);
  }

  /**
   * Clear all trace steps
   */
  clear(): void {
    this._steps.set([]);
  }

  /**
   * Helper to format label for request trace
   */
  logRequest(method: string, url: string): void {
    const path = url.split('/').pop() || url;
    this.addStep(`Вызов API: ${method} /${path}`, 'request', url);
  }
}
