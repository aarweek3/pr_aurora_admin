import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { ApiEndpoints } from '@environments/api-endpoints';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { AvIconCategory } from '@shared/models/icon-metadata.model';

@Injectable({
  providedIn: 'root',
})
export class IconDataService {
  private http = inject(HttpClient);

  // Reactive registry state
  private registry = signal<AvIconCategory[]>([]);

  constructor() {}

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

  /**
   * Переименовать иконку
   * @param oldName - текущее имя иконки
   * @param newName - новое имя иконки
   */
  renameIcon(oldName: string, newName: string): Observable<any> {
    return this.http.post(ApiEndpoints.ICONS.RENAME, { oldName, newName }).pipe(
      catchError((error) => {
        // Обработка ошибок от backend
        let errorMessage = 'Ошибка переименования';

        if (error.status === 400) {
          errorMessage = error.error.message || 'Недопустимое имя';
        } else if (error.status === 409) {
          errorMessage = 'Иконка с таким именем уже существует';
        } else if (error.status === 404) {
          errorMessage = 'Иконка не найдена';
        }

        throw new Error(errorMessage);
      }),
    );
  }

  /**
   * Массовое переименование файлов с префиксом
   * @param fileNames - список имен файлов
   * @param targetFolder - целевая папка
   * @param prefix - префикс для добавления
   * @param sourceFolder - исходная папка на диске
   */
  bulkRename(
    fileNames: string[],
    targetFolder: string,
    prefix: string,
    sourceFolder?: string,
  ): Observable<any> {
    const request = {
      fileNames,
      targetFolder,
      prefix,
      sourceFolder,
      createFolderIfNotExists: true,
      overwriteExisting: true,
    };

    return this.http.post(ApiEndpoints.ICONS.BULK_RENAME, request);
  }

  /**
   * Получить список файлов и папок на сервере
   * @param path - относительный путь
   */
  browseFileSystem(path = ''): Observable<any[]> {
    return this.http.get<any[]>(ApiEndpoints.ICONS.BROWSE_FILESYSTEM(path));
  }

  /**
   * Загрузить полное содержимое (включая SVG) для конкретной категории
   */
  getCategoryContent(categoryId: number): Observable<any[]> {
    return this.http.get<any[]>(ApiEndpoints.ICONS.CATEGORY_CONTENT(categoryId));
  }

  // ==========================================
  // ДОПОЛНИТЕЛЬНЫЕ МЕТОДЫ УПРАВЛЕНИЯ ФАЙЛАМИ
  // ==========================================

  saveToDisk(fileName: string, path: string, svgContent: string): Observable<any> {
    return this.http.post(ApiEndpoints.ICONS.SAVE_TO_DISK, { fileName, path, svgContent });
  }

  createDirectory(path: string): Observable<any> {
    return this.http.post(ApiEndpoints.ICONS.CREATE_DIRECTORY(path), {});
  }

  openFile(path: string): Observable<any> {
    return this.http.post(ApiEndpoints.ICONS.OPEN_FILE(path), {});
  }

  readFile(path: string): Observable<string> {
    return this.http.get(ApiEndpoints.ICONS.READ_FILE(path), { responseType: 'text' });
  }

  renameFile(oldPath: string, newPath: string): Observable<any> {
    return this.http.post(ApiEndpoints.ICONS.RENAME_FILE, { oldPath, newPath });
  }

  deleteFile(path: string): Observable<any> {
    return this.http.delete(
      `${ApiEndpoints.ICONS.BASE}/delete-file?path=${encodeURIComponent(path)}`,
    );
  }

  /**
   * Синхронизация файловой системы с базой данных
   */
  syncIcons(): Observable<any> {
    return this.http.post(`${ApiEndpoints.ICONS.BASE.replace('Icons', 'IconCategory')}/sync`, {});
  }
}
