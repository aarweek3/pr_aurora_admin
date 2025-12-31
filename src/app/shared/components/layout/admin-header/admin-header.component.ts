import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { AuthService } from '../../../../auth/services/auth.service';

/**
 * Admin Header Component
 *
 * Компонент шапки админ-панели.
 * Содержит:
 * - Логотип/брендинг
 * - Глобальные действия (уведомления, поиск)
 * - Меню пользователя
 *
 * Согласно архитектуре (SOW ЧАСТЬ 4.1):
 * - НЕ отвечает за Layout и Navigation
 * - Только брендинг и глобальные действия
 */
@Component({
  selector: 'app-admin-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    NzIconModule,
    NzDropDownModule,
    NzAvatarModule,
    NzBadgeModule,
  ],
  template: `
    <header class="admin-header">
      <div class="admin-header__branding">
        <a routerLink="/" class="admin-header__logo">
          <span nz-icon nzType="crown" nzTheme="fill"></span>
          <span class="admin-header__title">Aurora Admin</span>
        </a>
      </div>

      <div class="admin-header__actions">
        <!-- Поиск -->
        <button class="admin-header__action-btn" title="Глобальный поиск">
          <span nz-icon nzType="search"></span>
        </button>

        <!-- Уведомления -->
        <button class="admin-header__action-btn" title="Уведомления">
          <nz-badge [nzCount]="notificationCount">
            <span nz-icon nzType="bell"></span>
          </nz-badge>
        </button>

        <!-- Настройки -->
        <button class="admin-header__action-btn" title="Настройки" routerLink="/settings">
          <span nz-icon nzType="setting"></span>
        </button>

        <!-- Пользователь -->
        <div
          class="admin-header__user"
          nz-dropdown
          [nzDropdownMenu]="userMenu"
          nzPlacement="bottomRight"
        >
          <nz-avatar
            [nzText]="userInitials"
            nzSize="default"
            style="background-color: #1890ff; cursor: pointer;"
          >
          </nz-avatar>
          <span class="admin-header__username">{{ userName }}</span>
          <span nz-icon nzType="down"></span>
        </div>
      </div>

      <!-- Dropdown меню пользователя -->
      <nz-dropdown-menu #userMenu="nzDropdownMenu">
        <ul nz-menu>
          <li nz-menu-item routerLink="/profile">
            <span nz-icon nzType="user"></span>
            Профиль
          </li>
          <li nz-menu-item routerLink="/settings">
            <span nz-icon nzType="setting"></span>
            Настройки
          </li>
          <li nz-menu-divider></li>
          <li nz-menu-item (click)="onLogout()">
            <span nz-icon nzType="logout"></span>
            Выйти
          </li>
        </ul>
      </nz-dropdown-menu>
    </header>
  `,
  styles: [
    `
      .admin-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        height: 64px;
        padding: 0 24px;
        background: #fff;
        border-bottom: 1px solid #f0f0f0;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
      }

      .admin-header__branding {
        display: flex;
        align-items: center;
      }

      .admin-header__logo {
        display: flex;
        align-items: center;
        gap: 12px;
        font-size: 20px;
        font-weight: 600;
        color: #1890ff;
        text-decoration: none;
        transition: opacity 0.3s;
      }

      .admin-header__logo:hover {
        opacity: 0.8;
      }

      .admin-header__logo [nz-icon] {
        font-size: 28px;
      }

      .admin-header__title {
        color: #262626;
      }

      .admin-header__actions {
        display: flex;
        align-items: center;
        gap: 16px;
      }

      .admin-header__action-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 40px;
        height: 40px;
        border: none;
        background: transparent;
        border-radius: 8px;
        cursor: pointer;
        font-size: 18px;
        color: #595959;
        transition: all 0.3s;
      }

      .admin-header__action-btn:hover {
        background: #f5f5f5;
        color: #1890ff;
      }

      .admin-header__user {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 4px 12px;
        border-radius: 8px;
        cursor: pointer;
        transition: background 0.3s;
      }

      .admin-header__user:hover {
        background: #f5f5f5;
      }

      .admin-header__username {
        font-weight: 500;
        color: #262626;
      }
    `,
  ],
})
export class AdminHeaderComponent {
  private authService = inject(AuthService);

  userName = 'Администратор';
  userInitials = 'А';
  notificationCount = 3;

  constructor() {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.userName = this.formatUserName(user);
      this.userInitials = this.userName.charAt(0).toUpperCase();
    }
  }

  private formatUserName(user: any): string {
    const fullName = user.fullName || '';
    const email = user.email || '';

    // Если fullName пустой, вернем email
    if (!fullName) return email;

    // 1. Проверка на повторение (например "email@test.com email@test.com")
    const parts = fullName.trim().split(/\s+/);
    if (parts.length === 2 && parts[0] === parts[1]) {
      return parts[0];
    }

    // 2. Если fullName совпадает с email (даже в одном экземпляре), можно вернуть его как есть
    // Но если "email email", это уже обработано выше.

    return fullName;
  }

  onLogout(): void {
    console.log('Logout clicked');
    this.authService.logout().subscribe({
      next: () => {
        console.log('Logged out successfully');
      },
      error: (err) => {
        console.error('Logout error:', err);
      },
    });
  }
}
