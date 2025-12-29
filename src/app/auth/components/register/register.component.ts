// src/app/auth/components/register/register.component.ts
import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { LoggerConsoleService } from '@shared/logger-console/services/logger-console.service';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Subject, takeUntil } from 'rxjs';
import { RegisterDto } from '../../models';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzCardModule,
    NzIconModule,
  ],
  template: `
    <div class="register-container">
      <nz-card class="register-card" [nzTitle]="'Регистрация'">
        <form nz-form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
          <nz-form-item>
            <nz-form-label [nzRequired]="true">Имя</nz-form-label>
            <nz-form-control [nzErrorTip]="firstNameErrorTpl">
              <input nz-input formControlName="firstName" placeholder="Введите имя" />
              <ng-template #firstNameErrorTpl let-control>
                <ng-container *ngIf="control.hasError('required')"> Имя обязательно </ng-container>
                <ng-container *ngIf="control.hasError('minlength')">
                  Минимум 2 символа
                </ng-container>
              </ng-template>
            </nz-form-control>
          </nz-form-item>

          <nz-form-item>
            <nz-form-label [nzRequired]="true">Фамилия</nz-form-label>
            <nz-form-control [nzErrorTip]="lastNameErrorTpl">
              <input nz-input formControlName="lastName" placeholder="Введите фамилию" />
              <ng-template #lastNameErrorTpl let-control>
                <ng-container *ngIf="control.hasError('required')">
                  Фамилия обязательна
                </ng-container>
                <ng-container *ngIf="control.hasError('minlength')">
                  Минимум 2 символа
                </ng-container>
              </ng-template>
            </nz-form-control>
          </nz-form-item>

          <nz-form-item>
            <nz-form-label [nzRequired]="true">Email</nz-form-label>
            <nz-form-control [nzErrorTip]="emailErrorTpl">
              <input nz-input formControlName="email" placeholder="Введите email" type="email" />
              <ng-template #emailErrorTpl let-control>
                <ng-container *ngIf="control.hasError('required')"> Email обязателен </ng-container>
                <ng-container *ngIf="control.hasError('email')"> Некорректный email </ng-container>
              </ng-template>
            </nz-form-control>
          </nz-form-item>

          <nz-form-item>
            <nz-form-label [nzRequired]="true">Пароль</nz-form-label>
            <nz-form-control [nzErrorTip]="passwordErrorTpl">
              <nz-input-group [nzSuffix]="suffixTemplate">
                <input
                  nz-input
                  formControlName="password"
                  placeholder="Введите пароль"
                  [type]="passwordVisible ? 'text' : 'password'"
                />
              </nz-input-group>
              <ng-template #suffixTemplate>
                <span
                  nz-icon
                  [nzType]="passwordVisible ? 'eye-invisible' : 'eye'"
                  (click)="passwordVisible = !passwordVisible"
                  class="password-toggle-icon"
                ></span>
              </ng-template>
              <ng-template #passwordErrorTpl let-control>
                <ng-container *ngIf="control.hasError('required')">
                  Пароль обязателен
                </ng-container>
                <ng-container *ngIf="control.hasError('minlength')">
                  Минимум 6 символов
                </ng-container>
              </ng-template>
            </nz-form-control>
          </nz-form-item>

          <nz-form-item>
            <button
              nz-button
              nzType="primary"
              nzBlock
              [nzLoading]="loading"
              [disabled]="registerForm.invalid"
              type="submit"
            >
              Зарегистрироваться
            </button>
          </nz-form-item>

          <div class="links">
            <a routerLink="/auth/login">Уже есть аккаунт? Войти</a>
          </div>
        </form>
      </nz-card>
    </div>
  `,
  styles: [
    `
      .register-container {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 100vh;
        background: #f0f2f5;
        padding: 20px;
      }

      .register-card {
        width: 400px;
        max-width: 100%;
      }

      .links {
        display: flex;
        justify-content: center;
        margin-top: 16px;
      }

      nz-form-item {
        margin-bottom: 24px;
      }

      .password-toggle-icon {
        cursor: pointer;
        color: rgba(0, 0, 0, 0.45);
        transition: color 0.3s;
      }

      .password-toggle-icon:hover {
        color: rgba(0, 0, 0, 0.85);
      }
    `,
  ],
})
export class RegisterComponent implements OnDestroy {
  private readonly destroy$ = new Subject<void>();
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly message = inject(NzMessageService);
  private readonly logger = inject(LoggerConsoleService).getLogger('Register');

  registerForm: FormGroup;
  loading = false;
  passwordVisible = false;

  constructor() {
    this.logger.info('Инициализация компонента регистрации');

    this.registerForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });

    this.logger.debug('Форма регистрации создана', {
      formControls: Object.keys(this.registerForm.controls),
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.logger.warn('Попытка отправки невалидной формы');
      Object.values(this.registerForm.controls).forEach((control) => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
      return;
    }

    const registerData: RegisterDto = this.registerForm.value;

    this.logger.info('Начало процесса регистрации', {
      email: registerData.email,
      firstName: registerData.firstName,
      lastName: registerData.lastName,
    });

    this.loading = true;

    this.authService
      .register(registerData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.logger.info('Успешная регистрация', {
            email: registerData.email,
            userId: response.data?.user?.email,
          });

          this.message.success('Регистрация успешна! Добро пожаловать!');

          this.logger.debug('RegisterComponent', 'Переход на админ-панель');
          this.router.navigate(['/admin/dashboard']);
        },
        error: (error) => {
          this.logger.error('Ошибка регистрации', {
            email: registerData.email,
            error: error,
          });

          this.loading = false;
          const errorMessage = error?.error?.message || error?.message || 'Ошибка регистрации';
          this.message.error(errorMessage);
        },
        complete: () => {
          this.loading = false;
          this.logger.debug('Процесс регистрации завершен');
        },
      });
  }
}
