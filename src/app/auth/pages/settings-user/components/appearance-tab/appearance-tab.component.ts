import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { UiDensity, UiTheme } from '../../enums';
import { SettingsEnumUtils } from '../../models';
import { UserSettingsService } from '../../services';

@Component({
  selector: 'app-appearance-tab',
  standalone: true,
  imports: [CommonModule, FormsModule, NzFormModule, NzRadioModule, NzDividerModule, NzInputModule],
  template: `
    <div class="tab-content">
      <div class="setting-section">
        <h3>Тема оформления</h3>
        <p class="description">Выберите цветовую схему интерфейса</p>
        <nz-radio-group [(ngModel)]="theme" (ngModelChange)="onThemeChange($event)">
          <label *ngFor="let option of themeOptions" nz-radio [nzValue]="option.value">
            {{ option.label }}
            <span class="option-description">{{ option.description }}</span>
          </label>
        </nz-radio-group>
      </div>

      <nz-divider></nz-divider>

      <div class="setting-section">
        <h3>Плотность интерфейса</h3>
        <p class="description">Настройте отступы между элементами</p>
        <nz-radio-group [(ngModel)]="density" (ngModelChange)="onDensityChange($event)">
          <label *ngFor="let option of densityOptions" nz-radio [nzValue]="option.value">
            {{ option.label }}
            <span class="option-description">{{ option.description }}</span>
          </label>
        </nz-radio-group>
      </div>

      <nz-divider></nz-divider>

      <div class="setting-section">
        <h3>Основной цвет</h3>
        <p class="description">Выберите акцентный цвет (HEX формат)</p>
        <input
          nz-input
          type="color"
          [(ngModel)]="primaryColor"
          (ngModelChange)="onColorChange($event)"
          style="width: 100px; height: 40px; cursor: pointer;"
        />
        <input
          nz-input
          type="text"
          [(ngModel)]="primaryColor"
          (ngModelChange)="onColorChange($event)"
          placeholder="#1890ff"
          style="width: 200px; margin-left: 12px;"
        />
      </div>
    </div>
  `,
  styles: [
    `
      .tab-content {
        max-width: 800px;
      }

      .setting-section {
        margin-bottom: 24px;
      }

      .setting-section h3 {
        margin: 0 0 8px;
        font-size: 16px;
        font-weight: 600;
      }

      .description {
        margin: 0 0 16px;
        color: #666;
        font-size: 14px;
      }

      .option-description {
        display: block;
        color: #999;
        font-size: 12px;
        margin-top: 4px;
      }

      nz-radio-group {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
    `,
  ],
})
export class AppearanceTabComponent {
  private readonly settingsService = inject(UserSettingsService);
  private readonly message = inject(NzMessageService);

  readonly themeOptions = SettingsEnumUtils.getUiThemeOptions();
  readonly densityOptions = SettingsEnumUtils.getUiDensityOptions();

  get theme(): UiTheme {
    return this.settingsService.settings().theme;
  }

  set theme(value: UiTheme) {
    this.settingsService.updateLocalSettings({ theme: value });
  }

  get density(): UiDensity {
    return this.settingsService.settings().density;
  }

  set density(value: UiDensity) {
    this.settingsService.updateLocalSettings({ density: value });
  }

  get primaryColor(): string {
    return this.settingsService.settings().primaryColor || '#1890ff';
  }

  set primaryColor(value: string) {
    this.settingsService.updateLocalSettings({ primaryColor: value });
  }

  onThemeChange(theme: UiTheme): void {
    this.settingsService.patchSettings({ theme }).subscribe({
      next: () => this.message.success('Тема изменена'),
      error: () => this.message.error('Ошибка изменения темы'),
    });
  }

  onDensityChange(density: UiDensity): void {
    this.settingsService.patchSettings({ density }).subscribe({
      next: () => this.message.success('Плотность изменена'),
      error: () => this.message.error('Ошибка изменения плотности'),
    });
  }

  onColorChange(color: string): void {
    if (/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color)) {
      this.settingsService.patchSettings({ primaryColor: color }).subscribe({
        next: () => this.message.success('Цвет изменён'),
        error: () => this.message.error('Ошибка изменения цвета'),
      });
    }
  }
}
