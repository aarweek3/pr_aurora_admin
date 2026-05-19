import { CommonModule } from '@angular/common';
import { Component, Input, OnDestroy, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SampleMainSeoItemDto } from '@pages/sample-manager-simple-language-seo/models/sample-main-seo.model';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzProgressModule } from 'ng-zorro-antd/progress';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { SampleMainSeoStateService } from '../../services/sample-main-seo-state.service';

@Component({
  selector: 'app-sample-main-seo-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    NzTableModule,
    NzButtonModule,
    NzIconModule,
    NzTagModule,
    NzToolTipModule,
    NzPopconfirmModule,
    NzInputModule,
    NzSpaceModule,
    NzCardModule,
    NzProgressModule,
    NzSelectModule,
    NzAlertModule,
  ],
  template: `
    <nz-card [nzBordered]="false" class="page-card">
      <div class="table-header">
        <div class="left-actions">
          <div class="search-box">
            <nz-input-group [nzPrefix]="prefixIconSearch">
              <input
                type="text"
                nz-input
                placeholder="Поиск по названию или коду..."
                [ngModel]="searchTerm"
                (ngModelChange)="onSearchChange($event)"
              />
            </nz-input-group>
            <ng-template #prefixIconSearch>
              <i nz-icon nzType="search"></i>
            </ng-template>
          </div>

          <nz-select
            style="width: 180px;"
            [ngModel]="selectedLanguageId$ | async"
            (ngModelChange)="onLanguageChange($event)"
            nzPlaceHolder="Фильтр по языку"
          >
            <nz-option [nzValue]="null" nzLabel="Все языки"></nz-option>
            <nz-option
              *ngFor="let lang of languages$ | async"
              [nzValue]="lang.id"
              [nzLabel]="lang.nativeTitle"
            ></nz-option>
          </nz-select>
        </div>

        <button nz-button nzType="primary" (click)="onAdd()">
          <i nz-icon nzType="plus"></i>
          Создать запись
        </button>
      </div>

      <!-- Контекстное отображение ошибок -->
      <div *ngIf="error$ | async as error" class="error-container">
        <nz-alert
          nzType="error"
          [nzMessage]="error.title"
          [nzDescription]="errorDescription"
          nzShowIcon
        >
          <ng-template #errorDescription>
            <div>
              <p>{{ error.getUserMessage() }}</p>
              <div class="error-meta" *ngIf="error.correlationId">
                <small>ID ошибки: {{ error.correlationId }}</small>
              </div>
            </div>
          </ng-template>
        </nz-alert>
      </div>

      <nz-table
        #basicTable
        [nzData]="(items$ | async)!"
        [nzLoading]="(loading$ | async)!"
        [nzTotal]="(total$ | async)!"
        [nzFrontPagination]="false"
        (nzPageIndexChange)="onPageIndexChange($event)"
      >
        <thead>
          <tr>
            <th>ID</th>
            <th>Тех. Название</th>
            <th>Системный код</th>
            <th>Локализованное имя</th>
            <th nzWidth="180px">SEO Качество</th>
            <th>Статус</th>
            <th nzWidth="120px">Действия</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let data of basicTable.data; trackBy: trackByItems">
            <td>{{ data.id }}</td>
            <td>
              <span class="tech-name">{{ data.name }}</span>
            </td>
            <td>
              <nz-tag nzColor="blue">{{ data.systemCode || '—' }}</nz-tag>
            </td>
            <td>{{ data.localizedName || '—' }}</td>
            <td>
              <div class="seo-score-container">
                <nz-progress
                  [nzPercent]="data.seoScore"
                  nzSize="small"
                  [nzStatus]="'active'"
                  [nzStrokeColor]="{ '0%': '#ff4d4f', '100%': '#52c41a' }"
                  nz-tooltip
                  nzTooltipTitle="Показатель оптимизации SEO"
                ></nz-progress>
              </div>
            </td>
            <td>
              <nz-tag [nzColor]="data.isActive ? 'success' : 'default'">
                {{ data.isActive ? 'Активен' : 'Черновик' }}
              </nz-tag>
            </td>
            <td>
              <div class="actions">
                <ng-container *ngIf="usePageNavigation; else modalActions">
                  <button
                    nz-button
                    nzType="text"
                    nz-tooltip
                    nzTooltipTitle="Редактировать на странице"
                    [routerLink]="[data.id, 'edit']"
                  >
                    <i nz-icon nzType="fullscreen" class="page-icon"></i>
                  </button>
                </ng-container>

                <ng-template #modalActions>
                  <button
                    nz-button
                    nzType="text"
                    nz-tooltip
                    nzTooltipTitle="Редактировать в модалке"
                    (click)="onEdit(data.id)"
                  >
                    <i nz-icon nzType="edit" class="edit-icon"></i>
                  </button>
                </ng-template>

                <button
                  nz-button
                  nzType="text"
                  nz-tooltip
                  nzTooltipTitle="Удалить"
                  nz-popconfirm
                  nzPopconfirmTitle="Вы уверены?"
                  (nzOnConfirm)="onDelete(data.id)"
                  [nzLoading]="(deletingId$ | async) === data.id"
                >
                  <i nz-icon nzType="delete" class="delete-icon"></i>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </nz-table>
    </nz-card>
  `,
  styles: [
    `
      .page-card {
        border-radius: 12px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
      }
      .table-header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 20px;
        gap: 16px;
      }
      .left-actions {
        display: flex;
        gap: 16px;
        flex: 1;
      }
      .search-box {
        flex: 1;
        max-width: 400px;
      }
      .tech-name {
        font-weight: 500;
        color: #1890ff;
      }
      .seo-score-container {
        padding-right: 20px;
      }
      .actions {
        display: flex;
        gap: 8px;
        align-items: center; /* Центрируем иконки и спиннер */
      }
      .edit-icon {
        color: #1890ff;
      }
      .page-icon {
        color: #722ed1;
      }
      .delete-icon {
        color: #ff4d4f;
      }
      .error-container {
        margin-bottom: 24px;
      }
      .error-meta {
        margin-top: 8px;
        color: #00000073;
        font-size: 12px;
      }
    `,
  ],
})
export class SampleMainSeoListComponent implements OnInit, OnDestroy {
  private state = inject(SampleMainSeoStateService);

  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();

  items$ = this.state.items$;
  total$ = this.state.total$;
  loading$ = this.state.loading$;
  selectedLanguageId$ = this.state.selectedLanguageId$;
  languages$ = this.state.languages$;
  error$ = this.state.error$;
  deletingId$ = this.state.deletingId$; // ID удаляемой записи

  searchTerm = '';

  @Input() usePageNavigation = false;

  ngOnInit(): void {
    this.state.loadItems();

    this.searchSubject
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((term) => {
        this.state.setSearchTerm(term);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSearchChange(term: string): void {
    this.searchTerm = term;
    this.searchSubject.next(term);
  }

  onLanguageChange(langId: number | null): void {
    this.state.setLanguageId(langId);
  }

  onPageIndexChange(index: number): void {
    this.state.setPageIndex(index);
  }

  onAdd(): void {
    this.state.openAddModal();
  }

  onEdit(id: number): void {
    this.state.openEditModal(id);
  }

  onDelete(id: number): void {
    this.state.delete(id);
  }

  // TrackBy функция для оптимизации рендеринга таблицы
  trackByItems(index: number, item: SampleMainSeoItemDto): number {
    return item.id;
  }
}
