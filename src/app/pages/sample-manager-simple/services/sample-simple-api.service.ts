import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '@environments/environment';
import { Observable } from 'rxjs';
import {
  SampleSimpleCreateDto,
  SampleSimpleDto,
  SampleSimplePageRequest,
  SampleSimplePagedResponse,
  SampleSimpleUpdateDto,
} from '../models/sample-simple.model';

@Injectable()
export class SampleSimpleApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api/v1/samples`;

  getSamples(request: SampleSimplePageRequest): Observable<SampleSimplePagedResponse> {
    return this.http.get<SampleSimplePagedResponse>(this.baseUrl, {
      params: { ...request } as any,
    });
  }

  getById(id: number): Observable<SampleSimpleDto> {
    return this.http.get<SampleSimpleDto>(`${this.baseUrl}/${id}`);
  }

  create(dto: SampleSimpleCreateDto): Observable<SampleSimpleDto> {
    return this.http.post<SampleSimpleDto>(this.baseUrl, dto);
  }

  update(id: number, dto: SampleSimpleUpdateDto): Observable<SampleSimpleDto> {
    return this.http.put<SampleSimpleDto>(`${this.baseUrl}/${id}`, dto);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
