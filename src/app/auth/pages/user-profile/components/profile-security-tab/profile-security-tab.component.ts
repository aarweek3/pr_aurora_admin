import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'app-profile-security-tab',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzIconModule,
    NzDividerModule,
    NzTypographyModule,
    NzCardModule,
    NzPopconfirmModule,
  ],
  template: `
    <div class="security-tab">
      <h3 nz-typography>Безопасность</h3>
      <p nz-typography nzType="secondary">Управление паролем и привязками аккаунтов.</p>

      <nz-divider></nz-divider>

      <div class="security-sections">
        <!-- Смена пароля -->
        <nz-card nzTitle="Смена пароля" [nzBordered]="true" class="security-card">
          <form
            nz-form
            [formGroup]="passwordForm"
            (ngSubmit)="submitPassword()"
            nzLayout="vertical"
          >
            <nz-form-item>
              <nz-form-label nzRequired>Текущий пароль</nz-form-label>
              <nz-form-control nzErrorTip="Пожалуйста, введите текущий пароль">
                <nz-input-group [nzPrefix]="prefixLock">
                  <input nz-input type="password" formControlName="currentPassword" />
                </nz-input-group>
              </nz-form-control>
            </nz-form-item>

            <nz-form-item>
              <nz-form-label nzRequired>Новый пароль</nz-form-label>
              <nz-form-control nzErrorTip="Пароль должен быть не менее 8 символов">
                <nz-input-group [nzPrefix]="prefixLock">
                  <input nz-input type="password" formControlName="newPassword" />
                </nz-input-group>
              </nz-form-control>
            </nz-form-item>

            <nz-form-item>
              <nz-form-label nzRequired>Подтверждение пароля</nz-form-label>
              <nz-form-control [nzErrorTip]="passwordErrorTpl">
                <nz-input-group [nzPrefix]="prefixLock">
                  <input nz-input type="password" formControlName="confirmPassword" />
                </nz-input-group>
                <ng-template #passwordErrorTpl let-control>
                  @if (control.hasError('required')) { Пожалуйста, подтвердите пароль } @if
                  (control.hasError('confirm')) { Пароли не совпадают }
                </ng-template>
              </nz-form-control>
            </nz-form-item>

            <button nz-button nzType="primary" [nzLoading]="changingPassword()">
              Обновить пароль
            </button>
          </form>
        </nz-card>

        <!-- Внешние аккаунты -->
        <nz-card nzTitle="Внешние аккаунты" [nzBordered]="true" class="security-card">
          <div class="external-accounts">
            <div class="provider-item">
              <div class="provider-info">
                <i nz-icon nzType="google" style="color: #de5246; font-size: 24px;"></i>
                <div class="provider-text">
                  <span class="provider-name">Google</span>
                  <span class="provider-status">
                    @if (user()?.externalProvider?.toLowerCase() === 'google') {
                    <nz-typography nzType="success">Подключено ({{ user()?.email }})</nz-typography>
                    } @else {
                    <nz-typography nzType="secondary">Не подключено</nz-typography>
                    }
                  </span>
                </div>
              </div>
              @if (user()?.externalProvider?.toLowerCase() === 'google') {
              <button
                nz-button
                nzDanger
                nz-popconfirm
                nzPopconfirmTitle="Вы уверены, что хотите отвязать аккаунт Google?"
                (nzOnConfirm)="unlink('google')"
              >
                Отвязать
              </button>
              }
            </div>

            <!-- Можно добавить другие провайдеры -->
          </div>
        </nz-card>
      </div>

      <ng-template #prefixLock><i nz-icon nzType="lock"></i></ng-template>
    </div>
  `,
  styles: [
    `
      .security-tab {
        padding: 8px;
      }

      .security-sections {
        display: flex;
        flex-direction: column;
        gap: 24px;
        max-width: 600px;
      }

      .security-card {
        border-radius: 8px;
      }

      .external-accounts {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .provider-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px;
        border: 1px solid #f0f0f0;
        border-radius: 8px;
        transition: background 0.3s;
      }

      .provider-item:hover {
        background: #fafafa;
      }

      .provider-info {
        display: flex;
        align-items: center;
        gap: 16px;
      }

      .provider-text {
        display: flex;
        flex-direction: column;
      }

      .provider-name {
        font-weight: 500;
        font-size: 16px;
      }

      .provider-status {
        font-size: 12px;
      }
    `,
  ],
})
export class ProfileSecurityTabComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private message = inject(NzMessageService);

  user = computed(() => this.authService.getCurrentUser());
  changingPassword = signal<boolean>(false);

  passwordForm!: FormGroup;

  ngOnInit(): void {
    this.passwordForm = this.fb.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required, this.confirmationValidator]],
    });
  }

  confirmationValidator = (control: any): { [s: string]: boolean } => {
    if (!this.passwordForm) return {};
    if (!control.value) {
      return { required: true };
    } else if (control.value !== this.passwordForm.controls['newPassword'].value) {
      return { confirm: true, error: true };
    }
    return {};
  };

  submitPassword(): void {
    if (this.passwordForm.valid) {
      this.changingPassword.set(true);
      this.authService.changePassword(this.passwordForm.value).subscribe({
        next: () => {
          this.message.success('Пароль успешно изменен');
          this.passwordForm.reset();
          this.changingPassword.set(false);
        },
        error: (err) => {
          this.message.error(err.error?.message || 'Ошибка при смене пароля');
          this.changingPassword.set(false);
        },
      });
    } else {
      Object.values(this.passwordForm.controls).forEach((control) => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
  }

  unlink(provider: string): void {
    this.authService.unlinkExternal(provider).subscribe({
      next: () => {
        this.message.success(`Аккаунт ${provider} успешно отвязан`);
      },
      error: (err) => {
        this.message.error(err.error?.message || 'Ошибка при отвязке аккаунта');
      },
    });
  }
}
