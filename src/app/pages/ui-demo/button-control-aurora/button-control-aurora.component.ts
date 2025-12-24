import { CommonModule } from '@angular/common';
import { Component, computed, OnDestroy, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import {
  ButtonDirective,
  ButtonSize,
  ButtonType,
} from '../../../shared/components/ui/button/button.directive';
import { HelpCopyContainerComponent } from '../../../shared/components/ui/container-help-copy-ui/container-help-copy-ui.component';
import { IconComponent } from '../../../shared/components/ui/icon/icon.component';
import { PickerComponent } from '../../../shared/components/ui/picker/picker.component';
import {
  ShowcaseComponent,
  ShowcaseConfig,
} from '../../../shared/components/ui/showcase/showcase.component';
import {
  API_EXAMPLE,
  FULL_HTML_DOC,
  FULL_SCSS_DOC,
  FULL_TS_DOC,
  IMPORT_DOC,
  PRESETS_DOC,
  SETUP_DOC,
  TEMPLATE_DOC,
  USAGE_EXAMPLE,
} from './button-control-aurora.docs';

// Интерфейс конфигурации кнопки
interface ButtonConfig {
  type: ButtonType;
  size: ButtonSize;
  shape: 'default' | 'circle' | 'square' | 'round' | 'rounded' | 'rounded-big';
  variant: string;
  disabled: boolean;
  loading: boolean;
  text: string;
  icon?: string;
  bgColor?: string;
  textColor?: string;
}

@Component({
  selector: 'app-button-control-aurora',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ShowcaseComponent,
    IconComponent,
    ButtonDirective,
    NzTabsModule,
    NzCardModule,
    NzButtonModule,
    NzCollapseModule,
    NzAlertModule,
    NzGridModule,
    NzRadioModule,
    NzInputModule,
    NzCheckboxModule,
    HelpCopyContainerComponent,
    PickerComponent,
  ],
  templateUrl: './button-control-aurora.component.html',
  styleUrl: './button-control-aurora.component.scss',
})
export class ButtonControlAuroraComponent implements OnDestroy {
  // Константы времени для улучшения читаемости
  private readonly MESSAGE_TIMEOUT = 3000; // 3 секунды

