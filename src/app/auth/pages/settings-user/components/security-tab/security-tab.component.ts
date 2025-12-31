import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { LoginNotificationMode, SessionTerminationMode } from '../../enums';
import { SettingsEnumUtils } from '../../models';
import { UserSettingsService } from '../../services';

@Component({
  selector: 'app-security-tab',
  standalone: true,
  imports: [CommonModule, FormsModule, NzFormModule, NzRadioModule, NzDividerModule],
  template: `
    <div class="tab-content">
      <div class="setting-section">
        <h3>Завершение сессии</h3>
        <p class="description">Когда завершать сессию автоматически</p>
        <nz-radio-group
          [(ngModel)]="sessionTerminationMode"
          (ngModelChange)="onSessionChange($event)"
        >
          <label *ngFor="let opt of sessionOptions" nz-radio [nzValue]="opt.value">{{
            opt.label
          }}</label>
        </nz-radio-group>
      </div>
      <nz-divider></nz-divider>
      <div class="setting-section">
        <h3>Уведомления о входе</h3>
        <p class="description">Когда уведомлять о входе в систему</p>
        <nz-radio-group [(ngModel)]="loginNotificationMode" (ngModelChange)="onLoginChange($event)">
          <label *ngFor="let opt of loginOptions" nz-radio [nzValue]="opt.value">{{
            opt.label
          }}</label>
        </nz-radio-group>
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
      nz-radio-group {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
    `,
  ],
})
export class SecurityTabComponent {
  private readonly settingsService = inject(UserSettingsService);
  private readonly message = inject(NzMessageService);

  readonly sessionOptions = SettingsEnumUtils.getSessionTerminationModeOptions();
  readonly loginOptions = SettingsEnumUtils.getLoginNotificationModeOptions();

  get sessionTerminationMode() {
    return this.settingsService.settings().sessionTerminationMode;
  }
  set sessionTerminationMode(v: SessionTerminationMode) {
    this.settingsService.updateLocalSettings({ sessionTerminationMode: v });
  }

  get loginNotificationMode() {
    return this.settingsService.settings().loginNotificationMode;
  }
  set loginNotificationMode(v: LoginNotificationMode) {
    this.settingsService.updateLocalSettings({ loginNotificationMode: v });
  }

  onSessionChange(mode: SessionTerminationMode): void {
    this.settingsService.patchSettings({ sessionTerminationMode: mode }).subscribe({
      next: () => this.message.success('Режим завершения сессии изменён'),
      error: () => this.message.error('Ошибка'),
    });
  }

  onLoginChange(mode: LoginNotificationMode): void {
    this.settingsService.patchSettings({ loginNotificationMode: mode }).subscribe({
      next: () => this.message.success('Режим уведомлений о входе изменён'),
      error: () => this.message.error('Ошибка'),
    });
  }
}
