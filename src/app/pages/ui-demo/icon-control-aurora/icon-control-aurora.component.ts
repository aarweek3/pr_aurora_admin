import { CommonModule } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { HelpCopyContainerComponent } from '../../../shared/components/ui/container-help-copy-ui/container-help-copy-ui.component';
import {
  AvIconConfig,
  IconComponent,
  IconSettingsControlComponent,
} from '../../../shared/components/ui/icon';
import {
  ShowcaseComponent,
  ShowcaseConfig,
} from '../../../shared/components/ui/showcase/showcase.component';

// Интерфейс конфигурации иконки (используем готовый из системы)
export { AvIconConfig as IconConfig } from '../../../shared/components/ui/icon';

@Component({
  selector: 'app-icon-control-aurora',
  standalone: true,
  imports: [
    CommonModule,
    ShowcaseComponent,
    IconComponent,
    IconSettingsControlComponent,
    NzTabsModule,
    NzCardModule,
    NzButtonModule,
    NzCollapseModule,
    NzAlertModule,
    NzGridModule,
    HelpCopyContainerComponent,
  ],
  templateUrl: './icon-control-aurora.component.html',
  styleUrl: './icon-control-aurora.component.scss',
})
export class IconControlAuroraComponent {
  // Конфигурация showcase с новой 3-блочной структурой
  readonly showcaseConfig: ShowcaseConfig = {
    headerConfig: {
      title: 'Icon Management System 🎨',
      componentName: 'IconControlAuroraComponent',
      componentPath: 'src/app/pages/ui-demo/icon-control-aurora/icon-control-aurora.component.ts',
      description:
        'Демонстрация возможностей IconSettingsControlComponent - готового решения для управления параметрами иконок. ' +
        'Включает полный набор контролов: выбор иконки, размер, цвет, поворот, масштаб, отражения и стилизацию контейнера. ' +
        'Компонент предоставляет удобный интерфейс для настройки всех аспектов отображения иконок в вашем приложении.',
      note: '💡 Полная документация по интеграции и использованию IconSettingsControlComponent находится в разделе "Документация"',
    },
    showExamples: true,
    showDocs: true,
    columnSplit: [14, 10],
    resultBlocks: {
      preview: {
        title: '🎯 Живая иконка',
      },
      code: {
        title: '📄 Генерированный код',
      },
      description: {
        title: '📋 Настройки',
        autoParams: true,
      },
    },
  };

  // Единственный сигнал для конфигурации иконки
  iconConfig = signal<AvIconConfig>({
    type: 'actions/av_check_mark',
    size: 32,
    color: '#1890ff',
    rotation: 0,
    opacity: 1,
    scale: 1,
    flipX: false,
    flipY: false,
    borderShow: false,
    borderColor: '#d9d9d9',
    borderWidth: 1,
    borderRadius: 4,
    padding: 8,
    background: 'transparent',
  });

  // Сообщения для пользователя
  message = signal<string>('');

