// src/app/auth/components/user-profile/user-profile.component.ts
import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { UserProfileService } from '@auth/services/user-profile.service';
import { AuthService } from '@auth/services/auth.service';
import { UserProfileDto } from '@auth/models';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzCardModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzTabsModule,
    NzAvatarModule,
    NzDividerModule,
    NzDescriptionsModule,
  ],
  template: `
    <div class="profile-container">
      <nz-card class="profile-card" *ngIf="currentUser">
        <div class="profile-header">
          <nz-avatar [nzSize]="80" [nzText]="getInitials()"></nz-avatar>
          <div class="profile-info">
            <h2>{{ currentUser.fullName }}</h2>
            <p>{{ currentUser.email }}</p>
          </div>
        </div>

        <nz-divider></nz-divider>

        <nz-tabset>
          <!-- Информация о профиле -->
          <nz-tab nzTitle="Профиль">
            <nz-descriptions nzBordered [nzColumn]="1">
              <nz-descriptions-item nzTitle="Полное имя">
                {{ currentUser.fullName }}
              </nz-descriptions-item>
              <nz-descriptions-item nzTitle="Email">
                {{ currentUser.email }}
              </nz-descriptions-item>
              <nz-descriptions-item nzTitle="Отдел">
                {{ currentUser.department || 'Не указан' }}
              </nz-descriptions-item>
              <nz-descriptions-item nzTitle="Статус">
                {{ currentUser.isActive ? 'Активен' : 'Неактивен' }}
              </nz-descriptions-item>
              <nz-descriptions-item nzTitle="Дата регистрации">
                {{ currentUser.createdAt | date: 'medium' }}
              </nz-descriptions-item>
              <nz-descriptions-item nzTitle="Последний вход">
                {{ currentUser.lastLogin ? (currentUser.lastLogin | date: 'medium') : 'Никогда' }}
              </nz-descriptions-item>
            </nz-descriptions>
          </nz-tab>

          <!-- Редактирование профиля -->
          <nz-tab nzTitle="Редактировать">
            <form nz-form [formGroup]="profileForm" (ngSubmit)="updateProfile()">
              <nz-form-item>
                <nz-form-label [nzSpan]="6">Имя</nz-form-label>
                <nz-form-control [nzSpan]="18" nzErrorTip="Введите имя">
                  <input nz-input formControlName="firstName" placeholder="Имя" />
                </nz-form-control>
              </nz-form-item>

              <nz-form-item>
                <nz-form-label [nzSpan]="6">Фамилия</nz-form-label>
                <nz-form-control [nzSpan]="18" nzErrorTip="Введите фамилию">
                  <input nz-input formControlName="lastName" placeholder="Фамилия" />
                </nz-form-control>
              </nz-form-item>

              <nz-form-item>
                <nz-form-label [nzSpan]="6">Отдел</nz-form-label>
                <nz-form-control [nzSpan]="18">
                  <input nz-input formControlName="department" placeholder="Отдел" />
                </nz-form-control>
              </nz-form-item>

              <nz-form-item>
                <nz-form-control [nzOffset]="6" [nzSpan]="18">
                  <button
                    nz-button
                    nzType="primary"
                    type="submit"
                    [nzLoading]="loadingProfile"
                    [disabled]="!profileForm.valid"
                  >
                    Сохранить изменения
                  </button>
                </nz-form-control>
              </nz-form-item>
            </form>
          </nz-tab>

          <!-- Смена пароля -->
          <nz-tab nzTitle="Безопасность">
            <form nz-form [formGroup]="passwordForm" (ngSubmit)="changePassword()">
              <nz-form-item>
                <nz-form-label [nzSpan]="6">Текущий пароль</nz-form-label>
                <nz-form-control [nzSpan]="18" nzErrorTip="Введите текущий пароль">
                  <input
                    nz-input
                    type="password"
                    formControlName="currentPassword"
                    placeholder="Текущий пароль"
                  />
                </nz-form-control>
              </nz-form-item>

              <nz-form-item>
                <nz-form-label [nzSpan]="6">Новый пароль</nz-form-label>
                <nz-form-control [nzSpan]="18" [nzErrorTip]="newPasswordError">
                  <input
                    nz-input
                    type="password"
                    formControlName="newPassword"
                    placeholder="Минимум 6 символов"
                  />
                  <ng-template #newPasswordError let-control>
                    <ng-container *ngIf="control.hasError('required')"
                      >Введите новый пароль</ng-container
                    >
                    <ng-container *ngIf="control.hasError('minlength')"
                      >Минимум 6 символов</ng-container
                    >
                  </ng-template>
                </nz-form-control>
              </nz-form-item>

              <nz-form-item>
                <nz-form-label [nzSpan]="6">Подтвердите пароль</nz-form-label>
                <nz-form-control [nzSpan]="18" [nzErrorTip]="confirmPasswordError">
                  <input
                    nz-input
                    type="password"
                    formControlName="confirmPassword"
                    placeholder="Повторите пароль"
                  />
                  <ng-template #confirmPasswordError let-control>
                    <ng-container *ngIf="control.hasError('required')"
                      >Подтвердите пароль</ng-container
                    >
                    <ng-container *ngIf="control.hasError('passwordMismatch')"
                      >Пароли не совпадают</ng-container
                    >
                  </ng-template>
                </nz-form-control>
              </nz-form-item>

              <nz-form-item>
                <nz-form-control [nzOffset]="6" [nzSpan]="18">
                  <button
                    nz-button
                    nzType="primary"
                    nzDanger
                    type="submit"
                    [nzLoading]="loadingPassword"
                    [disabled]="!passwordForm.valid"
                  >
                    Изменить пароль
                  </button>
                </nz-form-control>
              </nz-form-item>
            </form>
          </nz-tab>
        </nz-tabset>
      </nz-card>
    </div>
  `,
  styles: [
    `
      .profile-container {
        padding: 24px;
        max-width: 1200px;
        margin: 0 auto;
      }

      .profile-card {
        background: #fff;
        border-radius: 8px;
      }

      .profile-header {
        display: flex;
        align-items: center;
        gap: 24px;
        margin-bottom: 24px;
      }

      .profile-info h2 {
        margin: 0 0 8px;
        font-size: 24px;
        font-weight: 600;
      }

      .profile-info p {
        margin: 0;
        color: #666;
      }

      nz-form-item {
        margin-bottom: 24px;
      }
    `,
  ],
})
export class UserProfileComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();
  private readonly fb = inject(FormBuilder);
  private readonly profileService = inject(UserProfileService);
  private readonly authService = inject(AuthService);
  private readonly message = inject(NzMessageService);

  currentUser: UserProfileDto | null = null;
  profileForm: FormGroup;
  passwordForm: FormGroup;
  loadingProfile = false;
  loadingPassword = false;

  constructor() {
    this.profileForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      department: [''],
    });

    this.passwordForm = this.fb.group(
      {
        currentPassword: ['', Validators.required],
        newPassword: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', Validators.required],
      },
      { validators: this.passwordMatchValidator },
    );
  }

  ngOnInit(): void {
    this.loadProfile();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadProfile(): void {
    this.profileService
      .getProfile()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.currentUser = response.data;
          this.patchProfileForm();
        },
        error: () => {
          this.message.error('Ошибка загрузки профиля');
        },
      });
  }

  patchProfileForm(): void {
    if (!this.currentUser) return;

    const [firstName, ...lastNameParts] = this.currentUser.fullName.split(' ');
    this.profileForm.patchValue({
      firstName: firstName || '',
      lastName: lastNameParts.join(' ') || '',
      department: this.currentUser.department || '',
    });
  }

  updateProfile(): void {
    if (!this.profileForm.valid || !this.currentUser) return;

    this.loadingProfile = true;
    const currentUserData = this.authService.getCurrentUser();

    if (!currentUserData) {
      this.message.error('Пользователь не найден');
      this.loadingProfile = false;
      return;
    }

    this.profileService
      .updateProfile(currentUserData.email, this.profileForm.value)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.message.success('Профиль обновлен');
          this.loadProfile();
          this.loadingProfile = false;
        },
        error: () => {
          this.message.error('Ошибка обновления профиля');
          this.loadingProfile = false;
        },
      });
  }

  changePassword(): void {
    if (!this.passwordForm.valid) return;

    this.loadingPassword = true;
    this.profileService
      .changePassword(this.passwordForm.value)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.message.success('Пароль изменен');
          this.passwordForm.reset();
          this.loadingPassword = false;
        },
        error: (error) => {
          this.message.error(error.error?.message || 'Ошибка смены пароля');
          this.loadingPassword = false;
        },
      });
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

  getInitials(): string {
    if (!this.currentUser?.fullName) return 'U';
    const names = this.currentUser.fullName.split(' ');
    return ((names[0]?.charAt(0) || '') + (names[1]?.charAt(0) || '')).toUpperCase();
  }
}
