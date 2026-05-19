import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

// Ng Zorro imports
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzTagModule } from 'ng-zorro-antd/tag';

// Auth services and models
import { AuthService } from '@auth/services/auth.service';
import { TokenService } from '@auth/services/token.service';
import { UserProfileDto } from '@auth/models';

@Component({
  selector: 'app-admin-panel',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    NzLayoutModule,
    NzMenuModule,
    NzIconModule,
    NzDropDownModule,
    NzAvatarModule,
    NzBadgeModule,
    NzButtonModule,
    NzToolTipModule,
    NzDividerModule,
    NzBreadCrumbModule,
    NzTagModule,
  ],
  template: `
    <nz-layout class="admin-layout">
      <nz-header class="admin-header">
        <div class="header-content">
          <div class="logo-section">
            <span
              nz-icon
              [nzType]="isCollapsed ? 'menu-unfold' : 'menu-fold'"
              class="trigger"
              nz-tooltip
              [nzTooltipTitle]="isCollapsed ? 'Развернуть меню' : 'Свернуть меню'"
              (click)="toggleSider()"
            ></span>
            <div class="logo">
              <span nz-icon nzType="crown" class="logo-icon"></span>
              <span class="logo-text">Панель Администратора</span>
            </div>
          </div>

          <div class="header-actions">
            <div class="token-status" nz-tooltip [nzTooltipTitle]="getTokenTooltip()">
              <nz-tag [nzColor]="getTokenStatusColor()" nzSize="small">
                {{ getTokenStatusText() }}
              </nz-tag>
            </div>

            <nz-badge [nzCount]="notificationCount" nzSize="small">
              <span
                nz-icon
                nzType="bell"
                class="action-icon"
                nz-tooltip
                nzTooltipTitle="Уведомления"
              ></span>
            </nz-badge>

            <div
              class="user-info"
              nz-dropdown
              [nzDropdownMenu]="userMenu"
              nzPlacement="bottomRight"
            >
              <nz-avatar [nzText]="getUserInitials()" nzSize="small"></nz-avatar>
              <span class="user-name">{{ getUserFullName() }}</span>
              <span class="user-roles">{{ getUserRolesText() }}</span>
              <span nz-icon nzType="down" class="dropdown-icon"></span>
            </div>

            <nz-dropdown-menu #userMenu="nzDropdownMenu">
              <ul nz-menu nzSelectable="false">
                <li nz-menu-item routerLink="/profile">
                  <span nz-icon nzType="user"></span>
                  <span>Мой профиль</span>
                </li>
                <li nz-menu-item routerLink="/dashboard">
                  <span nz-icon nzType="home"></span>
                  <span>Главная панель</span>
                </li>
                <li nz-menu-divider></li>
                <li nz-menu-item (click)="refreshTokenStatus()">
                  <span nz-icon nzType="reload"></span>
                  <span>Обновить токен</span>
                </li>
                <li nz-menu-divider></li>
                <li nz-menu-item (click)="logout()">
                  <span nz-icon nzType="logout"></span>
                  <span>Выйти</span>
                </li>
              </ul>
            </nz-dropdown-menu>
          </div>
        </div>
      </nz-header>

      <nz-layout class="main-layout">
        <nz-sider
          class="admin-sider"
          [nzCollapsed]="isCollapsed"
          [nzWidth]="240"
          [nzCollapsedWidth]="80"
          nzTheme="light"
        >
          <ul nz-menu nzMode="inline" [nzInlineCollapsed]="isCollapsed" class="admin-menu">
            <li
              *ngIf="hasAnyRole(['Admin', 'Moderator'])"
              nz-menu-item
              routerLink="/admin/dashboard"
              routerLinkActive="ant-menu-item-selected"
              (click)="setSelectedMenu('dashboard')"
            >
              <span nz-icon nzType="dashboard"></span>
              <span>Панель</span>
            </li>

            <!-- Sample -->
            <li
              nz-menu-item
              routerLink="/admin/anecdote-manager"
              routerLinkActive="ant-menu-item-selected"
              (click)="setSelectedMenu('anecdote-manager')"
            >
              <span nz-icon nzType="experiment"></span>
              <span>Анекдоты manager</span>
            </li>

            <!-- namemain -->
            <li
              nz-menu-item
              routerLink="/admin/namemain-manager"
              routerLinkActive="ant-menu-item-selected"
              (click)="setSelectedMenu('namemain-manager')"
            >
              <span nz-icon nzType="experiment"></span>
              <span>Name Main manager</span>
            </li>
            <li
              nz-menu-item
              routerLink="/admin/namemain-control"
              routerLinkActive="ant-menu-item-selected"
              (click)="setSelectedMenu('namemain-control')"
            >
              <span nz-icon nzType="experiment"></span>
              <span>Name Main control</span>
            </li>
            <li
              nz-menu-item
              routerLink="/admin/namemain-control-test"
              routerLinkActive="ant-menu-item-selected"
              (click)="setSelectedMenu('namemain-control-test')"
            >
              <span nz-icon nzType="experiment"></span>
              <span>Name Main Test</span>
            </li>

            <!-- Sample -->
            <li
              nz-menu-item
              routerLink="/admin/sample-manager"
              routerLinkActive="ant-menu-item-selected"
              (click)="setSelectedMenu('sample-manager')"
            >
              <span nz-icon nzType="experiment"></span>
              <span>Sample manager</span>
            </li>
            <li
              nz-menu-item
              routerLink="/admin/sample-control"
              routerLinkActive="ant-menu-item-selected"
              (click)="setSelectedMenu('sample-control')"
            >
              <span nz-icon nzType="experiment"></span>
              <span>Sample control</span>
            </li>

            <!-- Language -->
            <li
              nz-menu-item
              routerLink="/admin/language-manager"
              routerLinkActive="ant-menu-item-selected"
              (click)="setSelectedMenu('language-manager')"
            >
              <span nz-icon nzType="experiment"></span>
              <span>Language manager</span>
            </li>
            <li
              nz-menu-item
              routerLink="/admin/language-control"
              routerLinkActive="ant-menu-item-selected"
              (click)="setSelectedMenu('language-control')"
            >
              <span nz-icon nzType="experiment"></span>
              <span>Language control</span>
            </li>

            <!-- Tests (Consolidated Submenu) -->
            <li nz-submenu nzTitle="ТЕСТЫ" nzIcon="experiment">
              <ul>
                <li
                  nz-menu-item
                  routerLink="/admin/tiny-mce-reactive-test"
                  routerLinkActive="ant-menu-item-selected"
                  (click)="setSelectedMenu('tiny-mce-reactive-test')"
                >
                  <span>Тест TinyMCE (Reactive Forms)</span>
                </li>
                <li
                  nz-menu-item
                  routerLink="/admin/test"
                  routerLinkActive="ant-menu-item-selected"
                  (click)="setSelectedMenu('test')"
                >
                  <span>Тест компонент</span>
                </li>
                <li
                  nz-menu-item
                  routerLink="/admin/test-one"
                  routerLinkActive="ant-menu-item-selected"
                  (click)="setSelectedMenu('test-one')"
                >
                  <span>Тест компонент №1</span>
                </li>
                <li
                  nz-menu-item
                  routerLink="/admin/test-two"
                  routerLinkActive="ant-menu-item-selected"
                  (click)="setSelectedMenu('test-two')"
                >
                  <span>Тест компонент №2</span>
                </li>
                <li
                  nz-menu-item
                  routerLink="/admin/cors-test"
                  routerLinkActive="ant-menu-item-selected"
                  (click)="setSelectedMenu('cors-test')"
                >
                  <span>cors-test</span>
                </li>
                <li
                  nz-menu-item
                  routerLink="/admin/app-test-image-manager"
                  routerLinkActive="ant-menu-item-selected"
                  (click)="setSelectedMenu('app-test-image-manager')"
                >
                  <span>Тест Image Uploader</span>
                </li>
                <li
                  nz-menu-item
                  routerLink="/admin/auth-test"
                  routerLinkActive="ant-menu-item-selected"
                  (click)="setSelectedMenu('auth-test')"
                >
                  <span>Тест авторизации</span>
                </li>
                <li
                  nz-menu-item
                  routerLink="/admin/auth-test-refactored"
                  routerLinkActive="ant-menu-item-selected"
                  (click)="setSelectedMenu('auth-test-refactored')"
                >
                  <span>Тест авторизации Ref</span>
                </li>
              </ul>
            </li>

            <li
              *ngIf="isAdmin()"
              nz-menu-item
              routerLink="/admin/users"
              routerLinkActive="ant-menu-item-selected"
              (click)="setSelectedMenu('users')"
            >
              <span nz-icon nzType="team"></span>
              <span>Управление пользователями</span>
            </li>

            <li
              *ngIf="isAdmin()"
              nz-menu-item
              routerLink="/admin/roles"
              routerLinkActive="ant-menu-item-selected"
              (click)="setSelectedMenu('roles')"
            >
              <span nz-icon nzType="safety"></span>
              <span>Управление ролями</span>
            </li>

            <li
              *ngIf="hasAnyRole(['Admin', 'Moderator'])"
              nz-menu-item
              routerLink="/admin/logs"
              routerLinkActive="ant-menu-item-selected"
              (click)="setSelectedMenu('logs')"
            >
              <span nz-icon nzType="file-text"></span>
              <span>Логи активности</span>
            </li>

            <li
              *ngIf="isAdmin()"
              nz-menu-item
              routerLink="/admin/debug/tokens"
              routerLinkActive="ant-menu-item-selected"
              (click)="setSelectedMenu('debug/tokens')"
            >
              <span nz-icon nzType="bug"></span>
              <span>Отладка токена !!!!!</span>
            </li>

            <li nz-menu-divider></li>

            <li nz-menu-item routerLink="/profile">
              <span nz-icon nzType="user"></span>
              <span>Мой профиль</span>
            </li>

            <li nz-menu-item routerLink="/dashboard">
              <span nz-icon nzType="home"></span>
              <span>Главная</span>
            </li>
          </ul>
        </nz-sider>

        <nz-layout class="content-layout">
          <nz-content class="admin-content">
            <div class="breadcrumb-container">
              <nz-breadcrumb class="breadcrumb">
                <nz-breadcrumb-item>
                  <span nz-icon nzType="home"></span>
                  <span>Панель Администратора</span>
                </nz-breadcrumb-item>
                <nz-breadcrumb-item>
                  <span>{{ getCurrentPageTitle() }}</span>
                </nz-breadcrumb-item>
              </nz-breadcrumb>

              <div class="status-indicators">
                <nz-tag [nzColor]="authService.isLoggedIn() ? 'green' : 'red'" nzSize="small">
                  {{ authService.isLoggedIn() ? 'Авторизован' : 'Не авторизован' }}
                </nz-tag>
                <nz-tag
                  nzColor="blue"
                  nzSize="small"
                  *ngFor="let role of authService.getUserRoles()"
                >
                  {{ role }}
                </nz-tag>
              </div>
            </div>

            <div class="page-content">
              <router-outlet></router-outlet>
            </div>
          </nz-content>

          <nz-footer class="admin-footer">
            <div class="footer-content">
              <span>Система авторизации ©2024. Все права защищены.</span>
              <div class="footer-links">
                <span>Токен: {{ getTokenStatusText() }}</span>
                <nz-divider nzType="vertical"></nz-divider>
                <span>Истекает через: {{ getTokenExpiryText() }}</span>
                <nz-divider nzType="vertical"></nz-divider>
                <a href="#" (click)="$event.preventDefault(); refreshTokenStatus()">Обновить</a>
              </div>
            </div>
          </nz-footer>
        </nz-layout>
      </nz-layout>
    </nz-layout>
  `,
  styles: [
    `
      .admin-layout {
        min-height: 100vh;
      }

      .admin-header {
        background: #fff;
        padding: 0;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
        position: relative;
        z-index: 10;
      }

      .header-content {
        display: flex;
        align-items: center;
        justify-content: space-between;
        height: 100%;
        padding: 0 24px;
      }

      .logo-section {
        display: flex;
        align-items: center;
        gap: 16px;
      }

      .trigger {
        font-size: 18px;
        line-height: 64px;
        cursor: pointer;
        transition: color 0.3s;
        color: #666;
      }

      .trigger:hover {
        color: #1890ff;
      }

      .logo {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .logo-icon {
        font-size: 24px;
        color: #1890ff;
      }

      .logo-text {
        font-size: 18px;
        font-weight: 600;
        color: #1f2937;
      }

      .header-actions {
        display: flex;
        align-items: center;
        gap: 16px;
      }

      .token-status {
        display: flex;
        align-items: center;
      }

      .action-icon {
        font-size: 18px;
        color: #666;
        cursor: pointer;
        transition: color 0.3s;
      }

      .action-icon:hover {
        color: #1890ff;
      }

      .user-info {
        display: flex;
        align-items: center;
        gap: 8px;
        cursor: pointer;
        padding: 8px 12px;
        border-radius: 6px;
        transition: background-color 0.3s;
      }

      .user-info:hover {
        background-color: #f5f5f5;
      }

      .user-name {
        font-weight: 500;
        color: #1f2937;
      }

      .user-roles {
        font-size: 12px;
        color: #666;
        font-style: italic;
      }

      .dropdown-icon {
        font-size: 12px;
        color: #666;
      }

      .main-layout {
        background: #f0f2f5;
      }

      .admin-sider {
        background: #fff;
        box-shadow: 2px 0 8px rgba(0, 0, 0, 0.06);
        position: relative;
        z-index: 5;
      }

      .admin-menu {
        height: 100%;
        border-right: 0;
        padding-top: 16px;
      }

      .admin-menu .ant-menu-item {
        margin: 4px 16px;
        border-radius: 6px;
        height: 40px;
        line-height: 40px;
      }

      .content-layout {
        background: #f0f2f5;
      }

      .admin-content {
        margin: 0;
        padding: 0;
        background: #f0f2f5;
        min-height: calc(100vh - 64px - 70px);
      }

      .breadcrumb-container {
        background: #fff;
        padding: 16px 24px;
        margin-bottom: 16px;
        border-bottom: 1px solid #f0f0f0;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .status-indicators {
        display: flex;
        gap: 8px;
        align-items: center;
      }

      .page-content {
        padding: 0 24px 24px;
      }

      .admin-footer {
        text-align: center;
        background: #fff;
        border-top: 1px solid #f0f0f0;
      }

      .footer-content {
        display: flex;
        align-items: center;
        justify-content: space-between;
        color: #666;
        font-size: 12px;
      }

      .footer-links a {
        color: #1890ff;
        text-decoration: none;
        cursor: pointer;
      }

      .footer-links a:hover {
        text-decoration: underline;
      }

      @media (max-width: 768px) {
        .header-content {
          padding: 0 16px;
        }

        .logo-text {
          display: none;
        }

        .user-name,
        .user-roles {
          display: none;
        }

        .token-status {
          display: none;
        }

        .breadcrumb-container {
          flex-direction: column;
          gap: 8px;
          align-items: flex-start;
          padding: 12px 16px;
        }

        .page-content {
          padding: 0 16px 16px;
        }

        .footer-content {
          flex-direction: column;
          gap: 8px;
          font-size: 11px;
        }
      }
    `,
  ],
})
export class AdminPanelComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();
  public readonly authService = inject(AuthService);
  public readonly tokenService = inject(TokenService);
  private readonly router = inject(Router);
  private readonly message = inject(NzMessageService);

  currentUser: UserProfileDto | null = null;
  isCollapsed = false;
  selectedMenuKey = 'test';
  notificationCount = 3;

  // Page title mapping
  private readonly pageTitles: Record<string, string> = {
    dashboard: 'Панель',
    test: 'Тест компонент',
    'test-one': 'Тест компонент №1',
    'test-two': 'Тест компонент №2',
    users: 'Управление пользователями',
    settings: 'Настройки системы',
    logs: 'Логи активности',
    'debug/tokens': 'Отладка токена',
    roles: 'Управление ролями',
    'app-test-image-manager': 'Тест Image Uploader',
    'auth-test': 'Тест авторизации',
    'auth-test-refactored': 'Тест авторизации Ref',
    'cors-test': 'Тест CORS',
    'anecdote-manager': 'Анекдоты manager',
    'namemain-manager': 'Name Main manager',
    'namemain-control': 'Name Main control',
    'namemain-control-test': 'Name Main Test',
    'sample-manager': 'Sample manager',
    'sample-control': 'Sample control',
    'language-manager': 'Language manager',
    'language-control': 'Language control',
  };

  ngOnInit(): void {
    console.log('=== ADMIN PANEL COMPONENT ===');
    this.loadCurrentUser();
    this.setInitialSelectedMenu();
    this.logComponentState();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private logComponentState(): void {
    console.log('Панель администратора инициализирована');
    console.log('Пользователь авторизован:', this.authService.isLoggedIn());
    console.log('Текущий пользователь:', this.authService.getCurrentUser()?.email);
    console.log('Роли пользователя:', this.authService.getUserRoles());
    console.log('Токен действителен:', this.tokenService.isTokenValid());
    console.log('Статус токена:', this.tokenService.getStatusText());
    console.log('==============================');
  }

  /**
   * Check if user is admin
   */
  isAdmin(): boolean {
    return this.authService.isAdminUser();
  }

  /**
   * Check if user has any of the specified roles
   */
  hasAnyRole(roles: string[]): boolean {
    const userRoles = this.authService.getUserRoles();
    return roles.some((role) => userRoles.includes(role));
  }

  /**
   * Load current user from AuthService
   */
  private loadCurrentUser(): void {
    this.currentUser = this.authService.getCurrentUser();
  }

  /**
   * Set initial selected menu based on current route
   */
  private setInitialSelectedMenu(): void {
    const currentRoute = this.router.url;
    if (currentRoute.includes('/admin/dashboard')) {
      this.selectedMenuKey = 'dashboard';
    } else if (currentRoute.includes('/admin/test-one')) {
      this.selectedMenuKey = 'test-one';
    } else if (currentRoute.includes('/admin/test-two')) {
      this.selectedMenuKey = 'test-two';
    } else if (currentRoute.includes('/admin/test')) {
      this.selectedMenuKey = 'test';
    } else if (currentRoute.includes('/admin/users')) {
      this.selectedMenuKey = 'users';
    } else if (currentRoute.includes('/admin/logs')) {
      this.selectedMenuKey = 'logs';
    } else if (currentRoute.includes('/admin/debug/tokens')) {
      this.selectedMenuKey = 'debug/tokens';
    } else if (currentRoute.includes('/admin/auth-test')) {
      this.selectedMenuKey = 'auth-test';
    } else if (currentRoute.includes('/admin/roles')) {
      this.selectedMenuKey = 'roles';
    } else if (currentRoute.includes('/admin/app-test-image-manager')) {
      this.selectedMenuKey = 'app-test-image-manager';
    } else if (currentRoute.includes('/admin/auth-test-refactored')) {
      this.selectedMenuKey = 'auth-test-refactored';
    } else if (currentRoute.includes('/admin/cors-test')) {
      this.selectedMenuKey = 'cors-test';
    } else if (currentRoute.includes('/admin/anecdote-manager')) {
      this.selectedMenuKey = 'anecdote-manager';
    } else if (currentRoute.includes('/admin/namemain-manager')) {
      this.selectedMenuKey = 'namemain-manager';
    } else if (currentRoute.includes('/admin/namemain-control')) {
      this.selectedMenuKey = 'namemain-control';
    } else if (currentRoute.includes('/admin/namemain-control-test')) {
      this.selectedMenuKey = 'namemain-control-test';
    } else if (currentRoute.includes('/admin/sample-manager')) {
      this.selectedMenuKey = 'sample-manager';
    } else if (currentRoute.includes('/admin/sample-control')) {
      this.selectedMenuKey = 'sample-control';
    } else if (currentRoute.includes('/admin/language-manager')) {
      this.selectedMenuKey = 'language-manager';
    } else if (currentRoute.includes('/admin/language-control')) {
      this.selectedMenuKey = 'language-control';
    } else {
      this.selectedMenuKey = 'test';
    }
  }

  /**
   * Toggle sidebar collapse state
   */
  toggleSider(): void {
    this.isCollapsed = !this.isCollapsed;
  }

  /**
   * Set selected menu item
   */
  setSelectedMenu(key: string): void {
    console.log('Выбранный ключ меню:', key);
    this.selectedMenuKey = key;
  }

  /**
   * Get current page title
   */
  getCurrentPageTitle(): string {
    return this.pageTitles[this.selectedMenuKey] || 'Страница';
  }

  /**
   * Get user full name
   */
  getUserFullName(): string {
    if (this.currentUser?.fullName) {
      return this.currentUser.fullName;
    }
    return this.currentUser?.email || 'Пользователь';
  }

  /**
   * Get user roles as text
   */
  getUserRolesText(): string {
    const roles = this.authService.getUserRoles();
    return roles.length > 0 ? roles.join(', ') : 'Нет ролей';
  }

  /**
   * Get user initials for avatar
   */
  getUserInitials(): string {
    if (this.currentUser?.fullName) {
      const names = this.currentUser.fullName.split(' ');
      return `${names[0][0]}${names[1]?.[0] || ''}`.toUpperCase();
    }
    if (this.currentUser?.email) {
      return this.currentUser.email.substring(0, 2).toUpperCase();
    }
    return 'П';
  }

  /**
   * Get token status color
   */
  getTokenStatusColor(): string {
    return this.tokenService.getStatusColor();
  }

  /**
   * Get token status text
   */
  getTokenStatusText(): string {
    return this.tokenService.getStatusText();
  }

  /**
   * Get token expiry text for display
   */
  getTokenExpiryText(): string {
    const status = this.tokenService.getCurrentStatus();
    if (!status.isValid) return 'Недействителен';
    return this.tokenService.formatTimeUntilExpiry(status.timeUntilExpiry);
  }

  /**
   * Get token tooltip information
   */
  getTokenTooltip(): string {
    const status = this.tokenService.getCurrentStatus();
    return `Статус токена: ${this.tokenService.getStatusText()}\nИстекает через: ${this.tokenService.formatTimeUntilExpiry(
      status.timeUntilExpiry,
    )}\nПоследняя проверка: ${status.lastChecked.toLocaleTimeString()}`;
  }

  /**
   * Refresh token status manually
   */
  refreshTokenStatus(): void {
    this.message.loading('Обновление статуса токена...', { nzDuration: 1000 });
    this.tokenService.checkTokenStatus().subscribe({
      next: (status) => {
        this.message.success('Статус токена обновлен');
        console.log('Статус токена обновлен вручную:', status);
      },
      error: (error) => {
        this.message.error('Не удалось обновить статус токена');
        console.error('Обновление токена не удалось:', error);
      },
    });
  }

  /**
   * Logout user
   */
  logout(): void {
    console.log('Выход из панели администратора инициирован');
    this.message.loading('Выход из системы...', { nzDuration: 0 });

    this.authService.logout().subscribe({
      next: () => {
        this.message.remove();
        this.message.success('Успешный выход из системы');
        console.log('Выход из панели администратора успешен');
        this.router.navigate(['/auth/login']);
      },
      error: (error) => {
        this.message.remove();
        this.message.error('Ошибка при выходе из системы');
        console.error('Ошибка выхода из панели администратора:', error);
        this.router.navigate(['/auth/login']);
      },
    });
  }
}