  // Пресеты иконок (полная библиотека)
  readonly iconPresets = [
    { category: 'actions', value: 'actions/av_add', label: 'Add' },
    { category: 'actions', value: 'actions/av_calculator', label: 'Calculator' },
    { category: 'actions', value: 'actions/av_check_mark', label: 'Check Mark' },
    { category: 'actions', value: 'actions/av_close', label: 'Close' },
    { category: 'actions', value: 'actions/av_copy', label: 'Copy' },
    { category: 'actions', value: 'actions/av_eraser', label: 'Eraser' },
    { category: 'actions', value: 'actions/av_exit', label: 'Exit' },
    { category: 'actions', value: 'actions/av_eye', label: 'Eye' },
    { category: 'actions', value: 'actions/av_hammer', label: 'Hammer' },
    { category: 'actions', value: 'actions/av_minus', label: 'Minus' },
    { category: 'actions', value: 'actions/av_plus', label: 'Plus' },
    { category: 'actions', value: 'actions/av_save', label: 'Save' },
    { category: 'actions', value: 'actions/av_search', label: 'Search' },
    { category: 'actions', value: 'actions/av_trash', label: 'Trash' },
    { category: 'actions', value: 'actions/av_upload', label: 'Upload' },
    { category: 'arrows', value: 'arrows/av_arrow_down_right', label: 'Arrow Down Right' },
    { category: 'arrows', value: 'arrows/av_arrow_down', label: 'Arrow Down' },
    { category: 'arrows', value: 'arrows/av_arrow_left', label: 'Arrow Left' },
    { category: 'arrows', value: 'arrows/av_arrow_right', label: 'Arrow Right' },
    { category: 'arrows', value: 'arrows/av_arrow_up', label: 'Arrow Up' },
    { category: 'arrows', value: 'arrows/av_arrows_out', label: 'Arrows Out' },
    { category: 'arrows', value: 'arrows/av_chevron-down', label: 'Chevron Down' },
    { category: 'arrows', value: 'arrows/av_chevron-left', label: 'Chevron Left' },
    { category: 'arrows', value: 'arrows/av_chevron-right', label: 'Chevron Right' },
    { category: 'arrows', value: 'arrows/av_chevron-up', label: 'Chevron Up' },
    { category: 'arrows', value: 'arrows/av_expand', label: 'Expand' },
    { category: 'arrows', value: 'arrows/av_fast_forward', label: 'Fast Forward' },
    { category: 'arrows', value: 'arrows/av_triangle-down', label: 'Triangle Down' },
    { category: 'arrows', value: 'arrows/av_triangle-left', label: 'Triangle Left' },
    { category: 'arrows', value: 'arrows/av_triangle-right', label: 'Triangle Right' },
    { category: 'arrows', value: 'arrows/av_triangle-up', label: 'Triangle Up' },
    { category: 'arrows', value: 'arrows/av_undo', label: 'Undo' },
    { category: 'charts', value: 'charts/av_bar_chart', label: 'Bar Chart' },
    { category: 'charts', value: 'charts/av_line_chart', label: 'Line Chart' },
    { category: 'charts', value: 'charts/av_pie_chart', label: 'Pie Chart' },
    { category: 'communication', value: 'communication/av_chat', label: 'Chat' },
    { category: 'communication', value: 'communication/av_mail', label: 'Mail' },
    { category: 'communication', value: 'communication/av_phone', label: 'Phone' },
    { category: 'communication', value: 'communication/av_rss', label: 'Rss' },
    { category: 'editor', value: 'editor/av_align_center', label: 'Align Center' },
    { category: 'editor', value: 'editor/av_align_right', label: 'Align Right' },
    { category: 'editor', value: 'editor/av_bold', label: 'Bold' },
    { category: 'editor', value: 'editor/av_bulleted-list', label: 'Bulleted List' },
    { category: 'editor', value: 'editor/av_edit', label: 'Edit' },
    { category: 'editor', value: 'editor/av_font', label: 'Font' },
    { category: 'editor', value: 'editor/av_italic', label: 'Italic' },
    { category: 'editor', value: 'editor/av_list', label: 'List' },
    { category: 'editor', value: 'editor/av_paint', label: 'Paint' },
    { category: 'files', value: 'files/av_excel', label: 'Excel' },
    { category: 'files', value: 'files/av_folder', label: 'Folder' },
    { category: 'files', value: 'files/av_paperclip', label: 'Paperclip' },
    { category: 'files', value: 'files/av_zip', label: 'Zip' },
    { category: 'general', value: 'general/av_book', label: 'Book' },
    { category: 'general', value: 'general/av_dice', label: 'Dice' },
    { category: 'general', value: 'general/av_earth', label: 'Earth' },
    { category: 'general', value: 'general/av_home', label: 'Home' },
    { category: 'general', value: 'general/av_house', label: 'House' },
    { category: 'general', value: 'general/av_like', label: 'Like' },
    { category: 'general', value: 'general/av_road', label: 'Road' },
    { category: 'general', value: 'general/av_tag', label: 'Tag' },
    { category: 'general', value: 'general/av_ticket', label: 'Ticket' },
    { category: 'general', value: 'general/av_trophy', label: 'Trophy' },
    { category: 'media', value: 'media/av_equalizer', label: 'Equalizer' },
    { category: 'media', value: 'media/av_image', label: 'Image' },
    { category: 'media', value: 'media/av_play', label: 'Play' },
    { category: 'media', value: 'media/av_screen', label: 'Screen' },
    { category: 'media', value: 'media/av_tablet', label: 'Tablet' },
    { category: 'media', value: 'media/av_volume', label: 'Volume' },
    { category: 'rewind', value: 'rewind/av_backward', label: 'Backward' },
    { category: 'rewind', value: 'rewind/av_eject', label: 'Eject' },
    { category: 'rewind', value: 'rewind/av_fast-backward', label: 'Fast Backward' },
    { category: 'rewind', value: 'rewind/av_fast-forward', label: 'Fast Forward' },
    { category: 'rewind', value: 'rewind/av_pause', label: 'Pause' },
    { category: 'rewind', value: 'rewind/av_record', label: 'Record' },
    { category: 'rewind', value: 'rewind/av_stop', label: 'Stop' },
    { category: 'settings', value: 'settings/av_adjust', label: 'Adjust' },
    { category: 'settings', value: 'settings/av_battery-empty', label: 'Battery Empty' },
    { category: 'settings', value: 'settings/av_battery-full', label: 'Battery Full' },
    { category: 'settings', value: 'settings/av_battery-half', label: 'Battery Half' },
    { category: 'settings', value: 'settings/av_bell-crossed', label: 'Bell Crossed' },
    { category: 'settings', value: 'settings/av_bell', label: 'Bell' },
    { category: 'settings', value: 'settings/av_bookmark', label: 'Bookmark' },
    { category: 'settings', value: 'settings/av_camera', label: 'Camera' },
    { category: 'settings', value: 'settings/av_checkmark', label: 'Checkmark' },
    { category: 'settings', value: 'settings/av_cog', label: 'Cog' },
    { category: 'settings', value: 'settings/av_cross', label: 'Cross' },
    { category: 'settings', value: 'settings/av_exclamation-mark', label: 'Exclamation Mark' },
    { category: 'settings', value: 'settings/av_info', label: 'Info' },
    { category: 'settings', value: 'settings/av_question-mark', label: 'Question Mark' },
    { category: 'settings', value: 'settings/av_speaker-mute', label: 'Speaker Mute' },
    {
      category: 'settings',
      value: 'settings/av_speaker-volume-down',
      label: 'Speaker Volume Down',
    },
    { category: 'settings', value: 'settings/av_speaker-volume-up', label: 'Speaker Volume Up' },
    { category: 'settings', value: 'settings/av_speaker', label: 'Speaker' },
    { category: 'settings', value: 'settings/av_sterisk', label: 'Sterisk' },
    { category: 'social', value: 'social/av_github', label: 'Github' },
    { category: 'social', value: 'social/av_twitter', label: 'Twitter' },
    { category: 'social', value: 'social/av_youtube', label: 'Youtube' },
    { category: 'system', value: 'system/av_barcode', label: 'Barcode' },
    { category: 'system', value: 'system/av_brightness', label: 'Brightness' },
    { category: 'system', value: 'system/av_bug', label: 'Bug' },
    { category: 'system', value: 'system/av_cog', label: 'Cog' },
    { category: 'system', value: 'system/av_info', label: 'Info' },
    { category: 'system', value: 'system/av_lock', label: 'Lock' },
    { category: 'system', value: 'system/av_notification', label: 'Notification' },
    { category: 'system', value: 'system/av_qr_code', label: 'Qr Code' },
    { category: 'system', value: 'system/av_settings', label: 'Settings' },
    { category: 'system', value: 'system/av_star', label: 'Star' },
    { category: 'system', value: 'system/av_sterisk', label: 'Sterisk' },
    { category: 'system', value: 'system/av_unlock', label: 'Unlock' },
    { category: 'system', value: 'system/av_warning', label: 'Warning' },
    { category: 'time', value: 'time/av_alarm', label: 'Alarm' },
    { category: 'time', value: 'time/av_clock', label: 'Clock' },
    { category: 'time', value: 'time/av_stopwatch', label: 'Stopwatch' },
    { category: 'user', value: 'user/av_profile', label: 'Profile' },
    { category: 'user', value: 'user/av_users', label: 'Users' },
  ];

