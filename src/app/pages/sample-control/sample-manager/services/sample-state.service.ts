import { Injectable, OnDestroy, inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import {
  SampleState,
  INITIAL_STATE_SAMPLE,
} from '../models/sample-state.model';

@Injectable({
  providedIn: 'root',
})
export class SampleStateService implements OnDestroy {
  private state$ = new BehaviorSubject<SampleState>(INITIAL_STATE_SAMPLE);

  ngOnDestroy(): void {
    this.state$.complete();
  }

  getState(): Observable<SampleState> {
    return this.state$.asObservable();
  }

  updateState(partialState: Partial<SampleState>): void {
    this.state$.next({ ...this.state$.value, ...partialState });
  }

  resetState(): void {
    this.state$.next({ ...INITIAL_STATE_SAMPLE });
  }

  getCurrentState(): SampleState {
    return this.state$.value;
  }
}
