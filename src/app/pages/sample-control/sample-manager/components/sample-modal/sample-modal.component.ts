import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { LoggingService } from '@core/services/logging/logging.service';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { Subject, takeUntil } from 'rxjs';
import { SampleState } from '../../models/sample-state.model';
import {
  SampleCreateRequestDto,
  SampleDetailDto,
  SampleUpdateRequestDto,
} from '../../models/sample.dto';
import { SampleValidatorsService } from '../../services/sample-validators.service';
import { SampleService } from '../../services/sample.service';

@Component({
  selector: 'app-sample-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzModalModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
  ],
  template: `
    <nz-modal
      [nzVisible]="visible"
      [nzTitle]="mode === 'add' ? '��������' : '�������������'"
      [nzWidth]="600"
      [nzFooter]="null"
      (nzOnCancel)="onCancel()"
    >
      <ng-container *nzModalContent>
        <form nz-form [formGroup]="form" (ngSubmit)="onSubmit()">
          <nz-form-item>
            <nz-form-label [nzRequired]="true">��������</nz-form-label>
            <nz-form-control
              [nzErrorTip]="getNameErrorMessage()"
              [nzValidateStatus]="validators.getFieldValidateStatus(form.get('name'))"
            >
              <input
                nz-input
                formControlName="name"
                placeholder="������� ��������"
                [maxlength]="SampleValidatorsService.SAMPLE_NAME_MAX_LENGTH"
                (input)="onNameInput($event)"
                (blur)="onNameBlur()"
              />
              <div
                *ngIf="nameInputMessage"
                style="color: #ff4d4f; font-size: 12px; margin-top: 4px"
              >
                {{ nameInputMessage }}
              </div>
              <div
                *ngIf="currentServerError"
                style="
                  color: #ff4d4f;
                  font-size: 12px;
                  margin-top: 8px;
                  padding: 8px;
                  background-color: #fff1f0;
                  border: 1px solid #ff4d4f;
                  border-radius: 4px;
                  font-weight: 500;
                "
              >
                {{ currentServerError }}
              </div>
            </nz-form-control>
          </nz-form-item>
          <nz-form-item>
            <nz-form-label>��������</nz-form-label>
            <nz-form-control
              [nzErrorTip]="getDescriptionErrorMessage()"
              [nzValidateStatus]="validators.getFieldValidateStatus(form.get('description'))"
            >
              <textarea
                nz-input
                formControlName="description"
                placeholder="������� ��������"
                [nzAutosize]="{ minRows: 3, maxRows: 6 }"
                [maxlength]="SampleValidatorsService.SAMPLE_DESCRIPTION_MAX_LENGTH"
                (input)="onDescriptionInput($event)"
                (blur)="onDescriptionBlur()"
              ></textarea>
              <div
                *ngIf="descriptionInputMessage"
                style="color: #ff4d4f; font-size: 12px; margin-top: 4px"
              >
                {{ descriptionInputMessage }}
              </div>
            </nz-form-control>
          </nz-form-item>
          <nz-form-item style="margin-bottom: 0">
            <nz-form-control>
              <button
                nz-button
                nzType="default"
                style="margin-right: 8px"
                type="button"
                (click)="onCancel()"
                [disabled]="currentLoading"
              >
                ������
              </button>
              <button
                nz-button
                nzType="primary"
                type="submit"
                [disabled]="form.invalid || currentLoading"
                [nzLoading]="currentLoading"
              >
                {{ mode === 'add' ? '�������' : '���������' }}
              </button>
            </nz-form-control>
          </nz-form-item>
        </form>
      </ng-container>
    </nz-modal>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SampleModalComponent implements OnInit, OnChanges, OnDestroy {
  @Input() visible = false;
  @Input() mode: 'add' | 'edit' = 'add';
  @Input() sample: SampleDetailDto | null = null;

  @Output() save = new EventEmitter<{
    mode: 'add' | 'edit';
    sample: SampleCreateRequestDto | SampleUpdateRequestDto;
  }>();
  @Output() cancel = new EventEmitter<void>();

  form: FormGroup;
  nameInputMessage = '';
  descriptionInputMessage = '';
  currentLoading = false;
  currentServerError = '';

  private destroy$ = new Subject<void>();
  readonly SampleValidatorsService = SampleValidatorsService;
  public readonly validators = inject(SampleValidatorsService);
  private readonly fb = inject(FormBuilder);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly sampleService = inject(SampleService);
  private readonly logger = inject(LoggingService);

  constructor() {
    this.form = this.createForm();
  }

  ngOnInit(): void {
    this.logger.debug('SampleModalComponent', '������������� ����������');
    this.sampleService
      .getState()
      .pipe(takeUntil(this.destroy$))
      .subscribe((state: SampleState) => {
        this.logger.debug('SampleModalComponent', '�������� ��������� ��������', {
          modalIsLoading: state.modalIsLoading,
          modalOperation: state.modalOperation,
          modalError: state.modalError,
        });

        this.currentLoading = state.modalIsLoading;

        if (state.modalError) {
          this.currentServerError =
            state.modalError.detail || state.modalError.title || '��������� ������ ��� ����������';
          this.logger.error('SampleModalComponent', '������ �������', {
            error: this.currentServerError,
          });
        } else {
          this.currentServerError = '';
        }

        this.cdr.markForCheck();
      });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible'] && this.visible) {
      this.updateForm();
      this.currentServerError = '';
      this.cdr.markForCheck();
    }
    if (changes['visible'] && !this.visible) {
      this.resetComponentState();
    }
  }

  ngOnDestroy(): void {
    this.logger.debug('SampleModalComponent', '������� ��������');
    this.destroy$.next();
    this.destroy$.complete();
  }

  onNameInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value;
    this.nameInputMessage = this.validators.hasInvalidCharacters(value)
      ? '������ ������������ ������'
      : '';

    if (this.currentServerError) {
      this.currentServerError = '';
    }

    this.form.get('name')?.updateValueAndValidity();
    this.cdr.markForCheck();
  }

  onNameBlur(): void {
    const nameControl = this.form.get('name');
    if (nameControl) {
      nameControl.markAsTouched();
      this.validators.trimControlValue(nameControl);
    }
    this.cdr.markForCheck();
  }

  onDescriptionInput(event: Event): void {
    const input = event.target as HTMLTextAreaElement;
    const value = input.value;
    this.descriptionInputMessage =
      value.length > SampleValidatorsService.SAMPLE_DESCRIPTION_MAX_LENGTH
        ? `��������� ������������ ����� (${SampleValidatorsService.SAMPLE_DESCRIPTION_MAX_LENGTH} ��������)`
        : '';
    this.form.get('description')?.updateValueAndValidity();
    this.cdr.markForCheck();
  }

  onDescriptionBlur(): void {
    const descControl = this.form.get('description');
    if (descControl) {
      descControl.markAsTouched();
      this.validators.trimControlValue(descControl);
    }
    this.cdr.markForCheck();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      name: [
        '',
        [
          Validators.required,
          Validators.minLength(1),
          Validators.maxLength(SampleValidatorsService.SAMPLE_NAME_MAX_LENGTH),
          this.validators.sampleNameValidator(),
        ],
      ],
      description: [
        '',
        [
          Validators.maxLength(SampleValidatorsService.SAMPLE_DESCRIPTION_MAX_LENGTH),
          this.validators.sampleDescriptionValidator(),
        ],
      ],
    });
  }

  getNameErrorMessage(): string {
    const nameControl = this.form.get('name');
    if (!nameControl || !nameControl.errors || !nameControl.touched) {
      return '';
    }
    return this.validators.getSampleNameErrorMessage(nameControl.errors);
  }

  getDescriptionErrorMessage(): string {
    const descControl = this.form.get('description');
    if (!descControl || !descControl.errors || !descControl.touched) {
      return '';
    }
    return this.validators.getSampleDescriptionErrorMessage(descControl.errors);
  }

  private updateForm(): void {
    this.resetValidationMessages();
    if (this.mode === 'edit' && this.sample) {
      this.form.patchValue({
        name: this.sample.name || '',
        description: this.sample.description || '',
      });
    } else {
      this.form.reset();
    }
    this.cdr.markForCheck();
  }

  private resetValidationMessages(): void {
    this.nameInputMessage = '';
    this.descriptionInputMessage = '';
    this.currentServerError = '';
  }

  private resetComponentState(): void {
    this.form.reset();
    this.nameInputMessage = '';
    this.descriptionInputMessage = '';
    this.currentServerError = '';
  }

  onSubmit(): void {
    this.currentServerError = '';
    this.logger.debug('SampleModalComponent', '�������� �����');

    if (this.form.valid) {
      const formValue = this.form.value;
      const payload: SampleCreateRequestDto | SampleUpdateRequestDto =
        this.mode === 'add'
          ? {
              name: formValue.name?.trim(),
              description: formValue.description?.trim() || undefined,
            }
          : {
              id: this.sample!.id,
              name: formValue.name?.trim(),
              description: formValue.description?.trim() || undefined,
            };

      this.logger.debug('SampleModalComponent', '�������� ������', {
        payload,
      });
      this.save.emit({ mode: this.mode, sample: payload });
    } else {
      Object.keys(this.form.controls).forEach((key) => {
        const control = this.form.get(key);
        if (control && control.invalid) {
          control.markAsTouched();
        }
      });
      this.cdr.markForCheck();
    }
  }

  onCancel(): void {
    this.logger.debug('SampleModalComponent', '������ ��������');
    this.cancel.emit();
  }
}
