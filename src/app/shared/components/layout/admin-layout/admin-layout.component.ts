import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AdminHeaderComponent } from '../admin-header/admin-header.component';
import { ConsolePanelComponent } from '../console-panel/console-panel.component';
import { FooterComponent } from '../footer/footer.component';
import { GlobalStatusBarComponent } from '../global-status-bar/global-status-bar.component';
import { LeftSidebarComponent } from '../left-sidebar/left-sidebar.component';
import { DEFAULT_SIDEBAR_CONFIG } from '../left-sidebar/sidebar-default.config';
import { SidebarConfig } from '../left-sidebar/sidebar.model';
import { RightPanelComponent } from '../right-panel/right-panel.component';

/**
 * Admin Layout Component
 *
 * Основной макет админ-панели.
 * Объединяет все layout компоненты:
 * - AdminHeader (верх)
 * - LeftSidebar (левая навигация)
 * - RouterOutlet (основной контент)
 * - RightPanel (правая панель)
 * - GlobalStatusBar (статус бар)
 * - Footer (подвал)
 *
 * Согласно архитектуре (SOW ЧАСТЬ 2.1):
 * ┌─────────────────────────────────────────────────────────────┐
 * │ ADMIN-HEADER                                                │
 * └─────────────────────────────────────────────────────────────┘
 * ┌──────┬──────────────────────────────────────────┬───────────┐
 * │      │                                          │           │
 * │ LEFT │          ADMIN-MAIN (Body)               │   RIGHT   │
 * │ SIDE │          <router-outlet>                 │   PANEL   │
 * │ BAR  │                                          │           │
 * │      │                                          │           │
 * └──────┴──────────────────────────────────────────┴───────────┘
 * ┌─────────────────────────────────────────────────────────────┐
 * │ GLOBAL-STATUS-BAR                                           │
 * └─────────────────────────────────────────────────────────────┘
 * ┌─────────────────────────────────────────────────────────────┐
 * │ ADMIN-FOOTER                                                │
 * └─────────────────────────────────────────────────────────────┘
 */
@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    AdminHeaderComponent,
    LeftSidebarComponent,
    RightPanelComponent,
    ConsolePanelComponent,
    FooterComponent,
    GlobalStatusBarComponent,
  ],
  template: `
    <div class="admin-layout">
      <!-- Шапка -->
      <app-admin-header class="admin-layout__header"></app-admin-header>

      <!-- Рабочая область -->
      <div class="admin-layout__workspace">
        <!-- Левая навигация -->
        <app-left-sidebar class="admin-layout__sidebar" [config]="defaultConfig"></app-left-sidebar>

        <!-- Основной контент -->
        <main class="admin-layout__main">
          <router-outlet></router-outlet>
        </main>

        <!-- Правая панель -->
        <app-right-panel class="admin-layout__right-panel"></app-right-panel>

        <!-- Консоль (отдельный слой) -->
        <app-console-panel></app-console-panel>
      </div>

      <!-- Глобальный статус бар -->
      <app-global-status-bar class="admin-layout__status-bar"></app-global-status-bar>

      <!-- Подвал -->
      <app-footer class="admin-layout__footer"></app-footer>
    </div>
  `,
  styles: [
    `
      .admin-layout {
        display: flex;
        flex-direction: column;
        height: 100vh;
        overflow: hidden;
      }

      .admin-layout__header {
        flex: 0 0 auto;
        z-index: 100;
      }

      .admin-layout__workspace {
        flex: 1 1 auto;
        display: flex;
        overflow: hidden;
      }

      .admin-layout__sidebar {
        flex: 0 0 auto;
        z-index: 50;
      }

      .admin-layout__main {
        flex: 1 1 auto;
        display: flex;
        flex-direction: column;
        overflow-y: auto;
        overflow-x: hidden;
        background: transparent; // Убираем серый фон (#f0f2f5)
        padding: 0; // Убираем принудительный отступ 24px
      }

      .admin-layout__right-panel {
        flex: 0 0 auto;
        z-index: 50;
      }

      .admin-layout__status-bar {
        flex: 0 0 auto;
        z-index: 40;
      }

      .admin-layout__footer {
        flex: 0 0 auto;
        z-index: 30;
      }

      /* Скроллбар для main контента */
      .admin-layout__main::-webkit-scrollbar {
        width: 8px;
      }

      .admin-layout__main::-webkit-scrollbar-track {
        background: #f0f2f5;
      }

      .admin-layout__main::-webkit-scrollbar-thumb {
        background: #bfbfbf;
        border-radius: 4px;
      }

      .admin-layout__main::-webkit-scrollbar-thumb:hover {
        background: #8c8c8c;
      }

      /* Responsive поведение */
      @media (max-width: 992px) {
        .admin-layout__sidebar {
          position: absolute;
          left: 0;
          top: 64px;
          bottom: 0;
          z-index: 200;
          box-shadow: 2px 0 8px rgba(0, 0, 0, 0.15);
        }
      }

      @media (max-width: 768px) {
        .admin-layout__main {
          padding: 16px;
        }

        .admin-layout__right-panel {
          position: absolute;
          right: 0;
          top: 64px;
          bottom: 0;
          z-index: 190;
          box-shadow: -2px 0 8px rgba(0, 0, 0, 0.15);
        }
      }
    `,
  ],
})
export class AdminLayoutComponent {
  // Дефолтная конфигурация
  readonly defaultConfig = DEFAULT_SIDEBAR_CONFIG;

  // Input для переопределения конфигурации меню
  sidebarConfig = input<SidebarConfig>(DEFAULT_SIDEBAR_CONFIG);
}
