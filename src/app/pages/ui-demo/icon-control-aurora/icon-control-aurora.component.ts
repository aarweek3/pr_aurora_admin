import { CommonModule } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzCardModule } from 'ng-zorro-antd/card';
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
    FormsModule,
    ShowcaseComponent,
    IconComponent,
    IconSettingsControlComponent,
    HelpCopyContainerComponent,
    NzTabsModule,
    NzCardModule,
    NzGridModule,
  ],
  templateUrl: './icon-control-aurora.component.html',
  styleUrl: './icon-control-aurora.component.scss',
})
export class IconControlAuroraComponent {
  // Конфигурация showcase
  readonly showcaseConfig: ShowcaseConfig = {
    headerConfig: {
      title: 'Icon Component Aurora 🎨',
      description: 'Интерактивная демонстрация компонента av-icon с полным управлением',
      componentName: 'IconComponent',
      componentPath: 'src/app/shared/components/ui/icon/icon.component.ts',
      note: '💡 Все изменения применяются в режиме реального времени',
    },
    resultTitle: '🎯 Живая иконка',
    showExamples: true,
    showDocs: true,
    columnSplit: [13, 11],
  };

  // Состояние иконки
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
    { category: 'arrows', value: 'arrows/av_arrow-down', label: 'Arrow Down' },
    { category: 'arrows', value: 'arrows/av_arrow-left', label: 'Arrow Left' },
    { category: 'arrows', value: 'arrows/av_arrow-right', label: 'Arrow Right' },
    { category: 'arrows', value: 'arrows/av_arrow-up', label: 'Arrow Up' },
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
    { category: 'editor', value: 'editor/av_align-center', label: 'Align Center' },
    { category: 'editor', value: 'editor/av_align-justify', label: 'Align Justify' },
    { category: 'editor', value: 'editor/av_align-left', label: 'Align Left' },
    { category: 'editor', value: 'editor/av_align-right', label: 'Align Right' },
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
  ]; // Пресеты цветов
  readonly colorPresets = [
    '#1890ff', // Primary Blue
    '#52c41a', // Success Green
    '#faad14', // Warning Orange
    '#ff4d4f', // Error Red
    '#722ed1', // Purple
    '#13c2c2', // Cyan
    '#eb2f96', // Magenta
    '#000000', // Black
    '#666666', // Gray
  ];

  // Пресеты размеров
  readonly sizePresets = [
    { value: 16, label: 'Small (16px)' },
    { value: 24, label: 'Medium (24px)' },
    { value: 32, label: 'Large (32px)' },
    { value: 48, label: 'Extra Large (48px)' },
  ];

  // Вычисляемые стили для иконки
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
    const tsCode = `iconConfig = {
  type: '${config.type}',
  size: ${config.size},
  color: '${config.color}',
  rotation: ${config.rotation},
  opacity: ${config.opacity},
  scale: ${config.scale}
};`;

    return {
      html: htmlLines.join('\n'),
      typescript: tsCode,
    };
  });

  // Примеры для API
  readonly apiExample = `// Базовое использование
<av-icon type="actions/av_check_mark" [size]="24" color="#1890ff"></av-icon>

// Со всеми опциями
<av-icon
  type="system/av_settings"
  [size]="32"
  color="#52c41a"
  [style.transform]="'rotate(45deg) scale(1.2)'"
  [style.opacity]="0.8">
</av-icon>`;

  // Методы управления (упрощены для работы с готовым контролом)
  onIconConfigChange(newConfig: AvIconConfig): void {
    this.iconConfig.set(newConfig);
    this.showMessage('Настройки обновлены! 🎨');
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
