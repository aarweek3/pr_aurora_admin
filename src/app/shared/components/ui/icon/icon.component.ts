// src/app/shared/components/ui/icon/icon.component.ts
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, Input, OnInit, inject } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

export type IconType =
  | 'download'
  | 'upload'
  | 'delete'
  | 'search'
  | 'plus'
  | 'settings'
  | 'close'
  | 'copy'
  | 'code'
  | 'chevron-up'
  | 'chevron-down'
  | 'info';

/**
 * Icon Component
 *
 * Компонент для отображения SVG иконок из папки assets/icons
 *
 * @example
 * <app-icon type="download" [size]="16"></app-icon>
 */
@Component({
  selector: 'app-icon',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span
      [style.width.px]="size"
      [style.height.px]="size"
      [style.display]="'inline-flex'"
      [style.align-items]="'center'"
      [style.justify-content]="'center'"
      [innerHTML]="svgContent"
    ></span>
  `,
  styles: [
    `
      :host {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        line-height: 1;
      }

      :host ::ng-deep svg {
        width: 100%;
        height: 100%;
        fill: currentColor;
      }
    `,
  ],
})
export class IconComponent implements OnInit {
  private http = inject(HttpClient);
  private sanitizer = inject(DomSanitizer);

  @Input() type: IconType = 'download';
  @Input() size: number = 16;

  svgContent: SafeHtml = '';

  // Маппинг типов иконок на файлы в assets/icons
  private iconFileMap: Record<IconType, string> = {
    download: 'down-arrow-1_icon-icons.com_70987.svg',
    upload: 'upload_icon-icons.com_70834.svg',
    delete: 'trash_icon-icons.com_70843.svg',
    search: 'loop_icon-icons.com_70926.svg',
    plus: 'plus_icon-icons.com_70890.svg',
    settings: 'settings_icon-icons.com_70873.svg',
    close: 'close_icon-icons.com_71000.svg',
    copy: 'code_icon-icons.com_70999.svg',
    code: 'code_icon-icons.com_70999.svg',
    'chevron-up': 'up-arrow_icon-icons.com_70835.svg',
    'chevron-down': 'down-arrow-1_icon-icons.com_70987.svg',
    info: 'information_icon-icons.com_70940.svg',
  };

  ngOnInit(): void {
    this.loadIcon();
  }

  private loadIcon(): void {
    const fileName = this.iconFileMap[this.type] || this.iconFileMap['download'];
    const iconPath = `/assets/icons/${fileName}`;

    this.http.get(iconPath, { responseType: 'text' }).subscribe({
      next: (svgText) => {
        this.svgContent = this.sanitizer.bypassSecurityTrustHtml(svgText);
      },
      error: (err) => {
        console.error(`Failed to load icon: ${iconPath}`, err);
        // Fallback to simple SVG if file not found
        this.svgContent = this.sanitizer.bypassSecurityTrustHtml(
          `<svg width="${this.size}" height="${this.size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
          </svg>`,
        );
      },
    });
  }
}
