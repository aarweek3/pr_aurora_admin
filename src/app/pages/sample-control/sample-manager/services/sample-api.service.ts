import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  SampleCreateRequestDto,
  SampleUpdateRequestDto,
  SampleDetailDto,
  SamplePageRequestDto,
  SamplePagedResponseDto,
} from '../models/sample.dto';
import { environment } from '@environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SampleApiService {
  private readonly baseUrl = `${environment.apiUrl}/api/v1/samples`;

  constructor(private http: HttpClient) {}

  /**
   * Получить все родителей для селектора (в алфавитном порядке)
   */
  getAllSamples(): Observable<SampleDetailDto[]> {
    const url = `${this.baseUrl}/all`;
    return this.http.get<SampleDetailDto[]>(url);
  }

  /**
   * Получить родителей с пагинацией
   */
  getSamples(request: SamplePageRequestDto): Observable<SamplePagedResponseDto> {
    return this.http.get<SamplePagedResponseDto>(this.baseUrl, {
      params: { ...request } as any,
    });
  }

  /**
   * Получить родителей по ID
   */
  getSampleById(id: number): Observable<SampleDetailDto> {
    const url = `${this.baseUrl}/${id}`;
    return this.http.get<SampleDetailDto>(url);
  }

  /**
   * Создать родителей
   */
  createSample(request: SampleCreateRequestDto): Observable<SampleDetailDto> {
    return this.http.post<SampleDetailDto>(this.baseUrl, request);
  }

  /**
   * Обновить родителей
   */
  updateSample(id: number, request: SampleUpdateRequestDto): Observable<SampleDetailDto> {
    const url = `${this.baseUrl}/${id}`;
    return this.http.put<SampleDetailDto>(url, request);
  }

  /**
   * Удалить родителей
   */
  deleteSample(id: number): Observable<void> {
    const url = `${this.baseUrl}/${id}`;
    return this.http.delete<void>(url);
  }

  /**
   * Получить родителей с описанием
   */
  getSamplesWithDescription(): Observable<SampleDetailDto[]> {
    const url = `${this.baseUrl}/with-description`;
    return this.http.get<SampleDetailDto[]>(url);
  }
}
