import { Component, Input, OnInit, inject, signal, computed, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DomSanitizer } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { CategorySimplifiedStateService } from '../../services/category-simplified-state.service';
import { CategorySimplifiedApiService } from '../../services/category-simplified-api.service';
import { SubcategoryItemDto } from '../../models/category-simplified.model';
import { ModalService } from '@shared/components/ui/modal/services/modal.service';
import { ImageServiceUniversal } from '@shared/services/image-service-universal.service';

@Component({
  selector: 'app-subcategory-list',
  standalone: true,
  imports: [CommonModule, NzTableModule, NzButtonModule, NzIconModule, NzTagModule, NzToolTipModule],
  template: `
    <div class="subcategory-wrapper">
      <nz-table #innerTable [nzData]="subcategories()" nzSize="small" [nzFrontPagination]="true" [nzLoading]="loading()">
        <thead>
          <tr>
            <th nzWidth="60px">ID</th>
            <th>Иконка</th>
            <th>Название / Код</th>
            <th>Slug</th>
            <th>Порядок</th>
            <th>Программы</th>
            <th>Статус</th>
            <th nzWidth="120px">Действия</th>
          </tr>
        </thead>
        <tbody>
          @for (data of innerTable.data; track data.id) {
            <tr>
              <td>{{ data.id }}</td>
              <td>
                <ng-container *ngIf="data.iconUrl; else noIcon">
                  <!-- 1. Проверяем наличие в кастомном JSON (SVG код) -->
                  @if (state.iconsMap().has(data.iconUrl)) {
                    <div [innerHTML]="sanitizer.bypassSecurityTrustHtml(state.iconsMap().get(data.iconUrl)!)" class="custom-svg-icon"></div>
                  } 
                  <!-- 2. Если это путь (содержит / или расширение) -->
                  @else if (data.iconUrl.includes('/') || data.iconUrl.includes('.')) {
                    <img
                      [src]="imgService.getAssetUrl(data.iconUrl)"
                      (error)="imgService.handleError($event)"
                      class="subcategory-icon-img"
                      alt="icon"
                    />
                  } @else {
                    <i nz-icon [nzType]="data.iconUrl"></i>
                  }
                </ng-container>
                <ng-template #noIcon>
                  <i nz-icon nzType="file" style="color: #ccc;"></i>
                </ng-template>
              </td>
              <td>
                <div style="display: flex; flex-direction: column;">
                  <span>{{ data.localizedName || data.canonicalName }}</span>
                  <span style="font-size: 10px; color: #8c8c8c;">{{ data.canonicalName }}</span>
                </div>
              </td>
              <td><nz-tag nzColor="blue">{{ data.slug }}</nz-tag></td>
              <td><nz-tag nzColor="orange">{{ data.sortOrder }}</nz-tag></td>
              <td><nz-tag nzColor="purple">{{ data.programsCount }}</nz-tag></td>
              <td>
                <nz-tag [nzColor]="data.isActive ? 'success' : 'default'">
                  {{ data.isActive ? 'Активен' : 'Пауза' }}
                </nz-tag>
              </td>
              <td>
                <div class="actions">
                   @if (data.isDeleted) {
                    <button nz-button nzType="text" nzSize="small" (click)="onRestore(data.id)">
                      <i nz-icon nzType="undo" style="color: #52c41a;"></i>
                    </button>
                  } @else {
                    <button nz-button nzType="text" nzSize="small" (click)="onView(data.id)" nz-tooltip nzTooltipTitle="Просмотр">
                      <i nz-icon nzType="eye" style="color: #1890ff;"></i>
                    </button>
                    <button nz-button nzType="text" nzSize="small" (click)="onEdit(data.id)" nz-tooltip nzTooltipTitle="Правка">
                      <i nz-icon nzType="edit" style="color: #1890ff;"></i>
                    </button>
                    <button nz-button nzType="text" nzSize="small" (click)="onDelete(data.id)" nz-tooltip nzTooltipTitle="В корзину">
                      <i nz-icon nzType="rest" style="color: #faad14;"></i>
                    </button>
                    <button nz-button nzType="text" nzSize="small" (click)="onHardDelete(data.id)" nz-tooltip nzTooltipTitle="Удалить навсегда">
                      <i nz-icon nzType="fire" style="color: #ff4d4f;"></i>
                    </button>
                  }
                </div>
              </td>
            </tr>
          }
          @if (subcategories().length === 0 && !loading()) {
            <tr>
              <td colspan="8" style="text-align: center; color: #bfbfbf; padding: 20px;">
                Нет подкатегорий
              </td>
            </tr>
          }
        </tbody>
      </nz-table>
    </div>
  `,
  styles: [`
    .subcategory-wrapper { padding: 16px 32px; background: #fafafa; border-radius: 4px; }
    .actions { display: flex; gap: 4px; }
    .subcategory-icon-img {
      width: 28px;
      height: 28px;
      object-fit: contain;
      background: #ffffff;
      border-radius: 4px;
      padding: 3px;
      border: 1px solid #e8e8e8;
    }
    .custom-svg-icon {
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--av-primary-color, #1890ff);
    }
    .custom-svg-icon ::ng-deep svg {
      width: 100%;
      height: 100%;
    }
  `]
})
export class SubcategoryListComponent implements OnInit {
  @Input() categoryId!: number;
  
