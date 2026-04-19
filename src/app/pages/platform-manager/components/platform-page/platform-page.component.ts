import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { PlatformStateService } from '../../services/platform-state.service';
import { PlatformFormComponent } from '../platform-form/platform-form.component';

@Component({
  selector: 'app-platform-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    NzCardModule,
    NzButtonModule,
    NzIconModule,
    NzPageHeaderModule,
    PlatformFormComponent,
  ],
  template: `
    <div class="page-container">
      <nz-page-header
        class="site-page-header"
        (nzBack)="goBack()"
        [nzTitle]="title"
        [nzSubtitle]="'Управление техническими данными, локализацией и SEO платформы'"
        nzBackIcon
      >
        <nz-page-header-extra>
          <button nz-button (click)="goBack()">Отмена</button>
          <button
            nz-button
            nzType="primary"
            (click)="platformForm.submitForm()"
            [nzLoading]="isLoading$ | async"
          >
            Сохранить данные
          </button>
        </nz-page-header-extra>
      </nz-page-header>

      <nz-card [nzBordered]="false" class="form-card">
        <app-platform-form
          #platformForm
          [loading]="(isLoading$ | async) || false"
          [initialData]="editingItem$ | async"
          (save)="handleSave($event)"
        ></app-platform-form>

        <div class="form-footer">
          <button nz-button (click)="goBack()">Отмена</button>
          <button
            nz-button
            nzType="primary"
            (click)="platformForm.submitForm()"
            [nzLoading]="isLoading$ | async"
          >
            <i nz-icon nzType="save"></i>
            Сохранить данные
          </button>
        </div>
      </nz-card>
    </div>
  `,
  styles: [
    `
      .page-container {
        padding: 0;
      }
      .site-page-header {
        background: #fff;
        margin-bottom: 24px;
        border: 1px solid #f0f0f0;
        border-radius: 8px;
      }
      .form-card {
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
      }
      .form-footer {
        margin-top: 32px;
        padding-top: 24px;
        border-top: 1px solid #f0f0f0;
        display: flex;
        justify-content: flex-end;
        gap: 12px;
      }
    `,
  ],
})
export class PlatformPageComponent implements OnInit {
  editingItem$ = this.state.editingItem$;
  isLoading$ = this.state.pageLoading$;
  mode: 'add' | 'edit' = 'add';

  constructor(
    private state: PlatformStateService,
    private route: ActivatedRoute,
    private router: Router,
    private message: NzMessageService,
  ) {}

  get title(): string {
    return this.mode === 'add' ? 'Создание новой платформы' : 'Редактирование платформы';
  }

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.mode = 'edit';
      this.state.loadById(id);
    } else {
      this.mode = 'add';
      this.state.updateState({ editingItem: null });
    }
  }

  handleSave(formValue: any): void {
    this.state.save(formValue).subscribe({
      next: () => {
        this.message.success(this.mode === 'add' ? 'Платформа создана' : 'Платформа обновлена');
        this.goBack();
      },
      error: () => {}, // Ошибка обрабатывается в сервисе
    });
  }

  goBack(): void {
    this.router.navigate(['/platforms']);
  }
}
