import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Footer Component
 *
 * Компонент подвала админ-панели.
 * Содержит:
 * - Версию приложения
 * - Копирайт
 * - Ссылки на помощь и документацию
 *
 * Согласно архитектуре (SOW ЧАСТЬ 4.4):
 * - Только мета-информация
 * - НЕ отвечает за логику, состояния и данные
 */
@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <footer class="admin-footer">
      <div class="admin-footer__info">
        <span class="admin-footer__version">Aurora Admin v{{ version }}</span>
        <span class="admin-footer__divider">|</span>
        <span class="admin-footer__copyright">© {{ currentYear }} Aurora Team</span>
      </div>

      <div class="admin-footer__links">
        <a href="#" class="admin-footer__link">Помощь</a>
        <span class="admin-footer__divider">|</span>
        <a href="#" class="admin-footer__link">Документация</a>
        <span class="admin-footer__divider">|</span>
        <a href="#" class="admin-footer__link">Конфиденциальность</a>
      </div>
    </footer>
  `,
  styles: [
    `
      .admin-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        height: 48px;
        padding: 0 24px;
        background: #fafafa;
        border-top: 1px solid #f0f0f0;
        font-size: 13px;
        color: #8c8c8c;
      }

      .admin-footer__info,
      .admin-footer__links {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .admin-footer__divider {
        color: #d9d9d9;
      }

      .admin-footer__version {
        font-weight: 500;
        color: #595959;
      }

      .admin-footer__link {
        color: #8c8c8c;
        text-decoration: none;
        transition: color 0.3s;
      }

      .admin-footer__link:hover {
        color: #1890ff;
      }

      @media (max-width: 768px) {
        .admin-footer {
          flex-direction: column;
          height: auto;
          padding: 12px 24px;
          gap: 8px;
        }
      }
    `,
  ],
})
export class FooterComponent {
  version = '1.0.0';
  currentYear = new Date().getFullYear();
}
