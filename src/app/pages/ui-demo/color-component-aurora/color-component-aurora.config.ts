import { ControlDocumentationConfig } from '@shared/components/ui/control-documentation';

export const COLOR_COMPONENT_DOCUMENTATION: ControlDocumentationConfig = {
  demoComponent: {
    name: 'ColorComponentAuroraComponent',
    path: 'src/app/pages/ui-demo/color-component-aurora/',
    description: 'Интерактивная оболочка для демонстрации всех возможностей PickerComponent',
    icon: 'general/av_page',
  },

  controlComponent: {
    name: 'PickerComponent (av-picker)',
    path: 'src/app/shared/components/ui/picker/picker.component.ts',
    description: 'Комплексный контрол для управления выбором цвета',
    icon: 'general/av_component',
  },

  mainDescription: {
    componentTitle: 'PickerComponent (av-picker)',
    shortDescription:
      'Универсальное решение для выбора цветов в Aurora Design System. Поддерживает работу с кастомными палитрами, системными диалогами и комбинированные режимы.',
    detailedDescription:
      'Комплексный контрол для управления выбором цвета. Поддерживает работу с палитрами, системными диалогами, а также предоставляет удобный интерфейс для работы с прозрачностью и форматом HEX. Автоматически адаптируется под темную тему.',
    keyFeatures: [
      '🎨 Три режима работы: Custom, Picker, Combined',
      '🌈 Поддержка кастомных палитр и категорий',
      '👁️ Управление прозрачностью (Alpha канал)',
      '📱 Адаптивный дизайн и поддержка темной темы',
      '⌨️ Встроенное поле ввода HEX',
      '🔌 Легкая интеграция с Angular Forms',
    ],
  },

  apiDetails: {
    inputs: [
      {
        name: 'mode',
        type: "'custom-only' | 'picker-only' | 'custom-and-picker'",
        defaultValue: "'custom-and-picker'",
        description: 'Режим работы компонента',
      },
      {
        name: 'selectedColor',
        type: 'string',
        defaultValue: '',
        description: 'Выбранный цвет (двустороннее связывание)',
      },
      {
        name: 'customColors',
        type: 'CustomColor[]',
        defaultValue: '[]',
        description: 'Массив кастомных цветов для палитры',
      },
      {
        name: 'allowTransparent',
        type: 'boolean',
        defaultValue: 'false',
        description: 'Разрешить выбор прозрачного цвета',
      },
      {
        name: 'showInput',
        type: 'boolean',
        defaultValue: 'true',
        description: 'Показать поле ввода HEX значения',
      },
      {
        name: 'avSize',
        type: "'default' | 'compact'",
        defaultValue: "'default'",
        description: 'Размер компонента',
      },
      {
        name: 'showAlpha',
        type: 'boolean',
        defaultValue: 'false',
        description: 'Включить поддержку альфа-канала (прозрачности)',
      },
    ],
    outputs: [
      {
        name: 'colorChange',
        type: 'string',
        description: 'Событие изменения цвета',
      },
    ],
    methods: [],
  },

  usageExamples: [
    {
      title: 'Базовое использование',
      description: 'Самый простой способ интеграции',
      htmlCode: `<av-picker [(selectedColor)]="myColor"></av-picker>`,
      tsCode: `selectedColor = signal<string>('#1890ff');`,
    },
    {
      title: 'С кастомной палитрой',
      description: 'Использование собственного набора цветов',
      htmlCode: `<av-picker
  mode="custom-only"
  [(selectedColor)]="brandColor"
  [customColors]="brandColors">
</av-picker>`,
      tsCode: `brandColors = [
  { name: 'Brand', value: '#1890ff', category: 'primary' },
  { name: 'Success', value: '#52c41a', category: 'status' }
];`,
    },
    {
      title: 'В Reactive Forms',
      description: 'Интеграция с формами Angular',
      htmlCode: `<form [formGroup]="myForm">
  <av-picker formControlName="themeColor"></av-picker>
</form>`,
      tsCode: `myForm = new FormGroup({
  themeColor: new FormControl('#1890ff')
});`,
    },
    {
      title: 'Полная конфигурация',
      description: 'Пример использования со всеми доступными настройками (без обертки)',
      htmlCode: `<av-picker
  mode="custom-and-picker"
  [(selectedColor)]="selectedColor"
  [customColors]="customColors"
  [allowTransparent]="false"
  [showInput]="true"
  [showWrapper]="false"
  [showBorder]="true">
</av-picker>`,
      tsCode: `selectedColor = signal<string>('#1890ff');

customColors: CustomColor[] = [
  { name: 'Primary', value: '#1890ff', category: 'brand' },
  { name: 'Success', value: '#52c41a', category: 'status' }
];`,
    },
  ],

  codeExamples: [
    {
      title: 'Полный пример компонента',
      description: 'Пример компонента с полной конфигурацией',
      htmlCode: `<div class="color-picker-demo">
  <av-picker
    [mode]="selectedMode()"
    [(selectedColor)]="selectedColor"
    [customColors]="customColors()"
    [allowTransparent]="false"
    [showInput]="true"
    (colorChange)="onColorChange($event)">
  </av-picker>
</div>`,
      tsCode: `import { Component, signal } from '@angular/core';
import { PickerComponent } from '@shared/components/ui/picker/picker.component';
import { CustomColor, PickerMode } from '@shared/components/ui/picker/picker.types';

@Component({
  selector: 'app-color-example',
  standalone: true,
  imports: [PickerComponent],
  templateUrl: './color-example.component.html'
})
export class ColorExampleComponent {
  selectedColor = signal<string>('#1890ff');
  selectedMode = signal<PickerMode>('custom-and-picker');

  customColors = signal<CustomColor[]>([
    { name: 'Primary', value: '#1890ff', category: 'primary' },
    { name: 'Success', value: '#52c41a', category: 'primary' }
  ]);

  onColorChange(color: string) {
    console.log('Color changed:', color);
  }
}`,
    },
  ],

  interactiveExample: {
    title: 'Интерактивный пример',
    description: 'Код генерируется автоматически на основе настроек в Playground',
  },

  architectureNotes: [
    {
      type: 'info',
      title: 'PickerMode',
      content:
        "Компонент поддерживает 3 режима: 'custom-only' (только палитра), 'picker-only' (только нативный пикер) и 'custom-and-picker' (оба варианта).",
    },
    {
      type: 'tip',
      title: 'Производительность',
      content:
        'Компонент оптимизирован для работы с `OnPush` стратегией и использует Angular Signals для реактивности.',
    },
  ],
};
