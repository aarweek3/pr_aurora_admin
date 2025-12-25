// src/app/pages/ui-demo/button-ui/button-ui.component.ts
import { CommonModule } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzColorPickerModule } from 'ng-zorro-antd/color-picker';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSliderModule } from 'ng-zorro-antd/slider';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import {
  ButtonDirective,
  ButtonSize,
} from '../../../../shared/components/ui/button/button.directive';
import { HelpCopyContainerComponent } from '../../../../shared/components/ui/container-help-copy-ui/container-help-copy-ui.component';
import { IconComponent } from '../../../../shared/components/ui/icon/icon.component';

@Component({
  selector: 'app-button-ui',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonDirective,
    IconComponent,
    HelpCopyContainerComponent,
    NzGridModule,
    NzSelectModule,
    NzSwitchModule,
    NzSpaceModule,
    NzInputModule,
    NzCardModule,
    NzColorPickerModule,
    NzToolTipModule,
    NzSliderModule,
    NzInputNumberModule,
  ],
  templateUrl: './button-ui.component.html',
  styleUrls: ['./button-ui.component.scss'],
})
export class ButtonUiComponent {
  // Playground state
  pgType = signal<'primary' | 'default' | 'dashed' | 'text' | 'link' | 'danger'>('primary');
  pgSize = signal<'small' | 'default' | 'large' | 'square' | 'custom'>('default');
  pgLoading = signal(false);
  pgBlock = signal(false);
  pgVisible = signal(true);
  pgIconOnly = signal(false);
  pgShape = signal<'default' | 'circle' | 'square' | 'round' | 'rounded' | 'rounded-big'>(
    'default',
  );
  pgWidth = signal<string | number | null>(null);
  pgHeight = signal<string | number | null>(null);
  pgRadius = signal<string | number | null>(null);
  pgIconSize = signal<number>(16);
  pgColor = signal<string | null>(null);
  pgIconColor = signal<string | null>(null);
  pgTextColor = signal<string | null>(null);
  pgSystemSoft = signal(false);
  refreshTrigger = signal(true);

  safePgSize = computed<ButtonSize>(() => {
    const size = this.pgSize();
    return size === 'custom' ? 'default' : size;
  });

  readonly colorPresets = [
    '#1890ff',
    '#6366f1',
    '#06b6d4',
    '#f43f5e',
    '#f59e0b',
    '#10b981',
    '#64748b',
  ];
  pgLabel = signal('Interactive Button');
  pgIcon = signal<string | undefined>(undefined);

  pgGeneratedCode = computed(() => {
    const isIconOnly = !!this.pgIcon() && !this.pgLabel();
    const hasManualGeometry = !!this.pgWidth() || !!this.pgHeight();

    let tpl = `<button\n  av-button\n  avType="${this.pgType()}"`;

    // Если заданы ручные размеры, avSize становится избыточным для геометрии
    if (this.pgSize() !== 'default' && this.pgSize() !== 'custom') {
      tpl += `\n  avSize="${this.pgSize()}"`;
    }
    if (this.pgColor()) tpl += `\n  avColor="${this.pgColor()}"`;
    if (this.pgLoading()) tpl += `\n  [avLoading]="true"`;
    if (this.pgBlock()) tpl += `\n  [avBlock]="true"`;
    if (!this.pgVisible()) tpl += `\n  [avVisible]="false"`;
    if (isIconOnly) tpl += `\n  [avIconOnly]="true"`;
    if (this.pgShape() !== 'default') tpl += `\n  avShape="${this.pgShape()}"`;
    if (this.pgWidth()) tpl += `\n  avWidth="${this.pgWidth()}"`;
    if (this.pgHeight()) tpl += `\n  avHeight="${this.pgHeight()}"`;
    if (this.pgRadius()) tpl += `\n  avRadius="${this.pgRadius()}"`;
    if (this.pgIconSize() !== 16) tpl += `\n  avIconSize="${this.pgIconSize()}"`;
    if (this.pgIconColor()) tpl += `\n  avIconColor="${this.pgIconColor()}"`;
    if (this.pgTextColor()) tpl += `\n  avTextColor="${this.pgTextColor()}"`;
    tpl += `\n  (clicked)="handleClick()"\n>`;

    if (this.pgIcon()) {
      tpl += `\n  <av-icon type="${this.pgIcon()}" [size]="${this.getIconSize()}"></av-icon>`;
      if (!isIconOnly) {
        tpl += `\n  <span style="margin-left: 8px;">${this.pgLabel()}</span>`;
      }
    } else {
      tpl += `\n  ${this.pgLabel()}`;
    }

    tpl += `\n</button>`;

    if (this.pgSystemSoft()) {
      return `<!-- Обертка с мягким стилем -->\n<div class="av-style-soft">\n  ${tpl
        .split('\n')
        .join('\n  ')}\n</div>`;
    }

    return tpl;
  });

