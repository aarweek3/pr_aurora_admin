import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { DeveloperOfAggregatorStateService } from '../../services/developer-of-aggregator-state.service';
import { DeveloperOfAggregatorFormComponent } from '../developer-of-aggregator-form/developer-of-aggregator-form.component';

@Component({
  selector: 'app-developer-of-aggregator-page-form',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    NzCardModule,
    NzPageHeaderModule,
    NzButtonModule,
    NzIconModule,
    NzSpaceModule,
    DeveloperOfAggregatorFormComponent,
  ],
  template: `
    <div class="page-form-container">
      <nz-page-header
        (nzBack)="handleCancel()"
        [nzTitle]="isAddMode ? 'Новый разработчик' : 'Редактирование разработчика'"
        [nzSubtitle]="!isAddMode ? 'ID: ' + id : ''"
      >
        <nz-page-header-extra>
          <nz-space>
            <button *nzSpaceItem nz-button (click)="handleCancel()">Отмена</button>
            <button
              *nzSpaceItem
              nz-button
              nzType="primary"
              (click)="devForm.submit()"
              [nzLoading]="state.modalLoading()"
            >
              {{ isAddMode ? 'Создать' : 'Сохранить' }}
            </button>
          </nz-space>
        </nz-page-header-extra>
      </nz-page-header>

      <nz-card [nzBordered]="false" class="form-card">
        <app-developer-of-aggregator-form
          #devForm
          [id]="id"
          (save)="handleSave($event)"
        ></app-developer-of-aggregator-form>

        <div class="form-footer-actions">
          <nz-space>
            <button *nzSpaceItem nz-button nzSize="large" (click)="handleCancel()">Отмена</button>
            <button
              *nzSpaceItem
              nz-button
              nzType="primary"
              nzSize="large"
              (click)="devForm.submit()"
              [nzLoading]="state.modalLoading()"
            >
              <i nz-icon nzType="save"></i>
              {{ isAddMode ? 'Создать разработчика' : 'Сохранить изменения' }}
            </button>
          </nz-space>
        </div>
      </nz-card>
    </div>
  `,
  styles: [
    `
      .page-form-container {
        padding: 24px;
        padding-top: 0;
        max-width: 1200px;
        margin: 0 auto;
      }
      .form-card {
        margin-top: 24px;
        border-radius: 12px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);

        ::ng-deep .ant-card-body {
          padding: 24px;
        }
      }
      .form-footer-actions {
        margin-top: 32px;
        padding-top: 24px;
        border-top: 1px solid #f0f0f0;
        display: flex;
        justify-content: flex-end;
      }
    `,
  ],
})
export class DeveloperOfAggregatorPageFormComponent implements OnInit {
  @ViewChild('devForm') devForm!: DeveloperOfAggregatorFormComponent;

  public state = inject(DeveloperOfAggregatorStateService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  id: number | null = null;
  isAddMode = true;

  ngOnInit(): void {
    const idParam = this.route.snapshot.params['id'];
    if (idParam) {
      this.id = +idParam;
      this.isAddMode = false;
    } else {
      this.id = null;
      this.isAddMode = true;
      this.state.updateState({ selectedId: null, viewItem: null });
    }
  }

  handleSave(formValue: any): void {
    this.state.save(formValue).subscribe({
      next: () => {
        this.goBack();
      },
    });
  }

  handleCancel(): void {
    this.goBack();
  }

  private goBack(): void {
    this.router.navigate(['./'], { relativeTo: this.route.parent });
  }
}
