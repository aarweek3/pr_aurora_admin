import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { PlatformOfAggregatorStateService } from '../../services/platform-of-aggregator-state.service';
import { PlatformOfAggregatorFormComponent } from '../platform-of-aggregator-form/platform-of-aggregator-form.component';

@Component({
  selector: 'app-platform-of-aggregator-page-form',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    NzCardModule,
    NzPageHeaderModule,
    NzButtonModule,
    NzIconModule,
    PlatformOfAggregatorFormComponent,
  ],
  template: `
    <div class="page-form-container">
      <nz-page-header (nzBack)="handleCancel()" [nzTitle]="state.modalMode() === 'add' ? 'Новая платформа' : 'Редактирование платформы'">
        <nz-page-header-extra>
          <button nz-button (click)="handleCancel()">Отмена</button>
          <button nz-button nzType="primary" (click)="platformForm.submitForm()" [nzLoading]="state.modalLoading()">
            Сохранить изменения
          </button>
        </nz-page-header-extra>
      </nz-page-header>

      <nz-card [nzBordered]="false">
        <app-platform-of-aggregator-form
          #platformForm
          [loading]="state.modalLoading()"
          [initialData]="state.editingItem()"
          (save)="handleSave($event)"
          (cancel)="handleCancel()"
        ></app-platform-of-aggregator-form>
      </nz-card>
    </div>
  `,
  styles: [` .page-form-container { padding: 24px; padding-top: 0; } `],
})
export class PlatformOfAggregatorPageFormComponent implements OnInit {
  @ViewChild('platformForm') platformForm!: PlatformOfAggregatorFormComponent;

  constructor(
    public state: PlatformOfAggregatorStateService,
    private route: ActivatedRoute,
    private router: Router
  ) {}


  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.state.loadById(+id);
    } else {
      this.state.openAddModal();
    }
  }

  handleSave(formValue: any): void {
    this.state.save(formValue);
    this.router.navigate(['../../'], { relativeTo: this.route });
  }

  handleCancel(): void {
    this.router.navigate(['../../'], { relativeTo: this.route });
  }
}
