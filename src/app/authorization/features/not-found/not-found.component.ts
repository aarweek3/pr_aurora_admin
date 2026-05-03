import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Location } from '@angular/common';
import { NzResultModule } from 'ng-zorro-antd/result';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzDividerModule } from 'ng-zorro-antd/divider';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    NzResultModule,
    NzButtonModule,
    NzIconModule,
    NzCardModule,
    NzTypographyModule,
    NzSpaceModule,
    NzDividerModule
  ],
  template: `
    <div class="not-found-container">
      <div class="not-found-content">
        <!-- Главный результат 404 -->
        <nz-result
          nzStatus="404"
          nzTitle="404"
          nzSubTitle="Извините, запрашиваемая страница не найдена"
          [nzExtra]="actionButtonsTemplate"
          class="main-result"
        >
          <ng-template #actionButtonsTemplate>
            <nz-space nzDirection="horizontal" nzSize="middle">
              <button
                nz-button
                nzType="primary"
                nzSize="large"
                (click)="goHome()"
                class="action-button"
              >
                <span nz-icon nzType="home" nzTheme="outline"></span>
                На главную
              </button>
              <button
                nz-button
                nzType="default"
                nzSize="large"
                (click)="goBack()"
                class="action-button"
              >
                <span nz-icon nzType="arrow-left" nzTheme="outline"></span>
                Назад
              </button>
            </nz-space>
          </ng-template>
        </nz-result>

        <!-- Дополнительная информация -->
        <nz-card class="help-card" nzTitle="Что можно сделать?" [nzBordered]="false">
          <div class="help-content">
            <div class="help-section">
              <h4 nz-typography class="help-title">
                <span nz-icon nzType="question-circle" nzTheme="outline"></span>
                Возможные причины:
              </h4>
              <ul class="help-list">
                <li>Неправильно введен адрес страницы</li>
                <li>Страница была перемещена или удалена</li>
                <li>Ссылка устарела или повреждена</li>
                <li>У вас нет прав для просмотра этой страницы</li>
              </ul>
            </div>

            <nz-divider></nz-divider>

            <div class="help-section">
              <h4 nz-typography class="help-title">
                <span nz-icon nzType="bulb" nzTheme="outline"></span>
                Рекомендации:
              </h4>
              <ul class="help-list">
                <li>Проверьте правильность написания URL</li>
                <li>Воспользуйтесь поиском по сайту</li>
                <li>Перейдите на главную страницу</li>
                <li>Обратитесь к администратору сайта</li>
              </ul>
            </div>
          </div>
        </nz-card>

        <!-- Быстрые ссылки -->
        <nz-card class="quick-links-card" nzTitle="Популярные разделы" [nzBordered]="false">
          <nz-space nzDirection="horizontal" nzSize="middle" nzWrap>
            <button
              nz-button
              nzType="link"
              nzSize="large"
              routerLink="/dashboard"
              class="quick-link"
            >
              <span nz-icon nzType="dashboard" nzTheme="outline"></span>
              Панель управления
            </button>
            <button
              nz-button
              nzType="link"
              nzSize="large"
              routerLink="/profile"
              class="quick-link"
            >
              <span nz-icon nzType="user" nzTheme="outline"></span>
              Профиль
            </button>
            <button
              nz-button
              nzType="link"
              nzSize="large"
              routerLink="/settings"
              class="quick-link"
            >
              <span nz-icon nzType="setting" nzTheme="outline"></span>
              Настройки
            </button>
            <button
              nz-button
              nzType="link"
              nzSize="large"
              routerLink="/help"
              class="quick-link"
            >
              <span nz-icon nzType="question-circle" nzTheme="outline"></span>
              Помощь
            </button>
          </nz-space>
        </nz-card>

        <!-- Контактная информация -->
        <div class="contact-info">
          <p nz-typography nzType="secondary" class="contact-text">
            Если проблема повторяется, обратитесь в
            <a href="mailto:support@example.com" class="contact-link">
              службу поддержки
            </a>
          </p>
        </div>
      </div>

      <!-- Декоративные элементы -->
      <div class="background-decoration">
        <div class="decoration-shape shape-1"></div>
        <div class="decoration-shape shape-2"></div>
        <div class="decoration-shape shape-3"></div>
      </div>
    </div>
  `,
  styles: [`
    .not-found-container {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 24px;
      background: linear-gradient(135deg, #f0f2f5 0%, #e6f7ff 50%, #f6ffed 100%);
      position: relative;
      overflow: hidden;
    }

    .not-found-content {
      width: 100%;
      max-width: 800px;
      z-index: 10;
      animation: fadeInUp 0.8s ease-out;
    }

    .main-result {
      background: white;
      border-radius: 16px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
      margin-bottom: 24px;
      padding: 24px;
    }

    .action-button {
      min-width: 120px;
      height: 44px;
      border-radius: 8px;
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 8px;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .action-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .help-card,
    .quick-links-card {
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
      margin-bottom: 20px;
      overflow: hidden;
    }

    .help-content {
      padding: 8px 0;
    }

    .help-section {
      margin-bottom: 16px;
    }

    .help-title {
      margin-bottom: 12px !important;
      font-size: 16px !important;
      font-weight: 600 !important;
      color: #262626 !important;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .help-list {
      margin: 0;
      padding-left: 24px;
      list-style: none;
    }

    .help-list li {
      margin-bottom: 8px;
      padding-left: 16px;
      position: relative;
      color: #595959;
      line-height: 1.6;
    }

    .help-list li::before {
      content: '•';
      position: absolute;
      left: 0;
      color: #1890ff;
      font-weight: bold;
    }

    .quick-link {
      height: 40px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 0 16px;
      transition: all 0.3s;
    }

    .quick-link:hover {
      background: #f0f0f0;
      transform: translateY(-1px);
    }

    .contact-info {
      text-align: center;
      margin-top: 16px;
    }

    .contact-text {
      margin: 0 !important;
      font-size: 14px;
    }

    .contact-link {
      color: #1890ff;
      text-decoration: none;
      font-weight: 500;
      transition: color 0.3s;
    }

    .contact-link:hover {
      color: #40a9ff;
      text-decoration: underline;
    }

    /* Декоративные элементы */
    .background-decoration {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 1;
      overflow: hidden;
    }

    .decoration-shape {
      position: absolute;
      border-radius: 50%;
      background: rgba(24, 144, 255, 0.05);
      animation: float 6s ease-in-out infinite;
    }

    .shape-1 {
      width: 200px;
      height: 200px;
      top: 10%;
      left: -5%;
      animation-delay: 0s;
    }

    .shape-2 {
      width: 150px;
      height: 150px;
      top: 60%;
      right: -3%;
      animation-delay: 2s;
      background: rgba(82, 196, 26, 0.05);
    }

    .shape-3 {
      width: 120px;
      height: 120px;
      bottom: 15%;
      left: 8%;
      animation-delay: 4s;
      background: rgba(250, 173, 20, 0.05);
    }

    /* Анимации */
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes float {
      0%, 100% {
        transform: translateY(0px) rotate(0deg);
      }
      50% {
        transform: translateY(-20px) rotate(180deg);
      }
    }

    /* Переопределения Ng Zorro */
    ::ng-deep .ant-result-title {
      font-size: 48px !important;
      font-weight: 700 !important;
      color: #ff4d4f !important;
      margin-bottom: 16px !important;
    }

    ::ng-deep .ant-result-subtitle {
      font-size: 18px !important;
      color: #8c8c8c !important;
      margin-bottom: 32px !important;
    }

    ::ng-deep .ant-result-icon > .anticon {
      font-size: 72px !important;
      color: #ff4d4f !important;
    }

    ::ng-deep .ant-card-head-title {
      font-size: 18px !important;
      font-weight: 600 !important;
      color: #262626 !important;
    }

    ::ng-deep .ant-divider {
      margin: 16px 0 !important;
    }

    /* Responsive дизайн */
    @media (max-width: 768px) {
      .not-found-container {
        padding: 16px;
      }

      .not-found-content {
        max-width: 100%;
      }

      .main-result {
        padding: 20px;
        margin-bottom: 16px;
      }

      .action-button {
        min-width: 100px;
        height: 40px;
      }

      .help-list {
        padding-left: 16px;
      }

      .decoration-shape {
        display: none;
      }

      ::ng-deep .ant-result-title {
        font-size: 36px !important;
      }

      ::ng-deep .ant-result-subtitle {
        font-size: 16px !important;
      }

      ::ng-deep .ant-result-icon > .anticon {
        font-size: 56px !important;
      }
    }

    @media (max-width: 480px) {
      .not-found-container {
        padding: 12px;
      }

      .main-result {
        padding: 16px;
      }

      .help-card,
      .quick-links-card {
        margin-bottom: 12px;
      }

      .action-button {
        width: 100%;
        margin-bottom: 8px;
      }

      ::ng-deep .ant-space-horizontal {
        flex-direction: column;
        width: 100%;
      }

      ::ng-deep .ant-result-title {
        font-size: 32px !important;
      }

      ::ng-deep .ant-result-subtitle {
        font-size: 15px !important;
      }
    }
  `]
})
export class NotFoundComponent {
  private router = inject(Router);
  private location = inject(Location);

  /**
   * Навигация на главную страницу
   */
  goHome(): void {
    this.router.navigate(['/']);
  }

  /**
   * Возврат на предыдущую страницу
   */
  goBack(): void {
    this.location.back();
  }

  /**
   * Навигация к определенному маршруту
   * @param route - маршрут для навигации
   */
  navigateTo(route: string): void {
    this.router.navigate([route]);
  }

  /**
   * Обновление текущей страницы
   */
  refreshPage(): void {
    window.location.reload();
  }
}
