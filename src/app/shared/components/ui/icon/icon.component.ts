import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { IconGetService } from '@core/services/icon/icon-get.service';

import { AvIconProps } from './index';

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
      }

      :host ::ng-deep svg {
        width: 100% !important;
        height: 100% !important;
        display: block;

        &:not([data-multicolor]) {
          fill: currentColor !important;
          path,
          circle,
          rect,
          polyline,
          line,
          polygon {
            fill: var(--av-icon-color, currentColor) !important;
            stroke: var(--av-icon-color, currentColor) !important;
            vector-effect: non-scaling-stroke;
          }
        }
      }
    `,
  ],
})
export class IconComponent {
  private iconService = inject(IconGetService);
  private sanitizer = inject(DomSanitizer);

  config = input<AvIconProps | any | null>(null);
  type = input<string>('');
  size = input<number>(24);
  color = input<string | null>(null);
  rotation = input<number>(0);
  scale = input<number>(1);
  opacity = input<number>(1);
  flipX = input<boolean>(false);
  flipY = input<boolean>(false);
  padding = input<number | string>(0);
  background = input<string>('transparent');
  border = input<string | null>(null);
  radius = input<number | string>(0);

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

  transformStyle = computed(() => {
    const parts = [];
    if (this.finalRotation() !== 0) parts.push(`rotate(${this.finalRotation()}deg)`);
    if (this.finalScale() !== 1) parts.push(`scale(${this.finalScale()})`);
    if (this.finalFlipX()) parts.push('scaleX(-1)');
    if (this.finalFlipY()) parts.push('scaleY(-1)');
    return parts.join(' ');
  });

  paddingStyle = computed(() => {
    const p = this.finalPadding();
    return typeof p === 'number' ? `${p}px` : p;
  });

  radiusStyle = computed(() => {
    const r = this.finalRadius();
    return typeof r === 'number' ? `${r}px` : r;
  });

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
    effect(() => {
      this.loadIcon(this.finalType());
    });
  }

  private loadIcon(type: string): void {
    if (!type) {
      this.svgContent.set('');
      return;
    }

    const mappedName = this.iconFileMap[type];
    let iconName = type;

    if (mappedName) {
      const parts = mappedName.split('/');
      iconName = parts[parts.length - 1].replace('.svg', '');
    } else {
      if (iconName.includes('/')) {
        const parts = iconName.split('/');
        iconName = parts[parts.length - 1];
      }
      iconName = iconName.replace('.svg', '');
    }

    this.iconService.getIcon(iconName).subscribe({
      next: (svgText: string) => {
        // 1. Определение многоцветности (ищем HEX, RGB(a) и все цветовые атрибуты)
        const colors = new Set<string>();

        // Массив паттернов для поиска цветов
        const patterns = [
          /#(?:[0-9a-fA-F]{3}){1,2}\b/gi, // HEX
          /rgba?\s*\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*(?:,\s*[\d.]+\s*)?\)/gi, // RGB(A)
          /\b(?:fill|stroke)\s*[:=]\s*["']?(?!(?:rgb|rgba)\b)([a-z]+)["']?/gi, // Named colors (skip rgb/rgba)
        ];

        patterns.forEach((regex) => {
          let match;
          while ((match = regex.exec(svgText)) !== null) {
            let color = (match[1] || match[0]).toLowerCase();
            color = color
              .replace(/^(fill|stroke)\s*[:=]\s*/, '')
              .replace(/["']/g, '')
              .trim();
            if (
              color &&
              !['none', 'inherit', 'currentcolor', 'transparent', 'nonzero'].includes(color)
            ) {
              colors.add(color);
            }
          }
        });

        const isFlag =
          iconName.toLowerCase().includes('flag') || svgText.toLowerCase().includes('flag');
        const isMulticolor = colors.size > 1 || isFlag;

        // 2. Очистка и нормализация SVG
        let cleanedSvg = svgText.replace(/<\?xml.*\?>/gi, '');

        // Гарантируем viewBox
        if (!cleanedSvg.includes('viewBox')) {
          const wMatch = cleanedSvg.match(/\bwidth="([^"]+)"/i);
          const hMatch = cleanedSvg.match(/\bheight="([^"]+)"/i);
          if (wMatch && hMatch) {
            const w = wMatch[1].replace('px', '');
            const h = hMatch[1].replace('px', '');
            cleanedSvg = cleanedSvg.replace(/<svg/i, `<svg viewBox="0 0 ${w} ${h}"`);
          }
        }

        // Обработка корневого тега
        cleanedSvg = cleanedSvg.replace(/<svg\s([^>]*)/i, (match, attrs) => {
          let cleanedAttrs = attrs
            .replace(/\bwidth="[^"]*"/gi, '')
            .replace(/\bheight="[^"]*"/gi, '');

          cleanedAttrs += ` data-icon-name="${iconName}"`;
          cleanedAttrs += ` data-colors-found="${colors.size}"`;
          if (isMulticolor) {
            cleanedAttrs += ' data-multicolor="true"';
          }
          return `<svg ${cleanedAttrs.trim()}`;
        });

        // Если иконка монохромная - принудительно ставим currentColor для атрибутов
        if (!isMulticolor) {
          cleanedSvg = cleanedSvg
            .replace(/fill="(?!none)[^"]*"/gi, 'fill="currentColor"')
            .replace(/stroke="(?!none)[^"]*"/gi, 'stroke="currentColor"');
        }

        this.svgContent.set(this.sanitizer.bypassSecurityTrustHtml(cleanedSvg));
      },
      error: (err: any) => {
        this.svgContent.set(
          this.sanitizer.bypassSecurityTrustHtml(
            `<svg viewBox="0 0 24 24"><rect width="24" height="24" fill="red" opacity="0.3"/></svg>`,
          ),
        );
      },
    });
  }
}
