import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { UserSettingsService } from '../../services';

@Component({
  selector: 'app-localization-tab',
  standalone: true,
  imports: [CommonModule, FormsModule, NzFormModule, NzSelectModule, NzDividerModule],
  template: `
    <div class="tab-content">
      <div class="setting-section">
        <h3>Язык интерфейса</h3>
        <p class="description">Выберите язык приложения</p>
        <nz-select
          [(ngModel)]="language"
          (ngModelChange)="onLanguageChange($event)"
          style="width: 200px;"
        >
          <nz-option nzValue="ru-RU" nzLabel="Русский"></nz-option>
          <nz-option nzValue="en-US" nzLabel="English"></nz-option>
        </nz-select>
      </div>
      <nz-divider></nz-divider>
      <div class="setting-section">
        <h3>Часовой пояс</h3>
        <p class="description">Выберите часовой пояс</p>
        <nz-select
          [(ngModel)]="timeZone"
          (ngModelChange)="onTimeZoneChange($event)"
          style="width: 300px;"
        >
          <nz-option nzValue="UTC" nzLabel="UTC"></nz-option>
          <nz-option nzValue="Europe/Moscow" nzLabel="Europe/Moscow (МСК)"></nz-option>
          <nz-option nzValue="America/New_York" nzLabel="America/New_York (EST)"></nz-option>
        </nz-select>
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
    `,
  ],
})
export class LocalizationTabComponent {
  private readonly settingsService = inject(UserSettingsService);
  private readonly message = inject(NzMessageService);

  get language() {
    return this.settingsService.settings().language;
  }
  set language(v: string) {
    this.settingsService.updateLocalSettings({ language: v });
  }

  get timeZone() {
    return this.settingsService.settings().timeZone;
  }
  set timeZone(v: string) {
    this.settingsService.updateLocalSettings({ timeZone: v });
  }

  onLanguageChange(lang: string): void {
    this.settingsService.patchSettings({ language: lang }).subscribe({
      next: () => this.message.success('Язык изменён'),
      error: () => this.message.error('Ошибка'),
    });
  }

  onTimeZoneChange(tz: string): void {
    this.settingsService.patchSettings({ timeZone: tz }).subscribe({
      next: () => this.message.success('Часовой пояс изменён'),
      error: () => this.message.error('Ошибка'),
    });
  }
}
