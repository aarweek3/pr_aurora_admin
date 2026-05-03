import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { ApiEndpoints } from '@environments/api-endpoints';
import { Observable } from 'rxjs';
import { AvIconCategory } from '../../pages/ui-demo/old-control/icon-ui/icon-metadata.model';

@Injectable({
  providedIn: 'root',
})
export class IconLaboratoryService {
  private http = inject(HttpClient);

  constructor() {}

  /**
   * Get all icon metadata (registry).
   * No SVG content, just structure.
   */
  getRegistry(): Observable<AvIconCategory[]> {
    return this.http.get<AvIconCategory[]>(ApiEndpoints.ICONS.BASE);
  }

  /**
   * Get SVG content for all icons in a specific category.
   */
  getCategoryContent(categoryId: number): Observable<any[]> {
    return this.http.get<any[]>(ApiEndpoints.ICONS.CATEGORY_CONTENT(categoryId));
  }

  /**
   * Get total count of icons.
   */
  getIconsCount(): Observable<number> {
    return this.http.get<number>(ApiEndpoints.ICONS.COUNT);
  }

  // ==========================================
  // MANAGEMENT METHODS
  // ==========================================

  moveIcon(iconType: string, targetCategoryId: number): Observable<any> {
    return this.http.post(ApiEndpoints.ICONS.MOVE, { iconType, targetCategoryId });
  }

  renameIcon(oldName: string, newName: string): Observable<any> {
    return this.http.post(ApiEndpoints.ICONS.RENAME, { oldName, newName });
  }

  /**
   * Bulk rename files
   */
  bulkRename(
    fileNames: string[],
    targetFolder: string,
    prefix: string,
    sourceFolder?: string,
  ): Observable<any> {
    return this.http.post(ApiEndpoints.ICONS.BULK_RENAME, {
      fileNames,
      targetFolder,
      prefix,
      sourceFolder,
      createFolderIfNotExists: true,
      overwriteExisting: true,
    });
  }

  browseFileSystem(path: string = ''): Observable<any[]> {
    return this.http.get<any[]>(ApiEndpoints.ICONS.BROWSE_FILESYSTEM(path));
  }

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
    return this.http.delete(`${ApiEndpoints.ICONS.BASE}/delete-file?path=${encodeURIComponent(path)}`);
  }

  /**
   * Trigger filesystem to DB synchronization
   */
  syncIcons(): Observable<any> {
    // The endpoint is on IconCategory controller, but we'll use a hardcoded path for now 
    // unless it's added to ApiEndpoints.
    return this.http.post(`${ApiEndpoints.ICONS.BASE.replace('Icons', 'IconCategory')}/sync`, {});
  }
}
