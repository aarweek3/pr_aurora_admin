/**
 * Централизованная конфигурация всех API endpoints
 */
import { environment } from './environment';

export class ApiEndpoints {
  private static readonly BASE_URL = environment.api.baseUrl;

  // Role endpoints
  static readonly ROLES = {
    BASE: `${this.BASE_URL}/roles`,
    BY_ID: (id: string) => `${this.BASE_URL}/roles/${id}`,
    CREATE: `${this.BASE_URL}/roles`,
    UPDATE: (id: string) => `${this.BASE_URL}/roles/${id}`,
    DELETE: (id: string) => `${this.BASE_URL}/roles/${id}`,
    USER_ROLES: (userId: string) => `${this.BASE_URL}/roles/user/${userId}`,
    ASSIGN: `${this.BASE_URL}/roles/assign`,
    USERS_IN_ROLE: (roleName: string) => `${this.BASE_URL}/roles/${roleName}/users`,
  };

  // Auth endpoints
  static readonly AUTH = {
    BASE: `${this.BASE_URL}/Auth`,
    REGISTER: `${this.BASE_URL}/Auth/register`,
    LOGIN: `${this.BASE_URL}/Auth/login`,
    LOGOUT: `${this.BASE_URL}/Auth/logout`,
    REFRESH: `${this.BASE_URL}/Auth/refresh`,
    CHANGE_PASSWORD: `${this.BASE_URL}/Auth/change-password`,
    PROFILE: `${this.BASE_URL}/Auth/profile`,
    UPDATE_PROFILE: `${this.BASE_URL}/Auth/profile`,
    EXTERNAL_LOGIN: (provider: string) => `${this.BASE_URL}/auth/external/login/${provider}`,
    DEBUG_TOKEN: `${this.BASE_URL}/Auth/debug-token`,
    DEBUG_COOKIES: `${this.BASE_URL}/Auth/debug-cookies`,
    UNLINK_EXTERNAL: (provider: string) => `${this.BASE_URL}/Auth/external/unlink/${provider}`,
    STRESS_TEST: `${this.BASE_URL}/Auth/stress-test`,
    GET_USER_SESSIONS: (includeHistory: boolean) =>
      `${this.BASE_URL}/Auth/sessions?includeHistory=${includeHistory}`,
    REVOKE_SESSION: (id: number) => `${this.BASE_URL}/Auth/sessions/${id}/revoke`,
  };

  // Password endpoints
  static readonly PASSWORD = {
    FORGOT: `${this.BASE_URL}/password/forgot-password`,
    RESET: `${this.BASE_URL}/password/reset-password`,
  };

  // Users endpoints
  static readonly USERS = {
    BASE: `${this.BASE_URL}/users`,
    BY_ID: (id: string) => `${this.BASE_URL}/users/${id}`,
    BY_EMAIL: (email: string) => `${this.BASE_URL}/users/by-email/${email}`,
    ACTIVATE: (id: string) => `${this.BASE_URL}/users/${id}/activate`,
    DEACTIVATE: (id: string) => `${this.BASE_URL}/users/${id}/deactivate`,
    STATISTICS: `${this.BASE_URL}/users/statistics`,
    SEARCH: `${this.BASE_URL}/users/search`,
  };

  // Sessions endpoints
  static readonly SESSIONS = {
    BASE: `${this.BASE_URL}/sessions`,
    BY_TOKEN: (token: string) => `${this.BASE_URL}/sessions/${token}`,
    REVOKE: (id: number) => `${this.BASE_URL}/sessions/${id}/revoke`,
    REVOKE_ALL: `${this.BASE_URL}/sessions/revoke-all`,
    UPDATE: (id: number) => `${this.BASE_URL}/sessions/${id}`,
    CLEANUP: `${this.BASE_URL}/sessions/cleanup`,
    VALIDATE: (token: string) => `${this.BASE_URL}/sessions/${token}/validate`,
  };

  // Activity logs endpoints
  static readonly ACTIVITY_LOGS = {
    BASE: `${this.BASE_URL}/activitylogs`,
    BY_ID: (id: number) => `${this.BASE_URL}/activitylogs/${id}`,
    BY_USER: (userId: string) => `${this.BASE_URL}/activitylogs/user/${userId}`,
    MY: `${this.BASE_URL}/activitylogs/my`,
    RECENT: `${this.BASE_URL}/activitylogs/recent`,
    STATISTICS: `${this.BASE_URL}/activitylogs/statistics`,
    CLEANUP: `${this.BASE_URL}/activitylogs/cleanup`,
  };

