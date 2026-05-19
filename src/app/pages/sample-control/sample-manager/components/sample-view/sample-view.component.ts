import { Component, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { SampleDetailDto } from '../../models/sample.dto';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-sample-view',
  standalone: true,
  imports: [CommonModule, NzModalModule, NzDescriptionsModule],
  template: `
    <nz-modal
      [nzVisible]="visible"
      nzTitle="Просмотр"
      [nzWidth]="600"
      [nzFooter]="null"
      (nzOnCancel)="modalClose.emit()"
    >
      <ng-container *nzModalContent>
        <nz-descriptions nzBordered [nzColumn]="1" *ngIf="sample">
          <nz-descriptions-item nzTitle="ID">
            {{ sample.id }}
          </nz-descriptions-item>
          <nz-descriptions-item nzTitle="Название">
            {{ sample.name }}
          </nz-descriptions-item>
          <nz-descriptions-item nzTitle="Описание">
            {{ sample.description || 'Отсутствует' }}
          </nz-descriptions-item>
        </nz-descriptions>

        <!-- Сообщение если запись родитель не загружена -->
        <div *ngIf="!sample" style="text-align: center; padding: 20px;">
          <p>Информация о записи недоступна</p>
        </div>
      </ng-container>
    </nz-modal>
  `,
})
export class SampleViewComponent implements OnDestroy {
  @Input() visible = false;
  @Input() sample: SampleDetailDto | null = null;
  @Output() modalClose = new EventEmitter<void>();

  private destroy$ = new Subject<void>();

  ngOnDestroy(): void {
    console.log('SampleView ngOnDestroy - очистка ресурсов');
    this.destroy$.next();
    this.destroy$.complete();
  }
}
