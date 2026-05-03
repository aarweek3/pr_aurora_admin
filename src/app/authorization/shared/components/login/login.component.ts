import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { AuthService } from '@auth/services/auth.service';


/**
 * Login Component
 *
 * Форма входа в систему.
 */
@Component({
  selector: 'av-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <div class="login-container">
      <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
        <h2>Вход в систему</h2>
        <input formControlName="email" type="email" placeholder="Email" />
        <input formControlName="password" type="password" placeholder="Пароль" />
        <button type="submit" [disabled]="isLoading()">Войти</button>
      </form>
    </div>
  `,
  styles: [`
    .login-container { max-width: 400px; margin: 100px auto; padding: 20px; border: 1px solid #ddd; }
    input { display: block; width: 100%; margin-bottom: 10px; padding: 8px; }
    button { width: 100%; padding: 10px; background: #1890ff; color: white; border: none; cursor: pointer; }
    button:disabled { background: #ccc; }
  `]
})
export class AuthSharedLoginComponent {

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);

  private router = inject(Router);
  private message = inject(NzMessageService);

  isLoading = signal(false);

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading.set(true);
      const { email, password } = this.loginForm.value;

      this.authService.login({ email: email!, password: password! }).subscribe({
        next: (response: any) => {

          if (response.success) {
            this.message.success('Вход выполнен успешно');
            this.router.navigate(['/']);
          } else {
            this.message.error(response.message || 'Ошибка входа');
          }
          this.isLoading.set(false);
        },
        error: () => {
          this.message.error('Ошибка сети или сервера');
          this.isLoading.set(false);
        }
      });
    }
  }
}