  public getIconSize(): number {
    return this.pgIconSize();
  }

  apiInterfaceCode = `/**
 * @directive av-button
 * Накладывается на нативные элементы <button> или <a>
 */
export interface AvButtonProps {
  /** Тип оформления кнопки */
  avType: 'primary' | 'default' | 'dashed' | 'text' | 'link' | 'danger'; // default: 'default'

  /** Размер кнопки */
  avSize: 'small' | 'default' | 'large' | 'square'; // default: 'default'

  /** Состояние загрузки (блокирует клики, показывает спиннер) */
  avLoading: boolean; // default: false

  /** Растягивание на всю ширину контейнера */
  avBlock: boolean; // default: false

  /** Видимость компонента (плавное появление/скрытие) */
  avVisible: boolean; // default: true

  /** Квадратная кнопка для иконок */
  avIconOnly: boolean; // default: false

  /** Форма кнопки */
  avShape: 'default' | 'circle' | 'square' | 'round' | 'rounded' | 'rounded-big'; // default: 'default'

  /** Произвольная ширина (px, %, и т.д.) */
  avWidth: string | number | null; // default: null

  /** Произвольная высота (px, %, и т.д.) */
  avHeight: string | number | null; // default: null

  /** Произвольный радиус скругления (px, %, и т.д.) */
  avRadius: string | number | null; // default: null

  /** Размер вложенной иконки (px) */
  avIconSize: string | number | null; // default: null

  /** Кастомный цвет (HEX, RGB, CSS name) - перекрывает стандартный тип */
  avColor: string | null; // default: null

  /** Кастомный цвет иконки */
  avIconColor: string | null; // default: null

  /** Кастомный цвет текста */
  avTextColor: string | null; // default: null

  /**
   * (clicked) - Событие клика (рекомендуется использовать вместо стандартного (click)
   * для корректной обработки состояния loading)
   */
  clicked: EventEmitter<MouseEvent>;
}`;

  // State
  isLoading = signal(false);
  message = signal('');
  showButtonSizesCode = signal(false);
  showCodePrimary = signal(false);
  showCodeDefault = signal(false);
  showCodeDashed = signal(false);
  showCodeText = signal(false);
  showCodeLink = signal(false);
  showCodeDanger = signal(false);
  showCodeSharp = signal(false);

  showMessage(msg: string): void {
    this.message.set(msg);
    setTimeout(() => this.message.set(''), 3000);
  }

  forceRefresh(): void {
    this.refreshTrigger.set(false);
    setTimeout(() => {
      this.refreshTrigger.set(true);
      this.showMessage('Настройки применены! ✨');
    }, 100);
  }

  onSizeChange(val: string | number | null): void {
    this.pgWidth.set(val);
    this.pgHeight.set(val);
  }

  resetGeometry(): void {
    this.pgWidth.set(null);
    this.pgHeight.set(null);
    this.pgRadius.set(null);
    this.showMessage('Геометрия сброшена');
  }

