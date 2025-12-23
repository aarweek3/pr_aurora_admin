import { CommonModule } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { ButtonDirective } from '../../../shared/components/ui/button/button.directive';
import { HelpCopyContainerComponent } from '../../../shared/components/ui/container-help-copy-ui/container-help-copy-ui.component';
import { FieldGroupComponent } from '../../../shared/components/ui/field-group/field-group.component';
import { IconComponent } from '../../../shared/components/ui/icon/icon.component';
import { PickerComponent } from '../../../shared/components/ui/picker/picker.component';
import {
  type CustomColor,
  type PickerMode,
} from '../../../shared/components/ui/picker/picker.types';
import { ContainerUiHelpBaseComponent } from '../../../shared/containers/ui-help/container-ui-help-base/container-ui-help-base.component';

@Component({
  selector: 'av-color-picker-demo',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzCardModule,
    NzGridModule,
    NzRadioModule,
    ButtonDirective,
    IconComponent,
    HelpCopyContainerComponent,
    FieldGroupComponent,
    PickerComponent,
    ContainerUiHelpBaseComponent,
  ],
  templateUrl: './color-picker-demo.component.html',
  styleUrl: './color-picker-demo.component.scss',
})
export class ColorPickerDemoComponent {
  // Section visibility signals (matching the base template)
  isSection1Visible = signal(true);
  isSection2Visible = signal(true);
  isSection3Visible = signal(true);
  isSection4Visible = signal(true);
  isSection5Visible = signal(true);

  // State
  selectedColor = signal<string>('#1890ff');
  selectedMode = signal<PickerMode>('custom-and-picker');

  // Custom colors for demo
  customColors = signal<CustomColor[]>([
    { name: 'Primary', value: '#1890ff', category: 'primary' },
    { name: 'Success', value: '#52c41a', category: 'primary' },
    { name: 'Warning', value: '#faad14', category: 'primary' },
    { name: 'Danger', value: '#ff4d4f', category: 'primary' },
    { name: 'Purple', value: '#722ed1', category: 'secondary' },
    { name: 'Cyan', value: '#13c2c2', category: 'secondary' },
    { name: 'Magenta', value: '#eb2f96', category: 'secondary' },
    { name: 'Red', value: '#f5222d', category: 'secondary' },
    { name: 'Orange', value: '#fa541c', category: 'secondary' },
    { name: 'Lime', value: '#a0d911', category: 'secondary' },
    { name: 'Blue', value: '#1677ff', category: 'secondary' },
    { name: 'Violet', value: '#722ed1', category: 'secondary' },
  ]);

  // Available modes
  modes: { value: PickerMode; label: string }[] = [
    { value: 'custom-only', label: 'Только кастомные цвета' },
    { value: 'picker-only', label: 'Только color picker' },
    { value: 'custom-and-picker', label: 'Комбинация (кастом + picker)' },
  ];

  // Computed: Generated code
  generatedCode = computed(() => {
    const mode = this.selectedMode();
    const color = this.selectedColor();

    const tsCode = `// TypeScript
selectedColor = signal<string>('${color}');

// Custom colors (опционально)
customColors: CustomColor[] = [
  { name: 'Primary', value: '#1890ff', category: 'primary' },
  { name: 'Success', value: '#52c41a', category: 'primary' },
  { name: 'Warning', value: '#faad14', category: 'primary' },
  // ... другие цвета
];`;

    const htmlCode = `<!-- HTML Template -->
<av-field-group label="Цвет ..." [collapsible]="true">
  <av-picker
    mode="${mode}"
    [(selectedColor)]="selectedColor"
    ${mode !== 'picker-only' ? '[customColors]="customColors"' : ''}
    [allowTransparent]="false"
    [showInput]="true"
  ></av-picker>
</av-field-group>`;

    return `${tsCode}\n\n${htmlCode}`;
  });

  // API Documentation
  readonly apiCode = `/**
 * @component av-picker
 * Универсальный компонент выбора цвета
 */
export interface AvPickerProps {
  /** Режим работы компонента */
  mode: 'custom-only' | 'picker-only' | 'custom-and-picker';

  /** Размер компонента */
  avSize: 'default' | 'compact';

  /** Массив кастомных цветов */
  customColors: CustomColor[];

  /** Разрешить прозрачный цвет */
  allowTransparent: boolean;

  /** Показывать поле ввода HEX */
  showInput: boolean;

  /** Выбранный цвет (two-way binding) */
  selectedColor: string;
}

export interface CustomColor {
  name: string;      // Название цвета
  value: string;     // HEX формат (#1890ff)
  category?: string; // Категория (опционально)
}`;

  readonly usageExamples = `// Пример 1: Только кастомные цвета
<av-picker
  mode="custom-only"
  [(selectedColor)]="myColor"
  [customColors]="brandColors"
></av-picker>

// Пример 2: Только системный picker
<av-picker
  mode="picker-only"
  [(selectedColor)]="myColor"
></av-picker>

// Пример 3: Комбинированный режим
<av-picker
  mode="custom-and-picker"
  [(selectedColor)]="myColor"
  [customColors]="myColors"
  [allowTransparent]="true"
  [showInput]="true"
></av-picker>`;

  // Section Toggles
  toggleSection1() {
    this.isSection1Visible.set(!this.isSection1Visible());
  }
  toggleSection2() {
    this.isSection2Visible.set(!this.isSection2Visible());
  }
  toggleSection3() {
    this.isSection3Visible.set(!this.isSection3Visible());
  }
  toggleSection4() {
    this.isSection4Visible.set(!this.isSection4Visible());
  }
  toggleSection5() {
    this.isSection5Visible.set(!this.isSection5Visible());
  }

  // Methods
}
