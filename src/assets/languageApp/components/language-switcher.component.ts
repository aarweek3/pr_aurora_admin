import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { IconComponent } from '@shared/components/ui/icon/icon.component';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { LANGUAGE_ICONS_MAP } from '../config/language-icons.config';
import { AppLanguage } from '../models/appLanguage.model';
import { LanguageService } from '../services/language.service';

/**
 * Компонент переключения языка для шапки приложения.
 */
@Component({
  selector: 'app-language-switcher',
  standalone: true,
  imports: [CommonModule, NzDropDownModule, NzIconModule, NzButtonModule, IconComponent],
  template: `
    <div class="language-switcher">
      <button
        nz-button
        nzType="text"
        nz-dropdown
        [nzDropdownMenu]="menu"
        nzPlacement="bottomRight"
        class="switcher-btn"
      >
        <span class="switcher-btn__content">
          <div class="flag-wrapper">
            <av-icon
              [type]="getIconName(languageService.currentLanguage()?.iconKey)"
              [size]="18"
              class="flag-icon"
            ></av-icon>
          </div>

          <span class="lang-title">{{ languageService.currentLanguage()?.nativeTitle }}</span>
          <i nz-icon nzType="down"></i>
        </span>
      </button>

      <nz-dropdown-menu #menu="nzDropdownMenu">
        <ul nz-menu>
          @for (lang of languageService.availableLanguages(); track lang.id) {
          <li
            nz-menu-item
            [nzSelected]="lang.id === languageService.currentLanguage()?.id"
            (click)="changeLanguage(lang)"
          >
            <div class="lang-item">
              <div class="flag-wrapper small">
                <av-icon [type]="getIconName(lang.iconKey)" [size]="14" class="flag-icon"></av-icon>
              </div>
              <span>{{ lang.nativeTitle }}</span>
            </div>
          </li>
          }
        </ul>
      </nz-dropdown-menu>
    </div>
  `,
  styles: [
    `
      .language-switcher {
        display: inline-block;
      }
      .switcher-btn {
        height: 48px;
        padding: 0 12px;
        display: flex;
        align-items: center;
        &:hover {
          background: rgba(0, 0, 0, 0.025);
        }
      }
      .switcher-btn__content {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .flag-wrapper {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 18px;
        overflow: hidden;
        border-radius: 2px;
        box-shadow: 0 0 1px rgba(0, 0, 0, 0.2);

        &.small {
          width: 20px;
          height: 14px;
        }

        ::ng-deep av-icon {
          display: flex;
          width: 100%;
          height: 100%;
        }

        ::ng-deep svg {
          object-fit: cover;
          width: 100%;
          height: 100%;
        }
      }
      .lang-title {
        font-size: 14px;
        font-weight: 500;
      }
      .lang-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 4px 0;
      }
    `,
  ],
})
export class LanguageSwitcherComponent {
  languageService = inject(LanguageService);

  getIconName(customIconKey?: string): string {
    if (!customIconKey) return LANGUAGE_ICONS_MAP['default'];
    return LANGUAGE_ICONS_MAP[customIconKey] || LANGUAGE_ICONS_MAP['default'];
  }

  changeLanguage(lang: AppLanguage): void {
    this.languageService.setLanguage(lang);
  }
}
