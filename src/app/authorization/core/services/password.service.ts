// src/app/auth/services/password.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiEndpoints } from '@environments/api-endpoints';

import { ForgotPasswordDto, ResetPasswordDto } from '../models';

export interface PasswordResponse {
  success: boolean;
  message: string;
  debugToken?: string;
  debugEmail?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PasswordService {
  private readonly http = inject(HttpClient);

  forgotPassword(data: ForgotPasswordDto): Observable<PasswordResponse> {
    return this.http.post<PasswordResponse>(ApiEndpoints.PASSWORD.FORGOT, data);
  }

  resetPassword(data: ResetPasswordDto): Observable<PasswordResponse> {
    return this.http.post<PasswordResponse>(ApiEndpoints.PASSWORD.RESET, data);
  }
}