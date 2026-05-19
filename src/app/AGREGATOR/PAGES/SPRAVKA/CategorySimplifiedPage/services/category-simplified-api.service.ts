import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '@environments/environment';
import { Observable, tap } from 'rxjs';
import {
  CategoryDetailDto,
  CategoryIconDto,
  CategorySimplifiedPagedResponse,
  SubcategoryDetailDto,
  SubcategoryItemDto,
} from '../models/category-simplified.model';

@Injectable({
  providedIn: 'root',
})
export class CategorySimplifiedApiService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.api.baseUrl}/v1/aggregator/categories-simplified`;

  // --- Categories ---

  getPaged(params: any): Observable<CategorySimplifiedPagedResponse> {
    let httpParams = new HttpParams()
      .set('pageNumber', params.pageNumber.toString())
      .set('pageSize', params.pageSize.toString())
      .set('sortBy', params.sortBy)
      .set('sortDirection', params.sortDirection.toString())
      .set('showDeleted', params.showDeleted.toString());

    if (params.searchTerm) {
      httpParams = httpParams.set('searchTerm', params.searchTerm);
    }
    if (params.languageId) {
      httpParams = httpParams.set('languageId', params.languageId.toString());
    }

    console.log(`[CategorySimplifiedApi] GET ${this.baseUrl}`, { params });
    return this.http
      .get<CategorySimplifiedPagedResponse>(this.baseUrl, { params: httpParams })
      .pipe(tap((res) => console.log(`[CategorySimplifiedApi] Response:`, res)));
  }

  getById(id: number): Observable<CategoryDetailDto> {
    return this.http.get<CategoryDetailDto>(`${this.baseUrl}/${id}`);
  }

  create(dto: any): Observable<CategoryDetailDto> {
    console.log(`[CategorySimplifiedApi] POST ${this.baseUrl}`, dto);
    return this.http
      .post<CategoryDetailDto>(this.baseUrl, dto)
      .pipe(tap((res) => console.log(`[CategorySimplifiedApi] Create Success:`, res)));
  }

  update(dto: any): Observable<CategoryDetailDto> {
    console.log(`[CategorySimplifiedApi] PUT ${this.baseUrl}/${dto.id}`, dto);
    return this.http
      .put<CategoryDetailDto>(`${this.baseUrl}/${dto.id}`, dto)
      .pipe(tap((res) => console.log(`[CategorySimplifiedApi] Update Success:`, res)));
  }

  delete(id: number, isHard: boolean = false): Observable<void> {
    const params = new HttpParams().set('isHard', isHard.toString());
    return this.http.delete<void>(`${this.baseUrl}/${id}`, { params });
  }

  restore(id: number): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${id}/restore`, {});
  }

  // --- Subcategories ---

  getSubcategories(
    categoryId: number,
    showDeleted: boolean = false,
  ): Observable<SubcategoryItemDto[]> {
    const params = new HttpParams()
      .set('categoryId', categoryId.toString())
      .set('showDeleted', showDeleted.toString());
    console.log(`[CategorySimplifiedApi] GET ${this.baseUrl}/subcategories`, {
      categoryId,
      showDeleted,
    });
    return this.http
      .get<SubcategoryItemDto[]>(`${this.baseUrl}/subcategories`, { params })
      .pipe(tap((res) => console.log(`[CategorySimplifiedApi] Subcategories Response:`, res)));
  }

  getSubcategoryById(id: number): Observable<SubcategoryDetailDto> {
    return this.http.get<SubcategoryDetailDto>(`${this.baseUrl}/subcategories/${id}`);
  }

  createSubcategory(dto: any): Observable<SubcategoryDetailDto> {
    return this.http.post<SubcategoryDetailDto>(`${this.baseUrl}/subcategories`, dto);
  }

  updateSubcategory(dto: any): Observable<SubcategoryDetailDto> {
    return this.http.put<SubcategoryDetailDto>(`${this.baseUrl}/subcategories/${dto.id}`, dto);
  }

  deleteSubcategory(id: number, isHard: boolean = false): Observable<void> {
    const params = new HttpParams().set('isHard', isHard.toString());
    return this.http.delete<void>(`${this.baseUrl}/subcategories/${id}`, { params });
  }

  restoreSubcategory(id: number): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/subcategories/${id}/restore`, {});
  }

  // --- Maintenance ---

  clearDatabase(): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.baseUrl}/clear-database`);
  }

  seedFromJson(): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.baseUrl}/seed-from-json`, {});
  }

  getIcons(): Observable<CategoryIconDto[]> {
    return this.http.get<CategoryIconDto[]>(`${this.baseUrl}/icons`);
  }

  saveIcons(icons: CategoryIconDto[]): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.baseUrl}/icons`, icons);
  }
}
