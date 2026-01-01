/* ============================================================================
YOUTUBE PLUGIN - НОВАЯ ВЕРСИЯ С ЛОГИРОВАНИЕМ
============================================================================

Плагин для вставки YouTube видео в редактор.

Особенности:
- Открытие модального окна для настройки видео
- Извлечение Video ID из URL
- Создание адаптивного или фиксированного iframe
- Настройка параметров встраивания
- Подробное логирование всех операций

============================================================================ */

import { AuroraPlugin } from '../aurora-plugin.interface';

/**
 * Плагин для вставки YouTube видео
 */
export class YouTubePlugin implements AuroraPlugin {
  name = 'youtube';
  title = 'YouTube видео';
  icon = '📺';
  category = 'insert';

  /**
   * Callback для открытия модального окна
   */
  onOpenModal?: () => void;

  constructor() {
    console.log('[YouTubePlugin] 🎬 Plugin created');
  }

  /**
   * Инициализация плагина
   */
  init(): void {
    console.log('[YouTubePlugin] 🔧 Plugin initialized');
  }

  /**
   * Выполнение плагина - открытие модального окна
   */
  execute(editorElement: HTMLElement): boolean {
    console.log('[YouTubePlugin] ▶️ Execute called');
    console.log('[YouTubePlugin] Editor element:', editorElement);
    console.log('[YouTubePlugin] onOpenModal callback:', this.onOpenModal ? 'exists' : 'NOT SET');

    if (this.onOpenModal) {
      console.log('[YouTubePlugin] 🚀 Calling onOpenModal callback');
      this.onOpenModal();
      console.log('[YouTubePlugin] ✅ onOpenModal callback executed');
      return true;
    }

    console.warn('[YouTubePlugin] ❌ onOpenModal callback is not set!');
    return false;
  }

  /**
   * Проверка активности (всегда неактивен)
   */
  isActive(editorElement: HTMLElement): boolean {
    return false;
  }

  /**
   * Уничтожение плагина
   */
  destroy(): void {
    console.log('[YouTubePlugin] 💥 Plugin destroyed');
  }
}