  // Admin endpoints
  static readonly ADMIN = {
    USERS: `${this.BASE_URL}/admin-panel/users`,
    USER_BY_ID: (id: string) => `${this.BASE_URL}/admin-panel/users/${id}`,
    USER_ACTIVATE: (id: string) => `${this.BASE_URL}/admin-panel/users/${id}/activate`,
    USER_DEACTIVATE: (id: string) => `${this.BASE_URL}/admin-panel/users/${id}/deactivate`,
    USER_CHANGE_PASSWORD: (id: string) =>
      `${this.BASE_URL}/admin-panel/users/${id}/change-password`,
    USER_SESSIONS: (id: string) => `${this.BASE_URL}/admin-panel/users/${id}/sessions`,
    USER_SESSIONS_REVOKE_ALL: (id: string) =>
      `${this.BASE_URL}/admin-panel/users/${id}/sessions/revoke-all`,
    USER_ACTIVITY_LOGS: (id: string) => `${this.BASE_URL}/admin-panel/users/${id}/activity-logs`,
    SESSIONS: `${this.BASE_URL}/admin-panel/sessions`,
    SESSION_REVOKE: (id: number) => `${this.BASE_URL}/admin-panel/sessions/${id}/revoke`,
    ACTIVITY_LOGS: `${this.BASE_URL}/admin-panel/activity-logs`,
    STATISTICS: `${this.BASE_URL}/admin-panel/statistics`,
  };

  // User Settings endpoints
  static readonly SETTINGS = {
    BASE: `${this.BASE_URL}/settings`,
    GET: `${this.BASE_URL}/settings`,
    UPDATE: `${this.BASE_URL}/settings`,
    RESET: `${this.BASE_URL}/settings/reset`,
    EXISTS: `${this.BASE_URL}/settings/exists`,
    BY_USER_ID: (userId: string) => `${this.BASE_URL}/settings/user/${userId}`,
  };

  // Icons endpoints
  static readonly ICONS = {
    BASE: `${this.BASE_URL}/Icons`,
    FLAT: `${this.BASE_URL}/Icons/flat`,
    COUNT: `${this.BASE_URL}/Icons/count`,
    SYNC_TO_LOCAL: `${this.BASE_URL}/Icons/sync-to-local`,
    UPDATE: `${this.BASE_URL}/Icons/update`,
    BATCH_UPDATE: `${this.BASE_URL}/Icons/batch-update`,
    SYNC_STATUS: `${this.BASE_URL}/Icons/sync-status`,
    REFACTOR_NAMES: `${this.BASE_URL}/Icons/refactor-names`,
    MOVE: `${this.BASE_URL}/Icons/move`,
    RENAME: `${this.BASE_URL}/Icons/rename`,
    BULK_RENAME: `${this.BASE_URL}/Icons/bulk-rename`,
    BROWSE_FILESYSTEM: (path: string) => `${this.BASE_URL}/Icons/browse-filesystem?path=${path}`,
    CONTENT: (name: string) => `${this.BASE_URL}/Icons/content/${name}`,
    CATEGORY_CONTENT: (id: number) => `${this.BASE_URL}/Icons/category/${id}/content`,
    BATCH_CONTENT: `${this.BASE_URL}/Icons/batch-content`,
    SAVE_TO_DISK: `${this.BASE_URL}/Icons/save-to-disk`,
    CREATE_DIRECTORY: (path: string) => `${this.BASE_URL}/Icons/create-directory?path=${encodeURIComponent(path)}`,
    OPEN_FILE: (path: string) => `${this.BASE_URL}/Icons/open-file?path=${encodeURIComponent(path)}`,
    READ_FILE: (path: string) => `${this.BASE_URL}/Icons/read-file?path=${encodeURIComponent(path)}`,
    DELETE: (type: string, b: boolean, f: boolean) =>
      `${this.BASE_URL}/Icons/delete?iconType=${type}&fromBackend=${b}&fromFrontend=${f}`,
    RENAME_FILE: `${this.BASE_URL}/Icons/rename-file`,
  };

  // Language App endpoints
  static readonly LANGUAGES_APP = {
    BASE: `${this.BASE_URL}/v1/languages-app`,
    AVAILABLE: `${this.BASE_URL}/v1/languages-app/available`,
    BY_ID: (id: number) => `${this.BASE_URL}/v1/languages-app/${id}`,
    DEFAULT: (id: number) => `${this.BASE_URL}/v1/languages-app/${id}/default`,
    STATUS: (id: number) => `${this.BASE_URL}/v1/languages-app/${id}/status`,
    HARD_RESET: `${this.BASE_URL}/v1/languages-app/hard-reset`,
    INITIALIZE: `${this.BASE_URL}/v1/languages-app/initialize`,
  };