  // Вычисляемые стили для иконки (для результата)
  iconStyle = computed(() => {
    const config = this.iconConfig();
    const style: any = {
      fontSize: `${config.size}px`,
      color: config.color,
      transform: `
        rotate(${config.rotation}deg)
        scale(${config.scale})
        scaleX(${config.flipX ? -1 : 1})
        scaleY(${config.flipY ? -1 : 1})
      `.trim(),
      opacity: config.opacity,
      padding: `${config.padding}px`,
      backgroundColor: config.background,
      borderRadius: `${config.borderRadius}px`,
      transition: 'all 0.3s ease',
    };

    if (config.borderShow) {
      style.border = `${config.borderWidth}px solid ${config.borderColor}`;
    }

    return style;
  });

  // Генерация кода для копирования
  generatedCode = computed(() => {
    const config = this.iconConfig();

    // HTML код
    const htmlLines = [
      `<av-icon`,
      `  type="${config.type}"`,
      `  [size]="${config.size}"`,
      `  color="${config.color}"`,
    ];

    if (config.rotation !== 0)
      htmlLines.push(`  [style.transform]="'rotate(${config.rotation}deg)'"`);
    if (config.opacity !== 1) htmlLines.push(`  [style.opacity]="${config.opacity}"`);
    if (config.scale !== 1) htmlLines.push(`  [style.transform]="'scale(${config.scale})'"`);
    if (config.padding !== 8) htmlLines.push(`  [style.padding]="'${config.padding}px'"`);
    if (config.background !== 'transparent')
      htmlLines.push(`  [style.background]="'${config.background}'"`);
    if (config.borderShow)
      htmlLines.push(`  [style.border]="'${config.borderWidth}px solid ${config.borderColor}'"`);

    htmlLines.push(`></av-icon>`);

    // TypeScript код
    const tsCode = `iconConfig: AvIconConfig = {
  type: '${config.type}',
  size: ${config.size},
  color: '${config.color}',
  rotation: ${config.rotation},
  opacity: ${config.opacity},
  scale: ${config.scale},
  flipX: ${config.flipX},
  flipY: ${config.flipY},
  padding: ${config.padding},
  background: '${config.background}',
  borderShow: ${config.borderShow},
  borderColor: '${config.borderColor}',
  borderWidth: ${config.borderWidth},
  borderRadius: ${config.borderRadius}
};`;

    return {
      html: htmlLines.join('\n'),
      typescript: tsCode,
    };
  });

