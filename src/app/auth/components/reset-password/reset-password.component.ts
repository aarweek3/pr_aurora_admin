// src/app/auth/components/reset-password/reset-password.component.ts
import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { PasswordService } from '../../services/password.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzCardModule,
    NzAlertModule,
  ],
  template: `
    <div class="reset-password-container">
      <nz-card class="reset-password-card">
        <h2>Новый пароль</h2>

        <nz-alert
          nzType="info"
          nzMessage="Требования к паролю:"
          nzDescription="Минимум 8 символов, заглавная буква, строчная буква и цифра"
          nzShowIcon
        ></nz-alert>

        <form nz-form [formGroup]="form" (ngSubmit)="onSubmit()">
          <nz-form-item>
            <nz-form-label [nzSpan]="24" nzRequired>Новый пароль</nz-form-label>
            <nz-form-control [nzSpan]="24" [nzErrorTip]="passwordError">
              <input
                nz-input
                formControlName="newPassword"
                type="password"
                placeholder="Введите новый пароль"
              />
            </nz-form-control>
            <ng-template #passwordError>
              <span *ngIf="form.get('newPassword')?.hasError('required')">Введите пароль</span>
              <span *ngIf="form.get('newPassword')?.hasError('minlength')">Минимум 8 символов</span>
              <span *ngIf="form.get('newPassword')?.hasError('pattern')"
                >Требования не соблюдены</span
              >
            </ng-template>
          </nz-form-item>

          <nz-form-item>
            <nz-form-label [nzSpan]="24" nzRequired>Подтвердите пароль</nz-form-label>
            <nz-form-control [nzSpan]="24" [nzErrorTip]="confirmError">
              <input
                nz-input
                formControlName="confirmPassword"
                type="password"
                placeholder="Повторите пароль"
              />
            </nz-form-control>
            <ng-template #confirmError>
              <span *ngIf="form.get('confirmPassword')?.hasError('required')"
                >Подтвердите пароль</span
              >
              <span *ngIf="form.get('confirmPassword')?.hasError('passwordMismatch')"
                >Пароли не совпадают</span
              >
            </ng-template>
          </nz-form-item>

          <nz-form-item>
            <nz-form-control [nzSpan]="24">
              <button
                nz-button
                nzType="primary"
                nzBlock
                [nzLoading]="loading"
                [disabled]="!form.valid"
              >
                Изменить пароль
              </button>
            </nz-form-control>
          </nz-form-item>
        </form>
      </nz-card>
    </div>
  `,
  styles: [
    `
      .reset-password-container {
        min-height: 100vh;
        display: flex;
        justify-content: center;
        align-items: center;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        padding: 20px;
      }

      .reset-password-card {
        width: 100%;
        max-width: 450px;
      }

      h2 {
        margin: 0 0 24px;
        text-align: center;
      }

      nz-alert {
        margin-bottom: 24px;
      }
    `,
  ],
})
export class ResetPasswordComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly passwordService = inject(PasswordService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly message = inject(NzMessageService);

  form: FormGroup;
  loading = false;
  token = '';
  email = '';

  constructor() {
    this.form = this.fb.group(
      {
        newPassword: [
          '',
          [
            Validators.required,
            Validators.minLength(8),
            Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/),
          ],
        ],
        confirmPassword: ['', Validators.required],
      },
      { validators: this.passwordMatchValidator },
    );
  }

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParams['token'] || '';
    this.email = this.route.snapshot.queryParams['email'] || '';

    if (!this.token || !this.email) {
      this.message.error('Неверная ссылка');
      this.router.navigate(['/auth/forgot-password']);
    }
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('newPassword')?.value;
    const confirm = control.get('confirmPassword')?.value;

    if (password !== confirm) {
      control.get('confirmPassword')?.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }

    return null;
  }

  onSubmit(): void {
    if (!this.form.valid) return;

    this.loading = true;
    this.passwordService
      .resetPassword({
        email: this.email,
        token: this.token,
        newPassword: this.form.value.newPassword,
      })
      .subscribe({
        next: () => {
          this.message.success('Пароль успешно изменен!');
          this.router.navigate(['/auth/login']);
        },
        error: (error) => {
          this.loading = false;
          this.message.error(error.error?.message || 'Ошибка при смене пароля');
        },
      });
  }
}
