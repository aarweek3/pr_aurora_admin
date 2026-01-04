import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { catchError, delay, map, shareReplay, tap } from 'rxjs/operators';

import { HARDCODED_FLAGS } from '@assets/languageApp/config/language-flags.const';
import { ApiEndpoints } from '../../../../environments/api-endpoints';

interface IconCategory {
  category: string;
  icons: Array<{
    name: string;
    type: string;
    category: string;
    svgContent?: string;
  }>;
}

@Injectable({
  providedIn: 'root',
})
export class IconService {
  private http = inject(HttpClient);
  private cache = new Map<string, Observable<string>>();
  private iconCache = new Map<string, string>(); // name -> svg content

  constructor() {
    Object.entries(HARDCODED_FLAGS).forEach(([name, svg]) => {
      if (svg && svg.trim().length > 0) {
        this.iconCache.set(name, svg);
      }
    });
  }

  getIcon(path: string): Observable<string> {
    let name = path;
    if (name.includes('/')) {
      name = name.split('/').pop()?.replace('.svg', '') || name;
    }

    if (this.iconCache.has(name)) {
      return of(this.normalizeSvg(this.iconCache.get(name)!)).pipe(delay(0));
    }

    if (this.cache.has(name)) return this.cache.get(name)!;

    const url = ApiEndpoints.ICONS.CONTENT(name);
    const request$ = this.http.get(url, { responseType: 'text' }).pipe(
      map((svg: string) => this.normalizeSvg(svg)),
      catchError((err: any) => {
        this.cache.delete(name);
        return throwError(() => err);
      }),
      shareReplay(1),
    );

    this.cache.set(name, request$);
    return request$;
  }

  private normalizeSvg(svg: string): string {
    if (!svg) return '';
    const trimmed = svg.trim();

    // Быстрый возврат для простых SVG
    if (trimmed.startsWith('<svg') && !trimmed.includes('<?xml')) {
      return trimmed;
    }

    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(trimmed, 'image/svg+xml');
      const svgElement = doc.querySelector('svg');
      if (!svgElement) return trimmed;

      svgElement.removeAttribute('width');
      svgElement.removeAttribute('height');
      svgElement.setAttribute('preserveAspectRatio', 'xMidYMid meet');
      if (!svgElement.getAttribute('xmlns')) {
        svgElement.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
      }

      return new XMLSerializer().serializeToString(svgElement);
    } catch (e) {
      return trimmed;
    }
  }

  preloadIcons(paths: string[]): void {
    paths.forEach((path) => this.getIcon(path).subscribe());
  }

  /**
   * Массовая загрузка контента для списка иконок
   */
  loadIconsBatch(names: string[]): Observable<Record<string, string>> {
    const missingNames = names.filter((n) => !this.iconCache.has(n));
    if (missingNames.length === 0) {
      const result: Record<string, string> = {};
      names.forEach((n) => (result[n] = this.iconCache.get(n)!));
      return of(result);
    }

    return this.http
      .post<Record<string, string>>(ApiEndpoints.ICONS.BATCH_CONTENT, missingNames)
      .pipe(
        tap((data) => {
          Object.entries(data).forEach(([name, svg]) => {
            this.iconCache.set(name, svg);
          });
        }),
        map((data) => {
          const result: Record<string, string> = {};
          names.forEach((n) => (result[n] = this.iconCache.get(n) || ''));
          return result;
        }),
        catchError((err) => {
          console.error('[IconService] Batch load failed', err);
          return throwError(() => err);
        }),
      );
  }

  /**
   * Внедрить контент напрямую в кэш (например, после загрузки рубрики)
   */
  injectBatchContent(data: Record<string, string>): void {
    Object.entries(data).forEach(([name, svg]) => {
      this.iconCache.set(name, svg);
    });
  }

  /**
   * Полностью очистить кэш (принудительно потянет данные с сервера при следующем запросе)
   */
  async refreshCache(): Promise<void> {
    this.iconCache.clear();
    this.cache.clear();
  }
}
