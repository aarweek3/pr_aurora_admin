import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, computed, effect, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HelpCopyContainerComponent } from '@shared/components/ui/container-help-copy-ui/container-help-copy-ui.component';
import {
  AvIconConfig,
  IconComponent,
  IconSettingsControlComponent,
} from '@shared/components/ui/icon';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzColorPickerModule } from 'ng-zorro-antd/color-picker';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSliderModule } from 'ng-zorro-antd/slider';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { ICON_REGISTRY } from '../icon-ui/icon-registry';

@Component({
  selector: 'av-icon-control',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzCardModule,
    NzGridModule,
    NzSelectModule,
    NzInputModule,
    NzInputNumberModule,
    NzSwitchModule,
    NzSliderModule,
    NzColorPickerModule,
    NzToolTipModule,
    IconComponent,
    HelpCopyContainerComponent,
    IconSettingsControlComponent,
    NzTabsModule,
  ],
  templateUrl: './icon-control.component.html',
  styleUrl: './icon-control.component.scss',
})
export class IconControlComponent {
  constructor(private http: HttpClient) {
    // Effect to fetch raw SVG source
    effect(() => {
      const iconPath = this.pgConfig().type;
      if (iconPath) {
        this.fetchRawSource(iconPath);
      }
    });
  }

  // State for playground visibility
  isPlaygroundVisible = signal(true);
  isSectionLibraryVisible = signal(true);

  // Search & Toast
  searchQuery = signal('');
  toastMessage = signal('');

