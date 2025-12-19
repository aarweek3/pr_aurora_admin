import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map, shareReplay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class IconService {
  private http = inject(HttpClient);
  private cache = new Map<string, Observable<string>>();

  /**
   * Получает SVG контент иконки по пути.
   * Использует кэширование и нормализацию.
   */
  getIcon(path: string): Observable<string> {
    if (this.cache.has(path)) {
      return this.cache.get(path)!;
    }

    const request$ = this.http.get(path, { responseType: 'text' }).pipe(
      map((svg: string) => this.normalizeSvg(svg)),
      catchError((err: any) => {
        this.cache.delete(path);

        // Детальное логирование ошибок
        if (err?.status === 404) {
          console.warn(`[IconService] Icon file not found: ${path}`);
        } else if (err?.status === 0) {
          console.error(`[IconService] Network error loading icon: ${path}`);
        } else {
          console.error(`[IconService] Error loading icon: ${path}`, err);
        }

        return throwError(() => err);
      }),
      shareReplay(1),
    );

    this.cache.set(path, request$);
    return request$;
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

    // Убираем инлайновые стили, которые могут мешать раскрашиванию (опционально)
    // svgElement.removeAttribute('style');

    return new XMLSerializer().serializeToString(doc);
  }

  /**
   * Предварительная загрузка списка иконок
   */
  preloadIcons(paths: string[]): void {
    paths.forEach((path) => this.getIcon(path).subscribe());
  }
}
