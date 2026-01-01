// src\environments\api-endpoints.ts

import { environment } from '@environments/environment';

export class ApiEndpoints {
  private static readonly BASE_URL = environment.api.baseUrl;

  static readonly IMAGES = {
    UPLOAD_SIMPLE: `${this.BASE_URL}/api/images/upload-simple`,
    UPLOADS_PATH: `${this.BASE_URL}/uploads`,
  };

  // Эндпоинты для EditorImageUploadController
  static readonly EDITOR_IMAGES = {
    UPLOAD: `${this.BASE_URL}/api/editor/images/upload`,
    VALIDATE: `${this.BASE_URL}/api/editor/images/validate`,
    METADATA: `${this.BASE_URL}/api/editor/images/metadata`,
    CONFIG: `${this.BASE_URL}/api/editor/images/config`,
    SUPPORTED_FORMATS: `${this.BASE_URL}/api/editor/images/supported-formats`,
    HEALTH: `${this.BASE_URL}/api/editor/images/health`,
    DELETE: (filename: string) =>
      `${this.BASE_URL}/api/editor/images/${encodeURIComponent(filename)}`,
    CLEANUP: `${this.BASE_URL}/api/editor/images/cleanup`,
  };

  // Эндпоинты для AdvancedImageProcessingController
  static readonly ADVANCED_IMAGES = {
    SAVE: `${this.BASE_URL}/api/advanced-image/save`,
    LOAD: (imageId: string) => `${this.BASE_URL}/api/advanced-image/load/${imageId}`,
    DELETE: (imageId: string) => `${this.BASE_URL}/api/advanced-image/delete/${imageId}`,
    LIST: `${this.BASE_URL}/api/advanced-image/list`,
  };

  static readonly IMAGES_CONFIG = {
    MAX_FILE_SIZE: 5 * 1024 * 1024,
    ALLOWED_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
    CROP_SIZES: [
      { name: 'Квадрат 300x300', width: 300, height: 300 },
      { name: 'Баннер 800x200', width: 800, height: 200 },
      { name: 'Пост 600x400', width: 600, height: 400 },
      { name: 'Аватар 150x150', width: 150, height: 150 },
    ],
  };

  static getImageUrl(relativePath: string): string {
    if (relativePath.startsWith('images/')) {
      return `${this.BASE_URL}/uploads/${relativePath}`;
    }
    return `${this.BASE_URL}/uploads/images/${relativePath}`;
  }
}
