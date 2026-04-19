import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { SampleMainSeoInlineComponent } from './components/sample-main-seo-inline/sample-main-seo-inline.component';
import { SampleMainSeoListComponent } from './components/sample-main-seo-list/sample-main-seo-list.component';
import { SampleMainSeoModalComponent } from './components/sample-main-seo-modal/sample-main-seo-modal.component';

@Component({
  selector: 'app-sample-main-seo-manager',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    NzRadioModule,
    NzButtonModule,
    NzIconModule,
    NzToolTipModule,
    SampleMainSeoListComponent,
    SampleMainSeoModalComponent,
    SampleMainSeoInlineComponent,
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div class="header-main">
          <div class="title-with-help">
            <h1>Samole Образцовая модель: Многоязычность + SEO</h1>
            <button
              nz-button
              nzType="text"
              nz-tooltip
              nzTooltipTitle="Справка"
              class="help-btn"
              (click)="showHelp()"
            >
              <i nz-icon nzType="question-circle" nzTheme="outline"></i>
            </button>
          </div>
          <nz-radio-group [(ngModel)]="viewMode" nzButtonStyle="solid">
            <label nz-radio-button nzValue="modal">Модалка</label>
            <label nz-radio-button nzValue="inline">Встроенная</label>
            <label nz-radio-button nzValue="page">Отдельная страница</label>
          </nz-radio-group>
        </div>
        <p class="subtitle">
          Универсальный компонент в 3-х вариантах хостинга (одна форма — разные задачи)
        </p>
      </div>

      <!-- Кнопка "Создать" для полноэкранного режима -->
      <div class="page-actions" *ngIf="viewMode === 'page'">
        <button nz-button nzType="primary" routerLink="new">
          <i nz-icon nzType="plus"></i> Создать на новой странице
        </button>
      </div>

      <!-- Список (с передачей режима навигации) -->
      <app-sample-main-seo-list
        [usePageNavigation]="viewMode === 'page'"
      ></app-sample-main-seo-list>

      <!-- Варианты хостинга формы -->
      <app-sample-main-seo-modal *ngIf="viewMode === 'modal'"></app-sample-main-seo-modal>

      <div class="inline-container" *ngIf="viewMode === 'inline'">
        <app-sample-main-seo-inline></app-sample-main-seo-inline>
      </div>
    </div>
  `,
  styles: [
    `
      .page-container {
        padding: 0px;
      }
      .page-header {
        margin-bottom: 24px;
      }
      .header-main {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .title-with-help {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .help-btn {
        color: #1890ff;
        font-size: 18px;
        padding: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .help-btn:hover {
        color: #40a9ff;
      }
      h1 {
        font-size: 24px;
        font-weight: 600;
        margin-bottom: 4px;
        color: #001529;
      }
      .subtitle {
        color: #8c8c8c;
        font-size: 14px;
      }
      .page-actions {
        margin-bottom: 16px;
        display: flex;
        justify-content: flex-end;
      }
      .inline-container {
        margin-top: 24px;
      }
    `,
  ],
})
export class SampleMainSeoManagerComponent {
  private modalService = inject(NzModalService);
  viewMode: 'modal' | 'inline' | 'page' = 'modal';

  showHelp(): void {
    this.modalService.info({
      nzTitle: 'Sammple Справка: Образцовая модель (Многоязычность + SEO)',
      nzWidth: 800,
      nzContent: `
        <div style="line-height: 1.8; font-size: 14px;">
          <p>Этот компонент является <strong>продвинутым эталоном</strong> для создания SEO-ориентированных сущностей.</p>
          <div style="background: #e6f7ff; padding: 10px; border-radius: 4px; border: 1px solid #91d5ff; margin: 10px 0;">
            <strong>📘 Рекомендуем ознакомиться:</strong><br>
            <a href="/#/help/models-comparison" target="_blank" style="color: #1890ff; font-weight: bold;">Сравнение моделей: Basic vs SEO</a> — как выбрать правильный шаблон для вашей задачи.
          </div>
          <ul>
            <li>Поддерживает 3 режима хостинга: Modal, Inline, Page.</li>
          </ul>
          <h3 style="margin-top: 0; color: #1890ff;">📋 Общее описание</h3>
          <p>
            Образцовый компонент для создания многоязычных записей с поддержкой SEO-метаданных.
            Демонстрирует три варианта интеграции формы: модальное окно, встроенная панель и отдельная страница.
          </p>

          <h3 style="color: #1890ff; margin-top: 20px;">🎯 Назначение</h3>
          <p>
            Это эталонный пример реализации универсального компонента, который можно переиспользовать
            в разных контекстах приложения. Использует единую форму (SampleMainSeoFormComponent),
            которая адаптируется под три режима работы.
          </p>

          <h3 style="color: #1890ff; margin-top: 20px;">⚙️ Режимы работы</h3>
          <ul style="padding-left: 20px;">
            <li><strong>📱 Модалка (Modal):</strong> Форма открывается в модальном окне поверх списка.
            Подходит для быстрых правок без ухода со страницы. После сохранения модалка закрывается,
            список обновляется автоматически.</li>

            <li><strong>📋 Встроенная (Inline):</strong> Форма отображается справа от списка в сплит-режиме.
            Позволяет видеть список и форму одновременно. Идеально для массового редактирования записей.</li>

            <li><strong>📄 Отдельная страница (Page):</strong> Форма открывается на полноэкранной странице
            с собственным URL (например, /sample-main-seo/new или /sample-main-seo/:id/edit). Максимальная
            концентрация на редактировании, поддерживает навигацию браузера и закладки.</li>
          </ul>

          <h3 style="color: #1890ff; margin-top: 20px;">🗂️ Структура данных</h3>
          <p>Каждая запись состоит из:</p>
          <ul style="padding-left: 20px;">
            <li><strong>Основные поля:</strong> Техническое название (Name), системный код (SystemCode),
            главное изображение (UrlPictureMain), флаг активности (IsActive).</li>

            <li><strong>Многоязычные вкладки:</strong> Для каждого активного языка создаётся вкладка с полями:
            локализованное название, описание, HTML-контент, локализованное изображение.</li>

            <li><strong>SEO-метаданные:</strong> В каждой языковой вкладке: Meta Title, Meta Description,
            Meta Keywords, Open Graph теги, Schema.org разметка.</li>
          </ul>

          <h3 style="color: #ff4d4f; margin-top: 20px;">⚠️ Важные требования</h3>
          <div style="background: #fff1f0; padding: 12px; border-left: 4px solid #ff4d4f; border-radius: 4px;">
            <p style="margin: 0;"><strong>Языки должны быть инициализированы!</strong></p>
            <p style="margin: 8px 0 0 0;">
              Перед созданием первой записи обязательно перейдите в меню
              <strong>"Управление языками" → "Инициализировать"</strong>.
              Без языков форма не загрузится, и вы увидите ошибку.
            </p>
          </div>

          <h3 style="color: #1890ff; margin-top: 20px;">🚀 Быстрый старт</h3>
          <ol style="padding-left: 20px;">
            <li>Убедитесь, что языки инициализированы (см. выше)</li>
            <li>Выберите режим работы: Модалка / Встроенная / Страница</li>
            <li>Нажмите "Добавить запись" (или "Создать на новой странице")</li>
            <li>Заполните основные поля на главной вкладке</li>
            <li>Переключайтесь между языковыми вкладками и заполняйте локализованные данные</li>
            <li>Раскройте секцию "SEO" для заполнения метаданных (опционально)</li>
            <li>Нажмите "Сохранить" — запись появится в списке</li>
          </ol>

          <h3 style="color: #1890ff; margin-top: 20px;">💡 Советы по использованию</h3>
          <ul style="padding-left: 20px;">
            <li>Используйте <strong>системный код</strong> (например, sample-about-us) для идентификации
            записей в коде приложения</li>
            <li><strong>Главное изображение</strong> используется по умолчанию, если для языка не задано локализованное</li>
            <li><strong>Meta Title</strong> автоматически генерируется из названия, если не заполнен вручную</li>
            <li>Деактивируйте записи через переключатель вместо удаления — так сохранится история</li>
            <li>В режиме "Встроенная" удобно быстро пролистать и отредактировать несколько записей подряд</li>
          </ul>

          <h3 style="color: #1890ff; margin-top: 20px;">🔗 Связанные компоненты</h3>
          <ul style="padding-left: 20px;">
            <li><strong>SampleMainSeoFormComponent:</strong> Универсальная форма, используемая во всех режимах</li>
            <li><strong>SampleMainSeoStateService:</strong> Управление состоянием (CRUD операции, модалка)</li>
            <li><strong>LanguageService:</strong> Предоставляет список активных языков для вкладок</li>
            <li><strong>VSModalService:</strong> Кастомный сервис модальных окон в стиле VS Code</li>
          </ul>

          <h3 style="color: #1890ff; margin-top: 20px;">📚 Применение паттерна</h3>
          <p>
            Этот компонент — шаблон для создания других многоязычных сущностей в приложении:
            платформы, категории, статьи блога и т.д. Скопируйте структуру и адаптируйте под свои модели данных.
          </p>
        </div>
      `,
      nzOkText: 'Понятно',
      nzCentered: true,
    });
  }
}
