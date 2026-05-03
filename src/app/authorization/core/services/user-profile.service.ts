// src/app/auth/services/user-profile.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiEndpoints } from '@environments/api-endpoints';
import { UserProfileDto, UpdateUserDto, ChangePasswordDto } from '@auth/models';

@Injectable({
  providedIn: 'root'
})
export class UserProfileService {
  private readonly http = inject(HttpClient);

  getProfile(): Observable<{ success: boolean; data: UserProfileDto }> {
    return this.http.get<any>(ApiEndpoints.AUTH.PROFILE);
  }

  updateProfile(userId: string, data: UpdateUserDto): Observable<{ success: boolean; message: string }> {
    return this.http.put<any>(ApiEndpoints.USERS.BY_ID(userId), data);
  }

  changePassword(data: ChangePasswordDto): Observable<{ success: boolean; message: string }> {
    return this.http.post<any>(ApiEndpoints.AUTH.CHANGE_PASSWORD, data);
  }
}