import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { SampleMainSeoStateService } from '../../services/sample-main-seo-state.service';
import { SampleMainSeoFormComponent } from '../sample-main-seo-form/sample-main-seo-form.component';

@Component({
  selector: 'app-sample-main-seo-inline',
  standalone: true,
  imports: [CommonModule, NzCardModule, NzGridModule, NzDividerModule, SampleMainSeoFormComponent],
  template: `
    <div nz-row [nzGutter]="24" *ngIf="isVisible$ | async">
      <div nz-col nzSpan="24">
        <nz-card
          [nzTitle]="
            (mode$ | async) === 'add' ? 'Новая запись (Inline)' : 'Редактирование записи (Inline)'
          "
          [nzExtra]="extraTemplate"
        >
          <app-sample-main-seo-form
            [loading]="(isLoading$ | async) || false"
            [initialData]="editingItem$ | async"
            [showInlineActions]="true"
            (save)="handleSave($event)"
            (cancel)="handleCancel()"
          ></app-sample-main-seo-form>
        </nz-card>
      </div>

      <ng-template #extraTemplate>
        <span style="color: #8c8c8c; font-size: 12px;">
          Форма встроена прямо в страницу, без модального окна
        </span>
      </ng-template>
    </div>
  `,
})
export class SampleMainSeoInlineComponent implements OnInit {
  isVisible$ = this.state.modalVisible$;
  editingItem$ = this.state.editingItem$;
  isLoading$ = this.state.modalLoading$;
  mode$ = this.state.modalMode$;

  constructor(private state: SampleMainSeoStateService) {}

  ngOnInit(): void {}

  handleSave(formValue: any): void {
    this.state.save(formValue);
  }

  handleCancel(): void {
    this.state.closeModal();
  }
}
