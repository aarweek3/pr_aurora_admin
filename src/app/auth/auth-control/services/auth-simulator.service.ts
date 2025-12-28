import { Injectable, signal } from '@angular/core';
import { Observable, of } from 'rxjs';
import { SimulationResult, SimulationType } from '../models/simulator.models';

@Injectable({
  providedIn: 'root',
})
export class AuthSimulatorService {
  activeSimulation = signal<SimulationType | null>(null);

  constructor() {}

  simulateError(config: SimulationType): void {
    console.log('Simulating error:', config);
  }

  simulateTokenExpiry(type: 'access' | 'refresh' | 'both'): void {
    console.log('Simulating token expiry:', type);
  }

  simulateScenario(name: string): Observable<SimulationResult> {
    return of({ success: true, message: 'Scenario simulated', timestamp: new Date() });
  }

  deactivate(): void {
    this.activeSimulation.set(null);
  }
}
