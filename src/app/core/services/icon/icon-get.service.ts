import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { HARDCODED_FLAGS } from '@language-app/config/language-flags.const';
import { ApiEndpoints } from '@environments/api-endpoints';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, shareReplay, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class IconGetService {
  private http = inject(HttpClient);

  // Cache for in-flight requests to prevent duplicate network calls for the same icon
  private requestCache = new Map<string, Observable<string>>();

  // In-memory cache for SVG content (name -> svg string)
  private iconCache = new Map<string, string>();

  constructor() {
    // Load hardcoded flags into cache immediately
    Object.entries(HARDCODED_FLAGS).forEach(([name, svg]) => {
      if (svg && svg.trim().length > 0) {
        this.iconCache.set(name, svg);
      }
    });
  }

  /**
   * Get a single icon by name.
   * Checks memory cache first, then makes an HTTP request.
   */
  getIcon(path: string): Observable<string> {
    // 1. Check if it's a local asset path (contains '/')
    if (path.includes('/')) {
      if (this.iconCache.has(path)) {
        return of(this.iconCache.get(path)!);
      }
      
      const assetUrl = `/assets/icons/${path}${path.endsWith('.svg') ? '' : '.svg'}`;
      return this.http.get(assetUrl, { responseType: 'text' }).pipe(
        tap((svg) => this.iconCache.set(path, svg)),
        catchError((err) => {
          console.error(`[IconGetService] Failed to load local asset: ${assetUrl}`, err);
          return throwError(() => err);
        })
      );
    }

    // 2. Otherwise treat as a database icon name
    let name = path;
    if (name.includes('/')) {
      name = name.split('/').pop()?.replace('.svg', '') || name;
    }

    // Check sync cache
    if (this.iconCache.has(name)) {
      return of(this.iconCache.get(name)!);
    }

    // Check inflight requests
    if (this.requestCache.has(name)) {
      return this.requestCache.get(name)!;
    }

    // Make HTTP request to API
    const url = ApiEndpoints.ICONS.CONTENT(name);
    const request$ = this.http.get(url, { responseType: 'text' }).pipe(
      tap((svg) => this.iconCache.set(name, svg)), // Cache result
      catchError((err) => {
        this.requestCache.delete(name);
        return throwError(() => err);
      }),
      shareReplay(1),
    );

    this.requestCache.set(name, request$);
    return request$;
  }

  /**
   * Fetch multiple icons in a single HTTP request.
   * Only fetches icons that are not already in the cache.
   */
  loadIconsBatch(names: string[]): Observable<Record<string, string>> {
    // Filter out icons we already have
    const missingNames = names.filter((n) => !this.iconCache.has(n));

    // If we have everything, return immediately from cache
    if (missingNames.length === 0) {
      const result: Record<string, string> = {};
      names.forEach((n) => (result[n] = this.iconCache.get(n)!));
      return of(result);
    }

    // Fetch missing only
    return this.http
      .post<Record<string, string>>(ApiEndpoints.ICONS.BATCH_CONTENT, missingNames)
      .pipe(
        tap((data) => {
          // Update cache with new data
          Object.entries(data).forEach(([name, svg]) => {
            this.iconCache.set(name, svg);
          });
        }),
        // Return combined result (cache + new)
        map(() => {
          const result: Record<string, string> = {};
          names.forEach((n) => (result[n] = this.iconCache.get(n)! || ''));
          return result;
        }),
      );
  }

  /**
   * DEBUG: Fetch batch with full response to access Server-Timing headers
   * Bypasses cache check to ensure we get a fresh measurement from server
   */
  loadIconsBatchDebug(names: string[]): Observable<HttpResponse<Record<string, string>>> {
    return this.http
      .post<Record<string, string>>(ApiEndpoints.ICONS.BATCH_CONTENT, names, {
        observe: 'response',
      })
      .pipe(
        tap((resp) => {
          if (resp.body) {
            Object.entries(resp.body).forEach(([name, svg]) => {
              this.iconCache.set(name, svg);
            });
          }
        }),
      );
  }

  /**
   * Manually inject content into cache (e.g. from a rubric load)
   */
  injectBatchContent(data: Record<string, string>): void {
    Object.entries(data).forEach(([name, svg]) => {
      this.iconCache.set(name, svg);
    });
  }

  /**
   * Check if icon is in cache
   */
  hasCached(name: string): boolean {
    return this.iconCache.has(name);
  }

  /**
   * Clear all caches
   */
  clearCache(): void {
    this.iconCache.clear();
    this.requestCache.clear();
    // Reload hardcoded flags
    Object.entries(HARDCODED_FLAGS).forEach(([name, svg]) => {
      this.iconCache.set(name, svg);
    });
  }
}
