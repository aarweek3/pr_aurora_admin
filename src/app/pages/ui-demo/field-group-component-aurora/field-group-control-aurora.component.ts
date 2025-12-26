import { CommonModule } from '@angular/common';
import { Component, computed, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { DOCUMENTATION } from './field-group-control-aurora.config';

import { ButtonDirective } from '@shared/components/ui/button/button.directive';
import { ControlDocumentationComponent } from '@shared/components/ui/control-documentation';
import { FieldGroupComponent } from '@shared/components/ui/field-group';
import {
  ShowcaseComponent,
  ShowcaseConfig,
} from '@shared/components/ui/showcase/showcase.component';

// Interface для конфигурации компонента
interface FieldGroupConfig {
  label: string;
  variant: 'block' | 'default' | 'minimal' | 'filled' | 'highlighted';
  size: 'small' | 'medium' | 'large';
  shape: 'square' | 'default' | 'rounded' | 'rounded-big';
  customRadius: string | number | null;
  collapsible: boolean;
  isCollapsed: boolean;
  showBackground: boolean;
  hoverBackground: 'none' | 'intensify';
  // Цвета
  labelColor: string;
  labelColorHover: string;
  arrowColor: string;
  arrowColorHover: string;
  borderColor: string;
  borderColorHover: string;
  headerBgColor: string;
  headerBgColorHover: string;
}

@Component({
  selector: 'app-field-group-control-aurora',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ShowcaseComponent,
    ControlDocumentationComponent,
    FieldGroupComponent,
    ButtonDirective,
    NzCardModule,
    NzGridModule,
    NzTabsModule,
    NzSelectModule,
    NzSwitchModule,
    NzCheckboxModule,
    NzInputModule,
  ],
  templateUrl: './field-group-control-aurora.component.html',
  styleUrl: './field-group-control-aurora.component.scss',
})
export class FieldGroupControlAuroraComponent implements OnInit {
  // 1. Documentation Configuration (from .config.ts)
  readonly documentationConfig = DOCUMENTATION;

  ngOnInit() {
    console.log('FieldGroupControlAuroraComponent Init');
    console.log('Documentation Config:', this.documentationConfig);
    console.log('Usage Examples:', this.documentationConfig?.usageExamples);
  }

  // 2. Showcase Configuration
  readonly showcaseConfig: ShowcaseConfig = {
    headerConfig: {
      title: 'Field Group Control Aurora 📋',
      componentName: 'FieldGroupControlAuroraComponent',
      componentPath:
        'src/app/pages/ui-demo/field-group-component-aurora/field-group-control-aurora.component.ts',
      controlComponent: {
        name: 'FieldGroupComponent (av-field-group)',
        path: 'src/app/shared/components/ui/field-group/field-group.component.ts',
      },
      docsPath:
        'src/app/pages/ui-demo/field-group-component-aurora/field-group-control-aurora.config.ts',
      description:
        'Универсальный компонент для группировки элементов управления в формах с расширенными возможностями кастомизации и сворачивания.',
    },
    showExamples: true,
    showDocs: true,
    columnSplit: [14, 10],
    resultBlocks: {
      preview: { title: '🔴 Live Demo' },
      code: { title: '📄 Генерированный код' },
      description: { title: '📋 Текущие настройки', autoParams: true },
    },
  };

  // 3. State Management (Signals)
  config = signal<FieldGroupConfig>({
    label: 'Демо группа полей',
    variant: 'block',
    size: 'medium',
    shape: 'default',
    customRadius: null,
    collapsible: true,
    isCollapsed: false,
    showBackground: false,
    hoverBackground: 'intensify',
    // Цвета по умолчанию
    labelColor: '#8c8c8c',
    labelColorHover: '#1890ff',
    arrowColor: '#8c8c8c',
    arrowColorHover: '#1890ff',
    borderColor: '#dcdee0',
    borderColorHover: '#1890ff',
    headerBgColor: '#ffffff',
    headerBgColorHover: '#ffffff',
  });

  // 4. Helper для обновления конфигурации
  updateConfig(key: keyof FieldGroupConfig, value: any) {
    this.config.update((c) => ({ ...c, [key]: value }));
  }

