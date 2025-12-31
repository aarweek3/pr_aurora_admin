import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NotificationChannel, NotificationLevel } from '../../enums';
import { SettingsEnumUtils } from '../../models';
import { UserSettingsService } from '../../services';

@Component({
  selector: 'app-notifications-tab',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzFormModule,
    NzRadioModule,
    NzCheckboxModule,
    NzDividerModule,
  ],
  template: `
    <div class="tab-content">
      <div class="setting-section">
        <h3>Уровень важности</h3>
        <p class="description">Какие уведомления показывать</p>
        <nz-radio-group [(ngModel)]="notificationLevel" (ngModelChange)="onLevelChange($event)">
          <label *ngFor="let opt of levelOptions" nz-radio [nzValue]="opt.value">{{
            opt.label
          }}</label>
        </nz-radio-group>
      </div>
      <nz-divider></nz-divider>
      <div class="setting-section">
        <h3>Каналы доставки</h3>
        <p class="description">Где получать уведомления</p>
        <label nz-checkbox [(ngModel)]="emailEnabled" (ngModelChange)="onChannelChange()"
          >Email</label
        >
        <label nz-checkbox [(ngModel)]="inAppEnabled" (ngModelChange)="onChannelChange()"
          >В приложении</label
        >
        <label nz-checkbox [(ngModel)]="pushEnabled" (ngModelChange)="onChannelChange()"
          >Push-уведомления</label
        >
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
      label[nz-checkbox] {
        display: block;
        margin-bottom: 12px;
      }
    `,
  ],
})
export class NotificationsTabComponent {
  private readonly settingsService = inject(UserSettingsService);
  private readonly message = inject(NzMessageService);

  readonly levelOptions = SettingsEnumUtils.getNotificationLevelOptions();

  get notificationLevel() {
    return this.settingsService.settings().notificationLevel;
  }
  set notificationLevel(v: NotificationLevel) {
    this.settingsService.updateLocalSettings({ notificationLevel: v });
  }

  get emailEnabled() {
    return SettingsEnumUtils.hasNotificationChannel(
      this.settingsService.settings().notificationChannels,
      NotificationChannel.Email,
    );
  }
  set emailEnabled(v: boolean) {}

  get inAppEnabled() {
    return SettingsEnumUtils.hasNotificationChannel(
      this.settingsService.settings().notificationChannels,
      NotificationChannel.InApp,
    );
  }
  set inAppEnabled(v: boolean) {}

  get pushEnabled() {
    return SettingsEnumUtils.hasNotificationChannel(
      this.settingsService.settings().notificationChannels,
      NotificationChannel.Push,
    );
  }
  set pushEnabled(v: boolean) {}

  onLevelChange(level: NotificationLevel): void {
    this.settingsService.patchSettings({ notificationLevel: level }).subscribe({
      next: () => this.message.success('Уровень уведомлений изменён'),
      error: () => this.message.error('Ошибка'),
    });
  }

  onChannelChange(): void {
    let channels = NotificationChannel.None;
    if (this.emailEnabled) channels |= NotificationChannel.Email;
    if (this.inAppEnabled) channels |= NotificationChannel.InApp;
    if (this.pushEnabled) channels |= NotificationChannel.Push;

    this.settingsService.patchSettings({ notificationChannels: channels }).subscribe({
      next: () => this.message.success('Каналы уведомлений изменены'),
      error: () => this.message.error('Ошибка'),
    });
  }
}
