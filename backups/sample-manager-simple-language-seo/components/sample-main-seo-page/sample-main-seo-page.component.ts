import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { SampleMainSeoStateService } from '../../services/sample-main-seo-state.service';
import { SampleMainSeoFormComponent } from '../sample-main-seo-form/sample-main-seo-form.component';

@Component({
  selector: 'app-sample-main-seo-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    NzCardModule,
    NzButtonModule,
    NzIconModule,
    NzPageHeaderModule,
    SampleMainSeoFormComponent,
  ],
  template: `
    <div class="page-container">
      <nz-page-header
        class="site-page-header"
        (nzBack)="goBack()"
        [nzTitle]="title"
        [nzSubtitle]="subtitle"
        nzBackIcon
      >
        <nz-page-header-extra>
          <button nz-button (click)="goBack()">Отмена</button>
          <button
            nz-button
            nzType="primary"
            (click)="seoForm.submitForm()"
            [nzLoading]="isLoading$ | async"
          >
            Сохранить изменения
          </button>
        </nz-page-header-extra>
      </nz-page-header>

      <nz-card [nzBordered]="false" class="form-card">
        <app-sample-main-seo-form
          #seoForm
          [loading]="(isLoading$ | async) || false"
          [initialData]="editingItem$ | async"
          [showInlineActions]="false"
          (save)="handleSave($event)"
          (cancel)="goBack()"
        ></app-sample-main-seo-form>
      </nz-card>
    </div>
  `,
  styles: [
    `
      .page-container {
        padding: 0px;
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
    `,
  ],
})
export class SampleMainSeoPageComponent implements OnInit {
  private state = inject(SampleMainSeoStateService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  editingItem$ = this.state.editingItem$;
  isLoading$ = this.state.modalLoading$;
  mode: 'add' | 'edit' = 'add';

  get title(): string {
    return this.mode === 'add' ? 'Создание новой записи' : 'Редактирование записи';
  }

  get subtitle(): string {
    return 'Полная форма управления контентом и SEO настройками';
  }

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.mode = 'edit';
      this.state.loadById(+id);
    } else {
      this.mode = 'add';
      this.state.openAddModal(); // Чтобы сбросить форму на 'add'
      this.state.closeModal(); // Но закрыть модалку, если она вдруг была
    }
  }

  handleSave(formValue: any): void {
    this.state.save(formValue);
    // После сохранения можно вернуться назад или оставить на странице
    // Сервис сам вызовет loadItems()
  }

  goBack(): void {
    this.router.navigate(['/sample-seo']);
  }
}
