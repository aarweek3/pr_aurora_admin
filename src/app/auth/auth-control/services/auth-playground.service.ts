import { Injectable, signal } from '@angular/core';
import { Observable, of } from 'rxjs';
import { PlaygroundRequest } from '../models/playground.models';

@Injectable({
  providedIn: 'root',
})
export class AuthPlaygroundService {
  requestHistory = signal<PlaygroundRequest[]>([]);

  constructor() {}

  sendRequest(request: PlaygroundRequest): Observable<any> {
    console.log('Sending request:', request);
    return of({});
  }

  loadTemplate(name: string): PlaygroundRequest | null {
    return null;
  }

  saveToHistory(request: PlaygroundRequest): void {
    this.requestHistory.update((history) => [request, ...history]);
  }

  exportHistory(): void {
    console.log('Exporting history...');
  }
}
