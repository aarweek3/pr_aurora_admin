import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { IconService } from '@core/services/icon/icon.service';

import { AvIconProps } from './index';

/**
 * Icon Component
 *
 * Высокопроизводительный компонент для отображения SVG-иконок.
 * Поддерживает автоматическую очистку SVG, трансформации и кастомизацию через Signals.
 */
@Component({
  selector: 'av-icon',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="av-icon"
      [style.width.px]="finalSize()"
      [style.height.px]="finalSize()"
      [style.--av-icon-color]="finalColor()"
      [style.transform]="transformStyle()"
      [style.opacity]="finalOpacity()"
      [style.padding]="paddingStyle()"
      [style.background]="finalBackground()"
      [style.border]="finalBorder()"
      [style.border-radius]="radiusStyle()"
      [innerHTML]="svgContent()"
    ></div>
  `,
  styles: [
    `
      :host {
        display: inline-flex;
        vertical-align: middle;
        line-height: 0;
      }

      .av-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;

        ::ng-deep svg {
          width: 100% !important;
          height: 100% !important;
          display: block;

          /* Только для одноцветных иконок применяем currentColor */
          &:not([data-multicolor]) {
            fill: currentColor !important;

            path,
            circle,
            rect,
            polyline,
            line,
            polygon {
              /* Приоритет: CSS переменная -> currentColor */
              fill: var(--av-icon-color, currentColor) !important;
              stroke: var(--av-icon-color, currentColor) !important;
              vector-effect: non-scaling-stroke;
            }
          }

          /* Для многоцветных иконок НЕ применяем currentColor */
          &[data-multicolor] {
            /* Не переопределяем fill/stroke - оставляем inline-атрибуты из SVG */
          }
        }
      }
    `,
  ],
})
export class IconComponent {
  private iconService = inject(IconService);
  private sanitizer = inject(DomSanitizer);

  /**
   * Конфигурационный объект (опционально).
   * Если передан, значения из него перекрывают индивидуальные инпуты.
   */
  config = input<AvIconProps | any | null>(null);

  /** Тип иконки или путь (напр. 'delete' или 'actions/av_trash') */
  type = input<string>('');

  /** Размер в пикселях */
  size = input<number>(24);

  /** Цвет иконки (напр. '#ff0000', 'red', 'currentColor') */
  color = input<string | null>(null);

  /** Угол поворота в градусах */
  rotation = input<number>(0);

  /** Масштаб (1 - оригинальный размер) */
  scale = input<number>(1);

  /** Прозрачность (0-1) */
  opacity = input<number>(1);

  /** Отразить по горизонтали */
  flipX = input<boolean>(false);

  /** Отразить по вертикали */
  flipY = input<boolean>(false);

  /** Внутренние отступы (число = px, или строка с единицами) */
  padding = input<number | string>(0);

  /** Фон иконки */
  background = input<string>('transparent');

  /** Граница (напр. '1px solid #ccc') */
  border = input<string | null>(null);

  /** Радиус скругления */
  radius = input<number | string>(0);

  // Вычисляемые свойства (приоритет у config)
  finalType = computed(() => this.config()?.type || this.type());
  finalSize = computed(() => this.config()?.size ?? this.size());
  finalColor = computed(() => this.config()?.color ?? this.color());
  finalRotation = computed(() => this.config()?.rotation ?? this.rotation());
  finalScale = computed(() => this.config()?.scale ?? this.scale());
  finalOpacity = computed(() => this.config()?.opacity ?? this.opacity());
  finalFlipX = computed(() => this.config()?.flipX ?? this.flipX());
  finalFlipY = computed(() => this.config()?.flipY ?? this.flipY());
  finalBackground = computed(() => this.config()?.background ?? this.background());

  finalBorder = computed(() => {
    const cfg = this.config();
    if (!cfg) return this.border();
    if (cfg.border) return cfg.border;
    if (cfg.borderShow) {
      return `${cfg.borderWidth ?? 1}px solid ${cfg.borderColor ?? '#d9d9d9'}`;
    }
    return null;
  });

  finalPadding = computed(() => this.config()?.padding ?? this.padding());

  finalRadius = computed(() => {
    const cfg = this.config();
    if (!cfg) return this.radius();
    return cfg.radius ?? cfg.borderRadius ?? this.radius();
  });

  /** Вычисляемая строка трансформации */
  transformStyle = computed(() => {
    const parts = [];
    if (this.finalRotation() !== 0) parts.push(`rotate(${this.finalRotation()}deg)`);
    if (this.finalScale() !== 1) parts.push(`scale(${this.finalScale()})`);
    if (this.finalFlipX()) parts.push('scaleX(-1)');
    if (this.finalFlipY()) parts.push('scaleY(-1)');
    return parts.join(' ');
  });

  /** Хелпер для отступов */
  paddingStyle = computed(() => {
    const p = this.finalPadding();
    return typeof p === 'number' ? `${p}px` : p;
  });

  /** Хелпер для радиуса */
  radiusStyle = computed(() => {
    const r = this.finalRadius();
    return typeof r === 'number' ? `${r}px` : r;
  });

  /** Обработанное содержимое SVG */
  svgContent = signal<SafeHtml>('');

  private iconFileMap: Record<string, string> = {
    download: 'arrows/av_arrow_down.svg',
    upload: 'actions/av_upload.svg',
    delete: 'actions/av_trash.svg',
    search: 'actions/av_search.svg',
    plus: 'actions/av_plus.svg',
    settings: 'system/av_settings.svg',
    close: 'actions/av_close.svg',
    copy: 'actions/av_copy.svg',
    code: 'actions/av_copy.svg',
    'chevron-up': 'arrows/av_chevron-up.svg',
    'chevron-down': 'arrows/av_chevron-down.svg',
    info: 'system/av_info.svg',
    email: 'communication/av_mail.svg',
    user: 'users/av_user.svg',
    lock: 'security/av_lock.svg',
    check: 'actions/av_check.svg',
  };

  constructor() {
    // Реагируем на изменение типа
    effect(() => {
      this.loadIcon(this.finalType());
    });
  }

  private loadIcon(type: string): void {
    if (!type) return;

    const mappedName = this.iconFileMap[type];
    // If mapped, use the map result (e.g. 'download' -> 'arrows/av_arrow_down.svg').
    // We need to extract just the name 'av_arrow_down'.

    let iconName = type;

    if (mappedName) {
      // e.g. "arrows/av_arrow_down.svg" -> "av_arrow_down"
      const parts = mappedName.split('/');
      iconName = parts[parts.length - 1].replace('.svg', '');
    } else {
      // e.g. "actions/av_save" -> "av_save"
      // or just "av_save" -> "av_save"
      if (iconName.includes('/')) {
        const parts = iconName.split('/');
        iconName = parts[parts.length - 1];
      }
      iconName = iconName.replace('.svg', '');
    }

    // Now iconName should be just "av_save"
    this.iconService.getIcon(iconName).subscribe({
      next: (svgText: string) => {
        // ГЛУБОКАЯ ОЧИСТКА SVG
        let cleanedSvg = svgText
          .replace(/<\?xml.*\?>/gi, '') // Убираем XML заголовок
          .replace(/width="[^"]*"/gi, '') // Убираем жесткую ширину
          .replace(/height="[^"]*"/gi, ''); // Убираем жесткую высоту

        // Проверяем, является ли это многоцветной иконкой (флаги, сложная графика)
        // Ищем цвета в атрибутах fill="..." и stroke="..."
        const fillMatches = svgText.match(/fill="(?!none)[^"]*"/gi) || [];
        const strokeMatches = svgText.match(/stroke="(?!none)[^"]*"/gi) || [];

        // Ищем цвета в inline-стилях style="fill: rgb(...)" или style="fill:#..."
        const styleFillMatches = svgText.match(/fill:\s*(?:rgb|#)[^;")]+/gi) || [];
        const styleStrokeMatches = svgText.match(/stroke:\s*(?:rgb|#)[^;")]+/gi) || [];

        const allColors = [
          ...fillMatches,
          ...strokeMatches,
          ...styleFillMatches,
          ...styleStrokeMatches,
        ];
        const uniqueColors = new Set(allColors).size;

        // Если уникальных цветов больше 1, считаем это многоцветной иконкой
        const isMulticolor = uniqueColors > 1;

        // 🐛 DEBUG: Логируем информацию о многоцветности
        if (iconName.includes('flag') || iconName.includes('language')) {
          console.log(`[IconComponent] 🎨 ${iconName}:`, {
            isMulticolor,
            uniqueColors,
            fillMatches,
            strokeMatches,
            styleFillMatches,
            styleStrokeMatches,
            svgPreview: svgText.substring(0, 500),
          });
        }

        if (!isMulticolor) {
          // Заменяем все fill="..." на fill="currentColor", кроме none
          cleanedSvg = cleanedSvg
            .replace(/fill="(?!none)[^"]*"/gi, 'fill="currentColor"')
            // Аналогично для stroke
            .replace(/stroke="(?!none)[^"]*"/gi, 'stroke="currentColor"');
        } else {
          // Для многоцветных иконок:
          // 1. Добавляем data-атрибут
          cleanedSvg = cleanedSvg.replace(/<svg/i, '<svg data-multicolor="true"');

          // 2. Преобразуем inline-стили в атрибуты (чтобы CSS не перекрывал их)
          // Ищем style="...fill: rgb(...)..." и извлекаем fill
          cleanedSvg = cleanedSvg.replace(/style="([^"]*)"/gi, (match, styleContent) => {
            let newAttrs = '';

            // Извлекаем fill
            const fillMatch = styleContent.match(
              /fill:\s*(rgb\([^)]+\)|#[0-9a-fA-F]{3,6}|[a-z]+)/i,
            );
            if (fillMatch) {
              newAttrs += ` fill="${fillMatch[1].trim()}"`;
            }

            // Извлекаем stroke
            const strokeMatch = styleContent.match(
              /stroke:\s*(rgb\([^)]+\)|#[0-9a-fA-F]{3,6}|[a-z]+)/i,
            );
            if (strokeMatch) {
              newAttrs += ` stroke="${strokeMatch[1].trim()}"`;
            }

            // Оставляем остальные стили (кроме fill/stroke)
            const remainingStyles = styleContent
              .replace(/fill:\s*[^;]+;?/gi, '')
              .replace(/stroke:\s*[^;]+;?/gi, '')
              .trim();

            if (remainingStyles) {
              return `style="${remainingStyles}"${newAttrs}`;
            }

            return newAttrs.trim();
          });

          console.log(`[IconComponent] ✅ ${iconName} marked as multicolor`);
        }

        this.svgContent.set(this.sanitizer.bypassSecurityTrustHtml(cleanedSvg));
      },
      error: (err: any) => {
        console.error(`[IconComponent] ❌ Error loading: ${iconName}`, err);
        // Fallback: красный квадрат
        this.svgContent.set(
          this.sanitizer.bypassSecurityTrustHtml(
            `<svg viewBox="0 0 24 24"><rect width="24" height="24" fill="red" opacity="0.5"/></svg>`,
          ),
        );
      },
    });
  }
}
