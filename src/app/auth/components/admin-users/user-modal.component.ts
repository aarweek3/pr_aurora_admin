// src/app/auth/components/admin-users/user-modal.component.ts
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { CreateUserDto, UpdateUserDto, UserDetailDto, UserModalMode } from '../../models';

@Component({
  selector: 'app-user-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzModalModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzSwitchModule,
    NzDescriptionsModule,
  ],
  template: `
    <nz-modal
      [(nzVisible)]="isVisible"
      [nzTitle]="getTitle()"
      [nzFooter]="mode === 'view' ? viewFooter : editFooter"
      (nzOnCancel)="handleCancel()"
      [nzWidth]="600"
    >
      <ng-container *nzModalContent>
        <!-- VIEW MODE -->
        <nz-descriptions *ngIf="mode === 'view' && user" nzBordered [nzColumn]="1">
          <nz-descriptions-item nzTitle="Email">{{ user.email }}</nz-descriptions-item>
          <nz-descriptions-item nzTitle="Имя">{{ user.firstName }}</nz-descriptions-item>
          <nz-descriptions-item nzTitle="Фамилия">{{ user.lastName }}</nz-descriptions-item>
          <nz-descriptions-item nzTitle="Отдел">{{
            user.department || 'Не указан'
          }}</nz-descriptions-item>
          <nz-descriptions-item nzTitle="Статус">
            <span [style.color]="user.isActive ? 'green' : 'red'">
              {{ user.isActive ? 'Активен' : 'Неактивен' }}
            </span>
          </nz-descriptions-item>
          <nz-descriptions-item nzTitle="Дата создания">
            {{ user.createdAt | date : 'medium' }}
          </nz-descriptions-item>
          <nz-descriptions-item nzTitle="Последний вход">
            {{ user.lastLogin ? (user.lastLogin | date : 'medium') : 'Никогда' }}
          </nz-descriptions-item>
          <nz-descriptions-item nzTitle="Внешний аккаунт">
            {{ user.isExternalAccount ? 'Да (' + user.externalProvider + ')' : 'Нет' }}
          </nz-descriptions-item>
        </nz-descriptions>

        <!-- CREATE/EDIT MODE -->
        <form *ngIf="mode !== 'view'" nz-form [formGroup]="form" (ngSubmit)="handleSubmit()">
          <nz-form-item>
            <nz-form-label [nzSpan]="24" nzRequired>Имя</nz-form-label>
            <nz-form-control [nzSpan]="24" nzErrorTip="Пожалуйста, введите имя">
              <input nz-input formControlName="firstName" placeholder="Введите имя" />
            </nz-form-control>
          </nz-form-item>

          <nz-form-item>
            <nz-form-label [nzSpan]="24" nzRequired>Фамилия</nz-form-label>
            <nz-form-control [nzSpan]="24" nzErrorTip="Пожалуйста, введите фамилию">
              <input nz-input formControlName="lastName" placeholder="Введите фамилию" />
            </nz-form-control>
          </nz-form-item>

          <nz-form-item *ngIf="mode === 'create'">
            <nz-form-label [nzSpan]="24" nzRequired>Email</nz-form-label>
            <nz-form-control [nzSpan]="24" nzErrorTip="Пожалуйста, введите корректный email">
              <input nz-input formControlName="email" type="email" placeholder="user@example.com" />
            </nz-form-control>
          </nz-form-item>

          <nz-form-item *ngIf="mode === 'create'">
            <nz-form-label [nzSpan]="24" nzRequired>Пароль</nz-form-label>
            <nz-form-control [nzSpan]="24" nzErrorTip="Пароль должен быть не менее 6 символов">
              <input
                nz-input
                formControlName="password"
                type="password"
                placeholder="Минимум 6 символов"
              />
            </nz-form-control>
          </nz-form-item>

          <nz-form-item>
            <nz-form-label [nzSpan]="24">Отдел</nz-form-label>
            <nz-form-control [nzSpan]="24">
              <input nz-input formControlName="department" placeholder="Например: IT, HR, Sales" />
            </nz-form-control>
          </nz-form-item>

          <nz-form-item *ngIf="mode === 'create'">
            <nz-form-label [nzSpan]="24">Активный</nz-form-label>
            <nz-form-control [nzSpan]="24">
              <nz-switch formControlName="isActive"></nz-switch>
            </nz-form-control>
          </nz-form-item>
        </form>
      </ng-container>

      <!-- View Footer -->
      <ng-template #viewFooter>
        <button nz-button nzType="default" (click)="handleCancel()">Закрыть</button>
        <button nz-button nzType="primary" (click)="switchToEdit()">Редактировать</button>
      </ng-template>

      <!-- Edit Footer -->
      <ng-template #editFooter>
        <button nz-button nzType="default" (click)="handleCancel()">Отмена</button>
        <button nz-button nzType="primary" (click)="handleSubmit()" [disabled]="!form.valid">
          {{ mode === 'create' ? 'Создать' : 'Сохранить' }}
        </button>
      </ng-template>
    </nz-modal>
  `,
})
export class UserModalComponent {
  @Output() userCreated = new EventEmitter<CreateUserDto>();
  @Output() userUpdated = new EventEmitter<{ id: string; data: UpdateUserDto }>();
  @Output() cancelled = new EventEmitter<void>();

  isVisible = false;
  mode: UserModalMode = 'create';
  user?: UserDetailDto;
  form: FormGroup;

  constructor(private fb: FormBuilder) {
    this.form = this.createForm();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      department: [''],
      isActive: [true],
    });
  }

  getTitle(): string {
    switch (this.mode) {
      case 'create':
        return 'Создать нового пользователя';
      case 'edit':
        return 'Редактировать пользователя';
      case 'view':
        return 'Информация о пользователе';
      default:
        return '';
    }
  }

  show(mode: UserModalMode, user?: UserDetailDto): void {
    this.mode = mode;
    this.user = user;
    this.isVisible = true;

    if (mode === 'create') {
      this.form.reset({ isActive: true });
      this.setValidators(true);
    } else if (mode === 'edit' && user) {
      this.form.patchValue({
        firstName: user.firstName,
        lastName: user.lastName,
        department: user.department,
      });
      this.setValidators(false);
    }
  }

  private setValidators(isCreate: boolean): void {
    const emailControl = this.form.get('email');
    const passwordControl = this.form.get('password');

    if (isCreate) {
      emailControl?.setValidators([Validators.required, Validators.email]);
      passwordControl?.setValidators([Validators.required, Validators.minLength(6)]);
    } else {
      emailControl?.clearValidators();
      passwordControl?.clearValidators();
    }

    emailControl?.updateValueAndValidity();
    passwordControl?.updateValueAndValidity();
  }

  switchToEdit(): void {
    this.mode = 'edit';
    if (this.user) {
      this.show('edit', this.user);
    }
  }

  handleCancel(): void {
    this.isVisible = false;
    this.cancelled.emit();
  }

  handleSubmit(): void {
    if (!this.form.valid) return;

    if (this.mode === 'create') {
      this.userCreated.emit(this.form.value);
    } else if (this.mode === 'edit' && this.user) {
      const updateData: UpdateUserDto = {
        firstName: this.form.value.firstName,
        lastName: this.form.value.lastName,
        department: this.form.value.department,
      };
      this.userUpdated.emit({ id: this.user.id, data: updateData });
    }

    this.isVisible = false;
  }
}