  // Aggregator Languages endpoints
  static readonly AGGREGATOR_LANGUAGES = {
    BASE: `${this.BASE_URL}/v1/aggregator/languages`,
    AVAILABLE: `${this.BASE_URL}/v1/aggregator/languages/available`,
    BY_ID: (id: number) => `${this.BASE_URL}/v1/aggregator/languages/${id}`,
    DEFAULT: (id: number) => `${this.BASE_URL}/v1/aggregator/languages/${id}/default`,
    STATUS: (id: number) => `${this.BASE_URL}/v1/aggregator/languages/${id}/status`,
    HARD_RESET: `${this.BASE_URL}/v1/aggregator/languages/hard-reset`,
    INITIALIZE: `${this.BASE_URL}/v1/aggregator/languages/initialize`,
  };

  // Images General
  static readonly IMAGES = {
    UPLOAD_SIMPLE: `${this.BASE_URL}/images/upload-simple`,
    UPLOADS_PATH: `${this.BASE_URL}/uploads`,
    GET_BY_PATH: (relativePath: string) => `${this.BASE_URL}/uploads/${relativePath}`,
  };

  // Image Studio & Processing
  static readonly IMAGE_STUDIO = {
    SAVE: `${this.BASE_URL}/av-image-studio/save`,
    PROXY_IMAGE: `${this.BASE_URL}/av-image-studio/proxy-image`,
  };

  static readonly ADVANCED_IMAGES = {
    SAVE: `${this.BASE_URL}/advanced-image/save`,
    LOAD: (id: string) => `${this.BASE_URL}/advanced-image/load/${id}`,
    DELETE: (id: string) => `${this.BASE_URL}/advanced-image/delete/${id}`,
    LIST: `${this.BASE_URL}/advanced-image/list`,
    PROXY_IMAGE: `${this.BASE_URL}/advanced-image/proxy-image`,
  };

  static readonly EDITOR_IMAGES = {
    UPLOAD: `${this.BASE_URL}/editor/images/upload`,
    VALIDATE: `${this.BASE_URL}/editor/images/validate`,
    METADATA: `${this.BASE_URL}/editor/images/metadata`,
    CONFIG: `${this.BASE_URL}/editor/images/config`,
    SUPPORTED_FORMATS: `${this.BASE_URL}/editor/images/supported-formats`,
    HEALTH: `${this.BASE_URL}/editor/images/health`,
    DELETE: (filename: string) => `${this.BASE_URL}/editor/images/${encodeURIComponent(filename)}`,
    CLEANUP: `${this.BASE_URL}/editor/images/cleanup`,
  };

  // Common Configs
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

  static readonly TINYMCE_CONFIG = {
    DEBUG_ENABLED: environment.production ? false : true,
    DEBUG_PREFIX: '[TOTO-PLUGIN]',
    LICENSE_KEY: 'gpl',
    PROMOTION: false,
    BRANDING: false,
  };

  /**
   * Утилитный метод для получения URL изображения
   */
  static getImageUrl(relativePath: string): string {
    if (!relativePath) return '';
    if (relativePath.startsWith('http')) return relativePath;

    // Получаем базовый URL хоста (убираем /api и лишние слеши в конце)
    const host = this.BASE_URL.split('/api')[0];

    // Убеждаемся, что относительный путь начинается со слеша
    const cleanPath = relativePath.startsWith('/') ? relativePath : `/${relativePath}`;

    // Если путь уже содержит /uploads/, просто склеиваем
    if (cleanPath.includes('/uploads/')) {
      return `${host}${cleanPath}`;
    }

    // По умолчанию для старого формата (images/...)
    return `${host}/uploads/images${cleanPath}`;
  }

  static getFullUrl(path: string): string {
    return `${this.BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
  }

  static isAuthEndpoint(url: string): boolean {
    const lowerUrl = url.toLowerCase();
    return (
      lowerUrl.includes('/auth/login') ||
      lowerUrl.includes('/auth/register') ||
      lowerUrl.includes('/auth/refresh') ||
      lowerUrl.includes('/password/')
    );
  }
}

export const STORAGE_KEYS = {
  ACCESS_TOKEN: environment.auth.tokenKey,
  REFRESH_TOKEN: environment.auth.refreshTokenKey,
  USER_DATA: 'user_data',
};

export const PAGINATION_DEFAULTS = {
  PAGE_NUMBER: 1,
  PAGE_SIZE: 20,
};