  // 5. Генерация кода
  generatedCode = computed(() => {
    const c = this.config();
    let attrs = '';

    if (c.label) attrs += ` label="${c.label}"`;
    if (c.variant !== 'block') attrs += ` variant="${c.variant}"`;
    if (c.size !== 'medium') attrs += ` size="${c.size}"`;
    if (c.shape !== 'default') attrs += ` shape="${c.shape}"`;
    if (c.customRadius !== null && c.customRadius !== '') {
      attrs += ` [radius]="${
        typeof c.customRadius === 'number' ? c.customRadius : "'" + c.customRadius + "'"
      }"`;
    }
    if (c.collapsible) attrs += ` [collapsible]="true"`;
    if (c.isCollapsed) attrs += ` [(isCollapsed)]="isCollapsed"`;
    if (c.showBackground) attrs += ` [showBackground]="true"`;
    if (c.hoverBackground !== 'intensify') attrs += ` hoverBackground="${c.hoverBackground}"`;

    // Цвета (только если отличаются от дефолтных)
    if (c.labelColor !== '#8c8c8c') attrs += `\n  [labelColor]="'${c.labelColor}'"`;
    if (c.labelColorHover !== '#1890ff') attrs += `\n  [labelColorHover]="'${c.labelColorHover}'"`;
    if (c.arrowColor !== '#8c8c8c') attrs += `\n  [arrowColor]="'${c.arrowColor}'"`;
    if (c.arrowColorHover !== '#1890ff') attrs += `\n  [arrowColorHover]="'${c.arrowColorHover}'"`;
    if (c.borderColor !== '#dcdee0') attrs += `\n  [borderColor]="'${c.borderColor}'"`;
    if (c.borderColorHover !== '#1890ff')
      attrs += `\n  [borderColorHover]="'${c.borderColorHover}'"`;
    if (c.headerBgColor !== '#ffffff') attrs += `\n  [headerBgColor]="'${c.headerBgColor}'"`;
    if (c.headerBgColorHover !== '#ffffff')
      attrs += `\n  [headerBgColorHover]="'${c.headerBgColorHover}'"`;

    return `<av-field-group${attrs}>
  <input av-input placeholder="Введите текст..." />
  <input av-input placeholder="Еще одно поле..." />
</av-field-group>`;
  });

  // 6. Константы для селектов
  readonly variants = [
    { value: 'block', label: 'Block (растягиваемый блок)' },
    { value: 'default', label: 'Default (обычная рамка)' },
    { value: 'minimal', label: 'Minimal (пунктир)' },
    { value: 'filled', label: 'Filled (заливка без рамки)' },
    { value: 'highlighted', label: 'Highlighted (выделенная)' },
  ];

  readonly sizes = [
    { value: 'small', label: 'Small' },
    { value: 'medium', label: 'Medium' },
    { value: 'large', label: 'Large' },
  ];

  readonly shapes = [
    { value: 'square', label: 'Прямоугольные (0px)' },
    { value: 'default', label: 'Обычные (4px)' },
    { value: 'rounded', label: 'Скругленные (8px)' },
    { value: 'rounded-big', label: 'Сильно скругленные (16px)' },
  ];

  readonly hoverBackgroundOptions = [
    { value: 'none', label: 'None (без эффекта)' },
    { value: 'intensify', label: 'Intensify (усилить)' },
  ];

  // 7. Сигналы для примеров использования
  exampleCollapsed = signal(false);
  exampleFormData = signal({
    name: '',
    email: '',
    notifications: true,
    city: '',
    country: '',
  });

  // 8. Управление цветовыми пикерами
  activePicker = signal<string | null>(null);

  togglePicker(id: string) {
    if (this.activePicker() === id) {
      this.activePicker.set(null);
    } else {
      this.activePicker.set(id);
    }
  }

  // 9. Методы для обновления данных примеров
  updateExampleFormData(key: string, value: any) {
    this.exampleFormData.update((data) => ({ ...data, [key]: value }));
  }

  // 10. Сброс к значениям по умолчанию
  resetToDefaults() {
    this.config.set({
      label: 'Демо группа полей',
      variant: 'block',
      size: 'medium',
      shape: 'default',
      customRadius: null,
      collapsible: true,
      isCollapsed: false,
      showBackground: false,
      hoverBackground: 'intensify',
      labelColor: '#8c8c8c',
      labelColorHover: '#1890ff',
      arrowColor: '#8c8c8c',
      arrowColorHover: '#1890ff',
      borderColor: '#dcdee0',
      borderColorHover: '#1890ff',
      headerBgColor: '#ffffff',
      headerBgColorHover: '#ffffff',
    });
    this.activePicker.set(null);
  }
}
