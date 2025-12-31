import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NavigationBehavior, SidebarState } from '../../enums';
import { SettingsEnumUtils } from '../../models';
import { UserSettingsService } from '../../services';

@Component({
  selector: 'app-navigation-tab',
  standalone: true,
  imports: [CommonModule, FormsModule, NzFormModule, NzRadioModule, NzDividerModule],
  template: `
    <div class="tab-content">
      <div class="setting-section">
        <h3>Состояние бокового меню</h3>
        <p class="description">Выберите отображение сайдбара</p>
        <nz-radio-group [(ngModel)]="sidebarState" (ngModelChange)="onSidebarChange($event)">
          <label *ngFor="let opt of sidebarOptions" nz-radio [nzValue]="opt.value">
            {{ opt.label }}
          </label>
        </nz-radio-group>
      </div>
      <nz-divider></nz-divider>
      <div class="setting-section">
        <h3>Поведение при входе</h3>
        <p class="description">Какую страницу открывать при входе</p>
        <nz-radio-group [(ngModel)]="navigationBehavior" (ngModelChange)="onNavChange($event)">
          <label *ngFor="let opt of navOptions" nz-radio [nzValue]="opt.value">
            {{ opt.label }}
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
    `,
  ],
})
export class NavigationTabComponent {
  private readonly settingsService = inject(UserSettingsService);
  private readonly message = inject(NzMessageService);

  readonly sidebarOptions = SettingsEnumUtils.getSidebarStateOptions();
  readonly navOptions = SettingsEnumUtils.getNavigationBehaviorOptions();

  get sidebarState() {
    return this.settingsService.settings().sidebarState;
  }
  set sidebarState(v: SidebarState) {
    this.settingsService.updateLocalSettings({ sidebarState: v });
  }

  get navigationBehavior() {
    return this.settingsService.settings().navigationBehavior;
  }
  set navigationBehavior(v: NavigationBehavior) {
    this.settingsService.updateLocalSettings({ navigationBehavior: v });
  }

  onSidebarChange(state: SidebarState): void {
    this.settingsService.patchSettings({ sidebarState: state }).subscribe({
      next: () => this.message.success('Настройки сайдбара изменены'),
      error: () => this.message.error('Ошибка'),
    });
  }

  onNavChange(behavior: NavigationBehavior): void {
    this.settingsService.patchSettings({ navigationBehavior: behavior }).subscribe({
      next: () => this.message.success('Поведение навигации изменено'),
      error: () => this.message.error('Ошибка'),
    });
  }
}
