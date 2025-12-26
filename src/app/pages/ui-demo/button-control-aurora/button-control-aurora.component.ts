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

// Новые импорты для универсального компонента документации
import { ControlDocumentationComponent } from '@shared/components/ui/control-documentation';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { ICON_PRESETS } from '../../../../assets/constants/icon-presets.const';
import {
  ButtonDirective,
  ButtonSize,
  ButtonType,
} from '../../../shared/components/ui/button/button.directive';
import { AvIconConfig } from '../../../shared/components/ui/icon';
import { IconSettingsControlComponent } from '../../../shared/components/ui/icon/icon-settings-control/icon-settings-control.component';
import { IconComponent } from '../../../shared/components/ui/icon/icon.component';
import { PickerComponent } from '../../../shared/components/ui/picker/picker.component';
import {
  ShowcaseComponent,
  ShowcaseConfig,
} from '../../../shared/components/ui/showcase/showcase.component';
import { DOCUMENTATION } from './button-control-aurora.config';

// Интерфейс конфигурации кнопки
interface ButtonConfig {
  type: ButtonType;
  size: ButtonSize;
  shape: 'default' | 'circle' | 'square' | 'round' | 'rounded' | 'rounded-big';
  variant: string;
  disabled: boolean;
  loading: boolean;
  block: boolean;
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
    NzSelectModule,
    NzCheckboxModule,
    PickerComponent,
    IconSettingsControlComponent,
    ControlDocumentationComponent,
  ],
  templateUrl: './button-control-aurora.component.html',
  styleUrl: './button-control-aurora.component.scss',
})
export class ButtonControlAuroraComponent implements OnDestroy {
  // Константы времени для улучшения читаемости
  private readonly MESSAGE_TIMEOUT = 3000; // 3 секунды

  // Хранение таймера для очистки
  private messageTimer: ReturnType<typeof setTimeout> | null = null;

  // Конфигурация универсальной документации
  readonly documentationConfig = DOCUMENTATION;
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
    block: false,
    text: 'Button Text',
    icon: 'actions/av_check_mark',
  });

  // Сообщения для пользователя
  message = signal<string>('');

  // Цвета кнопки
  bgColor = signal<string>('');
  textColor = signal<string>('');

  // Конфигурация иконки
  iconConfig = signal<AvIconConfig>({
    type: null,
    size: 16,
    color: '',
    rotation: 0,
    scale: 1,
    opacity: 1,
    flipX: false,
    flipY: false,
    padding: 0,
    background: '',
    borderShow: false,
    borderColor: '#d9d9d9',
    borderWidth: 1,
    borderRadius: 0,
  });

  // Пресеты иконок (полная библиотека)
  readonly iconPresets = ICON_PRESETS;

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
    const icon = this.iconConfig();

    // HTML код
    const htmlLines = [
      `<button av-button`,
      `  avType="${config.type}"`,
      `  avSize="${config.size}"`,
    ];

    if (config.shape !== 'default') {
      htmlLines.push(`  avShape="${config.shape}"`);
    }

    // Добавляем класс варианта
    if (config.variant && config.variant !== 'filled') {
      htmlLines.push(`  class="av-btn--variant-${config.variant}"`);
    }

    if (config.disabled) htmlLines.push(`  [disabled]="true"`);
    if (config.loading) htmlLines.push(`  [avLoading]="true"`);
    if (config.block) htmlLines.push(`  [avBlock]="true"`);

    // Добавляем цвета если они заданы
    if (this.bgColor()) htmlLines.push(`  [style.background-color]="${this.bgColor()}"`);
    if (this.textColor()) htmlLines.push(`  [style.color]="${this.textColor()}"`);

    htmlLines.push(`>`);

    // Добавляем иконку если настроена
    if (icon.type) {
      const iconLines = [`  <av-icon`];
      iconLines.push(`    type="${icon.type}"`);
      if (icon.size !== 16) iconLines.push(`    [size]="${icon.size}"`);
      if (icon.color) iconLines.push(`    color="${icon.color}"`);

      // Добавляем трансформации
      const transforms = [];
      if (icon.rotation !== 0) transforms.push(`rotate(${icon.rotation}deg)`);
      if (icon.scale !== 1) transforms.push(`scale(${icon.scale})`);
      if (icon.flipX) transforms.push(`scaleX(-1)`);
      if (icon.flipY) transforms.push(`scaleY(-1)`);
      if (transforms.length > 0) {
        iconLines.push(`    [style.transform]="${transforms.join(' ')}"`);
      }

      if (icon.opacity !== 1) iconLines.push(`    [style.opacity]="${icon.opacity}"`);
      if (icon.padding) iconLines.push(`    [style.padding.px]="${icon.padding}"`);
      if (icon.background) iconLines.push(`    [style.background]="${icon.background}"`);
      if (icon.borderShow && icon.borderColor) {
        iconLines.push(`    [style.border]="${icon.borderWidth}px solid ${icon.borderColor}"`);
      }
      if (icon.borderRadius) iconLines.push(`    [style.border-radius.px]="${icon.borderRadius}"`);

      iconLines.push(`  ></av-icon>`);
      htmlLines.push(iconLines.join('\n'));
    }

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
  block: ${config.block},
  text: '${config.text}'`;

    if (this.bgColor() || this.textColor()) {
      if (this.bgColor()) tsCode += `,\n  bgColor: '${this.bgColor()}'`;
      if (this.textColor()) tsCode += `,\n  textColor: '${this.textColor()}'`;
    }

    tsCode += `\n};\n\n`;

    // Добавляем конфигурацию иконки если настроена
    if (icon.type) {
      tsCode += `iconConfig: AvIconConfig = {\n`;
      tsCode += `  type: '${icon.type}',\n`;
      tsCode += `  size: ${icon.size},\n`;
      if (icon.color) tsCode += `  color: '${icon.color}',\n`;
      if (icon.rotation !== 0) tsCode += `  rotation: ${icon.rotation},\n`;
      if (icon.scale !== 1) tsCode += `  scale: ${icon.scale},\n`;
      if (icon.opacity !== 1) tsCode += `  opacity: ${icon.opacity},\n`;
      if (icon.flipX) tsCode += `  flipX: true,\n`;
      if (icon.flipY) tsCode += `  flipY: true,\n`;
      if (icon.padding) tsCode += `  padding: ${icon.padding},\n`;
      if (icon.background) tsCode += `  background: '${icon.background}',\n`;
      if (icon.borderShow) {
        tsCode += `  borderShow: true,\n`;
        tsCode += `  borderColor: '${icon.borderColor}',\n`;
        tsCode += `  borderWidth: ${icon.borderWidth},\n`;
      }
      if (icon.borderRadius) tsCode += `  borderRadius: ${icon.borderRadius},\n`;
      tsCode += `};`;
    }

    return {
      html: htmlLines.join('\n'),
      typescript: tsCode,
    };
  });

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

  // Метод для обработки изменения иконки
  onIconConfigChange(newConfig: AvIconConfig): void {
    this.iconConfig.set(newConfig);
    // Обновляем иконку в конфигурации кнопки
    if (newConfig.type) {
      this.updateButtonConfig('icon', newConfig.type);
    }
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
