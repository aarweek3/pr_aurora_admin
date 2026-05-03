// src/app/auth/services/activity-logs.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiEndpoints } from '@environments/api-endpoints';
import { ActivityLogDto, ActivityLogFilterDto } from '@auth/models/activity.models';

@Injectable({
  providedIn: 'root'
})
export class ActivityLogsService {
  private readonly http = inject(HttpClient);

  getActivityLogs(filter: ActivityLogFilterDto): Observable<{ success: boolean; data: any }> {
    return this.http.get<any>(ApiEndpoints.ACTIVITY_LOGS.BASE, { params: { ...filter } as any });
  }

  getRecentActivities(limit: number = 20): Observable<{ success: boolean; data: ActivityLogDto[] }> {
    return this.http.get<any>(ApiEndpoints.ACTIVITY_LOGS.RECENT, { 
      params: { limit: limit.toString() } 
    });
  }

  getMyActivityLogs(limit: number = 50): Observable<{ success: boolean; data: ActivityLogDto[] }> {
    return this.http.get<any>(ApiEndpoints.ACTIVITY_LOGS.MY, { 
      params: { limit: limit.toString() } 
    });
  }
}