  // --- Документация для интеграции IconSettingsControlComponent ---

  readonly importDoc = `import { IconSettingsControlComponent } from '@shared/components/ui/icon';

@Component({
  standalone: true,
  imports: [IconSettingsControlComponent],
  // ...
})`;

  readonly setupDoc = `import { signal } from '@angular/core';
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

  readonly templateDoc = `<!-- Двухстороннее связывание (Two-way binding) -->
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

  readonly presetsDoc = `// Пример структуры пресетов
readonly iconPresets = [
  { category: 'actions', value: 'actions/av_add', label: 'Добавить' },
  { category: 'arrows', value: 'arrows/av_arrow_down', label: 'Вниз' },
  // ...
];`;

  readonly fullTsDoc = `import { Component, signal } from '@angular/core';
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

  readonly fullHtmlDoc = `<div class="example-layout">
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

  readonly fullScssDoc = `.example-layout {
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

  // Код для showcase (объединенный)
  codeForShowcase = computed(() => {
    const code = this.generatedCode();
    return `HTML:\n${code.html}\n\nTypeScript:\n${code.typescript}`;
  });

  // Примеры для API
  readonly usageExample = `// Базовые примеры использования
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

  readonly apiExample = `// ========================================
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

  // Методы для обработки изменений
  onIconConfigChange(newConfig: AvIconConfig): void {
    this.iconConfig.set(newConfig);
    this.showMessage('Настройки иконки обновлены! 🎨');
  }

  copyToClipboard(text: string, type: string): void {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        this.showMessage(`${type} код скопирован! 📋`);
      })
      .catch(() => {
        this.showMessage('Ошибка копирования 😞');
      });
  }

  private showMessage(msg: string): void {
    this.message.set(msg);
    setTimeout(() => this.message.set(''), 3000);
  }
}
