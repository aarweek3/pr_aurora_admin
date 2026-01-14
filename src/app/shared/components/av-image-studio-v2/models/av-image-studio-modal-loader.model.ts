/**
 * Результат первичной загрузки изображения в Студию
 */
export interface AvImageLoadResult {
  source: 'file' | 'url' | 'drop'; // Откуда пришло изображение
  dataUrl: string; // Строка base64 или Blob URL для отображения
  file: File | null; // Оригинальный файл (может быть null, если загрузка по URL не удалась в Blob)
  fileName: string; // Имя файла (из свойств файла или извлеченное из URL)
  fileSize: number; // Вес в байтах
  mimeType: string; // Тип (image/jpeg и т.д.)
  width: number;
  height: number;
}

/**
 * Ошибки загрузки (для уведомлений пользователя)
 */
export interface AvImageLoadError {
  code: 'INVALID_FORMAT' | 'TOO_LARGE' | 'CORS_ISSUE' | 'NOT_FOUND';
  message: string;
}
