import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnDestroy, signal } from '@angular/core';
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
import { IconDataService } from '../../../shared/services/icon-data.service';
import { AvIconCategory } from '../old-control/icon-ui/icon-metadata.model';
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
} from './icon-control-aurora.docs';

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
export class IconControlAuroraComponent implements OnDestroy {
  private iconService = inject(IconDataService);

  // Константы времени для улучшения читаемости
  private readonly MESSAGE_TIMEOUT = 3000; // 3 секунды

  // Хранение таймера для очистки
  private messageTimer: ReturnType<typeof setTimeout> | null = null;

  // Динамические пресеты иконок
  iconPresets = signal<any[]>([]);

  constructor() {
    this.loadIconPresets();
  }

  private loadIconPresets() {
    this.iconService.getIcons().subscribe({
      next: (categories: AvIconCategory[]) => {
        const flatIcons = categories.flatMap((cat) =>
          cat.icons.map((icon) => ({
            category: icon.category,
            value: icon.type,
            label: icon.name,
          })),
        );
        this.iconPresets.set(flatIcons);
      },
      error: (err: any) => {
        console.error('Failed to load icons in aurora component', err);
      },
    });
  }

  // Конфигурация showcase с новой 3-блочной структурой
  readonly showcaseConfig: ShowcaseConfig = {
    headerConfig: {
      title: 'Icon Management System 🎨',
      componentName: 'IconControlAuroraComponent',
      componentPath: 'src/app/pages/ui-demo/icon-control-aurora/icon-control-aurora.component.ts',
      controlComponent: {
        name: 'IconSettingsControlComponent',
        path: 'src/app/shared/components/ui/icon/icon-settings-control/icon-settings-control.component.ts',
      },
      docsPath: 'src\\app\\pages\\ui-demo\\icon-control-aurora\\icon-control-aurora.docs.ts',
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
