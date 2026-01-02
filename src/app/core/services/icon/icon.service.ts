import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, from, of, throwError } from 'rxjs';
import { catchError, map, shareReplay, switchMap } from 'rxjs/operators';

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
  private batchLoadPromise: Promise<void> | null = null;

  constructor() {
    // Load all icons with content on service initialization
    this.batchLoadPromise = this.loadAllIcons();
  }

  /**
   * Loads all icons with SVG content in a single batch request
   */
  private async loadAllIcons(): Promise<void> {
    console.log('[IconService] 🔄 Loading all icons with content...');

    try {
      const categories = await this.http
        .get<IconCategory[]>(`${ApiEndpoints.ICONS.BASE}?includeSvgContent=true`)
        .toPromise();

      if (categories) {
        let totalIcons = 0;
        categories.forEach((cat) => {
          cat.icons.forEach((icon) => {
            if (icon.svgContent) {
              this.iconCache.set(icon.name, icon.svgContent);
              totalIcons++;
            }
          });
        });
        console.log(`[IconService] ✅ Batch loaded ${totalIcons} icons into cache`);
      }
    } catch (err) {
      console.error('[IconService] ❌ Failed to batch load icons', err);
    }
  }

  /**
   * Получает SVG контент иконки по имени.
   * Path может быть простым именем "av_save" или полным путем (для совместимости)
   */
  getIcon(path: string): Observable<string> {
    // Extract simple name if it looks like a path
    let name = path;
    if (name.includes('/')) {
      name = name.split('/').pop()?.replace('.svg', '') || name;
    }

    // Wait for batch load to complete, then check cache
    return from(this.batchLoadPromise || Promise.resolve()).pipe(
      switchMap(() => {
        // Check icon cache (from batch load)
        if (this.iconCache.has(name)) {
          const svg = this.iconCache.get(name)!;
          return of(this.normalizeSvg(svg));
        }

        // Check Observable cache
        if (this.cache.has(name)) {
          return this.cache.get(name)!;
        }

        // Fallback: individual request (if batch load failed or icon not in cache)
        console.warn(`[IconService] ⚠️ Icon "${name}" not in cache, fetching individually`);
        const url = ApiEndpoints.ICONS.CONTENT(name);

        const request$ = this.http.get(url, { responseType: 'text' }).pipe(
          map((svg: string) => this.normalizeSvg(svg)),
          catchError((err: any) => {
            this.cache.delete(name);

            // Детальное логирование ошибок
            if (err?.status === 404) {
              console.warn(`[IconService] Icon not found in DB: ${name} (path: ${path})`);
            } else if (err?.status === 0) {
              console.error(`[IconService] Network error loading icon: ${name}`);
            } else {
              console.error(`[IconService] Error loading icon: ${name}`, err);
            }

            return throwError(() => err);
          }),
          shareReplay(1),
        );

        this.cache.set(name, request$);
        return request$;
      }),
    );
  }

  /**
   * Нормализует SVG: удаляет жесткие размеры и подготавливает для масштабирования.
   */
  private normalizeSvg(svg: string): string {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svg, 'image/svg+xml');
    const svgElement = doc.querySelector('svg');

    if (!svgElement) return svg;

    // Получаем текущие размеры
    const width = svgElement.getAttribute('width');
    const height = svgElement.getAttribute('height');
    const viewBox = svgElement.getAttribute('viewBox');

    // Если нет viewBox, но есть width/height - создаем его
    if (!viewBox && width && height) {
      svgElement.setAttribute(
        'viewBox',
        `0 0 ${width.replace('px', '')} ${height.replace('px', '')}`,
      );
    }

    // Удаляем жесткие размеры, чтобы иконка управлялась через CSS/container
    svgElement.removeAttribute('width');
    svgElement.removeAttribute('height');

    // Гарантируем корректное масштабирование
    svgElement.setAttribute('preserveAspectRatio', 'xMidYMid meet');

    return new XMLSerializer().serializeToString(doc);
  }

  /**
   * Предварительная загрузка списка иконок
   */
  preloadIcons(paths: string[]): void {
    paths.forEach((path) => this.getIcon(path).subscribe());
  }

  /**
   * Refresh the icon cache (useful after icon updates)
   */
  async refreshCache(): Promise<void> {
    this.iconCache.clear();
    this.cache.clear();
    this.batchLoadPromise = this.loadAllIcons();
    await this.batchLoadPromise;
  }
}
