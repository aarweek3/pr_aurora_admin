import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzSkeletonModule } from 'ng-zorro-antd/skeleton';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { AuthService } from '../../../../services/auth.service';
import { ProfileGeneralTabComponent } from '../profile-general-tab/profile-general-tab.component';
import { ProfileSecurityTabComponent } from '../profile-security-tab/profile-security-tab.component';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    NzTabsModule,
    NzIconModule,
    NzPageHeaderModule,
    NzBreadCrumbModule,
    NzGridModule,
    NzSkeletonModule,
    NzAlertModule,
    NzButtonModule,
    ProfileGeneralTabComponent,
    ProfileSecurityTabComponent,
  ],
  template: `
    <div class="profile-container">
      <nz-page-header class="site-page-header">
        <nz-breadcrumb nz-page-header-breadcrumb>
          <nz-breadcrumb-item><a routerLink="/">Главная</a></nz-breadcrumb-item>
          <nz-breadcrumb-item>Профиль пользователя</nz-breadcrumb-item>
        </nz-breadcrumb>
        <nz-page-header-title>Мой профиль</nz-page-header-title>
        <nz-page-header-subtitle
          >Управление личными данными и безопасностью</nz-page-header-subtitle
        >
      </nz-page-header>

      <div class="profile-content">
        @if (loading()) {
        <nz-skeleton [nzActive]="true" [nzParagraph]="{ rows: 10 }"></nz-skeleton>
        } @else if (error()) {
        <nz-alert
          nzType="error"
          [nzMessage]="'Ошибка загрузки профиля'"
          [nzDescription]="error() || ''"
          nzShowIcon
        ></nz-alert>
        <button nz-button nzType="primary" (click)="loadProfile()" style="margin-top: 16px;">
          Попробовать снова
        </button>
        } @else {
        <nz-tabset [nzTabPosition]="'left'" class="profile-tabs">
          <nz-tab [nzTitle]="generalTitle">
            <ng-template #generalTitle>
              <i nz-icon nzType="user"></i>
              Общая информация
            </ng-template>
            <app-profile-general-tab></app-profile-general-tab>
          </nz-tab>

          <nz-tab [nzTitle]="securityTitle">
            <ng-template #securityTitle>
              <i nz-icon nzType="safety"></i>
              Безопасность
            </ng-template>
            <app-profile-security-tab></app-profile-security-tab>
          </nz-tab>
        </nz-tabset>
        }
      </div>
    </div>
  `,
  styles: [
    `
      .profile-container {
        padding: 0;
        background: #f0f2f5;
        min-height: 100%;
      }

      .site-page-header {
        background: #fff;
        border-bottom: 1px solid #d9d9d9;
        padding: 16px 24px;
      }

      .profile-content {
        padding: 24px;
        max-width: 1200px;
        margin: 0 auto;
      }

      .profile-tabs {
        background: #fff;
        padding: 24px;
        border-radius: 8px;
        min-height: 500px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
      }

      :host ::ng-deep .ant-tabs-left > .ant-tabs-nav {
        width: 200px;
      }

      :host ::ng-deep .ant-tabs-tab {
        padding: 12px 24px;
        margin: 4px 0 !important;
        border-radius: 4px;
      }

      :host ::ng-deep .ant-tabs-tab-active {
        background: #f0f5ff;
      }
    `,
  ],
})
export class ProfilePageComponent implements OnInit {
  private authService = inject(AuthService);

  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.loading.set(true);
    this.error.set(null);

    this.authService.getProfile().subscribe({
      next: () => {
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.message || 'Не удалось загрузить данные профиля');
        this.loading.set(false);
      },
    });
  }
}
