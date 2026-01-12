import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '@environments/environment';
import { Observable } from 'rxjs';
import {
  SampleMainCreateRequestDto,
  SampleMainDetailDto,
  SampleMainPageRequest,
  SampleMainPagedResponse,
  SampleMainUpdateRequestDto,
} from '../models/sample-main.model';

@Injectable({
  providedIn: 'root',
})
export class SampleMainApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api/v1/samples-main-seo`;

  getPaged(request: SampleMainPageRequest): Observable<SampleMainPagedResponse> {
    const params: any = {};
    Object.keys(request).forEach((key) => {
      const value = (request as any)[key];
      if (value !== null && value !== undefined && value !== '') {
        params[key] = value;
      }
    });

    return this.http.get<SampleMainPagedResponse>(this.baseUrl, {
      params: params,
    });
  }

  getById(id: number): Observable<SampleMainDetailDto> {
    return this.http.get<SampleMainDetailDto>(`${this.baseUrl}/${id}`);
  }

  create(dto: SampleMainCreateRequestDto): Observable<SampleMainDetailDto> {
    return this.http.post<SampleMainDetailDto>(this.baseUrl, dto);
  }

  update(id: number, dto: SampleMainUpdateRequestDto): Observable<SampleMainDetailDto> {
    return this.http.put<SampleMainDetailDto>(`${this.baseUrl}/${id}`, dto);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  checkName(name: string, excludeId?: number): Observable<{ isUnique: boolean }> {
    return this.http.get<{ isUnique: boolean }>(`${this.baseUrl}/check-name`, {
      params: { name, excludeId: excludeId?.toString() || '' },
    });
  }
}
