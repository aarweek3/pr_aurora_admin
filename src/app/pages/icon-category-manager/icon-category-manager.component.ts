import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import {
  IconCategory,
  IconCategoryCreateDto,
  IconCategoryUpdateDto,
} from './models/icon-category.model';
import { IconCategoryService } from './services/icon-category.service';

@Component({
  selector: 'app-icon-category-manager',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NzTableModule,
    NzButtonModule,
    NzIconModule,
    NzCardModule,
    NzModalModule,
    NzFormModule,
    NzInputModule,
    NzTagModule,
    NzBreadCrumbModule,
  ],
  template: `
    <div class="page-container">
      <div class="header-section">
        <nz-breadcrumb>
          <nz-breadcrumb-item>Инструменты</nz-breadcrumb-item>
          <nz-breadcrumb-item>Папки иконок</nz-breadcrumb-item>
        </nz-breadcrumb>
        <div class="title-row">
          <h1>Управление папками иконок</h1>
          <div class="actions">
            <button nz-button nzType="default" (click)="onSync()" [nzLoading]="isSyncing()">
              <span nz-icon nzType="sync"></span> Синхронизировать с диском
            </button>
            <button nz-button nzType="primary" (click)="showCreateModal()">
              <span nz-icon nzType="plus"></span> Добавить коллекцию
            </button>
          </div>
        </div>
      </div>

      <nz-card class="table-card">
        <nz-table
          #basicTable
          [nzData]="categories()"
          [nzLoading]="isLoading()"
          [nzPageSize]="10"
          [nzShowSizeChanger]="true"
          [nzPageSizeOptions]="[5, 10, 20, 50, 100]"
        >
          <thead>
            <tr>
              <th nzWidth="60px">Иконка</th>
              <th>Отображаемое имя</th>
              <th>Папка на диске</th>
              <th>Статус</th>
              <th>Создано</th>
              <th nzWidth="150px">Действия</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let data of basicTable.data">
              <td>
                <div class="icon-preview">
                  <span nz-icon [nzType]="data.menuIcon || 'folder'"></span>
                </div>
              </td>
              <td class="display-name">{{ data.displayName }}</td>
              <td>
                <code>{{ data.folderName }}</code>
              </td>
              <td>
                <nz-tag [nzColor]="data.isSystem ? 'blue' : 'default'">
                  {{ data.isSystem ? 'Системная' : 'Пользовательская' }}
                </nz-tag>
              </td>
              <td>{{ data.createdAt | date : 'dd.MM.yyyy' }}</td>
              <td>
                <div class="row-actions">
                  <button
                    nz-button
                    nzType="text"
                    (click)="showEditModal(data)"
                    nz-tooltip="Редактировать"
                  >
                    <span nz-icon nzType="edit"></span>
                  </button>
                  <button
                    nz-button
                    nzType="text"
                    nzDanger
                    (click)="onDelete(data)"
                    [disabled]="data.isSystem"
                    nz-tooltip="Удалить"
                  >
                    <span nz-icon nzType="delete"></span>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </nz-table>
      </nz-card>
    </div>

    <!-- Модальное окно Создания/Редактирования -->
    <nz-modal
      [(nzVisible)]="isModalVisible"
      [nzTitle]="editMode() ? 'Редактирование категории' : 'Создание новой коллекции'"
      (nzOnCancel)="handleCancel()"
      (nzOnOk)="handleOk()"
      [nzOkLoading]="isSubmitting()"
    >
      <div *nzModalContent>
        <form nz-form [formGroup]="validateForm" nzLayout="vertical">
          <nz-form-item *ngIf="!editMode()">
            <nz-form-label nzRequired>Имя папки (folder-name)</nz-form-label>
            <nz-form-control nzErrorTip="Имя папки обязательно (только латиница, цифры, - и _)">
              <input nz-input formControlName="folderName" placeholder="Например: business" />
            </nz-form-control>
          </nz-form-item>

          <nz-form-item>
            <nz-form-label nzRequired>Отображаемое имя</nz-form-label>
            <nz-form-control nzErrorTip="Введите название для отображения">
              <input nz-input formControlName="displayName" placeholder="Например: Бизнес" />
            </nz-form-control>
          </nz-form-item>

          <nz-form-item>
            <nz-form-label>Иконка меню (NZ-Icon name)</nz-form-label>
            <nz-form-control>
              <input nz-input formControlName="menuIcon" placeholder="Например: shop" />
            </nz-form-control>
          </nz-form-item>
        </form>
      </div>
    </nz-modal>
  `,
  styles: [
    `
      .page-container {
        padding: 24px;
        max-width: 1200px;
        margin: 0 auto;
      }
      .header-section {
        margin-bottom: 24px;
      }
      .title-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 16px;
      }
      .title-row h1 {
        margin: 0;
        font-size: 24px;
        font-weight: 600;
      }
      .actions {
        display: flex;
        gap: 12px;
      }
      .table-card {
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
      }
      .icon-preview {
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #f5f5f5;
        border-radius: 4px;
        font-size: 18px;
      }
      .display-name {
        font-weight: 500;
      }
      .row-actions {
        display: flex;
        gap: 4px;
      }
      code {
        background: #f0f2f5;
        padding: 2px 6px;
        border-radius: 4px;
        font-family: 'Monaco', 'Menlo', monospace;
        font-size: 13px;
      }
    `,
  ],
})
export class IconCategoryManagerComponent implements OnInit {
  private fb = inject(FormBuilder);
  private categoryService = inject(IconCategoryService);
  private message = inject(NzMessageService);
  private modal = inject(NzModalService);

