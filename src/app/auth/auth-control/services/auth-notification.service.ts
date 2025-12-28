import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AuthNotificationService {
  constructor() {}

  startMonitoring(): void {
    console.log('Auth notification monitoring started');
  }
}
