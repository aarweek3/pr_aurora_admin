import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { LicenseTypeOfAggregatorStateService } from '../../services/license-type-of-aggregator-state.service';
import { LicenseTypeOfAggregatorFormComponent } from '../license-type-of-aggregator-form/license-type-of-aggregator-form.component';

@Component({
  selector: 'app-license-type-of-aggregator-page-form',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    NzCardModule,
    NzPageHeaderModule,
    NzButtonModule,
    NzIconModule,
    LicenseTypeOfAggregatorFormComponent,
  ],
  template: `
    <div class="page-form-container">
      <nz-page-header
        (nzBack)="handleCancel()"
        [nzTitle]="
          state.modalMode() === 'add' ? 'Новый тип лицензии' : 'Редактирование типа лицензии'
        "
      >
        <nz-page-header-extra>
          <button nz-button (click)="handleCancel()">Отмена</button>
          <button
            nz-button
            nzType="primary"
            (click)="licenseForm.submitForm()"
            [nzLoading]="state.modalLoading()"
          >
            Сохранить изменения
          </button>
        </nz-page-header-extra>
      </nz-page-header>

      <nz-card [nzBordered]="false">
        <app-license-type-of-aggregator-form
          #licenseForm
          [loading]="state.modalLoading()"
          [initialData]="state.editingItem()"
          (save)="handleSave($event)"
          (cancel)="handleCancel()"
        ></app-license-type-of-aggregator-form>
      </nz-card>
    </div>
  `,
  styles: [
    `
      .page-form-container {
        padding: 24px;
        padding-top: 0;
      }
    `,
  ],
})
export class LicenseTypeOfAggregatorPageFormComponent implements OnInit {
  state = inject(LicenseTypeOfAggregatorStateService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  @ViewChild('licenseForm') licenseForm!: LicenseTypeOfAggregatorFormComponent;

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
