import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { AccessibilityLevel } from '../../enums';
import { SettingsEnumUtils } from '../../models';
import { UserSettingsService } from '../../services';

@Component({
  selector: 'app-accessibility-tab',
  standalone: true,
  imports: [CommonModule, FormsModule, NzFormModule, NzRadioModule],
  template: `
    <div class="tab-content">
      <div class="setting-section">
        <h3>Уровень доступности</h3>
        <p class="description">Настройте размер шрифтов и контрастность</p>
        <nz-radio-group [(ngModel)]="accessibilityLevel" (ngModelChange)="onChange($event)">
          <label *ngFor="let opt of options" nz-radio [nzValue]="opt.value">
            {{ opt.label }}
            <span class="option-description">{{ opt.description }}</span>
          </label>
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
      .option-description {
        display: block;
        color: #999;
        font-size: 12px;
        margin-top: 4px;
      }
    `,
  ],
})
export class AccessibilityTabComponent {
  private readonly settingsService = inject(UserSettingsService);
  private readonly message = inject(NzMessageService);

  readonly options = SettingsEnumUtils.getAccessibilityLevelOptions();

  get accessibilityLevel() {
    return this.settingsService.settings().accessibilityLevel;
  }
  set accessibilityLevel(v: AccessibilityLevel) {
    this.settingsService.updateLocalSettings({ accessibilityLevel: v });
  }

  onChange(level: AccessibilityLevel): void {
    this.settingsService.patchSettings({ accessibilityLevel: level }).subscribe({
      next: () => this.message.success('Уровень доступности изменён'),
      error: () => this.message.error('Ошибка'),
    });
  }
}
