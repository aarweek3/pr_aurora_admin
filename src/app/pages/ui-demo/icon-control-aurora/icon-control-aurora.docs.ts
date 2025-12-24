/**
 * Документация и примеры кода для IconControlAuroraComponent
 * Вынесено из основного компонента для улучшения читаемости и сопровождения
 */

// --- Документация для интеграции IconSettingsControlComponent ---

export const IMPORT_DOC = `import { IconSettingsControlComponent } from '@shared/components/ui/icon';

@Component({
  standalone: true,
  imports: [IconSettingsControlComponent],
  // ...
})`;

export const SETUP_DOC = `import { signal } from '@angular/core';
import { AvIconConfig } from '@shared/components/ui/icon';

export class MyComponent {
  // Инициализация конфигурации
  iconConfig = signal<AvIconConfig>({
    type: 'actions/av_check_mark',
    size: 32,
    color: '#1890ff'
  });

  // Обработка изменений (опционально, если не используете сигналы напрямую)
  onIconChange(newConfig: AvIconConfig) {
    console.log('Icon config updated:', newConfig);
  }
}`;

export const TEMPLATE_DOC = `<!-- Двухстороннее связывание (Two-way binding) -->
<av-icon-settings-control
  [(value)]="iconConfig"
  [presets]="myPresets"
  (valueChange)="onIconChange($event)">
</av-icon-settings-control>

<!-- Отображение иконки -->
<av-icon
  [type]="iconConfig().type"
  [size]="iconConfig().size"
  [color]="iconConfig().color">
</av-icon>`;

export const PRESETS_DOC = `// Пример структуры пресетов
readonly iconPresets = [
  { category: 'actions', value: 'actions/av_add', label: 'Добавить' },
  { category: 'arrows', value: 'arrows/av_arrow_down', label: 'Вниз' },
  // ...
];`;

export const FULL_TS_DOC = `import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent, IconSettingsControlComponent, AvIconConfig } from '@shared/components/ui/icon';

@Component({
  selector: 'app-icon-advanced-example',
  standalone: true,
  imports: [CommonModule, IconComponent, IconSettingsControlComponent],
  templateUrl: './icon-advanced-example.component.html',
  styleUrl: './icon-advanced-example.component.scss'
})
export class IconAdvancedExampleComponent {
  // Сигнал конфигурации (все параметры иконки)
  iconConfig = signal<AvIconConfig>({
    type: 'actions/av_check_mark',
    size: 48,
    color: '#1890ff',
    rotation: 0,
    background: '#f0f7ff',
    padding: 12,
    borderRadius: 8,
    borderShow: true,
    borderColor: '#1890ff'
  });

  // Пресеты для быстрого выбора
  readonly presets = [
    { category: 'actions', value: 'actions/av_add', label: 'Add' },
    { category: 'actions', value: 'actions/av_check_mark', label: 'Check' },
    { category: 'system', value: 'system/av_settings', label: 'Settings' }
  ];
}`;

export const FULL_HTML_DOC = `<div class="example-layout">
  <!-- Блок управления -->
  <div class="control-side">
    <av-icon-settings-control
      [(value)]="iconConfig"
      [presets]="presets">
    </av-icon-settings-control>
  </div>

  <!-- Блок предпросмотра -->
  <div class="preview-side">
    <av-icon
      [type]="iconConfig().type"
      [size]="iconConfig().size"
      [color]="iconConfig().color"
      [style.transform]="'rotate(' + iconConfig().rotation + 'deg)'"
      [style.background]="iconConfig().background"
      [style.padding.px]="iconConfig().padding"
      [style.border-radius.px]="iconConfig().borderRadius"
      [style.border]="iconConfig().borderShow ? iconConfig().borderWidth + 'px solid ' + iconConfig().borderColor : 'none'">
    </av-icon>
  </div>
</div>`;

export const FULL_SCSS_DOC = `.example-layout {
  display: flex;
  gap: 24px;
  padding: 24px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);

  .control-side {
    flex: 1;
    max-width: 400px;
  }

  .preview-side {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f8f9fa;
    border-radius: 8px;
    min-height: 200px;
  }
}`;

export const USAGE_EXAMPLE = `// Базовые примеры использования
<av-icon type="actions/av_check_mark" [size]="24"></av-icon>
<av-icon type="general/av_like" [size]="32" color="#ff4d4f"></av-icon>
<av-icon type="system/av_settings" [size]="48" color="#1890ff"></av-icon>

// С трансформациями
<av-icon
  type="arrows/av_arrow_right"
  [size]="24"
  [style.transform]="'rotate(45deg)'">
</av-icon>

// С фоном и границей
<av-icon
  type="general/av_star"
  [size]="40"
  color="#faad14"
  [style.padding]="'8px'"
  [style.background]="'#fffbe6'"
  [style.border]="'1px solid #ffe58f'"
  [style.border-radius]="'6px'">
</av-icon>`;