  // Хранение таймера для очистки
  private messageTimer: ReturnType<typeof setTimeout> | null = null;
  // Конфигурация showcase с новой 3-блочной структурой
  readonly showcaseConfig: ShowcaseConfig = {
    headerConfig: {
      title: 'Button Control System �',
      componentName: 'ButtonControlAuroraComponent',
      componentPath:
        'src/app/pages/ui-demo/button-control-aurora/button-control-aurora.component.ts',
      controlComponent: {
        name: 'ButtonDirective',
        path: 'src/app/shared/components/ui/button/button.directive.ts',
      },
      docsPath: 'src\\app\\pages\\ui-demo\\button-control-aurora\\button-control-aurora.docs.ts',
      description:
        'Демонстрация возможностей ButtonDirective - мощного решения для создания стилизованных кнопок. ' +
        'Поддерживает различные типы (primary, default, dashed, link), размеры (small, default, large), ' +
        'состояния (loading, disabled) и полную кастомизацию внешнего вида. ' +
        'Директива предоставляет единообразный API для всех типов кнопок в приложении.',
      note: '💡 Полная документация по интеграции и использованию ButtonDirective находится в разделе "Документация"',
    },
    showExamples: true,
    showDocs: true,
    columnSplit: [14, 10],
    resultBlocks: {
      preview: {
        title: '🎯 Живая кнопка',
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

  // Единственный сигнал для конфигурации кнопки
  buttonConfig = signal<ButtonConfig>({
    type: 'primary',
    size: 'default',
    shape: 'default',
    variant: 'filled',
    disabled: false,
    loading: false,
    text: 'Button Text',
    icon: 'actions/av_check_mark',
  });

  // Сообщения для пользователя
  message = signal<string>('');

  // Цвета кнопки
  bgColor = signal<string>('');
  textColor = signal<string>('');

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

  // Вычисляемые стили для кнопки (для результата)
  buttonStyle = computed(() => {
    const config = this.buttonConfig();
    const style: any = {
      opacity: config.disabled ? 0.6 : 1,
      cursor: config.disabled ? 'not-allowed' : 'pointer',
      transition: 'all 0.3s ease',
    };

    // Применяем цвета если они заданы
    if (this.bgColor()) {
      style.backgroundColor = this.bgColor();
      style.borderColor = this.bgColor();
    }
    if (this.textColor()) {
      style.color = this.textColor();
    }

    return style;
  });

  // Генерация кода для копирования
  generatedCode = computed(() => {
    const config = this.buttonConfig();

    // HTML код
    const htmlLines = [
      `<button av-button`,
      `  avType="${config.type}"`,
      `  avSize="${config.size}"`,
    ];

    if (config.shape !== 'default') {
      htmlLines.push(`  avShape="${config.shape}"`);
    }

    htmlLines.push(`  avVariant="${config.variant}"`);

    if (config.disabled) htmlLines.push(`  [disabled]="true"`);
    if (config.loading) htmlLines.push(`  [avLoading]="true"`);
    if (config.icon) htmlLines.push(`  avIcon="${config.icon}"`);

    // Добавляем цвета если они заданы
    if (this.bgColor()) htmlLines.push(`  avColor="${this.bgColor()}"`);
    if (this.textColor()) htmlLines.push(`  avTextColor="${this.textColor()}"`);

    htmlLines.push(`>`);
    htmlLines.push(`  ${config.text}`);
    htmlLines.push(`</button>`);

    // TypeScript код
    let tsCode = `buttonConfig: ButtonConfig = {
  type: '${config.type}',
  size: '${config.size}',
  shape: '${config.shape}',
  variant: '${config.variant}',
  disabled: ${config.disabled},
  loading: ${config.loading},
  text: '${config.text}',
  icon: '${config.icon}'`;

    if (this.bgColor() || this.textColor()) {
      tsCode += `,`;
      if (this.bgColor()) tsCode += `\n  bgColor: '${this.bgColor()}'`;
      if (this.bgColor() && this.textColor()) tsCode += `,`;
      if (this.textColor()) tsCode += `\n  textColor: '${this.textColor()}'`;
    }

    tsCode += `\n};`;

    return {
      html: htmlLines.join('\n'),
      typescript: tsCode,
    };
  });

  // --- Документация импортированная из отдельного файла ---
  // Константы для улучшения читаемости и сопровождения кода
  readonly importDoc = IMPORT_DOC;
  readonly setupDoc = SETUP_DOC;
  readonly templateDoc = TEMPLATE_DOC;
  readonly presetsDoc = PRESETS_DOC;
  readonly fullTsDoc = FULL_TS_DOC;
  readonly fullHtmlDoc = FULL_HTML_DOC;
  readonly fullScssDoc = FULL_SCSS_DOC;
  readonly usageExample = USAGE_EXAMPLE;
  readonly apiExample = API_EXAMPLE;

  // Код для showcase (объединенный)
  codeForShowcase = computed(() => {
    const code = this.generatedCode();
    return `HTML:\n${code.html}\n\nTypeScript:\n${code.typescript}`;
  });

  // Методы для обработки изменений
  onButtonConfigChange(newConfig: ButtonConfig): void {
    this.buttonConfig.set(newConfig);
    this.showMessage('Настройки кнопки обновлены! 🎨');
  }

  // Метод для обновления конфигурации кнопки (используется в шаблоне)
  updateButtonConfig(property: keyof ButtonConfig, value: any): void {
    const currentConfig = this.buttonConfig();
    this.buttonConfig.set({
      ...currentConfig,
      [property]: value,
    });
    this.showMessage('Настройки кнопки обновлены! 🎨');
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
    // Очищаем предыдущий таймер, если он есть
    if (this.messageTimer) {
      clearTimeout(this.messageTimer);
    }

    this.message.set(msg);

    // Устанавливаем новый таймер с сохранением ссылки
    this.messageTimer = setTimeout(() => {
      this.message.set('');
      this.messageTimer = null;
    }, this.MESSAGE_TIMEOUT);
  }

  ngOnDestroy(): void {
    // Очищаем таймер при уничтожении компонента
    if (this.messageTimer) {
      clearTimeout(this.messageTimer);
      this.messageTimer = null;
    }
  }
}
