import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { SampleMainSeoStateService } from '../../services/sample-main-seo-state.service';
import { SampleMainSeoFormComponent } from '../sample-main-seo-form/sample-main-seo-form.component';

@Component({
  selector: 'app-sample-main-seo-modal',
  standalone: true,
  imports: [CommonModule, NzModalModule, NzButtonModule, NzIconModule, SampleMainSeoFormComponent],
  template: `
    <nz-modal
      [(nzVisible)]="isVisible"
      [nzTitle]="modalTitle"
      [nzFooter]="modalFooter"
      (nzOnCancel)="handleCancel()"
      [nzWidth]="1200"
    >
      <ng-container *nzModalContent>
        <app-sample-main-seo-form
          #seoForm
          [loading]="isLoading"
          [initialData]="editingItem"
          (save)="handleSave($event)"
          (cancel)="handleCancel()"
        ></app-sample-main-seo-form>
      </ng-container>

      <ng-template #modalTitle>
        <span *ngIf="mode === 'add'"
          ><i nz-icon nzType="plus"></i> Новая запись sample-main-seo-modal.component.ts</span
        >
        <span *ngIf="mode === 'edit'"><i nz-icon nzType="edit"></i> Редактирование записи</span>
      </ng-template>

      <ng-template #modalFooter>
        <button nz-button nzType="default" (click)="handleCancel()">Отмена</button>
        <button nz-button nzType="primary" (click)="seoForm.submitForm()" [nzLoading]="isLoading">
          Сохранить
        </button>
      </ng-template>
    </nz-modal>
  `,
})
export class SampleMainSeoModalComponent implements OnInit {
  private state = inject(SampleMainSeoStateService);

  @ViewChild('seoForm') seoForm!: SampleMainSeoFormComponent;

  isVisible = false;
  mode: 'add' | 'edit' | 'view' = 'add';
  isLoading = false;
  editingItem: any = null;

  ngOnInit(): void {
    console.log('[ModalComponent] ngOnInit - инициализация');

    this.state.modalVisible$.subscribe((v) => {
      console.log('[ModalComponent] modalVisible изменено:', v);
      this.isVisible = v;
    });

    this.state.modalMode$.subscribe((m) => {
      console.log('[ModalComponent] modalMode изменено:', m);
      this.mode = m;
    });

    this.state.modalLoading$.subscribe((l) => {
      console.log('[ModalComponent] modalLoading изменено:', l);
      this.isLoading = l;
    });

    this.state.editingItem$.subscribe((item) => {
      console.log('[ModalComponent] editingItem изменено:', item);
      this.editingItem = item;
    });
  }

  handleCancel(): void {
    this.state.closeModal();
  }

  handleSave(formValue: any): void {
    this.state.save(formValue);
  }
}
