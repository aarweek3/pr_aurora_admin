// src/app/auth/components/login/login.component.ts
import { CommonModule } from '@angular/common';
import { Component, OnInit, effect, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ApiEndpoints } from '@environments/api-endpoints';
import { LoggerConsoleService } from '@shared/logger-console/services/logger-console.service';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzCardModule,
    NzCheckboxModule,
    NzIconModule,
  ],
  template: `
    <div class="login-container">
      <nz-card nzTitle="Вход в систему" style="width: 400px;">
        <form nz-form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
          <nz-form-item>
            <nz-form-label nzRequired>Email</nz-form-label>
            <nz-form-control
              [nzValidateStatus]="getFieldValidateStatus('email')"
              [nzErrorTip]="getFieldErrorTip('email')"
            >
              <input
                nz-input
                formControlName="email"
                type="email"
                placeholder="Введите ваш email"
              />
            </nz-form-control>
          </nz-form-item>

          <nz-form-item>
            <nz-form-label nzRequired>Пароль</nz-form-label>
            <nz-form-control
              [nzValidateStatus]="getFieldValidateStatus('password')"
              [nzErrorTip]="getFieldErrorTip('password')"
            >
              <nz-input-group [nzSuffix]="suffixTemplate">
                <input
                  nz-input
                  formControlName="password"
                  [type]="passwordVisible() ? 'text' : 'password'"
                  placeholder="Введите пароль"
                />
              </nz-input-group>
              <ng-template #suffixTemplate>
                <span
                  nz-icon
                  [nzType]="passwordVisible() ? 'eye-invisible' : 'eye'"
                  (click)="togglePasswordVisibility()"
                ></span>
              </ng-template>
            </nz-form-control>
          </nz-form-item>

          <nz-form-item>
            <nz-form-control>
              <div style="display: flex; justify-content: space-between;">
                <label nz-checkbox formControlName="rememberMe">Запомнить меня</label>
                <a [routerLink]="['/auth/forgot-password']">Забыли пароль?</a>
              </div>
            </nz-form-control>
          </nz-form-item>

          <nz-form-item>
            <nz-form-control>
              <button nz-button nzType="primary" nzBlock [nzLoading]="isLoading()" type="submit">
                Войти
              </button>
            </nz-form-control>
          </nz-form-item>

          <nz-form-item>
            <nz-form-control>
              <button
                nz-button
                nzType="default"
                nzBlock
                (click)="loginWithGoogle()"
                type="button"
                style="display: flex; align-items: center; justify-content: center; gap: 8px;"
              >
                <span nz-icon nzType="google" nzTheme="outline"></span>
                Войти через Google
              </button>
            </nz-form-control>
          </nz-form-item>

          <nz-form-item>
            <nz-form-control>
              <div style="text-align: center;">
                Нет аккаунта?
                <a [routerLink]="['/auth/register']">Зарегистрироваться</a>
              </div>
            </nz-form-control>
          </nz-form-item>
        </form>
      </nz-card>
    </div>
  `,
  styles: [
    `
      .login-container {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 100vh;
      }
    `,
  ],
})
export class LoginComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);
  private message = inject(NzMessageService);
  private logger = inject(LoggerConsoleService).getLogger('LoginComponent');
  private loggerConsole = inject(LoggerConsoleService);

  public isLoading = signal<boolean>(false);
  public passwordVisible = signal<boolean>(false);

  public loginForm: FormGroup;
  private returnUrl?: string;
  private readonly context = 'LoginComponent';

  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false],
    });

    this.loggerConsole.trackSignal(this.isLoading, 'Login_Loading');

    effect(() => {
      const loading = this.isLoading();
      if (loading) {
        this.loginForm.disable();
      } else {
        this.loginForm.enable();
      }
    });
  }

  ngOnInit(): void {
    this.logger.debug('Инициализация компонента входа');
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'];
    this.setDevelopmentCredentials();
  }

  private setDevelopmentCredentials(): void {
    if (this.isDevelopmentMode()) {
      this.loginForm.patchValue({
        email: 'admin@example.com',
        password: 'Admin123!',
        rememberMe: true,
      });
    }
  }

  private isDevelopmentMode(): boolean {
    return (
      !location.hostname.includes('production') &&
      (location.hostname === 'localhost' || location.hostname === '127.0.0.1')
    );
  }

  togglePasswordVisibility(): void {
    this.passwordVisible.set(!this.passwordVisible());
  }

  onSubmit(): void {
    if (!this.loginForm.valid || this.isLoading()) {
      // ... (existing code)
      this.markFormGroupTouched();
      return;
    }
    // ... (rest of onSubmit)
    this.isLoading.set(true);
    const formValue = this.loginForm.getRawValue();

    this.logger.debug('Начало процесса входа', {
      email: formValue.email,
      rememberMe: formValue.rememberMe,
    });

    this.authService
      .login({
        email: formValue.email,
        password: formValue.password,
      })
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.handleLoginSuccess();
          } else {
            this.handleLoginError(response.message || 'Ошибка входа');
          }
        },
        error: (error) => {
          this.handleLoginError(
            error?.error?.message || error?.message || 'Произошла ошибка при входе',
          );
        },
      });
  }

  loginWithGoogle(): void {
    this.logger.info('Запуск входа через Google');
    window.location.href = ApiEndpoints.AUTH.EXTERNAL_LOGIN('Google');
  }

  private handleLoginSuccess(): void {
    this.logger.info('Успешный вход в систему');
    this.message.success('Добро пожаловать!');

    setTimeout(() => {
      this.authService.redirectAfterLogin(this.returnUrl);
      this.isLoading.set(false);
    }, 500);
  }

  private handleLoginError(errorMessage: string): void {
    this.logger.error('Ошибка входа', { error: errorMessage });
    this.isLoading.set(false);

    const userFriendlyMessage = this.getUserFriendlyErrorMessage(errorMessage);
    this.message.error(userFriendlyMessage);
  }

  private getUserFriendlyErrorMessage(errorMessage: string): string {
    const lowerMessage = errorMessage.toLowerCase();

    if (
      lowerMessage.includes('invalid credentials') ||
      lowerMessage.includes('неверные учетные данные') ||
      lowerMessage.includes('wrong password') ||
      lowerMessage.includes('user not found')
    ) {
      return 'Неверный email или пароль';
    }

    if (lowerMessage.includes('account locked') || lowerMessage.includes('аккаунт заблокирован')) {
      return 'Аккаунт временно заблокирован';
    }

    if (
      lowerMessage.includes('network') ||
      lowerMessage.includes('connection') ||
      lowerMessage.includes('сеть')
    ) {
      return 'Проблемы с подключением к серверу';
    }

    return 'Произошла ошибка при входе. Попробуйте еще раз.';
  }

  private markFormGroupTouched(): void {
    Object.keys(this.loginForm.controls).forEach((key) => {
      const control = this.loginForm.get(key);
      if (control) {
        control.markAsTouched();
        control.updateValueAndValidity();
      }
    });
  }

  getFieldValidateStatus(fieldName: string): string {
    const field = this.loginForm.get(fieldName);
    if (!field) return '';

    if (field.invalid && field.touched) {
      return 'error';
    } else if (field.valid && field.touched) {
      return 'success';
    }
    return '';
  }

  getFieldErrorTip(fieldName: string): string {
    const field = this.loginForm.get(fieldName);
    if (!field || !field.errors || !field.touched) {
      return '';
    }

    const errors = field.errors;

    if (errors['required']) {
      return fieldName === 'email' ? 'Введите email' : 'Введите пароль';
    }

    if (errors['email']) {
      return 'Введите корректный email';
    }

    if (errors['minlength']) {
      return `Минимум ${errors['minlength'].requiredLength} символов`;
    }

    return 'Неверный формат';
  }
}
