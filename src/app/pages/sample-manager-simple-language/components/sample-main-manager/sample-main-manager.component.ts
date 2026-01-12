import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { LanguageService } from '@assets/languageApp/services/language.service';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { filter, take } from 'rxjs';
import { SampleMainApiService } from '../../services/sample-main-api.service';
import { SampleMainStateService } from '../../services/sample-main-state.service';
import { SampleMainModalComponent } from '../sample-main-modal/sample-main-modal.component';
import { SampleMainTableComponent } from '../sample-main-table/sample-main-table.component';

@Component({
  selector: 'app-sample-main-manager',
  standalone: true,
  imports: [
    CommonModule,
    NzGridModule,
    NzButtonModule,
    NzInputModule,
    NzIconModule,
    NzPaginationModule,
    NzSelectModule,
    FormsModule,
    SampleMainTableComponent,
    SampleMainModalComponent,
  ],
  providers: [SampleMainApiService, SampleMainStateService],
  template: `
    <div class="manager-container">
      <div nz-row [nzGutter]="[16, 16]">
        <!-- Header -->
        <div nz-col nzSpan="24" class="header-row">
          <div class="title-group">
            <h2 class="m0">Multi-Language Manager 🌐</h2>
            <span class="total-count">Всего: {{ (state$ | async)?.total }}</span>
          </div>

          <div class="action-group">
            <nz-select
              style="width: 200px;"
              nzPlaceHolder="Язык отображения"
              [ngModel]="(state$ | async)?.languageId"
              (ngModelChange)="service.setLanguage($event)"
              nzAllowClear
            >
              <nz-option
                *ngFor="let lang of languages$()"
                [nzValue]="lang.id"
                [nzLabel]="lang.title"
              ></nz-option>
            </nz-select>

            <button nz-button nzType="primary" (click)="service.openAdd()">
              <span nz-icon nzType="plus"></span> Добавить
            </button>
          </div>
        </div>

        <!-- Search -->
        <div nz-col nzSpan="24">
          <nz-input-group [nzPrefix]="prefixIcon" [nzSuffix]="inputClearTpl">
            <input
              nz-input
              placeholder="Поиск по тех. названию или коду..."
              [value]="(state$ | async)?.searchTerm"
              (input)="onSearch($event)"
            />
          </nz-input-group>
          <ng-template #prefixIcon><span nz-icon nzType="search"></span></ng-template>
          <ng-template #inputClearTpl>
            <span
              nz-icon
              class="ant-input-clear-icon"
              nzTheme="fill"
              nzType="close-circle"
              *ngIf="(state$ | async)?.searchTerm"
              (click)="onClearSearch()"
            ></span>
          </ng-template>
        </div>

        <!-- Table -->
        <div nz-col nzSpan="24">
          <app-sample-main-table
            [items]="(state$ | async)?.items || []"
            [loading]="(state$ | async)?.loading || false"
            (view)="service.openView($event.id)"
            (edit)="service.openEdit($event.id)"
            (delete)="service.delete($event.id, $event.name)"
          ></app-sample-main-table>
        </div>

        <!-- Pagination -->
        <div nz-col nzSpan="24" class="pagination-row">
          <nz-pagination
            [nzPageIndex]="(state$ | async)?.pageNumber || 1"
            [nzPageSize]="(state$ | async)?.pageSize || 10"
            [nzTotal]="(state$ | async)?.total || 0"
            nzShowSizeChanger
            [nzPageSizeOptions]="[10, 20, 30, 40, 50]"
            (nzPageIndexChange)="service.changePage($event)"
            (nzPageSizeChange)="service.changePageSize($event)"
          ></nz-pagination>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <app-sample-main-modal
      [visible]="(state$ | async)?.modalVisible || false"
      [mode]="(state$ | async)?.modalMode || 'add'"
      [item]="(state$ | async)?.editingItem || null"
      [loading]="(state$ | async)?.modalLoading || false"
      [error]="(state$ | async)?.modalError || null"
      [selectedLanguageId]="(state$ | async)?.languageId || null"
      (save)="service.save($event)"
      (cancel)="service.closeModal()"
    ></app-sample-main-modal>
  `,
  styles: [
    `
      .manager-container {
        padding: 24px;
        background: #fff;
        min-height: 100vh;
      }
      .header-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid #f0f0f0;
        padding-bottom: 16px;
        margin-bottom: 8px;
      }
      .title-group {
        display: flex;
        align-items: baseline;
        gap: 12px;
      }
      .m0 {
        margin: 0;
      }
      .total-count {
        color: #8c8c8c;
        font-size: 14px;
      }
      .action-group {
        display: flex;
        gap: 12px;
      }
      .pagination-row {
        display: flex;
        justify-content: flex-end;
        margin-top: 16px;
      }
      .ant-input-clear-icon {
        color: rgba(0, 0, 0, 0.25);
        cursor: pointer;
      }
      .ant-input-clear-icon:hover {
        color: rgba(0, 0, 0, 0.45);
      }
    `,
  ],
})
export class SampleMainManagerComponent implements OnInit {
  public service = inject(SampleMainStateService);
  private langService = inject(LanguageService);

  state$ = this.service.getState();
  languages$ = this.langService.allLanguages;

  constructor() {
    // При инициализации ждем языки и выставляем базовый фильтр
    toObservable(this.languages$)
      .pipe(
        filter((langs) => langs.length > 0),
        take(1),
      )
      .subscribe((langs) => {
        const defaultLang = langs.find((l) => l.isDefault);
        if (defaultLang) {
          this.service.setLanguage(defaultLang.id);
        } else {
          this.service.loadItems();
        }
      });
  }

  ngOnInit(): void {
    this.langService.refreshAdminList();
  }

  onSearch(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.service.search(val);
  }

  onClearSearch(): void {
    this.service.search('');
  }
}
