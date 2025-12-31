import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { NzUploadFile, NzUploadModule } from 'ng-zorro-antd/upload';
import { ApiEndpoints } from '../../../../../../environments/api-endpoints';
import { AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'app-profile-general-tab',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzAvatarModule,
    NzIconModule,
    NzUploadModule,
    NzDividerModule,
    NzTagModule,
    NzTypographyModule,
  ],
  template: `
    <div class="general-tab">
      <h3 nz-typography>Общая информация</h3>
      <p nz-typography nzType="secondary">Обновите ваши личные данные и аватар.</p>

      <nz-divider></nz-divider>

      <div class="profile-layout">
        <!-- Аватар секция -->
        <div class="avatar-section">
          <div class="avatar-wrapper">
            <nz-avatar
              [nzSize]="128"
              [nzSrc]="previewImage() || user()?.avatar || ''"
              [nzText]="userInitials()"
              class="profile-avatar"
            >
            </nz-avatar>
            <div class="avatar-overlay">
              <nz-upload
                [nzAction]="uploadUrl"
                [nzShowUploadList]="false"
                [nzBeforeUpload]="beforeUpload"
                (nzChange)="handleAvatarChange($event)"
              >
                <button nz-button nzType="text" class="change-btn">
                  <i nz-icon nzType="camera"></i>
                </button>
              </nz-upload>
            </div>
          </div>
          <div class="avatar-info">
            <p class="avatar-hint">Рекомендуемый размер: 256x256px. Форматы: JPG, PNG, WEBP.</p>
          </div>
        </div>

        <!-- Форма секция -->
        <div class="form-section">
          <form nz-form [formGroup]="validateForm" (ngSubmit)="submitForm()" nzLayout="vertical">
            <div nz-row [nzGutter]="16">
              <div nz-col nzSpan="12">
                <nz-form-item>
                  <nz-form-label nzRequired>Имя</nz-form-label>
                  <nz-form-control nzErrorTip="Пожалуйста, введите имя">
                    <input nz-input formControlName="firstName" placeholder="Ваше имя" />
                  </nz-form-control>
                </nz-form-item>
              </div>
              <div nz-col nzSpan="12">
                <nz-form-item>
                  <nz-form-label nzRequired>Фамилия</nz-form-label>
                  <nz-form-control nzErrorTip="Пожалуйста, введите фамилию">
                    <input nz-input formControlName="lastName" placeholder="Ваша фамилия" />
                  </nz-form-control>
                </nz-form-item>
              </div>
            </div>

            <nz-form-item>
              <nz-form-label>Email</nz-form-label>
              <nz-form-control>
                <input nz-input [value]="user()?.email" disabled />
                <span class="field-hint"
                  >Email не может быть изменен администратором самостоятельно в этом разделе.</span
                >
              </nz-form-control>
            </nz-form-item>

            <nz-form-item>
              <nz-form-label>Отдел / Департамент</nz-form-label>
              <nz-form-control>
                <input nz-input formControlName="department" placeholder="Название отдела" />
              </nz-form-control>
            </nz-form-item>

            <nz-form-item>
              <nz-form-label>Роли в системе</nz-form-label>
              <div class="roles-list">
                @for (role of user()?.roles; track role) {
                <nz-tag [nzColor]="'blue'">{{ role }}</nz-tag>
                } @empty {
                <span nz-typography nzType="secondary">Роли не назначены</span>
                }
              </div>
            </nz-form-item>

            <nz-divider></nz-divider>

            <div class="form-actions">
              <button
                nz-button
                nzType="primary"
                [nzLoading]="saving()"
                [disabled]="!validateForm.dirty"
              >
                Сохранить изменения
              </button>
              <button
                nz-button
                type="button"
                (click)="resetForm()"
                [disabled]="!validateForm.dirty"
              >
                Отмена
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .general-tab {
        padding: 8px;
      }

      .profile-layout {
        display: flex;
        gap: 48px;
        margin-top: 24px;
      }

      @media (max-width: 768px) {
        .profile-layout {
          flex-direction: column;
          align-items: center;
        }
      }

      .avatar-section {
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 200px;
      }

      .avatar-wrapper {
        position: relative;
        width: 128px;
        height: 128px;
      }

      .profile-avatar {
        border: 4px solid #fff;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }

      .avatar-overlay {
        position: absolute;
        bottom: 0;
        right: 0;
        background: #1890ff;
        border-radius: 50%;
        width: 36px;
        height: 36px;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px solid #fff;
        transition: all 0.3s;
      }

      .avatar-overlay:hover {
        transform: scale(1.1);
        background: #40a9ff;
      }

      .change-btn {
        color: #fff !important;
        padding: 0;
        width: 100%;
        height: 100%;
      }

      .avatar-info {
        margin-top: 16px;
        text-align: center;
      }

      .avatar-hint {
        font-size: 12px;
        color: #8c8c8c;
      }

      .form-section {
        flex: 1;
        max-width: 600px;
      }

      .field-hint {
        display: block;
        font-size: 12px;
        color: #8c8c8c;
        margin-top: 4px;
      }

      .roles-list {
        margin-top: 4px;
      }

      .form-actions {
        display: flex;
        gap: 12px;
      }
    `,
  ],
})
export class ProfileGeneralTabComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private message = inject(NzMessageService);
  private http = inject(HttpClient);

  user = computed(() => this.authService.getCurrentUser());
  userInitials = computed(() => {
    const user = this.user();
    if (!user) return '?';
    return (user.fullName || user.email).charAt(0).toUpperCase();
  });

  validateForm!: FormGroup;
  saving = signal<boolean>(false);
  previewImage = signal<string | null>(null);
  uploadUrl = ApiEndpoints.IMAGES.UPLOAD_SIMPLE;

  ngOnInit(): void {
    const currentUser = this.user();

    // Пытаемся распарсить полное имя, если оно есть
    let firstName = '';
    let lastName = '';

    if (currentUser?.fullName) {
      const parts = currentUser.fullName.split(' ');
      firstName = parts[0] || '';
      lastName = parts.slice(1).join(' ') || '';
    }

    this.validateForm = this.fb.group({
      firstName: [firstName, [Validators.required]],
      lastName: [lastName, [Validators.required]],
      department: [currentUser?.department || ''],
    });
  }

  submitForm(): void {
    if (this.validateForm.valid) {
      this.saving.set(true);
      const values = this.validateForm.value;

      this.http
        .put<any>(ApiEndpoints.AUTH.UPDATE_PROFILE, values, { withCredentials: true })
        .subscribe({
          next: (res) => {
            this.message.success('Профиль успешно обновлен');
            this.validateForm.markAsPristine();
            this.authService.getProfile().subscribe(); // Refresh local signal
            this.saving.set(false);
          },
          error: (err) => {
            this.message.error(err.error?.message || 'Ошибка при обновлении профиля');
            this.saving.set(false);
          },
        });
    } else {
      Object.values(this.validateForm.controls).forEach((control) => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
  }

  resetForm(): void {
    this.ngOnInit();
    this.validateForm.markAsPristine();
    this.previewImage.set(null);
  }

  beforeUpload = (file: NzUploadFile): boolean => {
    const isJpgOrPng =
      file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/webp';
    if (!isJpgOrPng) {
      this.message.error('Вы можете загружать только JPG/PNG/WEBP файлы!');
      return false;
    }
    const isLt5M = (file.size || 0) / 1024 / 1024 < 5;
    if (!isLt5M) {
      this.message.error('Изображение должно быть меньше 5MB!');
      return false;
    }
    return true;
  };

  handleAvatarChange(info: { file: NzUploadFile }): void {
    if (info.file.status === 'uploading') {
      return;
    }
    if (info.file.status === 'done') {
      // Сервер вернул путь к файлу
      const relativePath =
        info.file.response?.data?.relativePath || info.file.response?.relativePath;
      if (relativePath) {
        const fullUrl = ApiEndpoints.getImageUrl(relativePath);
        this.previewImage.set(fullUrl);

        // Обновляем профиль с новой ссылкой на аватар
        this.http
          .put<any>(
            ApiEndpoints.AUTH.UPDATE_PROFILE,
            { avatar: fullUrl },
            { withCredentials: true },
          )
          .subscribe({
            next: () => {
              this.message.success('Аватар успешно обновлен');
              this.authService.getProfile().subscribe();
            },
          });
      }
    } else if (info.file.status === 'error') {
      this.message.error('Ошибка загрузки сетевого изображения');
    }
  }
}