export const API_EXAMPLE = `// ========================================
// ICON COMPONENT API - Полная документация
// ========================================

// 1. БАЗОВОЕ ИСПОЛЬЗОВАНИЕ
<av-icon type="actions/av_check_mark"></av-icon>
<av-icon type="actions/av_check_mark" [size]="24"></av-icon>
<av-icon type="actions/av_check_mark" [size]="24" color="#1890ff"></av-icon>

// 2. ОБЯЗАТЕЛЬНЫЕ ПАРАМЕТРЫ
type: string    // Путь к иконке в формате "category/icon_name"
                // Примеры: "actions/av_check_mark", "system/av_settings"

// 3. ОПЦИОНАЛЬНЫЕ ПАРАМЕТРЫ
[size]: number           // Размер иконки в пикселях (по умолчанию: 24)
color: string           // Цвет иконки в любом CSS формате
                       // Примеры: "#1890ff", "red", "rgb(24, 144, 255)"

// 4. СТИЛИЗАЦИЯ ЧЕРЕЗ CSS СВОЙСТВА
[style.transform]: string      // Трансформации
[style.opacity]: number        // Прозрачность (0-1)
[style.padding]: string        // Внутренние отступы
[style.background]: string     // Фон контейнера
[style.border]: string         // Рамка контейнера
[style.border-radius]: string  // Скругление углов

// 5. ПРИМЕРЫ ТРАНСФОРМАЦИЙ
// Поворот
<av-icon type="arrows/av_arrow_right" [style.transform]="'rotate(90deg)'"></av-icon>

// Масштабирование
<av-icon type="general/av_star" [style.transform]="'scale(1.5)'"></av-icon>

// Отражение
<av-icon type="arrows/av_arrow_left" [style.transform]="'scaleX(-1)'"></av-icon>
<av-icon type="arrows/av_arrow_up" [style.transform]="'scaleY(-1)'"></av-icon>

// Комбинированные трансформации
<av-icon
  type="system/av_settings"
  [style.transform]="'rotate(45deg) scale(1.2)'">
</av-icon>

// 6. ПРИМЕРЫ СО СТИЛИЗАЦИЕЙ
// Иконка с фоном и рамкой
<av-icon
  type="general/av_like"
  [size]="40"
  color="#ff4d4f"
  [style.padding]="'12px'"
  [style.background]="'#fff2f0'"
  [style.border]="'2px solid #ffccc7'"
  [style.border-radius]="'8px'">
</av-icon>

// Полупрозрачная иконка
<av-icon
  type="system/av_warning"
  [size]="32"
  color="#faad14"
  [style.opacity]="0.6">
</av-icon>

// 7. ДОСТУПНЫЕ КАТЕГОРИИ ИКОНОК
actions/      // Действия: check_mark, close, delete, etc.
arrows/       // Стрелки: arrow_left, arrow_right, etc.
charts/       // Графики: bar_chart, pie_chart, etc.
communication/ // Связь: chat, mail, phone, etc.
editor/       // Редактор: bold, italic, align_center, etc.
files/        // Файлы: folder, excel, zip, etc.
general/      // Общие: home, star, like, etc.
media/        // Медиа: play, pause, image, etc.
settings/     // Настройки: speaker, volume, etc.
social/       // Соцсети: github, twitter, youtube, etc.
system/       // Система: settings, lock, notification, etc.
time/         // Время: clock, alarm, stopwatch, etc.
user/         // Пользователи: profile, users, etc.

// 8. ТИПЫ ДАННЫХ (TypeScript)
interface AvIconConfig {
  type: string;              // Обязательно
  size?: number;             // По умолчанию: 24
  color?: string;            // По умолчанию: inherit
  rotation?: number;         // Поворот в градусах
  opacity?: number;          // Прозрачность 0-1
  scale?: number;           // Масштаб (1 = 100%)
  flipX?: boolean;          // Отражение по X
  flipY?: boolean;          // Отражение по Y
  padding?: number;         // Внутренние отступы
  background?: string;      // Фон контейнера
  borderShow?: boolean;     // Показать рамку
  borderColor?: string;     // Цвет рамки
  borderWidth?: number;     // Толщина рамки
  borderRadius?: number;    // Скругление рамки
}`;
