/**
 * Основной экспорт плагина Circle
 * Круговая обрезка изображений с прозрачностью
 */

// Основной сервис
export { CircleService } from './circle.service';

// Компоненты
export { CircleToolbarComponent } from './components/circle-toolbar.component';

// Типы и интерфейсы
export type {
  CircleConfig,
  CircleEvents,
  CircleRenderOptions,
  CircleResult,
  CircleSettings,
  CircleState,
  CircleStateDetailed,
  CircleUtils,
  ImageBounds,
  InteractionMode,
  MousePosition,
} from './circle.types';

// Константы и настройки по умолчанию
export { CIRCLE_CONSTANTS, DEFAULT_CIRCLE_CONFIG, DEFAULT_CIRCLE_SETTINGS } from './circle.types';

// Утилиты
export { circleUtils, CircleUtilsImpl } from './utils/circle.utils';

/**
 * Информация о плагине
 */
export const CIRCLE_PLUGIN_INFO = {
  name: 'Circle',
  version: '1.0.0',
  description: 'Плагин для круговой обрезки изображений с поддержкой прозрачности',
  author: 'Aurora Editor Team',

  features: [
    'Интерактивная настройка круга',
    'Перетаскивание и изменение размера',
    'Экспорт PNG с прозрачностью',
    'Горячие клавиши (Enter, Esc, Ctrl+C, Ctrl+R)',
    'Валидация границ изображения',
    'Адаптивный интерфейс',
    'Поддержка всех форматов изображений',
  ],

  requirements: ['Angular 19+', 'Canvas API', 'HTML5 File API'],

  shortcuts: {
    Enter: 'Применить обрезку',
    Escape: 'Отменить операцию',
    'Ctrl+C': 'Центрировать круг',
    'Ctrl+R': 'Оптимальный размер',
  },
} as const;

/**
 * Метаданные для интеграции в редактор
 */
export const CIRCLE_PLUGIN_META = {
  id: 'circle',
  category: 'image-editing',
  toolbar: {
    group: 'image-tools',
    position: 'after-crop',
    icon: 'circle',
    shortcut: 'C',
  },
  permissions: ['canvas-access', 'file-export'],
  dependencies: [],
} as const;
