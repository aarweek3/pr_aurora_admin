import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  IconCategory,
  IconCategoryCreateDto,
  IconCategoryUpdateDto,
} from '../models/icon-category.model';

@Injectable({
  providedIn: 'root',
})
export class IconCategoryService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/IconCategory`;

  getAll(): Observable<{ success: boolean; data: IconCategory[] }> {
    return this.http.get<{ success: boolean; data: IconCategory[] }>(this.apiUrl);
  }

  getById(id: number): Observable<{ success: boolean; data: IconCategory }> {
    return this.http.get<{ success: boolean; data: IconCategory }>(`${this.apiUrl}/${id}`);
  }

  create(dto: IconCategoryCreateDto): Observable<{ success: boolean; data: IconCategory }> {
    return this.http.post<{ success: boolean; data: IconCategory }>(this.apiUrl, dto);
  }

  update(
    id: number,
    dto: IconCategoryUpdateDto,
  ): Observable<{ success: boolean; data: IconCategory }> {
    return this.http.put<{ success: boolean; data: IconCategory }>(`${this.apiUrl}/${id}`, dto);
  }

  delete(id: number): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.apiUrl}/${id}`);
  }

  sync(): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(`${this.apiUrl}/sync`, {});
  }
}