  private api = inject(CategorySimplifiedApiService);
  public state = inject(CategorySimplifiedStateService);
  public imgService = inject(ImageServiceUniversal);
  public sanitizer = inject(DomSanitizer);
  private modalService = inject(ModalService);
  private destroyRef = inject(DestroyRef);

  allSubcategories = signal<SubcategoryItemDto[]>([]);
  loading = signal(false);

  subcategories = computed(() => {
    const term = this.state.searchTerm()?.toLowerCase();
    if (!term) return this.allSubcategories();
    return this.allSubcategories().filter(s => 
      s.canonicalName.toLowerCase().includes(term) || 
      s.slug.toLowerCase().includes(term) ||
      (s.localizedName && s.localizedName.toLowerCase().includes(term))
    );
  });

  ngOnInit(): void {
    this.loadSubcategories();
    this.setupRefreshSubscription();
  }

  private setupRefreshSubscription(): void {
    this.state.refreshSubcategories$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(cid => {
        if (cid === 0 || cid === this.categoryId) {
          this.loadSubcategories();
        }
      });
  }

  loadSubcategories(): void {
    this.loading.set(true);
    this.api.getSubcategories(this.categoryId, this.state.showDeleted())
      .subscribe({
        next: (data) => {
          this.allSubcategories.set(data);
          this.loading.set(false);
        },
        error: () => this.loading.set(false)
      });
  }

  onView(id: number): void {
    this.state.openViewSubcategory(id);
  }

  onEdit(id: number): void {
    this.state.updateState({ selectedSubcategoryId: id });
  }

  async onDelete(id: number): Promise<void> {
    const confirmed = await this.modalService.challengeWarning(
      'Это действие переместит подкатегорию в корзину. Программы из неё будут сброшены в основную категорию.',
      'Запись можно будет <span class="text-warning">восстановить</span> позже. Введите <span class="text-warning">"КОРЗИНА"</span> для подтверждения:',
      'КОРЗИНА',
      'УДАЛИТЬ В КОРЗИНУ?'
    );
    
    if (confirmed) {
      this.state.deleteSubcategory(id, false);
    }
  }

  async onHardDelete(id: number): Promise<void> {
    const confirmed = await this.modalService.challenge(
      'Удалить подкатегорию ПОЛНОСТЬЮ?',
      'Это действие необратимо. Введите <span class="text-danger">"УДАЛИТЬ"</span> для подтверждения:',
      'УДАЛИТЬ',
      'ОПАСНОЕ ДЕЙСТВИЕ',
      'modal-danger'
    );
    
    if (confirmed) {
      this.state.deleteSubcategory(id, true);
    }
  }

  async onRestore(id: number): Promise<void> {
    const confirmed = await this.modalService.confirm({
      title: 'Восстановить подкатегорию?',
      message: 'Запись снова станет доступной.',
      confirmText: 'Да',
      confirmType: 'primary'
    });
    if (confirmed) {
      this.state.restoreSubcategory(id);
    }
  }
}