  categories = signal<IconCategory[]>([]);
  isLoading = signal(false);
  isSyncing = signal(false);
  isSubmitting = signal(false);

  isModalVisible = false;
  editMode = signal(false);
  selectedId = signal<number | null>(null);

  validateForm: FormGroup = this.fb.group({
    folderName: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9_-]+$/)]],
    displayName: ['', [Validators.required]],
    menuIcon: ['av_folder'],
  });

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.isLoading.set(true);
    this.categoryService.getAll().subscribe({
      next: (res) => {
        this.categories.set(res.data);
        this.isLoading.set(false);
      },
      error: () => {
        this.message.error('Ошибка при загрузке категорий');
        this.isLoading.set(false);
      },
    });
  }

  onSync(): void {
    this.isSyncing.set(true);
    this.categoryService.sync().subscribe({
      next: (res) => {
        this.message.success(res.message);
        this.loadCategories();
        this.isSyncing.set(false);
      },
      error: () => {
        this.message.error('Ошибка синхронизации');
        this.isSyncing.set(false);
      },
    });
  }

  showCreateModal(): void {
    this.editMode.set(false);
    this.selectedId.set(null);
    this.validateForm.reset({ menuIcon: 'av_folder' });
    this.validateForm.get('folderName')?.enable();
    this.isModalVisible = true;
  }

  showEditModal(category: IconCategory): void {
    this.editMode.set(true);
    this.selectedId.set(category.id);
    this.validateForm.patchValue({
      folderName: category.folderName,
      displayName: category.displayName,
      menuIcon: category.menuIcon,
    });
    this.validateForm.get('folderName')?.disable();
    this.isModalVisible = true;
  }

  handleCancel(): void {
    this.isModalVisible = false;
  }

  handleOk(): void {
    if (this.validateForm.valid) {
      this.isSubmitting.set(true);
      const data = this.validateForm.getRawValue();

      if (this.editMode()) {
        const updateDto: IconCategoryUpdateDto = {
          displayName: data.displayName,
          menuIcon: data.menuIcon,
        };
        this.categoryService.update(this.selectedId()!, updateDto).subscribe({
          next: () => {
            this.message.success('Категория обновлена');
            this.finishSubmit();
          },
          error: () => this.isSubmitting.set(false),
        });
      } else {
        const createDto: IconCategoryCreateDto = {
          ...data,
          isSystem: false,
        };
        this.categoryService.create(createDto).subscribe({
          next: () => {
            this.message.success('Коллекция создана');
            this.finishSubmit();
          },
          error: (err) => {
            this.message.error(err.error?.message || 'Ошибка при создании');
            this.isSubmitting.set(false);
          },
        });
      }
    } else {
      Object.values(this.validateForm.controls).forEach((control) => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
  }

  private finishSubmit(): void {
    this.isSubmitting.set(false);
    this.isModalVisible = false;
    this.loadCategories();
  }

  onDelete(category: IconCategory): void {
    this.modal.confirm({
      nzTitle: 'Вы уверены, что хотите удалить эту категорию?',
      nzContent: `<b style="color: red;">${category.displayName}</b> будет удалена из базы данных. Физическая папка останется, если в ней есть иконки.`,
      nzOkText: 'Да, удалить',
      nzOkType: 'primary',
      nzOkDanger: true,
      nzOnOk: () => {
        this.categoryService.delete(category.id).subscribe({
          next: (res) => {
            this.message.success(res.message);
            this.loadCategories();
          },
          error: (err) => {
            this.message.error(err.error?.message || 'Ошибка при удалении');
          },
        });
      },
      nzCancelText: 'Отмена',
    });
  }
}
