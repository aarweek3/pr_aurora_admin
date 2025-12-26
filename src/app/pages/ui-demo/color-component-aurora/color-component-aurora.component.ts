import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, OnDestroy, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { NzCardModule } from 'ng-zorro-antd/card';

import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzTabsModule } from 'ng-zorro-antd/tabs';

import { ControlDocumentationComponent } from '@shared/components/ui/control-documentation';
import { ButtonDirective } from '../../../shared/components/ui/button/button.directive';

import { NzTableModule } from 'ng-zorro-antd/table';
import { IconComponent } from '../../../shared/components/ui/icon/icon.component';
import { PickerComponent } from '../../../shared/components/ui/picker/picker.component';
import {
  type CustomColor,
  type PickerMode,
} from '../../../shared/components/ui/picker/picker.types';
import {
  ShowcaseComponent,
  ShowcaseConfig,
} from '../../../shared/components/ui/showcase/showcase.component';
import { DOCUMENTATION } from './color-component-aurora.config';

// Экспорт типов для использования в других компонентах
export { CustomColor, PickerMode } from '../../../shared/components/ui/picker/picker.types';

@Component({
  selector: 'app-color-component-aurora',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ShowcaseComponent,
    PickerComponent,
    ButtonDirective,
    IconComponent,
    NzTableModule,
    NzRadioModule,
    NzCardModule,
    NzGridModule,
    NzTabsModule,
    ControlDocumentationComponent,
  ],
  templateUrl: './color-component-aurora.component.html',
  styleUrl: './color-component-aurora.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ColorComponentAuroraComponent implements OnDestroy {
  // Константы времени для улучшения читаемости
  private readonly MESSAGE_TIMEOUT = 3000; // 3 секунды

  // Хранение таймера для очистки
  private messageTimer: ReturnType<typeof setTimeout> | null = null;

  // Конфигурация документации
  readonly documentationConfig = DOCUMENTATION;

  // Конфигурация showcase с новой 3-блочной структурой
  readonly showcaseConfig: ShowcaseConfig = {
    headerConfig: {
      title: 'Color Picker Management System 🎨',
      componentName: 'ColorComponentAuroraComponent',
      componentPath:
        'src/app/pages/ui-demo/color-component-aurora/color-component-aurora.component.ts',
      controlComponent: {
        name: 'PickerComponent',
        path: 'src/app/shared/components/ui/picker/picker.component.ts',
      },
      docsPath: 'src/app/pages/ui-demo/color-component-aurora/color-component-aurora.config.ts',
      description:
        'Универсальное решение для выбора цветов в Aurora Design System. Поддерживает работу с кастомными палитрами, системными диалогами и комбинированные режимы. Включает поддержку HEX форматов, прозрачности и адаптивной стилизации.',
      note: '💡 Полная документация по интеграции и использованию PickerComponent находится в разделе "Документация"',
    },
    showExamples: true,
    showDocs: true,
    columnSplit: [14, 10],
    resultBlocks: {
      preview: {
        title: '🎯 Живой Color Picker',
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

  // Основное состояние компонента (упрощенное - как в color-picker-demo)
  selectedColor = signal<string>('#1890ff');
  selectedMode = signal<PickerMode>('custom-and-picker');

  // Кастомные цвета для демонстрации (5 базовых цветов)
  customColors = signal<CustomColor[]>([
    { name: 'Primary', value: '#1890ff', category: 'primary' },
    { name: 'Success', value: '#52c41a', category: 'primary' },
    { name: 'Warning', value: '#faad14', category: 'primary' },
    { name: 'Error', value: '#ff4d4f', category: 'primary' },
    { name: 'Purple', value: '#722ed1', category: 'secondary' },
  ]);

  // Доступные режимы работы (точная копия из color-picker-demo)
  readonly modes: { value: PickerMode; label: string }[] = [
    { value: 'custom-only', label: 'Только кастомные цвета' },
    { value: 'picker-only', label: 'Только color picker' },
    { value: 'custom-and-picker', label: 'Комбинация (кастом + picker)' },
  ];

  // Computed свойства

  // Автоматическая генерация кода на основе текущих настроек
  generatedCode = computed(() => {
    const mode = this.selectedMode();
    const color = this.selectedColor();

    const tsCode = `// TypeScript
selectedColor = signal<string>('${color}');

// Custom colors для демонстрации
customColors: CustomColor[] = [
  { name: 'Primary', value: '#1890ff', category: 'primary' },
  { name: 'Success', value: '#52c41a', category: 'primary' },
  { name: 'Warning', value: '#faad14', category: 'primary' },
  { name: 'Error', value: '#ff4d4f', category: 'primary' },
  { name: 'Purple', value: '#722ed1', category: 'secondary' },
];`;

    const htmlCode = `<!-- HTML Template -->
<av-picker
  mode="${mode}"
  [(selectedColor)]="selectedColor"
  [customColors]="customColors"
  [allowTransparent]="false"
  [showInput]="true"
  [showWrapper]="false"
  [showBorder]="true">
</av-picker>`;

    return {
      typescript: tsCode,
      html: htmlCode,
    };
  });

  // Code for showcase input (formatted string)
  codeForShowcase = computed(() => {
    const code = this.generatedCode();
    return `${code.html}\n\n${code.typescript}`;
  });

  // Методы управления

  // Обработка изменения цвета (как в color-picker-demo)
  onColorChange(color: string): void {
    this.selectedColor.set(color);
    this.showSuccessMessage(`Цвет изменен на: ${color}`);
  }

  // Обработка изменения режима
  onModeChange(mode: PickerMode): void {
    this.selectedMode.set(mode);
  }

  // Сброс к настройкам по умолчанию
  resetToDefaults(): void {
    this.selectedColor.set('#1890ff');
    this.selectedMode.set('custom-and-picker');
    this.showSuccessMessage('Настройки сброшены к значениям по умолчанию');
  }

  // Копирование кода в буфер обмена
  copyCode(): void {
    const code = this.generatedCode();
    const textToCopy = `HTML:\n${code.html}\n\nTypeScript:\n${code.typescript}`;

    navigator.clipboard.writeText(textToCopy).then(
      () => {
        this.showSuccessMessage('Код скопирован в буфер обмена!');
      },
      (err) => {
        console.error('Ошибка копирования: ', err);
        this.showErrorMessage('Не удалось скопировать код');
      },
    );
  }

  // Применение пресета Aurora Theme
  applyAuroraTheme(): void {
    this.selectedColor.set('#1890ff');
    this.selectedMode.set('custom-and-picker');
    this.showSuccessMessage('Применена тема Aurora');
  }

  // Применение пресета Dark Theme
  applyDarkTheme(): void {
    this.selectedColor.set('#722ed1');
    this.selectedMode.set('custom-and-picker');
    this.showSuccessMessage('Применена темная тема');
  }

  // Генерация случайного цвета
  generateRandomColor(): void {
    const randomColor =
      '#' +
      Math.floor(Math.random() * 16777215)
        .toString(16)
        .padStart(6, '0');
    this.selectedColor.set(randomColor);
    this.showSuccessMessage(`Генерирован случайный цвет: ${randomColor}`);
  }

  // Утилиты для сообщений
  private showSuccessMessage(message: string): void {
    console.log('✅ Success:', message);
    this.clearMessageTimer();
    // Здесь можно добавить показ toast уведомления
  }

  private showErrorMessage(message: string): void {
    console.error('❌ Error:', message);
    this.clearMessageTimer();
    // Здесь можно добавить показ toast уведомления с ошибкой
  }

  private clearMessageTimer(): void {
    if (this.messageTimer) {
      clearTimeout(this.messageTimer);
      this.messageTimer = null;
    }
  }

  // Очистка ресурсов при уничтожении компонента
  ngOnDestroy(): void {
    this.clearMessageTimer();
  }
}
