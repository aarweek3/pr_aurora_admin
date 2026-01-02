import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { ApiEndpoints } from '../../../environments/api-endpoints';
import { AvIconCategory } from '../../pages/ui-demo/old-control/icon-ui/icon-metadata.model';

@Injectable({
  providedIn: 'root',
})
export class IconDataService {
  private http = inject(HttpClient);

  // Reactive registry state
  private registry = signal<AvIconCategory[]>([]);

  constructor() {
    this.loadIcons();
  }

  /**
   * Fetches the latest icon registry from the backend.
   * Updates the local signal state.
   */
  loadIcons(force = false): Observable<AvIconCategory[]> {
    console.log(`[IconDataService] 🔄 loadIcons(force=${force}) execution started...`);
    return this.http.get<AvIconCategory[]>(ApiEndpoints.ICONS.BASE).pipe(
      tap((data) => {
        console.log(`[IconDataService] ✅ Received ${data.length} categories from API`);
        this.registry.set(data);
      }),
      catchError((err) => {
        console.error('[IconDataService] ❌ Failed to load icons from API', err);
        return of([]);
      }),
    );
  }

  /**
   * Returns the current icon list.
   * Logic: If registry is empty, try to load it. Otherwise, return the observable of it.
   */
  getIcons(force = false): Observable<AvIconCategory[]> {
    console.log(
      `[IconDataService] 📡 getIcons(force=${force}) called. Current registry size: ${
        this.registry().length
      }`,
    );
    if (force || this.registry().length === 0) {
      if (force) console.log('[IconDataService] ⚡ Force reload requested.');
      return this.loadIcons(force);
    }
    console.log('[IconDataService] 📦 Returning cached registry data.');
    return of(this.registry());
  }

  getIconsCount(): Observable<number> {
    return this.http.get<number>(ApiEndpoints.ICONS.COUNT);
  }

  moveIcon(iconType: string, targetCategoryId: number): Observable<any> {
    return this.http.post(ApiEndpoints.ICONS.MOVE, { iconType, targetCategoryId });
  }
}
