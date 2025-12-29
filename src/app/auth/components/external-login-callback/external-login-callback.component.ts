import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LoggerConsoleService } from '@shared/logger-console/services/logger-console.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-external-login-callback',
  standalone: true,
  imports: [CommonModule, NzSpinModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="callback-container">
      <div class="loading-content">
        <div class="spinner-wrapper">
          <nz-spin nzSize="large"></nz-spin>
        </div>
        <div class="text-content">
          <h2 class="title">Авторизация...</h2>
          <p class="subtitle">Пожалуйста, подождите, мы проверяем ваши данные.</p>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .callback-container {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 100vh;
        background-color: var(--background-default, #f0f2f5);
        padding: 20px;
      }

      .loading-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 48px 64px;
        background: #ffffff;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08); /* $shadow-md approximate */
        text-align: center;
        max-width: 400px;
        width: 100%;
        animation: fadeIn 0.3s ease-out;
      }

      .spinner-wrapper {
        margin-bottom: 24px;
        transform: scale(1.2);
      }

      .text-content {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .title {
        font-size: 20px; /* $font-size-xl */
        font-weight: 600; /* $font-weight-semibold */
        color: rgba(0, 0, 0, 0.85); /* $color-text-primary */
        margin: 0;
      }

      .subtitle {
        font-size: 14px; /* $font-size-base */
        color: rgba(0, 0, 0, 0.45); /* $color-text-tertiary */
        margin: 0;
        line-height: 1.5;
      }

      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      /* Dark theme support (basic) */
      :host-context([data-theme='dark']) .callback-container {
        background-color: #141414; /* $dark-bg-base */
      }

      :host-context([data-theme='dark']) .loading-content {
        background: #1f1f1f; /* $dark-bg-light */
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
      }

      :host-context([data-theme='dark']) .title {
        color: rgba(255, 255, 255, 0.85); /* $dark-text-primary */
      }

      :host-context([data-theme='dark']) .subtitle {
        color: rgba(255, 255, 255, 0.45); /* $dark-text-tertiary */
      }
    `,
  ],
})
export class ExternalLoginCallbackComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly message = inject(NzMessageService);
  private readonly logger = inject(LoggerConsoleService).getLogger('ExternalLoginCallback');

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token');
    const refreshToken = this.route.snapshot.queryParamMap.get('refresh');

    if (token) {
      this.handleSuccess(token, refreshToken);
    } else {
      this.handleError();
    }
  }

  private handleSuccess(token: string, refreshToken: string | null): void {
    this.logger.info('Токен получен, сохранение сессии');

    // Сохраняем токены
    this.authService.setSession(token, refreshToken || '');

    this.message.success('Вход выполнен успешно!');
    this.router.navigate(['/']);
  }

  private handleError(): void {
    this.logger.error('Токен не найден в URL параметрах');
    this.message.error('Ошибка входа через внешний сервис');
    this.router.navigate(['/auth/login']);
  }
}