  resetAllSettings(): void {
    this.pgType.set('primary');
    this.pgSize.set('default');
    this.pgLabel.set('Interactive Button');
    this.pgIcon.set(undefined);
    this.pgColor.set(null);
    this.pgShape.set('default');
    this.pgWidth.set(null);
    this.pgHeight.set(null);
    this.pgRadius.set(null);
    this.pgIconSize.set(16);
    this.pgIconColor.set(null);
    this.pgTextColor.set(null);
    this.pgLoading.set(false);
    this.pgBlock.set(false);
    this.pgVisible.set(true);
    this.pgIconOnly.set(false);
    this.pgSystemSoft.set(false);
    this.forceRefresh();
    this.showMessage('Все настройки сброшены к дефолтным');
  }

  simulateLoading(): void {
    this.isLoading.set(true);
    setTimeout(() => {
      this.isLoading.set(false);
      this.showMessage('Loading completed!');
    }, 2000);
  }

  toggleCode(section: string): void {
    switch (section) {
      case 'sizes':
        this.showButtonSizesCode.update((v) => !v);
        break;
      case 'primary':
        this.showCodePrimary.update((v) => !v);
        break;
      case 'default':
        this.showCodeDefault.update((v) => !v);
        break;
      case 'dashed':
        this.showCodeDashed.update((v) => !v);
        break;
      case 'text':
        this.showCodeText.update((v) => !v);
        break;
      case 'link':
        this.showCodeLink.update((v) => !v);
        break;
      case 'danger':
        this.showCodeDanger.update((v) => !v);
        break;
      case 'sharp':
        this.showCodeSharp.update((v) => !v);
        break;
    }
  }

  readonly howToConnectCode = `// 1. Импорт в компонент
import { ButtonDirective } from '@shared/components/ui/button';
import { IconComponent } from '@shared/components/ui/icon'; // опционально

@Component({
  standalone: true,
  imports: [ButtonDirective, IconComponent],
  ...
})

// 2. Использование в шаблоне
<button
  av-button
  avType="primary"
  avSize="default"
  (clicked)="handleClick()"
>
  <av-icon type="download" [size]="16"></av-icon>
  <span style="margin-left: 8px;">Скачать</span>
</button>

// Квадратная кнопка (только иконка)
<button
  av-button
  avType="default"
  [avIconOnly]="true"
>
  <av-icon type="search" [size]="16"></av-icon>
</button>

// Кастомные цвета (Фон, Текст и Иконка раздельно)
<button
  av-button
  avColor="#1e293b"
  avTextColor="#f8fafc"
  avIconColor="#38bdf8"
>
  <av-icon type="settings"></av-icon>
  <span style="margin-left:8px">Настройки</span>
</button>`;

  readonly buttonPrimaryCode = `<button av-button avType="primary" (clicked)="handleClick()">Primary</button>`;
  readonly buttonDefaultCode = `<button av-button avType="default" (clicked)="handleClick()">Default</button>`;
  readonly buttonDashedCode = `<button av-button avType="dashed" (clicked)="handleClick()">Dashed</button>`;
  readonly buttonTextCode = `<button av-button avType="text" (clicked)="handleClick()">Text Button</button>`;
  readonly buttonLinkCode = `<button av-button avType="link" (clicked)="handleClick()">Link Button</button>`;
  readonly buttonDangerCode = `<button av-button avType="danger" (clicked)="handleClick()">Danger</button>`;

  readonly buttonSizesCode = `<button av-button avType="primary" avSize="small">Small</button>
<button av-button avType="primary" avSize="default">Default</button>
<button av-button avType="primary" avSize="large">Large</button>`;

  readonly sharpCode = `<button av-button avShape="square">Sharp Corners</button>
<button av-button avType="primary" avShape="square">Sharp Primary</button>
<button av-button [avIconOnly]="true" avShape="square">
  <av-icon type="search"></av-icon>
</button>`;
}
