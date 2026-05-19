import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../../environments/environment';
import { OS_VERSION_BASE_URL, SYSTEM_REQUIREMENT_BASE_URL } from '../end-points';
import {
  PlatformOsVersionDto,
  PlatformOsVersionPageRequestDto,
  PlatformOsVersionPagedResponseDto,
  SystemRequirementCreateDto,
  SystemRequirementDto,
  SystemRequirementUpdateDto,
} from '../models/system-requirement.model';

@Injectable({
  providedIn: 'root',
})
export class SystemRequirementApiService {
  private http = inject(HttpClient);

  private readonly osUrl = `${environment.apiUrl}/${OS_VERSION_BASE_URL}`;
  private readonly reqUrl = `${environment.apiUrl}/${SYSTEM_REQUIREMENT_BASE_URL}`;

  // --- Справочник ОС ---

  getOsVersions(
    request: PlatformOsVersionPageRequestDto,
  ): Observable<PlatformOsVersionPagedResponseDto> {
    let params = new HttpParams()
      .set('pageNumber', request.pageNumber.toString())
      .set('pageSize', request.pageSize.toString());

    if (request.platformId) params = params.set('platformId', request.platformId.toString());
    if (request.searchTerm) params = params.set('searchTerm', request.searchTerm);
    if (request.languageId) params = params.set('languageId', request.languageId.toString());
    if (request.showDeleted !== undefined)
      params = params.set('showDeleted', request.showDeleted.toString());

    return this.http.get<PlatformOsVersionPagedResponseDto>(this.osUrl, { params });
  }

  getOsVersionById(id: number): Observable<PlatformOsVersionDto> {
    return this.http.get<PlatformOsVersionDto>(`${this.osUrl}/${id}`);
  }

  createOsVersion(dto: any): Observable<PlatformOsVersionDto> {
    return this.http.post<PlatformOsVersionDto>(this.osUrl, dto);
  }

  updateOsVersion(id: number, dto: any): Observable<PlatformOsVersionDto> {
    return this.http.put<PlatformOsVersionDto>(`${this.osUrl}/${id}`, dto);
  }

  deleteOsVersion(id: number, isHard = false): Observable<void> {
    let params = new HttpParams();
    if (isHard) params = params.set('isHard', 'true');
    return this.http.delete<void>(`${this.osUrl}/${id}`, { params });
  }

  seedOsVersions(): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.osUrl}/maintenance/seed`, {});
  }

  clearOsVersions(): Observable<void> {
    return this.http.delete<void>(`${this.osUrl}/maintenance/clear`);
  }

  // --- Системные требования ---

  getByVersionId(versionId: number): Observable<SystemRequirementDto[]> {
    return this.http.get<SystemRequirementDto[]>(`${this.reqUrl}/version/${versionId}`);
  }

  getById(id: number): Observable<SystemRequirementDto> {
    return this.http.get<SystemRequirementDto>(`${this.reqUrl}/${id}`);
  }

  create(dto: SystemRequirementCreateDto): Observable<SystemRequirementDto> {
    return this.http.post<SystemRequirementDto>(this.reqUrl, dto);
  }

  update(id: number, dto: SystemRequirementUpdateDto): Observable<SystemRequirementDto> {
    return this.http.put<SystemRequirementDto>(`${this.reqUrl}/${id}`, dto);
  }

  delete(id: number, isHard = false): Observable<void> {
    let params = new HttpParams();
    if (isHard) params = params.set('isHard', 'true');
    return this.http.delete<void>(`${this.reqUrl}/${id}`, { params });
  }
}
