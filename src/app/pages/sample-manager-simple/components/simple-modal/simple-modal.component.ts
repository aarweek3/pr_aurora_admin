import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzModalModule } from 'ng-zorro-antd/modal';
import {
  SampleSimpleCreateDto,
  SampleSimpleDto,
  SampleSimpleUpdateDto,
} from '../../models/sample-simple.model';

@Component({
  selector: 'app-simple-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzModalModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzAlertModule,
  ],
  template: `
    <nz-modal
      [nzVisible]="visible"
      [nzTitle]="title"
      [nzFooter]="modalFooter"
      (nzOnCancel)="cancel.emit()"
    >
      <ng-container *nzModalContent>
        <nz-alert
          *ngIf="error"
          nzType="error"
          [nzMessage]="error"
          nzShowIcon
          style="margin-bottom: 16px;"
        ></nz-alert>

        <form nz-form [formGroup]="form" (ngSubmit)="submit()">
          <nz-form-item>
            <nz-form-label [nzRequired]="true">Название</nz-form-label>
            <nz-form-control nzErrorTip="Введите название">
              <input
                nz-input
                formControlName="name"
                placeholder="Название..."
                [readonly]="mode === 'view'"
              />
            </nz-form-control>
          </nz-form-item>

          <nz-form-item>
            <nz-form-label>Описание</nz-form-label>
            <nz-form-control>
              <textarea
                nz-input
                formControlName="description"
                placeholder="Описание..."
                [nzAutosize]="{ minRows: 3 }"
                [readonly]="mode === 'view'"
              ></textarea>
            </nz-form-control>
          </nz-form-item>
        </form>
      </ng-container>

      <ng-template #modalFooter>
        <button nz-button nzType="default" (click)="cancel.emit()" [disabled]="loading">
          Закрыть
        </button>
        <button
          *ngIf="mode !== 'view'"
          nz-button
          nzType="primary"
          (click)="submit()"
          [nzLoading]="loading"
          [disabled]="form.invalid"
        >
          {{ mode === 'add' ? 'Создать' : 'Сохранить' }}
        </button>
      </ng-template>
    </nz-modal>
  `,
})
export class SimpleModalComponent implements OnChanges {
  @Input() visible = false;
  @Input() mode: 'add' | 'edit' | 'view' = 'add';
  @Input() item: SampleSimpleDto | null = null;
  @Input() loading = false;
  @Input() error: string | null = null;

  @Output() save = new EventEmitter<SampleSimpleCreateDto | SampleSimpleUpdateDto>();
  @Output() cancel = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  form: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    description: ['', [Validators.maxLength(1000)]],
  });

  get title(): string {
    if (this.mode === 'view') return 'Просмотр';
    return this.mode === 'add' ? 'Добавление' : 'Редактирование';
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible'] && this.visible) {
      if (this.mode !== 'add' && this.item) {
        this.form.patchValue(this.item);
      } else {
        this.form.reset();
      }
    }
  }

  submit(): void {
    if (this.form.valid) {
      const val = this.form.value;
      this.save.emit(this.mode === 'add' ? val : { ...val, id: this.item?.id });
    }
  }
}