  // Icon State Signal (Unified)
  pgConfig = signal<AvIconConfig>({
    type: 'actions/av_check_mark',
    size: 24,
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

  pgRawSource = signal<string>('');

  // UI State
  message = signal<string>('');

  // Icon Registry & Filtering
  readonly categories = signal([...ICON_REGISTRY]);

  readonly iconPresets = computed(() => {
    return ICON_REGISTRY.flatMap((cat) =>
      cat.icons.map((icon) => ({
        label: icon.name,
        value: icon.type,
        category: cat.category,
      })),
    );
  });

  filteredCategories = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) return this.categories();

    return this.categories()
      .map((cat) => ({
        ...cat,
        icons: cat.icons.filter(
          (icon) =>
            icon.name.toLowerCase().includes(query) || cat.category.toLowerCase().includes(query),
        ),
      }))
      .filter((cat) => cat.icons.length > 0);
  });

  readonly colorPresets = [
    '#1890ff',
    '#52c41a',
    '#faad14',
    '#ff4d4f',
    '#722ed1',
    '#13c2c2',
    '#eb2f96',
    '#f5222d',
    '#fa541c',
    '#a0d911',
    '#1677ff',
    '#722ed1',
  ];

  readonly sizePresets = [
    { value: 12, label: 'Extra Small (12px)' },
    { value: 16, label: 'Small (16px)' },
    { value: 20, label: 'Medium Small (20px)' },
    { value: 24, label: 'Medium (24px)' },
    { value: 32, label: 'Large (32px)' },
    { value: 48, label: 'Extra Large (48px)' },
    { value: 64, label: 'Huge (64px)' },
  ];

  // Computed style for the icon
  iconStyle = computed(() => {
    const config = this.pgConfig();
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

  // Generated code for copying
  pgGeneratedCode = computed(() => {
    const config = this.pgConfig();
    const transformParts = [];
    if (config.rotation !== 0) transformParts.push(`rotate(${config.rotation}deg)`);
    if (config.scale !== 1) transformParts.push(`scale(${config.scale})`);
    if (config.flipX) transformParts.push('scaleX(-1)');
    if (config.flipY) transformParts.push('scaleY(-1)');
    const transform = transformParts.length > 0 ? transformParts.join(' ') : '';

    // TypeScript config
    const tsLines = [
      `  type: '${config.type}',`,
      `  size: ${config.size},`,
      `  color: '${config.color}',`,
    ];
    if (config.opacity !== 1) tsLines.push(`  opacity: ${config.opacity},`);
    if (transform) tsLines.push(`  transform: '${transform}',`);
    if (config.padding !== 8) tsLines.push(`  padding: '${config.padding}px',`);
    if (config.background !== 'transparent')
      tsLines.push(`  backgroundColor: '${config.background}',`);
    if (config.borderShow)
      tsLines.push(`  border: '${config.borderWidth}px solid ${config.borderColor}',`);
    if (config.borderRadius !== 4) tsLines.push(`  borderRadius: '${config.borderRadius}px',`);

    const tsCode = `// TypeScript\niconConfig = {\n${tsLines.join('\n')}\n};`;

    // HTML Template
    const htmlLines = [
      `<av-icon`,
      `  type="${config.type}"`,
      `  [size]="${config.size}"`,
      `  color="${config.color}"`,
    ];
    if (config.opacity !== 1) htmlLines.push(`  [style.opacity]="${config.opacity}"`);
    if (transform) htmlLines.push(`  [style.transform]="'${transform}'"`);
    if (config.padding !== 8) htmlLines.push(`  [style.padding]="'${config.padding}px'"`);
    if (config.background !== 'transparent')
      htmlLines.push(`  [style.background-color]="'${config.background}'"`);
    if (config.borderShow)
      htmlLines.push(`  [style.border]="'${config.borderWidth}px solid ${config.borderColor}'"`);
    if (config.borderRadius !== 4)
      htmlLines.push(`  [style.border-radius]="'${config.borderRadius}px'"`);
    htmlLines.push(`></av-icon>`);

    const htmlCode = `// HTML Template\n${htmlLines.join('\n')}`;

    // SCSS Styles
    const scssIconLines = [`    font-size: ${config.size}px;`, `    color: ${config.color};`];
    if (config.opacity !== 1) scssIconLines.push(`    opacity: ${config.opacity};`);
    if (transform) scssIconLines.push(`    transform: ${transform};`);
    if (config.padding !== 8) scssIconLines.push(`    padding: ${config.padding}px;`);
    if (config.background !== 'transparent')
      scssIconLines.push(`    background-color: ${config.background};`);
    if (config.borderShow)
      scssIconLines.push(`    border: ${config.borderWidth}px solid ${config.borderColor};`);
    if (config.borderRadius !== 4)
      scssIconLines.push(`    border-radius: ${config.borderRadius}px;`);
    scssIconLines.push(`    transition: all 0.3s ease;`);

    const scssCode = `// SCSS Styles\n.icon-container {\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n\n  av-icon {\n${scssIconLines.join(
      '\n',
    )}\n  }\n}`;

    return `${tsCode}\n\n${htmlCode}\n\n${scssCode}`;
  });

  apiInterfaceCode = `/**
 * @component av-icon
 * Высокопроизводительный компонент для отображения SVG-иконок.
 */
export interface AvIconProps {
  /** Тип иконки или полный путь к SVG файлу */
  readonly type: string; // required

  /** Размер в пикселях (W=H). default: 24 */
  readonly size: number;

  /** Цвет иконки. default: inherit (currentColor) */
  readonly color: string | null;

  /** Угол поворота (deg). default: 0 */
  readonly rotation: number;

  /** Масштаб (множитель). default: 1 */
  readonly scale: number;

  /** Прозрачность (0-1). default: 1 */
  readonly opacity: number;

  /** Отражение по осям X/Y. default: false */
  readonly flipX: boolean;
  readonly flipY: boolean;

  /** Стилизация контейнера */
  readonly padding: number | string; // default: 0
  readonly background: string;       // default: 'transparent'
  readonly border: string | null;    // default: null
  readonly radius: number | string;  // default: 0
}`;

  readonly howToConnectCode = `// 1. Базовое использование
<av-icon type="actions/av_check_mark"></av-icon>

// 2. С трансформациями и стилизацией
<av-icon
  type="system/av_settings"
  [size]="32"
  color="#1890ff"
  [rotation]="45"
  [scale]="1.5"
  [padding]="8"
  background="#f0f2f5"
  border="1px solid #d9d9d9"
  [radius]="4"
></av-icon>`;

  readonly helpContainerDocsCode = `/**
 * @component av-help-copy-container
 * Контейнер для демонстрации кода с поддержкой копирования и справки.
 */
export interface AvHelpCopyProps {
  /** Заголовок блока */
  title: string; // default: 'Код использования'

  /** Текст/код для отображения и копирования */
  content: string;

  /** Геометрия */
  width: string;  // default: '100%'
  height: string; // default: 'auto'

  /** Стилизация (HEX, slate-800 и т.д.) */
  bgColor: string | null;

  /** Управление кнопками */
  showCopy: boolean;       // default: true
  showHelpButton: boolean; // default: false

  /** Кастомная справка */
  helpContent: string | null;
  disableInternalHelp: boolean; // default: false
}`;

  resetAllSettings(): void {
    this.pgConfig.set({
      type: 'actions/av_check_mark',
      size: 24,
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
    this.showMessage('Настройки сброшены! 🔄');
  }

  showMessage(msg: string): void {
    this.message.set(msg);
    setTimeout(() => this.message.set(''), 3000);
  }

  selectIconPreset(preset: { category: string; value: string; label: string }): void {
    this.pgConfig.update((c) => ({ ...c, type: preset.value }));
    this.showMessage(`Выбрана иконка: ${preset.label} (${preset.category})`);
  }

  selectColorPreset(color: string): void {
    this.pgConfig.update((c) => ({ ...c, color }));
    this.showMessage(`Цвет изменён на: ${color}`);
  }

  selectSizePreset(size: number): void {
    this.pgConfig.update((c) => ({ ...c, size }));
    this.showMessage(`Размер изменён на: ${size}px`);
  }

  copyToClipboard(text: string, msg: string): void {
    navigator.clipboard.writeText(text);
    this.showToast(msg);
    // Также можно автоматически выбрать эту иконку в плейграунд если нужно
    // this.pgConfig.update(c => ({ ...c, type: text }));
  }

  private showToast(message: string): void {
    this.toastMessage.set(message);
    setTimeout(() => this.toastMessage.set(''), 3000);
  }

  private fetchRawSource(iconPath: string): void {
    const url = `assets/icons/${iconPath}.svg`;
    this.http.get(url, { responseType: 'text' }).subscribe({
      next: (source) => this.pgRawSource.set(source),
      error: () => this.pgRawSource.set('Не удалось загрузить исходный код иконки'),
    });
  }
}
