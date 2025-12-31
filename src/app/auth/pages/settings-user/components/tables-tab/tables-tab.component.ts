import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { DefaultPageSizeOption, TableDensity } from '../../enums';
import { SettingsEnumUtils } from '../../models';
import { UserSettingsService } from '../../services';

@Component({
  selector: 'app-tables-tab',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzFormModule,
    NzRadioModule,
    NzSelectModule,
    NzSwitchModule,
    NzDividerModule,
  ],
  template: `
    <div class="tab-content">
      <div class="setting-section">
        <h3>Плотность таблиц</h3>
        <p class="description">Высота строк в таблицах</p>
        <nz-radio-group [(ngModel)]="tableDensity" (ngModelChange)="onDensityChange($event)">
          <label *ngFor="let opt of densityOptions" nz-radio [nzValue]="opt.value">
            {{ opt.label }}
          </label>
        </nz-radio-group>
      </div>
      <nz-divider></nz-divider>
      <div class="setting-section">
        <h3>Записей на странице</h3>
        <p class="description">Количество записей по умолчанию</p>
        <nz-select
          [(ngModel)]="defaultPageSize"
          (ngModelChange)="onPageSizeChange($event)"
          style="width: 200px;"
        >
          <nz-option
            *ngFor="let opt of pageSizeOptions"
            [nzValue]="opt.value"
            [nzLabel]="opt.label"
          ></nz-option>
        </nz-select>
      </div>
      <nz-divider></nz-divider>
      <div class="setting-section">
        <h3>Расширенные фильтры</h3>
        <p class="description">Показывать фильтры по умолчанию</p>
        <nz-switch
          [(ngModel)]="showAdvancedFilters"
          (ngModelChange)="onFiltersChange($event)"
        ></nz-switch>
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
export class TablesTabComponent {
  private readonly settingsService = inject(UserSettingsService);
  private readonly message = inject(NzMessageService);

  readonly densityOptions = SettingsEnumUtils.getTableDensityOptions();
  readonly pageSizeOptions = SettingsEnumUtils.getDefaultPageSizeOptions();

  get tableDensity() {
    return this.settingsService.settings().tableDensity;
  }
  set tableDensity(v: TableDensity) {
    this.settingsService.updateLocalSettings({ tableDensity: v });
  }

  get defaultPageSize() {
    return this.settingsService.settings().defaultPageSize;
  }
  set defaultPageSize(v: DefaultPageSizeOption) {
    this.settingsService.updateLocalSettings({ defaultPageSize: v });
  }

  get showAdvancedFilters() {
    return this.settingsService.settings().showAdvancedFilters;
  }
  set showAdvancedFilters(v: boolean) {
    this.settingsService.updateLocalSettings({ showAdvancedFilters: v });
  }

  onDensityChange(density: TableDensity): void {
    this.settingsService.patchSettings({ tableDensity: density }).subscribe({
      next: () => this.message.success('Плотность таблиц изменена'),
      error: () => this.message.error('Ошибка'),
    });
  }

  onPageSizeChange(size: DefaultPageSizeOption): void {
    this.settingsService.patchSettings({ defaultPageSize: size }).subscribe({
      next: () => this.message.success('Размер страницы изменён'),
      error: () => this.message.error('Ошибка'),
    });
  }

  onFiltersChange(show: boolean): void {
    this.settingsService.patchSettings({ showAdvancedFilters: show }).subscribe({
      next: () => this.message.success('Настройки фильтров изменены'),
      error: () => this.message.error('Ошибка'),
    });
  }
}
