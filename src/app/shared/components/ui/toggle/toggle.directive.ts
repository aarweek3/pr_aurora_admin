// src/app/shared/components/ui/toggle/toggle.directive.ts
import {
  Directive,
  effect,
  ElementRef,
  HostBinding,
  inject,
  input,
  OnInit,
  Renderer2,
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

/**
 * Toggle Directive
 *
 * Директива для создания toggle-переключателей на нативных checkbox элементах.
 * Аналогично ButtonDirective - добавляет классы и поведение к нативным элементам.
 *
 * @example
 * <label class="av-toggle">
 *   <input type="checkbox" avToggle [(ngModel)]="isEnabled" />
 *   <span class="av-toggle__slider"></span>
 * </label>
 *
 * @example С параметрами
 * <label class="av-toggle">
 *   <input type="checkbox" avToggle avSize="large" avColor="success" />
 *   <span class="av-toggle__slider"></span>
 * </label>
 */
@Directive({
  selector: 'input[avToggle][type="checkbox"]',
  standalone: true,
  host: {
    class: 'av-toggle-input',
  },
})
export class ToggleDirective implements OnInit {
  /**
   * Размер переключателя
   */
  avSize = input<'small' | 'default' | 'large'>('default');

  /**
   * Цветовая схема или произвольный цвет
   */
  avColor = input<string | 'primary' | 'success' | 'warning' | 'danger'>('primary');

  /**
   * Форма переключателя
   */
  avShape = input<'default' | 'square'>('default');

  /**
   * Иконка во включенном состоянии
   */
  avCheckedIcon = input<string | null>(null);

  /**
   * Иконка в выключенном состоянии
   */
  avUncheckedIcon = input<string | null>(null);

  /**
   * Отключенное состояние
   */
  disabled = input<boolean>(false);

  /** Пользовательская ширина */
  avWidth = input<string | number | null>(null);

  /** Пользовательская высота */
  avHeight = input<string | number | null>(null);

  /** Пользовательский радиус скругления */
  avRadius = input<string | number | null>(null);

  @HostBinding('class.av-toggle-input--disabled')
  get isDisabled() {
    return this.disabled();
  }

  private el = inject(ElementRef<HTMLInputElement>);
  private renderer = inject(Renderer2);
  private sanitizer = inject(DomSanitizer);

  constructor() {
    effect(() => {
      this.updateToggleStyles();
    });
  }

  ngOnInit(): void {
    // Logic moved to effect for reactivity
  }

  /**
   * Обновляет стили и классы родительского label
   */
  private updateToggleStyles(): void {
    const input = this.el.nativeElement;
    const label = input.closest('.av-toggle');
    if (!label) return;

    // Очищаем старые классы
    const classesToRemove = [
      'av-toggle--small',
      'av-toggle--default',
      'av-toggle--large',
      'av-toggle--shape-default',
      'av-toggle--shape-square',
      'av-toggle--primary',
      'av-toggle--success',
      'av-toggle--warning',
      'av-toggle--danger',
      'av-toggle--custom',
    ];
    classesToRemove.forEach((cls) => this.renderer.removeClass(label, cls));

    const width = this.avWidth();
    const height = this.avHeight();
    const radius = this.avRadius();

    // Применяем классы размера только если нет кастомных размеров
    const size = this.avSize();
    const hasCustomSize = width !== null || height !== null;

    if (!hasCustomSize && size !== 'default') {
      this.renderer.addClass(label, `av-toggle--${size}`);
    }

    this.renderer.addClass(label, `av-toggle--shape-${this.avShape()}`);

    // Логика цвета
    const color = this.avColor();
    const presets = ['primary', 'success', 'warning', 'danger'];
    const isPreset = presets.includes(color);

    if (isPreset) {
      this.renderer.addClass(label, `av-toggle--${color}`);
      (label as HTMLElement).style.removeProperty('--av-toggle-color');
    } else {
      (label as HTMLElement).style.setProperty('--av-toggle-color', color);
      this.renderer.addClass(label, 'av-toggle--custom');
    }

    if (width) {
      const widthVal = typeof width === 'number' ? `${width}px` : width;
      this.renderer.setStyle(label, 'width', widthVal);
      (label as HTMLElement).style.setProperty('--av-toggle-width', widthVal);
    } else {
      this.renderer.removeStyle(label, 'width');
      (label as HTMLElement).style.removeProperty('--av-toggle-width');
    }

    if (height) {
      const heightVal = typeof height === 'number' ? `${height}px` : height;
      this.renderer.setStyle(label, 'height', heightVal);
      (label as HTMLElement).style.setProperty('--av-toggle-height', heightVal);

      // Автоматически подбираем offset для больших размеров
      const heightNum = typeof height === 'number' ? height : parseInt(heightVal);
      let off = '2px';
      if (heightNum > 40) off = '4px';
      else if (heightNum > 25) off = '3px';

      (label as HTMLElement).style.setProperty('--av-toggle-inner-offset', off);
    } else {
      this.renderer.removeStyle(label, 'height');
      (label as HTMLElement).style.removeProperty('--av-toggle-height');
      (label as HTMLElement).style.removeProperty('--av-toggle-inner-offset');
    }

    if (radius) {
      const radiusVal = typeof radius === 'number' ? `${radius}px` : radius;
      this.renderer.setStyle(label, 'border-radius', radiusVal);
      (label as HTMLElement).style.setProperty('--av-toggle-radius', radiusVal);
    } else {
      this.renderer.removeStyle(label, 'border-radius');
      (label as HTMLElement).style.removeProperty('--av-toggle-radius');
    }

    // Diagnostic Log
    console.log('[ToggleDirective] applied:', {
      width,
      height,
      radius,
      elementStyle: (label as HTMLElement).getAttribute('style'),
    });
  }

  @HostBinding('style.--av-toggle-color')
  get customColor() {
    const color = this.avColor();
    return ['primary', 'success', 'warning', 'danger'].includes(color) ? null : color;
  }
}
