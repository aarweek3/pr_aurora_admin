// src/app/auth/components/forgot-password/forgot-password.component.ts
import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { LoggerConsoleService } from '@shared/logger-console/services/logger-console.service';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { PasswordService } from '../../services/password.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzCardModule,
    NzAlertModule,
  ],
  template: `
    <div class="forgot-password-container">
      <nz-card class="forgot-password-card">
        <h2>Восстановление пароля</h2>

        <nz-alert
          *ngIf="!emailSent"
          nzType="info"
          nzMessage="Введите ваш email"
          nzDescription="Мы отправим инструкции для восстановления пароля"
          nzShowIcon
        ></nz-alert>

        <nz-alert
          *ngIf="emailSent"
          nzType="success"
          nzMessage="Письмо отправлено!"
          nzDescription="Проверьте почту для получения инструкций"
          nzShowIcon
        ></nz-alert>

        <form *ngIf="!emailSent" nz-form [formGroup]="form" (ngSubmit)="onSubmit()">
          <nz-form-item>
            <nz-form-label [nzSpan]="24" nzRequired>Email</nz-form-label>
            <nz-form-control [nzSpan]="24" nzErrorTip="Введите корректный email">
              <input nz-input formControlName="email" type="email" placeholder="your@email.com" />
            </nz-form-control>
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
                Отправить
              </button>
            </nz-form-control>
          </nz-form-item>

          <div class="links">
            <a routerLink="/auth/login">Вернуться к входу</a>
          </div>
        </form>

        <div *ngIf="emailSent" class="actions">
          <button nz-button nzBlock routerLink="/auth/login">Войти</button>
          <button nz-button nzType="link" nzBlock (click)="emailSent = false">
            Отправить повторно
          </button>
        </div>
      </nz-card>
    </div>
  `,
  styles: [
    `
      .forgot-password-container {
        min-height: 100vh;
        display: flex;
        justify-content: center;
        align-items: center;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        padding: 20px;
      }

      .forgot-password-card {
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

      .links {
        text-align: center;
        margin-top: 16px;
      }

      .actions {
        display: flex;
        flex-direction: column;
        gap: 12px;
        margin-top: 24px;
      }
    `,
  ],
})
export class ForgotPasswordComponent {
  private readonly fb = inject(FormBuilder);
  private readonly passwordService = inject(PasswordService);
  private readonly message = inject(NzMessageService);
  private readonly logger = inject(LoggerConsoleService).getLogger('ForgotPassword');

  form: FormGroup;
  loading = true; // Temporary set to false in constructor, but let's fix the logic
  emailSent = false;

  constructor() {
    this.loading = false;
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  onSubmit(): void {
    if (!this.form.valid) return;

    this.loading = true;
    this.logger.info('Запрос на восстановление пароля', { email: this.form.value.email });

    this.passwordService.forgotPassword(this.form.value).subscribe({
      next: (response: any) => {
        this.emailSent = true;
        this.loading = false;
        this.logger.info('Инструкции отправлены на email');

        if (response.debugToken) {
          console.log(
            'Reset URL:',
            `/auth/reset-password?email=${response.debugEmail}&token=${encodeURIComponent(
              response.debugToken,
            )}`,
          );
        }
      },
      error: (err) => {
        this.loading = false;
        this.logger.error('Ошибка восстановления пароля', err);
        this.message.error('Ошибка при отправке запроса');
      },
    });
  }
}
