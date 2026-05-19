import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HelpCopyContainerComponent, HelpPathHeaderComponent } from '@shared/components/ui';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzTagModule } from 'ng-zorro-antd/tag';

@Component({
  selector: 'app-developer-help',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzCardModule,
    NzTabsModule,
    NzTableModule,
    NzTagModule,
    NzIconModule,
    NzAlertModule,
    NzInputModule,
    NzSelectModule,
    NzSwitchModule,
    NzPaginationModule,
    HelpCopyContainerComponent,
    HelpPathHeaderComponent,
  ],
  template: `
    <div class="help-container">
      <av-help-path-header
        title="Developer Of Aggregator Model"
        subtitle="Техническая спецификация сущности Разработчик (Вендор) в системе агрегатора."
        icon="👨‍💻"
        componentPath="src/app/pages/help/developer-help/developer-help.component.ts"
      ></av-help-path-header>

      <nz-tabset nzType="card" class="help-tabs">
        <!-- 1. ОБЗОР -->
        <nz-tab nzTitle="🌟 Обзор">
          <div class="help-section">
            <nz-card nzTitle="Назначение">
              <p>
                Сущность <strong>DeveloperOfAggregator</strong> предназначена для хранения
                информации о создателях программного обеспечения. Она является ключевым справочником
                для группировки ПО по вендорам.
              </p>
              <div class="feature-grid">
                <div class="feature-item">
                  <i nz-icon nzType="folder-open" class="f-icon"></i>
                  <div class="f-text">
                    <strong>Алфавитное шардирование:</strong> Автоматическое распределение
                    медиа-файлов по подпапкам (A-Z) для масштабируемости.
                  </div>
                </div>
                <div class="feature-item">
                  <i nz-icon nzType="translation" class="f-icon"></i>
                  <div class="f-text">
                    <strong>Smart Fallback:</strong> Автозаполнение пустых переводов из английской
                    локализации или технического имени.
                  </div>
                </div>
                <div class="feature-item">
                  <i nz-icon nzType="fullscreen" class="f-icon"></i>
                  <div class="f-text">
                    <strong>Dual-Mode UI:</strong> Работа в режиме модального окна для быстрых
                    правок или на отдельной странице для глубокого редактирования.
                  </div>
                </div>
              </div>
            </nz-card>

            <nz-alert
              nzType="success"
              nzMessage="Reference Implementation / Золотой Эталон Aurora v3.5"
              nzDescription="Модуль является образцом реализации современных паттернов: Signals, CRUD v1, алфавитное шардирование и умная система локализации."
              nzShowIcon
            ></nz-alert>

            <nz-card nzTitle="⚙️ Системные требования БД" style="margin-top: 16px;">
              <p>
                Для корректной работы логики «Умного мастера» в справочнике разработчиков
                <strong>обязательно</strong> должна присутствовать запись с <code>ID = 1</code>.
              </p>
              <div
                class="logic-card"
                style="background: #fffbe6; border: 1px solid #ffe58f; padding: 12px; border-radius: 8px;"
              >
                <ul style="margin-bottom: 0; padding-left: 20px;">
                  <li><strong>ID: 1</strong> — Зарезервированный системный идентификатор.</li>
                  <li>
                    <strong>Назначение:</strong> Используется как значение по умолчанию («Не
                    указан»), когда оператор оставляет поле разработчика пустым в мастере программ.
                  </li>
                  <li>
                    <strong>Рекомендация:</strong> При начальном заполнении БД (Seed Data) создайте
                    под этим ID запись с системным именем <em>"Unknown / Не указан"</em>.
                  </li>
                </ul>
              </div>
            </nz-card>
          </div>
        </nz-tab>

        <!-- 2. МОДЕЛЬ ДАННЫХ -->
        <nz-tab nzTitle="💾 Структура БД">
          <div class="help-section">
            <nz-card nzTitle="Core Entity (DeveloperOfAggregator)">
              <nz-table #coreTable [nzData]="coreFields" [nzFrontPagination]="false" nzSize="small">
                <thead>
                  <tr>
                    <th>Поле</th>
                    <th>Тип</th>
                    <th>Описание</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let f of coreTable.data">
                    <td>
                      <code>{{ f.name }}</code>
                    </td>
                    <td>
                      <nz-tag>{{ f.type }}</nz-tag>
                    </td>
                    <td>{{ f.desc }}</td>
                  </tr>
                </tbody>
              </nz-table>
            </nz-card>

            <nz-card nzTitle="Localization (DeveloperOfAggregatorLocalization)">
              <nz-table #locTable [nzData]="locFields" [nzFrontPagination]="false" nzSize="small">
                <thead>
                  <tr>
                    <th>Поле</th>
                    <th>Тип</th>
                    <th>Описание</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let f of locTable.data">
                    <td>
                      <code>{{ f.name }}</code>
                    </td>
                    <td>
                      <nz-tag>{{ f.type }}</nz-tag>
                    </td>
                    <td>{{ f.desc }}</td>
                  </tr>
                </tbody>
              </nz-table>
            </nz-card>
          </div>
        </nz-tab>

        <!-- 3. ПОИСК И СОРТИРОВКА -->
        <nz-tab nzTitle="🔍 Поиск и Сортировка">
          <div class="help-section">
            <nz-card nzTitle="Универсальный компонент поиска (AvSearchComponent)">
              <p>
                В модуле используется <strong>Universal Search Hero</strong> — стандартизированный
                компонент Aurora из <code>&#64;shared/components/ui/search</code>.
              </p>

              <div class="feature-grid">
                <div class="feature-item">
                  <i nz-icon nzType="thunderbolt" class="f-icon"></i>
                  <div class="f-text">
                    <strong>Реактивный Debounce:</strong> Автоматическая задержка в 300мс при наборе
                    текста, чтобы минимизировать нагрузку на БД.
                  </div>
                </div>
                <div class="feature-item">
                  <i nz-icon nzType="interaction" class="f-icon"></i>
                  <div class="f-text">
                    <strong>Two-way Signals:</strong> Использование <code>model signal</code> для
                    мгновенной синхронизации строки поиска между компонентами.
                  </div>
                </div>
              </div>

              <div class="logic-card full-width" style="margin-top: 16px;">
                <h4>Техническая интеграция:</h4>
                <ul>
                  <li>
                    <strong>Шаблон:</strong>
                    <code
                      >&lt;av-search [(value)]="searchTerm"
                      (searchChange)="onSearchChange($event)"&gt;</code
                    >
                  </li>
                  <li>
                    <strong>Входные данные:</strong> <code>avPlaceholder</code> (подсказка),
                    <code>avLoading</code> (индикация процесса).
                  </li>
                  <li>
                    <strong>Событие onSearch:</strong> Срабатывает автоматически после паузы или
                    мгновенно при нажатии <b>Enter</b>.
                  </li>
                </ul>
              </div>
            </nz-card>

            <nz-card nzTitle="Серверная фильтрация & Сортировка (Backend Pattern)">
              <p>
                Поиск и сортировка выполняются на стороне базы данных PostgreSQL для обеспечения
                производительности при больших объемах данных.
              </p>

              <div class="logic-grid">
                <div class="logic-card">
                  <h4>Логика поиска (C#)</h4>
                  <ul>
                    <li>
                      <strong>Поля:</strong> <code>Name</code>, <code>SystemCode</code> и
                      локализованные имена в <code>Localizations</code>.
                    </li>
                    <li>
                      <strong>Регистр:</strong> Поиск регистронезависимый (используется
                      <code>ToLower()</code>).
                    </li>
                    <li>
                      <strong>SEO:</strong> <nz-tag nzColor="default">Исключено</nz-tag> (поля
                      MetaTitle/Description не участвуют в поиске согласно стандарту вендоров).
                    </li>
                  </ul>
                </div>
                <div class="logic-card">
                  <h4>Параметры сортировки</h4>
                  <ul>
                    <li><code>Id</code>, <code>Name</code>, <code>SystemCode</code>.</li>
                    <li><code>SortOrder</code> (Приоритет в каталоге).</li>
                    <li>
                      <code>ProgramsCount</code> — <nz-tag nzColor="blue">New</nz-tag> Сортировка по
                      количеству софта.
                    </li>
                  </ul>
                </div>
              </div>
            </nz-card>

            <av-help-copy-container
              title="Пример: Реализация серверного поиска"
              [content]="serverSearchCode"
              bgColor="#1e293b"
            ></av-help-copy-container>
          </div>
        </nz-tab>

        <!-- НОВАЯ ВКЛАДКА: UI LAYOUT -->
        <nz-tab nzTitle="🎨 UI Layout">
          <div class="help-section">
            <nz-card nzTitle="Визуальный эталон интерфейса (Golden Sample UI)">
              <!-- MAIN CONTAINER MOCK (Matches Screenshot) -->
              <div
                class="ui-mockup-v35"
                style="border: 1px solid #f1f5f9; border-radius: 16px; overflow: hidden; background: #fff; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05); font-family: 'Inter', system-ui, -apple-system, sans-serif;"
              >
                <!-- 1. TOP HEADER -->
                <div
                  style="padding: 24px 32px; display: flex; justify-content: space-between; align-items: flex-start; background: linear-gradient(135deg, #fff 0%, #f8fafc 100%);"
                >
                  <div>
                    <h2
                      style="margin: 0; font-size: 24px; font-weight: 800; color: #0f172a; display: flex; align-items: center; gap: 10px;"
                    >
                      Разработчики Агрегатора
                      <i
                        nz-icon
                        nzType="setting"
                        style="font-size: 16px; color: #64748b; cursor: pointer;"
                      ></i>
                    </h2>
                    <div
                      style="font-size: 13px; color: #64748b; margin-top: 4px; display: flex; align-items: center; gap: 12px;"
                    >
                      Справочник вендоров и создателей ПО (Aurora v3.5 Reference)
                      <span
                        style="background: #eff6ff; color: #2563eb; padding: 2px 10px; border-radius: 12px; font-weight: 600; font-size: 11px; border: 1px solid #dbeafe;"
                        >— Всего: 5</span
                      >
                    </div>
                  </div>

                  <div style="display: flex; gap: 16px; align-items: center;">
                    <div
                      style="background: #f1f5f9; padding: 4px; border-radius: 8px; display: flex; gap: 4px;"
                    >
                      <div
                        style="padding: 4px 12px; background: #fff; border-radius: 6px; font-size: 11px; font-weight: 700; color: #2563eb; box-shadow: 0 2px 4px rgba(0,0,0,0.05);"
                      >
                        Модалка
                      </div>
                      <div
                        style="padding: 4px 12px; font-size: 11px; font-weight: 600; color: #64748b;"
                      >
                        Страница
                      </div>
                    </div>
                    <button
                      nz-button
                      nzType="primary"
                      style="background: #2563eb; border-radius: 6px; height: 38px; font-weight: 600; box-shadow: 0 4px 6px -1px rgba(37,99,235,0.2);"
                    >
                      <i nz-icon nzType="plus" style="margin-right: 6px;"></i>Добавить разработчика
                    </button>
                  </div>
                </div>

                <!-- 2. CONTENT CARD (Inner) -->
                <div
                  style="margin: 0 24px 24px; background: #fff; border: 1px solid #f1f5f9; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.02); overflow: hidden;"
                >
                  <!-- FILTER TOOLBAR -->
                  <div
                    style="padding: 20px; display: flex; gap: 12px; align-items: center; border-bottom: 1px solid #f1f5f9;"
                  >
                    <div style="flex: 1; position: relative;">
                      <nz-input-group [nzPrefix]="prefixIconSearch">
                        <input
                          type="text"
                          nz-input
                          placeholder="Поиск по названию или коду..."
                          style="border-radius: 6px; height: 36px; border: 1px solid #e2e8f0;"
                        />
                      </nz-input-group>
                      <ng-template #prefixIconSearch
                        ><i nz-icon nzType="search" style="color: #94a3b8;"></i
                      ></ng-template>
                    </div>
                    <nz-select nzPlaceHolder="Все языки" style="width: 180px;"> </nz-select>
                    <div
                      style="display: flex; align-items: center; gap: 10px; padding: 0 16px; border-left: 1px solid #f1f5f9;"
                    >
                      <span
                        style="font-size: 11px; font-weight: 700; color: #475569; letter-spacing: 0.5px;"
                        >КОРЗИНА</span
                      >
                      <nz-switch nzSize="small"></nz-switch>
                    </div>
                  </div>

                  <!-- TABLE HEADER (Custom Styled) -->
                  <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
                    <thead
                      style="background: #f8fafc; color: #475569; border-bottom: 1px solid #f1f5f9;"
                    >
                      <tr>
                        <th
                          style="padding: 12px 20px; text-align: left; font-weight: 600; width: 60px;"
                        >
                          ID
                        </th>
                        <th style="padding: 12px; text-align: left; font-weight: 600;">
                          Разработчик
                        </th>
                        <th
                          style="padding: 12px; text-align: left; font-weight: 600; width: 180px;"
                        >
                          Код (SystemCode)
                        </th>
                        <th
                          style="padding: 12px; text-align: left; font-weight: 600; width: 100px;"
                        >
                          Порядок
                        </th>
                        <th
                          style="padding: 12px; text-align: left; font-weight: 600; width: 120px;"
                        >
                          Программы
                        </th>
                        <th style="padding: 12px; text-align: left; font-weight: 600;">Сайт</th>
                        <th
                          style="padding: 12px; text-align: left; font-weight: 600; width: 100px;"
                        >
                          Статус
                        </th>
                        <th
                          style="padding: 12px; text-align: center; font-weight: 600; width: 140px;"
                        >
                          Действия
                        </th>
                      </tr>
                    </thead>
                    <tbody style="color: #334155;">
                      <!-- ROW 1 -->
                      <tr style="border-bottom: 1px solid #f1f5f9;">
                        <td style="padding: 16px 20px; color: #64748b; font-weight: 500;">3</td>
                        <td style="padding: 12px;">
                          <div style="display: flex; align-items: center; gap: 12px;">
                            <div
                              style="width: 32px; height: 32px; background: #eff6ff; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #2563eb; font-size: 16px; border: 1px solid #dbeafe;"
                            >
                              <i nz-icon nzType="api"></i>
                            </div>
                            <div>
                              <div style="font-weight: 600; color: #1e293b;">Adobe Inc.</div>
                              <div style="font-size: 11px; color: #94a3b8;">Adobe</div>
                            </div>
                          </div>
                        </td>
                        <td style="padding: 12px;">
                          <span
                            style="background: #f0f9ff; color: #0369a1; padding: 2px 8px; border-radius: 4px; border: 1px solid #e0f2fe; font-family: monospace;"
                            >adobe</span
                          >
                        </td>
                        <td style="padding: 12px;">
                          <span
                            style="background: #fffbeb; color: #92400e; width: 22px; height: 22px; display: flex; align-items: center; justify-content: center; border-radius: 4px; border: 1px solid #fef3c7; font-weight: 600;"
                            >3</span
                          >
                        </td>
                        <td style="padding: 12px; color: #64748b;">
                          <i
                            nz-icon
                            nzType="appstore"
                            style="color: #3b82f6; margin-right: 5px;"
                          ></i>
                          0
                        </td>
                        <td style="padding: 12px;">
                          <a href="#" style="color: #3b82f6; text-decoration: none;"
                            >https://www.adobe.com</a
                          >
                        </td>
                        <td style="padding: 12px;">
                          <span
                            style="color: #10b981; background: #ecfdf5; padding: 2px 10px; border-radius: 4px; font-size: 11px; border: 1px solid #d1fae5;"
                            >Активен</span
                          >
                        </td>
                        <td style="padding: 12px; text-align: center;">
                          <div
                            style="display: flex; justify-content: center; gap: 12px; color: #94a3b8;"
                          >
                            <i nz-icon nzType="eye" style="cursor: pointer;"></i>
                            <i nz-icon nzType="edit" style="cursor: pointer; color: #3b82f6;"></i>
                            <i nz-icon nzType="delete" style="cursor: pointer; color: #f59e0b;"></i>
                            <i nz-icon nzType="sync" style="cursor: pointer; color: #ef4444;"></i>
                          </div>
                        </td>
                      </tr>
                      <!-- ROW 2 (APPLE) -->
                      <tr style="border-bottom: 1px solid #f1f5f9;">
                        <td style="padding: 16px 20px; color: #64748b;">5</td>
                        <td style="padding: 12px;">
                          <div style="display: flex; align-items: center; gap: 12px;">
                            <div
                              style="width: 32px; height: 32px; background: #eff6ff; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #2563eb; border: 1px solid #dbeafe;"
                            >
                              <i nz-icon nzType="api"></i>
                            </div>
                            <div>
                              <div style="font-weight: 600;">Apple Inc.</div>
                              <div style="font-size: 11px; color: #94a3b8;">Apple</div>
                            </div>
                          </div>
                        </td>
                        <td style="padding: 12px;">
                          <span
                            style="background: #f0f9ff; color: #0369a1; padding: 2px 8px; border-radius: 4px; border: 1px solid #e0f2fe; font-family: monospace;"
                            >apple</span
                          >
                        </td>
                        <td style="padding: 12px;">
                          <span
                            style="background: #fffbeb; color: #92400e; width: 22px; height: 22px; display: flex; align-items: center; justify-content: center; border-radius: 4px; border: 1px solid #fef3c7; font-weight: 600;"
                            >5</span
                          >
                        </td>
                        <td style="padding: 12px; color: #64748b;">
                          <i
                            nz-icon
                            nzType="appstore"
                            style="color: #3b82f6; margin-right: 5px;"
                          ></i>
                          0
                        </td>
                        <td style="padding: 12px;">
                          <a href="#" style="color: #3b82f6;">https://www.apple.com</a>
                        </td>
                        <td style="padding: 12px;">
                          <span
                            style="color: #10b981; background: #ecfdf5; padding: 2px 10px; border-radius: 4px; font-size: 11px; border: 1px solid #d1fae5;"
                            >Активен</span
                          >
                        </td>
                        <td style="padding: 12px; text-align: center;">
                          <div
                            style="display: flex; justify-content: center; gap: 12px; color: #94a3b8;"
                          >
                            <i nz-icon nzType="eye"></i
                            ><i nz-icon nzType="edit" style="color: #3b82f6;"></i
                            ><i nz-icon nzType="delete" style="color: #f59e0b;"></i
                            ><i nz-icon nzType="sync" style="color: #ef4444;"></i>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  <!-- PAGINATION MOCK -->
                  <div
                    style="padding: 16px 32px; display: flex; justify-content: flex-end; align-items: center; gap: 15px; background: #fff;"
                  >
                    <nz-pagination [nzPageIndex]="1" [nzTotal]="5" nzSimple></nz-pagination>
                    <div style="font-size: 13px; color: #64748b;">Показано 1-5 из 5</div>
                    <nz-select [ngModel]="10" style="width: 120px;" nzSize="small">
                      <nz-option [nzValue]="10" nzLabel="10 на странице"></nz-option>
                    </nz-select>
                  </div>
                </div>

                <!-- BOTTOM STATUS BAR -->
                <div
                  style="padding: 12px 24px; background: #f8fafc; border-top: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center; font-size: 11px; color: #64748b; font-weight: 500;"
                >
                  <div style="display: flex; gap: 24px;">
                    <span style="display: flex; align-items: center; gap: 6px;"
                      ><i nz-icon nzType="database"></i> Всего записей: 5</span
                    >
                    <span style="display: flex; align-items: center; gap: 6px;"
                      ><i nz-icon nzType="global"></i> Языки: Иниц.</span
                    >
                  </div>
                  <div style="display: flex; align-items: center; gap: 10px;">
                    <span style="background: #e2e8f0; padding: 2px 8px; border-radius: 4px;"
                      >v3.5.0</span
                    >
                  </div>
                </div>
              </div>

              <div
                style="margin-top: 30px; background: #f0f9ff; border-radius: 12px; padding: 20px; border: 1px solid #bae6fd;"
              >
                <h5
                  style="color: #0369a1; font-weight: 700; display: flex; align-items: center; gap: 8px;"
                >
                  <i nz-icon nzType="info-circle"></i> Философия интерфейса Aurora v3.5
                </h5>
                <p style="font-size: 13px; color: #0c4a6e; margin: 10px 0 0 0; line-height: 1.6;">
                  Интерфейс спроектирован по паттерну
                  <strong>"Information Density & Clarity"</strong>. Мы используем мягкие тени и
                  акцентные цвета для ключевых данных (ID, SystemCode), чтобы разработчик мог
                  мгновенно ориентироваться в справочнике. Каждое действие имеет цветовую кодировку:
                  синий — конгруэнтность, оранжевый — корзина, красный — сброс/очистка.
                </p>
              </div>
            </nz-card>
          </div>
        </nz-tab>

        <!-- 4. ИКОНКИ И МЕДИА -->
        <nz-tab nzTitle="🖼️ Иконки и Медиа">
          <div class="help-section">
            <nz-card nzTitle="Алфавитное шардирование (Aurora v3.5 Sharding Storage)">
              <p>
                Для обеспечения высокой производительности файловой системы и предотвращения
                переполнения папок, в модуле реализовано
                <strong>алфавитное шардирование</strong> (1-уровневое).
              </p>

              <div class="logic-grid">
                <div class="logic-card">
                  <h5>Логика формирования пути:</h5>
                  <p>
                    Путь к файлу строится по формуле:
                    <code>uploads/&#123;folder&#125;/&#123;shard&#125;/&#123;filename&#125;</code>
                  </p>
                  <ul>
                    <li><strong>folder:</strong> Целевая папка (<code>developers</code>).</li>
                    <li>
                      <strong>shard:</strong> Первая буква имени файла (в нижнем регистре, только
                      латиница).
                    </li>
                    <li><strong>filename:</strong> Оригинальное (нормализованное) имя файла.</li>
                  </ul>
                </div>
                <div class="logic-card">
                  <h5>Пример маппинга:</h5>
                  <table style="width: 100%; font-size: 12px; border-collapse: collapse;">
                    <tr style="border-bottom: 1px solid #f1f5f9;">
                      <td style="padding: 8px;"><code>adobe.png</code></td>
                      <td style="padding: 8px;"><i nz-icon nzType="arrow-right"></i></td>
                      <td style="padding: 8px;"><code>uploads/developers/a/adobe.png</code></td>
                    </tr>
                    <tr style="border-bottom: 1px solid #f1f5f9;">
                      <td style="padding: 8px;"><code>Microsoft.jpg</code></td>
                      <td style="padding: 8px;"><i nz-icon nzType="arrow-right"></i></td>
                      <td style="padding: 8px;"><code>uploads/developers/m/microsoft.jpg</code></td>
                    </tr>
                    <tr>
                      <td style="padding: 8px;"><code>123-log.svg</code></td>
                      <td style="padding: 8px;"><i nz-icon nzType="arrow-right"></i></td>
                      <td style="padding: 8px;"><code>uploads/developers/1/123-log.svg</code></td>
                    </tr>
                  </table>
                </div>
              </div>

              <div class="logic-card full-width" style="margin-top: 16px;">
                <av-help-copy-container
                  title="Backend Implementation: UniversalMediaController.cs"
                  [content]="shardingBackendCode"
                  bgColor="#0f172a"
                ></av-help-copy-container>
              </div>
            </nz-card>

            <nz-card nzTitle="Интеграция с Frontend">
              <p>
                Фронтенд-сервис <code>ImageServiceUniversal</code> прозрачно работает с любыми
                относительными путями, возвращаемыми API.
              </p>
              <div class="feature-grid">
                <div class="feature-item">
                  <i nz-icon nzType="check-circle" class="f-icon"></i>
                  <div class="f-text">
                    Бэкенд сам создает нужную подпапку (шард), если она не существует.
                  </div>
                </div>
                <div class="feature-item">
                  <i nz-icon nzType="info-circle" class="f-icon"></i>
                  <div class="f-text">
                    При проверке существующих файлов (CheckExists) логика шардирования применяется
                    автоматически.
                  </div>
                </div>
              </div>
            </nz-card>
          </div>
        </nz-tab>

        <!-- 5. УМНАЯ ЛОКАЛИЗАЦИЯ -->
        <nz-tab nzTitle="🌍 Локализация">
          <div class="help-section">
            <nz-card nzTitle="Механизм English Fallback">
              <p>
                Система Aurora v3.5 минимизирует рутинную работу по заполнению переводов. Если
                пользователь не заполнил вкладку другого языка, данные будут автоматически подтянуты
                из английской версии.
              </p>

              <div class="logic-grid">
                <div class="logic-card">
                  <h5>Приоритеты Fallback:</h5>
                  <ol>
                    <li>Значение в текущей вкладке.</li>
                    <li>Значение из вкладки <strong>en-US</strong>.</li>
                    <li>Значение из поля <strong>Техническое название</strong>.</li>
                  </ol>
                </div>
                <div class="logic-card">
                  <h5>Охватываемые поля:</h5>
                  <ul>
                    <li>Отображаемое название (Name)</li>
                    <li>Описание (Description)</li>
                    <li>SEO Title & Meta Description</li>
                  </ul>
                </div>
              </div>

              <av-help-copy-container
                title="Реализация в StateService"
                [content]="fallbackLogicCode"
                bgColor="#1e293b"
              ></av-help-copy-container>
            </nz-card>
          </div>
        </nz-tab>

        <!-- 6. СИСТЕМНЫЕ ТРЕБОВАНИЯ (АРХИТЕКТУРА) -->
        <nz-tab nzTitle="⚙️ Системные требования">
          <div class="help-section">
            <nz-card nzTitle="Архитектурный стандарт: Системные требования v1.0">
              <p>
                Система требований реализована через связку справочника версий ОС и архитектур
                процессоров. Это позволяет избежать текстового хардкода и обеспечить фильтрацию ПО
                по совместимости.
              </p>

              <div class="logic-grid">
                <div class="logic-card">
                  <h5>Ключевые сущности:</h5>
                  <ul>
                    <li>
                      <code>PlatformOsVersionOfAggregator</code> — Справочник (Win 10, macOS
                      Sonoma).
                    </li>
                    <li><code>RequirementArchitecture</code> — Enum (x64, Arm64, Universal).</li>
                    <li><code>SystemRequirementOfAggregator</code> — Связующая таблица.</li>
                  </ul>
                </div>
                <div class="logic-card">
                  <h5>Логика Min/Max Version:</h5>
                  <p>Мы используем инклюзивный диапазон:</p>
                  <ul>
                    <li><code>Min: Win 10, Max: null</code> = "Windows 10 и выше".</li>
                    <li>Автоматическая поддержка новых ОС (Win 12) без правки кода.</li>
                  </ul>
                </div>
              </div>
            </nz-card>

            <nz-card nzTitle="Спецификация моделей (C#)">
              <nz-tabset>
                <nz-tab nzTitle="RequirementArchitecture (Enum)">
                  <av-help-copy-container [content]="sysReqEnumCode"></av-help-copy-container>
                </nz-tab>
                <nz-tab nzTitle="SystemRequirementOfAggregator">
                  <av-help-copy-container [content]="sysReqCoreCode"></av-help-copy-container>
                </nz-tab>
                <nz-tab nzTitle="Seed Data (JSON)">
                  <p>
                    Стандарт заполнения справочников через
                    <code>DAL/SeedData/Aggregator/platform_os_versions.json</code>
                  </p>
                  <av-help-copy-container [content]="sysReqJsonCode"></av-help-copy-container>
                </nz-tab>
              </nz-tabset>
            </nz-card>
          </div>
        </nz-tab>

        <!-- 7. ROADMAP -->
        <nz-tab nzTitle="🚀 Roadmap v3.5">
          <div class="help-section">
            <nz-card nzTitle="Как собрать такой модуль с нуля? (Пошаговый план)">
              <div class="roadmap-container">
                <!-- КАРТА МОДУЛЯ (БЭКЕНД) -->
                <div
                  style="margin-bottom: 30px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px;"
                >
                  <h5 style="color: #1e293b; margin-bottom: 12px; font-weight: 600;">
                    <i nz-icon nzType="cluster" style="margin-right: 8px;"></i>
                    Карта Бэкенд-модуля (DAL & API)
                  </h5>
                  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                    <div
                      style="font-family: 'Consolas', monospace; font-size: 11px; color: #334155; line-height: 1.5; background: #fff; padding: 12px; border-radius: 4px; border: 1px dashed #cbd5e1;"
                    >
                      <strong style="color: #0366d6; display: block; margin-bottom: 5px;"
                        >[DAL] Слой доступа к данным</strong
                      >
                      ├── 📂 <span style="color: #6aab73;">Models/Aggregator/</span><br />
                      │ ├── 📄 DeveloperOfAggregator.cs<br />
                      │ └── 📄 Localizations/Devel...Localization.cs<br />
                      ├── 📂 <span style="color: #6aab73;">Repositories/</span><br />
                      │ ├── 📄 DeveloperOfAggregatorRepository.cs<br />
                      │ └── 📄 Interfaces/IDeveloperOfAgg...Repository.cs<br />
                      ├── 📄 AppDbContext.Aggregator.cs<br />
                      └── 📄 AggregatorModelConfiguration.cs
                    </div>
                    <div
                      style="font-family: 'Consolas', monospace; font-size: 11px; color: #334155; line-height: 1.5; background: #fff; padding: 12px; border-radius: 4px; border: 1px dashed #cbd5e1;"
                    >
                      <strong style="color: #0366d6; display: block; margin-bottom: 5px;"
                        >[API] Слой логики и сервисов</strong
                      >
                      ├── 📂 <span style="color: #6aab73;">Controllers/</span><br />
                      │ └── 📄 DeveloperOfAggregatorController.cs<br />
                      └── 📂
                      <span style="color: #6aab73;">Pages/AGGREGATOR/DeveloperOfAggregator/</span
                      ><br />
                      ├── 📂 Dtos/DeveloperOfAggregatorDto.cs<br />
                      ├── 📂 Interfaces/IDeveloperOfAgg...Service.cs<br />
                      ├── 📂 Services/DeveloperOfAggregatorService.cs<br />
                      ├── 📂 Mappings/DeveloperOfAggregatorProfile.cs<br />
                      ├── 📂 Validators/DeveloperOfAgg...Validators.cs<br />
                      └── 📂 Jsons/DeveloperOfAggregator.json
                    </div>
                  </div>
                </div>
                <div class="roadmap-step">
                  <div class="step-header">
                    <nz-tag nzColor="blue">Step 1</nz-tag>
                    <strong>Бэкенд: Модели и БД</strong>
                  </div>
                  <ul>
                    <li>
                      Создайте <code>Entity</code> и <code>Localization</code> в папке
                      <code>DAL/Models/Aggregator</code>.
                    </li>
                    <li>
                      <strong>Техническая спецификация (Стандарт v3.5):</strong>
                      <div
                        class="logic-card"
                        style="margin: 8px 0; background: #f0f9ff; border: 1px solid #bae6fd;"
                      >
                        <div style="font-weight: 600; margin-bottom: 4px; color: #0369a1;">
                          Core Entity:
                        </div>
                        <ul style="margin: 4px 0; font-size: 13px; color: #0c4a6e;">
                          <li><code>Name</code> (Required, MaxLength) - Системное имя</li>
                          <li><code>SystemCode</code> (Required, MaxLength) - Slug для URL</li>
                          <li><code>IsActive</code> (bool) - По умолчанию true</li>
                          <li><code>SortOrder</code> (int) - По умолчанию 0</li>
                          <li><code>IconPath</code> (string?) - Путь к иконке</li>
                        </ul>
                        <div style="margin-top: 8px; font-size: 12px;">
                          Унаследовано от: <code>FullAuditableEntityOfAggregator</code>
                        </div>
                      </div>
                      <div
                        class="logic-card"
                        style="margin: 8px 0; background: #fefce8; border: 1px solid #fef08a;"
                      >
                        <div style="font-weight: 600; margin-bottom: 4px; color: #a16207;">
                          Localization Entity:
                        </div>
                        <ul style="margin: 4px 0; font-size: 13px; color: #713f12;">
                          <li><code>Name</code> (Required, MaxLength) - Витринное имя</li>
                          <li><code>Description</code> (string?) - Описание</li>
                          <li><code>MetaTitle</code> + <code>MetaDescription</code> (SEO)</li>
                        </ul>
                        <div style="margin-top: 8px; font-size: 12px;">
                          Унаследовано от: <code>AuditableEntityOfAggregator</code>
                        </div>
                      </div>
                      <div
                        class="logic-card"
                        style="margin: 8px 0; background: #fdf2f8; border: 1px solid #fbcfe8;"
                      >
                        <div style="font-weight: 600; margin-bottom: 4px; color: #9d174d;">
                          Naming Conventions:
                        </div>
                        <ul style="margin: 4px 0; font-size: 13px; color: #831843;">
                          <li>
                            <strong>Table Name:</strong>
                            <code>platforms_of_aggregator</code> (plural)
                          </li>
                          <li>
                            <strong>Localization Table:</strong>
                            <code>platform_of_aggregator_localizations</code> (singular)
                          </li>
                        </ul>
                      </div>
                    </li>
                    <li>Добавьте их в <code>AppDbContext.Aggregator.cs</code>.</li>
                    <li>
                      Настройте связи и индексы в <code>AggregatorModelConfiguration.cs</code>.
                    </li>
                    <li>
                      <strong>Миграция:</strong> Используйте CLI:
                      <code>dotnet ef migrations add ... --project DAL</code>.
                    </li>
                  </ul>

                  <nz-alert
                    nzType="info"
                    nzMessage="Golden Sample / Эталон"
                    [nzDescription]="goldenSampleDesc"
                    nzShowIcon
                    style="margin-top: 16px;"
                  ></nz-alert>
                </div>

                <div class="roadmap-step">
                  <div class="step-header">
                    <nz-tag nzColor="blue">Step 2</nz-tag>
                    <strong>Бэкенд: Репозитории и UnitOfWork</strong>
                  </div>
                  <ul>
                    <li>
                      Реализуйте <code>IRepository</code> и <code>Repository</code> в папке
                      <code>DAL/Repositories</code>.
                    </li>
                    <li>
                      <strong>Эталонная реализация (Sample):</strong>
                      <div
                        class="logic-card"
                        style="margin: 8px 0; background: #f8fafc; border: 1px dashed #cbd5e1;"
                      >
                        <ul
                          style="margin: 4px 0; font-size: 12px; list-style: none; padding-left: 0;"
                        >
                          <li>
                            📄 Interface:
                            <code
                              >DAL/Repositories/Interfaces/IPlatformOfAggregatorRepository.cs</code
                            >
                          </li>
                          <li>
                            📄 Logic:
                            <code>DAL/Repositories/PlatformOfAggregatorRepository.cs</code>
                          </li>
                        </ul>
                      </div>
                    </li>
                    <li>
                      <strong>Unit of Work:</strong> Добавьте новое свойство в
                      <code>IUnitOfWork.cs</code> и его реализацию в <code>UnitOfWork.cs</code>. Это
                      «точка входа» для всех операций с БД в сервисах.
                    </li>
                    <li>
                      <strong>DI Registration:</strong> Зарегистрируйте репозиторий в
                      <code>ServiceCollectionExtensions.cs</code>.
                      <div
                        class="logic-card"
                        style="margin: 8px 0; background: #f0fdf4; border: 1px solid #bbf7d0;"
                      >
                        <code style="font-size: 11px;"
                          >services.AddScoped&lt;IDeveloperOfAggregatorRepository,
                          DeveloperOfAggregatorRepository&gt;();</code
                        >
                      </div>
                    </li>
                  </ul>
                </div>

                <div class="roadmap-step">
                  <div class="step-header">
                    <nz-tag nzColor="blue">Step 3</nz-tag>
                    <strong>Бэкенд: Логика и API</strong>
                  </div>
                  <ul>
                    <li>
                      Реализуйте <code>IService</code>, который использует
                      <code>IUnitOfWork</code> для доступа к данным.
                    </li>
                    <li>
                      <strong>Регистрация DI:</strong> Зарегистрируйте Сервис в
                      <code>ServiceCollectionExtensions.cs</code>.
                      <div
                        class="logic-card"
                        style="margin: 8px 0; background: #eff6ff; border: 1px solid #bfdbfe;"
                      >
                        <code style="font-size: 11px;"
                          >services.AddScoped&lt;IDeveloperOfAggregatorService,
                          DeveloperOfAggregatorService&gt;();</code
                        >
                      </div>
                    </li>
                    <li>
                      <strong>Контроллер (Стандарт v3.5):</strong>
                      <ul style="margin: 4px 0; font-size: 13px;">
                        <li>
                          <strong>Имя класса:</strong>
                          <code>[EntityName]OfAggregatorController</code>
                        </li>
                        <li><strong>Base:</strong> Наследуйте от <code>ControllerBase</code>.</li>
                        <li>
                          <strong>Стандартный путь:</strong>
                          <code>api/v1/aggregator/[plural-name]</code>.
                        </li>
                        <li style="margin-top: 5px;">
                          <strong>Именование Роутов:</strong>
                          <ul style="font-size: 12px; color: #475569;">
                            <li><code>[HttpGet]</code> — Получение списка (Paged)</li>
                            <li><code>[HttpGet("&#123;id&#125;")]</code> — Детали записи</li>
                            <li>
                              <code>[HttpPut("&#123;id&#125;")]</code> — Обновление (ID в URL)
                            </li>
                            <li>
                              <code>[HttpDelete("&#123;id&#125;")]</code> — Удаление (Soft/Hard
                              через флаг)
                            </li>
                            <li>
                              <code>[HttpPost("&#123;id&#125;/restore")]</code> — Восстановление
                            </li>
                            <li>
                              <code>maintenance/seed</code> + <code>maintenance/clear</code> —
                              Обслуживание
                            </li>
                          </ul>
                        </li>
                      </ul>
                    </li>
                    <li style="margin-top: 12px;">
                      <strong>Архитектура модуля (Backend Structure):</strong>
                      <div
                        class="logic-card module-structure"
                        style="margin: 8px 0; background: #fafafa; border: 1px solid #eaeaea;"
                      >
                        <div style="font-size: 12px; line-height: 1.6;">
                          <div>
                            📂 <strong>Controllers</strong> <code>UniversalMediaController.cs</code>
                            <div style="padding-left: 15px; color: #666;">
                              Централизованная логика загрузки с поддержкой
                              <strong>алфавитного шардирования</strong>.
                            </div>
                          </div>
                          <div>
                            📂 <strong>Controllers</strong>
                            <code>DeveloperOfAggregatorController.cs</code>
                            <div style="padding-left: 15px; color: #666;">
                              Входная точка API v1. Поддержка CRUD и обслуживания.
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                    <li style="margin-top: 16px;">
                      <strong>AI Prompt: Создание Контроллера (v1):</strong>
                      <div
                        class="logic-card prompt-box"
                        style="margin: 8px 0; background: #2d2d2d; color: #e0e0e0; border-radius: 8px; padding: 12px; font-family: 'Consolas', monospace; font-size: 11px;"
                      >
                        <span style="color: #6a9955;"
                          >/* Промпт для реализации контроллера (v3.5) */</span
                        ><br />
                        Создай
                        <span style="color: #ce9178;">DeveloperOfAggregatorController.cs</span
                        >.<br />
                        1. Маршрут:
                        <span style="color: #ce9178;">[Route("api/v1/aggregator/developers")]</span
                        >.<br />
                        2. Методы: GetPaged, GetById, Create, Update, Delete, Restore, Seed,
                        Clear.<br />
                        3. Для медиа: Используй
                        <span style="color: #4ec9b0;">UniversalMediaController</span> с папкой
                        <span style="color: #ce9178;">"developers"</span>.
                      </div>
                    </li>
                  </ul>
                </div>

                <!-- КАРТА МОДУЛЯ (ФРОНТЕНД) -->
                <div
                  style="margin-bottom: 30px; background: #fff7ed; border: 1px solid #ffedd5; border-radius: 8px; padding: 16px;"
                >
                  <h5 style="color: #9a3412; margin-bottom: 12px; font-weight: 600;">
                    <i nz-icon nzType="layout" style="margin-right: 8px;"></i>
                    Карта Фронтенд-модуля (Angular v17+)
                  </h5>
                  <div
                    style="font-family: 'Consolas', monospace; font-size: 11px; color: #431407; line-height: 1.5; background: #fff; padding: 12px; border-radius: 4px; border: 1px dashed #fed7aa;"
                  >
                    <strong style="color: #ea580c; display: block; margin-bottom: 5px;"
                      >src/app/AGREGATOR/PAGES/SPRAVKA/DeveloperOfAggregatorPage/</strong
                    >
                    ├── 📂 <span style="color: #6aab73;">components/</span>
                    <span style="color: #94a3b8;"
                      >// UI компоненты (List, Form, Modal, Inline, View)</span
                    ><br />
                    ├── 📂 <span style="color: #6aab73;">models/</span>
                    <span style="color: #94a3b8;">// Интерфейсы DTO и State</span><br />
                    ├── 📂 <span style="color: #6aab73;">services/</span><br />
                    │ ├── 📄 developer-of-aggregator-api.service.ts
                    <span style="color: #94a3b8;">// API v1 Integration</span><br />
                    │ └── 📄 developer-of-aggregator-state.service.ts
                    <span style="color: #94a3b8;">// Signals + Fallbacks</span><br />
                    ├── 📄 developer-of-aggregator-manager.component.ts
                    <span style="color: #94a3b8;">// Modal/Page Orchestrator</span><br />
                    ├── 📄 developer-of-aggregator.routes.ts
                    <span style="color: #94a3b8;">// Child routes integration</span><br />
                    └── 📄 end-points.ts
                    <span style="color: #94a3b8;">// api/v1/aggregator/developers</span>
                  </div>
                </div>

                <div class="roadmap-step">
                  <div class="step-header">
                    <nz-tag nzColor="green">Step 4</nz-tag>
                    <strong>Фронтенд: Инфраструктура</strong>
                  </div>
                  <ul>
                    <li>
                      Создайте папку модуля в <code>AGREGATOR/PAGES/SPRAVKA</code> по эталону
                      Platform.
                    </li>
                    <li>
                      <strong>API Service:</strong> Реализуйте <code>getPaged</code> с
                      использованием <code>HttpParams</code>.
                      <div
                        class="logic-card"
                        style="margin: 8px 0; background: #f8fafc; border: 1px dashed #cbd5e1; font-family: monospace; font-size: 11px;"
                      >
                        let params = new HttpParams();<br />
                        Object.keys(req).forEach(k => params = params.set(k, req[k]));
                      </div>
                    </li>
                    <li>
                      <strong>State Service:</strong> Внедрите <strong>SSOT</strong> на базе
                      <code>signal&lt;State&gt;</code>.
                      <ul style="font-size: 12px; color: #64748b;">
                        <li>
                          Для реактивности используйте <code>computed()</code> для каждого поля
                          стейта.
                        </li>
                        <li>
                          Используйте <code>executeWithLoading()</code> для автоматических
                          спиннеров.
                        </li>
                      </ul>
                    </li>
                    <li>
                      Добавьте логику <code>seedFromJson</code> и <code>clearDatabase</code> (методы
                      в API и State).
                    </li>
                  </ul>
                </div>

                <div class="roadmap-step">
                  <div class="step-header">
                    <nz-tag nzColor="green">Step 5</nz-tag>
                    <strong>Фронтенд: Функциональная спецификация UI</strong>
                  </div>
                  <ul>
                    <li>
                      <strong>Управляющие Контролы (UI Controls):</strong>
                      <ul style="font-size: 12px; color: #64748b;">
                        <li>
                          🔭 <strong>Контрол Поиска:</strong> Выполнен на базе
                          <code>AvSearchComponent</code>. Это реактивный контрол, который «слушает»
                          ввод пользователя и через сигнал <code>searchTerm</code> инициирует
                          обновление всей таблицы.
                        </li>
                        <li>
                          📑 <strong>Контрол Пагинации:</strong> Инструмент навигации
                          <code>nz-pagination</code>. Управляет двумя параметрами стейта:
                          <code>pageIndex</code> и <code>pageSize</code>.
                        </li>
                        <li>
                          🌍 <strong>Контрол Фильтрации:</strong> Выпадающий список для выбора
                          языка.
                        </li>
                        <li>
                          ♻️ <strong>Контрол Состояния (Корзина):</strong> Переключатель, меняющий
                          глобальный режим отображения данных.
                        </li>
                        <li>
                          🏗️ <strong>Логика Инициализации:</strong> При
                          <code>OnInit</code> компонент обязан вызвать <code>loadItems()</code> и
                          параллельно инициализировать список языков через
                          <code>LanguageService</code>.
                        </li>
                      </ul>
                    </li>
                    <li>
                      <strong>Интерактивная таблица (Actions Logic):</strong>
                      <ul style="font-size: 12px; color: #64748b;">
                        <li>
                          📝 <strong>Редактирование:</strong> Вызывает
                          <code>openEditModal(id)</code>. Внутри:
                          <code>executeWithLoading(api.getById(id))</code>. Форма появляется только
                          после успешной загрузки Detail DTO.
                        </li>
                        <li>
                          🗑️ <strong>Soft Delete (Trash):</strong> Вызывается только для
                          <code>!isDeleted</code>. Механика: <code>ModalService.confirm</code> ->
                          <code>api.delete(id, false)</code>. Обновляет список без перезагрузки
                          страницы.
                        </li>
                        <li>
                          🔥 <strong>Hard Delete (Force):</strong> Появляется только в режиме
                          корзины. Требует <code>ModalService.challenge</code>. Полное удаление
                          записи из БД.
                        </li>
                        <li>
                          🔄 <strong>Восстановление:</strong> Видима только в корзине. Вызывает
                          <code>restore(id)</code>. Меняет статус записи и инициирует
                          <code>loadItems()</code>.
                        </li>
                        <li>
                          📊 <strong>Сортировка:</strong> Клик по заголовку таблицы вызывает
                          <code>setSort(field)</code>. Если поле уже выбрано — меняется направление
                          (ASC/DESC). Всегда сбрасывает страницу на 1.
                        </li>
                        <li>
                          🛠️ <strong>Maintenance Logic:</strong> Кнопки «Сидинг» и «Очистка» (в меню
                          настроек). <code>Clear</code> всегда требует
                          <code>Modal.challenge</code> (капча).
                        </li>
                      </ul>
                    </li>
                  </ul>
                </div>

                <div class="roadmap-step">
                  <div class="step-header">
                    <nz-tag nzColor="gold">Step 6</nz-tag>
                    <strong>Премиум Логика: Маппинг и Fallbacks</strong>
                  </div>
                  <ul>
                    <li>
                      <strong>SEO Mapping:</strong> При открытии формы стейт инициализирует объект
                      SEO из массива локализаций. При сохранении — выполняет обратный маппинг полей
                      <code>MetaTitle/Description</code>.
                    </li>
                    <li>
                      <strong>Механика English Fallbacks:</strong>
                      <div
                        class="logic-card"
                        style="margin: 8px 0; background: #f0fdf4; border: 1px solid #bbf7d0; padding: 12px; font-size: 13px; color: #166534;"
                      >
                        <p style="margin-bottom: 8px;">
                          <strong>Как это работает при сохранении:</strong>
                        </p>
                        <ul style="padding-left: 18px;">
                          <li>Сервис сканирует все локализации перед отправкой на бэкенд.</li>
                          <li>
                            Если «Название» пустое — подставляется значение из
                            <strong>en-US</strong>.
                          </li>
                          <li>
                            Если английская вкладка тоже пуста — используется технический
                            <strong>Slug</strong>.
                          </li>
                          <li>
                            Автоматически копируются Описание и SEO-настройки (Title, Meta) из
                            английской версии.
                          </li>
                        </ul>
                        <p style="margin-top: 8px; font-size: 12px; font-style: italic;">
                          Это избавляет от необходимости вручную заполнять 10+ вкладок при создании
                          контента.
                        </p>
                      </div>
                    </li>
                    <li>
                      <strong>Logic: Form Save:</strong>
                      <div
                        class="logic-card"
                        style="margin: 8px 0; background: #fff7ed; border: 1px solid #ffedd5; font-size: 11px; color: #9a3412; padding: 8px;"
                      >
                        <strong>Оркестрация Сохранения:</strong> 1. Валидация. 2. Вызов
                        <code>applyEnglishFallbacks()</code>. 3. <code>api.save</code> в
                        <code>executeWithLoading</code>. 4. Refresh данных.
                      </div>
                    </li>
                  </ul>
                </div>

                <div class="roadmap-step">
                  <div class="step-header">
                    <nz-tag nzColor="magenta">Step 7</nz-tag>
                    <strong>Системные проверки (Guards)</strong>
                  </div>
                  <ul>
                    <li>
                      <strong>Language Guard:</strong> <code>openAddModal()</code> блокируется, если
                      в <code>langService</code> не инициализирован ни один язык.
                    </li>
                    <li>
                      <strong>Seed Guard:</strong> При попытке
                      <code>seedFromJson()</code> проверяется <code>total() > 0</code>. Если БД не
                      пуста — всплывает <code>modal.warn</code>.
                    </li>
                  </ul>
                </div>

                <div class="roadmap-step">
                  <div class="step-header">
                    <nz-tag nzColor="orange">Step 8</nz-tag>
                    <strong>Universal Search (Поиск)</strong>
                  </div>
                  <ul>
                    <li>
                      <strong>Sync Logic:</strong> Поиск реализован через двустороннее связывание
                      <code>[(value)]="searchTerm"</code> в <code>ListComponent</code>.
                    </li>
                    <li>
                      <strong>Trigger:</strong> При каждом <code>emit</code> значения вызывается
                      <code>state.setSearchTerm(val)</code>.
                    </li>
                  </ul>
                </div>

                <div class="roadmap-step">
                  <div class="step-header">
                    <nz-tag nzColor="cyan">Step 9</nz-tag>
                    <strong>Action Bar Logic</strong>
                  </div>
                  <ul>
                    <li>
                      <strong>Delegation:</strong> Компонент списка не содержит логики действий. Он
                      делегирует клики в <code>StateService</code>.
                    </li>
                    <li>
                      <strong>Appearance:</strong> Набор кнопок в ячейке действий переключается
                      автоматически на основе сигнала <code>showDeleted()</code>.
                    </li>
                  </ul>
                </div>

                <div class="roadmap-step">
                  <div class="step-header">
                    <nz-tag nzColor="cyan">Step 10</nz-tag>
                    <strong>Advanced filtering (Корзина)</strong>
                  </div>
                  <ul>
                    <li>
                      <strong>Trash Mode Logic:</strong> При активации переключателя стейт меняет
                      фильтр <code>showDeleted = true</code> и сбрасывает пагинацию.
                    </li>
                    <li>
                      <strong>Appearance:</strong> Над таблицей появляется <code>nz-alert</code> с
                      типом <code>warning</code>, информирующий о просмотре удаленных записей.
                      Кнопка «Добавить» деактивируется.
                    </li>
                  </ul>
                </div>

                <div class="roadmap-step">
                  <div class="step-header">
                    <nz-tag nzColor="blue">Step 11</nz-tag>
                    <strong>Медиа и Иконки (Icon Management)</strong>
                  </div>
                  <ul>
                    <li>
                      <strong>Property:</strong> Поле <code>IconPath</code> в БД хранит
                      относительный путь к иконке (например,
                      <code>uploads/developers/adobe.svg</code>).
                    </li>
                    <li>
                      <strong>Documentation:</strong> Подробные правила хранения и Fallback-логика
                      вынесены в отдельную вкладку <b>"🖼️ Иконки и Медиа"</b>.
                    </li>
                    <li>
                      <strong>Integration:</strong> Реализуйте предварительный просмотр иконки в
                      модальном окне редактирования.
                    </li>
                  </ul>
                </div>

                <div class="roadmap-step">
                  <div class="step-header">
                    <nz-tag nzColor="purple">Step 12</nz-tag>
                    <strong>Регистрация и Роутинг (Routing)</strong>
                  </div>
                  <ul>
                    <li>
                      <strong>Routes:</strong> Зарегистрируйте компонент в
                      <code>aggregator-pages.routes.ts</code>. Путь:
                      <code>/aggregator/developers</code>.
                    </li>
                    <li>
                      <strong>Sidebar:</strong> Добавьте новый пункт меню в
                      <code>SidebarService</code>. Используйте иконку <code>team</code> или
                      <code>api</code> для визуальной идентификации.
                    </li>
                  </ul>
                </div>

                <div class="roadmap-step">
                  <div class="step-header">
                    <nz-tag nzColor="red">Step 13</nz-tag>
                    <strong>Обработка ошибок (Error Handling)</strong>
                  </div>
                  <ul>
                    <li>
                      <strong>Pattern:</strong> Все API-вызовы в
                      <code>executeWithLoading()</code> должны иметь блок <code>catchError</code>.
                    </li>
                    <li>
                      <strong>User Notify:</strong> При ошибке используйте
                      <code>NzMessageService.error()</code> для вывода технического сообщения
                      (например, "Ошибка соединения с сервером").
                    </li>
                  </ul>
                </div>
              </div>

              <!-- ДЕТАЛИЗАЦИЯ ШАГОВ 9-10 (ПЕРЕНЕСЕНО СЮДА ДЛЯ УДОБСТВА) -->
              <div style="margin-top: 32px; border-top: 2px dashed #e2e8f0; padding-top: 24px;">
                <h4 style="margin-bottom: 20px; color: #0f172a;">
                  🛠️ Детализация реализации (Actions & Layout)
                </h4>

                <nz-card
                  nzTitle="Логика Actions и паттерны UI"
                  class="inner-card"
                  style="margin-bottom: 24px;"
                >
                  <nz-table
                    #actionsTable
                    [nzData]="actionPatterns"
                    [nzFrontPagination]="false"
                    [nzShowPagination]="false"
                    nzSize="small"
                  >
                    <thead>
                      <tr>
                        <th>Действие</th>
                        <th>Иконка</th>
                        <th nzWidth="120px">Цвет</th>
                        <th>Метод State</th>
                        <th>Механика UX</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr *ngFor="let act of actionPatterns">
                        <td>
                          <strong>{{ act.name }}</strong>
                        </td>
                        <td><i nz-icon [nzType]="act.icon"></i></td>
                        <td>
                          <nz-tag [nzColor]="act.color">{{ act.colorName }}</nz-tag>
                        </td>
                        <td>
                          <code>{{ act.method }}</code>
                        </td>
                        <td>{{ act.ux }}</td>
                      </tr>
                    </tbody>
                  </nz-table>

                  <div class="logic-grid" style="margin-top: 24px;">
                    <div class="logic-card full-width">
                      <h5>Кнопки в таблице (HTML)</h5>
                      <av-help-copy-container
                        title="Action Column Template"
                        [content]="listActionTemplateCode"
                        bgColor="#0f172a"
                      ></av-help-copy-container>
                    </div>
                  </div>
                </nz-card>

                <nz-card nzTitle="🎛️ Панель фильтров и Сборка Header" class="inner-card">
                  <div class="logic-grid">
                    <div class="logic-card">
                      <h5>Бизнес-логика</h5>
                      <ul>
                        <li><strong>Reset:</strong> Пагинация сбрасывается на 1.</li>
                        <li><strong>Safe Add:</strong> Кнопка «Добавить» скрыта в корзине.</li>
                      </ul>
                    </div>
                    <div class="logic-card">
                      <h5>Header Design</h5>
                      <ul>
                        <li><strong>Flex:</strong> Поиск занимает всё место (flex: 1).</li>
                        <li><strong>Pill:</strong> Корзина оформлена капсулой.</li>
                      </ul>
                    </div>
                  </div>

                  <div class="logic-grid" style="margin-top: 20px;">
                    <div class="logic-card">
                      <av-help-copy-container
                        title="Filters Template"
                        [content]="toolbarFilterCode"
                        bgColor="#0f172a"
                      ></av-help-copy-container>
                    </div>
                    <div class="logic-card">
                      <av-help-copy-container
                        title="Header Layout & Styles"
                        [content]="
                          headerAssemblyHtmlCode +
                          '

' +
                          headerAssemblyScssCode
                        "
                        bgColor="#1e293b"
                      ></av-help-copy-container>
                    </div>
                  </div>
                </nz-card>
              </div>
            </nz-card>

            <nz-card nzTitle="Пример: GET-Контроллер (Standard v3.5)">
              <av-help-copy-container
                title="C# Controller Pattern"
                [content]="serverControllerCode"
                bgColor="#0f172a"
              ></av-help-copy-container>
            </nz-card>
          </div>
        </nz-tab>

        <!-- 6. ТЕХНИЧЕСКАЯ СПЕЦИФИКАЦИЯ -->
        <nz-tab nzTitle="📋 Спецификация Aurora v3.5">
          <div class="help-section">
            <nz-card nzTitle="🛡️ Data Integrity & Safety (Надежность данных)">
              <div class="feature-grid">
                <div class="feature-item">
                  <div class="f-text">
                    <strong>Soft Delete & Recycle Bin:</strong>
                    <p>
                      Все объекты агрегатора поддерживают мягкое удаление. В БД поле
                      <code>IsDeleted</code>. На фронтенде реализован режим «Корзины» через сигнал
                      <code>showDeleted</code>.
                    </p>
                  </div>
                </div>
                <div class="feature-item">
                  <div class="f-text">
                    <strong>Localization Fallbacks:</strong>
                    <p>
                      Метод <code>applyEnglishFallbacks</code> гарантирует отсутствие пустых полей.
                      Если локализация не заполнена, данные копируются из
                      <strong>English (ID: 1)</strong> или Canonical Name.
                    </p>
                  </div>
                </div>
              </div>
            </nz-card>

            <nz-card nzTitle="💡 Особенности реализации (Premium UX)">
              <nz-alert
                nzType="info"
                nzMessage="GET Стандарт для списков"
                nzDescription="Для получения списков (getPaged) всегда используйте GET-запросы. Это обеспечивает более надежную десериализацию Enum и параметров фильтрации на стороне бэкенда."
                nzShowIcon
                style="margin-bottom: 16px;"
              ></nz-alert>

              <nz-alert
                nzType="warning"
                nzMessage="Безопасность удалений (Confirm & Challenge)"
                nzDescription="Все опасные действия должны быть подтверждены. Для обычного удаления используется modal.confirm(), для необратимого (Hard Delete) — modal.challenge() с проверкой."
                nzShowIcon
                style="margin-bottom: 16px;"
              ></nz-alert>

              <nz-alert
                nzType="info"
                nzMessage="Навигация и Роутинг"
                nzDescription="Модуль поддерживает бесшовное переключение между модалками и страницами. Используйте routerLink для страниц и Signals для модалок."
                nzShowIcon
                style="margin-bottom: 16px;"
              ></nz-alert>

              <nz-card nzTitle="💎 Нюансы реализации поиска (Standard Hero)" class="inner-card">
                <div class="logic-grid">
                  <div class="logic-card">
                    <h5>Frontend: Reactive UI</h5>
                    <ul>
                      <li>
                        <strong>Model Signals:</strong> Используйте <code>searchTerm = ''</code> в
                        компоненте и <code>this.state.setSearch(term)</code> для триггера загрузки
                        данных.
                      </li>
                      <li>
                        <strong>Debounce 300ms:</strong> Встроен в <code>av-search</code>.
                        Срабатывает автоматически при наборе, предотвращая спам запросами к API.
                      </li>
                      <li>
                        <strong>Sync:</strong> Двустороннее связывание
                        <code>[(value)]</code> критически важно для корректной очистки строки поиска
                        из внешних эффектов.
                      </li>
                    </ul>
                  </div>
                  <div class="logic-card">
                    <h5>Backend: Query Logic</h5>
                    <ul>
                      <li>
                        <strong>Scope:</strong> Поиск идет по <code>Name</code> (техническое имя),
                        <code>SystemCode</code> (слаг) и <code>Localizations.Name</code> (витринное
                        имя).
                      </li>
                      <li>
                        <strong>SEO Integrity:</strong> Поля <code>MetaTitle</code> и
                        <code>MetaDescription</code> сознательно исключены из поиска, чтобы избежать
                        "зашумления" результатов ключевыми словами, не относящимися к сути вендора.
                      </li>
                      <li>
                        <strong>Total Count:</strong> Вызов <code>CountAsync()</code> должен
                        происходить ПОСЛЕ применения фильтров поиска, но ДО применения
                        <code>Skip/Take</code>.
                      </li>
                    </ul>
                  </div>
                </div>
              </nz-card>

              <nz-card nzTitle="🛠️ Логика Actions и паттерны UI" class="inner-card">
                <nz-table
                  #actionsTable
                  [nzData]="actionPatterns"
                  [nzFrontPagination]="false"
                  [nzShowPagination]="false"
                  nzSize="small"
                >
                  <thead>
                    <tr>
                      <th>Действие</th>
                      <th>Иконка</th>
                      <th nzWidth="120px">Цвет</th>
                      <th>Метод State</th>
                      <th>Механика UX</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let act of actionPatterns">
                      <td>
                        <strong>{{ act.name }}</strong>
                      </td>
                      <td><i nz-icon [nzType]="act.icon"></i></td>
                      <td>
                        <nz-tag [nzColor]="act.color">{{ act.colorName }}</nz-tag>
                      </td>
                      <td>
                        <code>{{ act.method }}</code>
                      </td>
                      <td>{{ act.ux }}</td>
                    </tr>
                  </tbody>
                </nz-table>

                <div class="logic-grid" style="margin-top: 24px;">
                  <div class="logic-card full-width">
                    <h5>Пример реализации: Шаблон (HTML)</h5>
                    <av-help-copy-container
                      title="developer-of-aggregator-list.component.html"
                      [content]="listActionTemplateCode"
                      bgColor="#0f172a"
                    ></av-help-copy-container>
                  </div>
                  <div class="logic-card full-width">
                    <h5>Пример реализации: Логика (TS)</h5>
                    <av-help-copy-container
                      title="developer-of-aggregator-list.component.ts"
                      [content]="listActionLogicCode"
                      bgColor="#1e1b4b"
                    ></av-help-copy-container>
                  </div>
                </div>

                <div style="margin-top: 20px;">
                  <nz-alert
                    nzType="info"
                    nzMessage="Режим Корзины (Soft Delete)"
                    nzDescription="Если data.isDeleted === true, кнопки Редактировать/Удалить заменяются на Восстановить (undo) и Hard Delete (fire). Это обеспечивает защиту данных от случайной потери."
                    nzShowIcon
                  ></nz-alert>
                </div>
              </nz-card>

              <nz-card nzTitle="🎛️ Панель фильтров: Корзина и Языки" class="inner-card">
                <div class="logic-grid">
                  <div class="logic-card">
                    <h5>Бизнес-логика фильтрации</h5>
                    <ul>
                      <li>
                        <strong>Pagination Reset:</strong> Любое изменение фильтра (поиск, язык,
                        корзина) ОБЯЗАНО сбрасывать <code>pageNumber</code> на 1. Это база Aurora
                        v3.5.
                      </li>
                      <li>
                        <strong>Language Scope:</strong> Фильтр по языку влияет на
                        <code>languageId</code> в запросе к API. Если ID не выбран — сервер ищет по
                        всем локализациям.
                      </li>
                    </ul>
                  </div>
                  <div class="logic-card">
                    <h5>Режим Корзины (Logic)</h5>
                    <ul>
                      <li>
                        <strong>Read-Only Mode:</strong> В режиме корзины кнопка «Добавить
                        разработчика» скрывается через <code>&#64;if (!state.showDeleted())</code>.
                      </li>
                      <li>
                        <strong>State Sync:</strong> Сигнал <code>showDeleted</code> в StateService
                        управляет параметром <code>isDeleted</code> в GET-запросе к серверу.
                      </li>
                    </ul>
                  </div>
                </div>

                <div class="logic-grid" style="margin-top: 20px;">
                  <div class="logic-card full-width">
                    <h5>Код Тулбара: Шаблон и Логика</h5>
                    <av-help-copy-container
                      title="Фильтры (Select & Switch)"
                      [content]="toolbarFilterCode"
                      bgColor="#0f172a"
                    ></av-help-copy-container>
                  </div>
                </div>
              </nz-card>

              <nz-card nzTitle="🎨 Сборка Header (Layout & Styles)" class="inner-card">
                <div class="logic-grid">
                  <div class="logic-card">
                    <h5>Flexbox Layout</h5>
                    <ul>
                      <li>
                        <strong>Container:</strong> Используйте
                        <code>display: flex; justify-content: space-between;</code> для разделения
                        фильтров и кнопки действия.
                      </li>
                      <li>
                        <strong>Fluid Search:</strong> Обертка поиска имеет <code>flex: 1</code>,
                        что заставляет её занимать всё свободное место слева.
                      </li>
                    </ul>
                  </div>
                  <div class="logic-card">
                    <h5>Pill Design (Корзина)</h5>
                    <ul>
                      <li>
                        <strong>Visual:</strong> Оформление в виде капсулы с фоном
                        <code>#f8fafc</code> и закруглением <code>99px</code>.
                      </li>
                      <li>
                        <strong>Feedback:</strong> Класс <code>.active</code> меняет фон на
                        светло-красный и цвет текста на системный Error.
                      </li>
                    </ul>
                  </div>
                </div>

                <div class="logic-grid" style="margin-top: 20px;">
                  <div class="logic-card">
                    <h5>HTML Структура Header</h5>
                    <av-help-copy-container
                      title="Header Layout"
                      [content]="headerAssemblyHtmlCode"
                      bgColor="#0f172a"
                    ></av-help-copy-container>
                  </div>
                  <div class="logic-card">
                    <h5>SCSS Стили Header</h5>
                    <av-help-copy-container
                      title="Header Styles"
                      [content]="headerAssemblyScssCode"
                      bgColor="#1e293b"
                    ></av-help-copy-container>
                  </div>
                </div>
              </nz-card>

              <nz-card nzTitle="💎 Технический чек-лист Aurora v3.5">
                <div class="feature-grid">
                  <div class="feature-item">
                    <div class="f-text">
                      <strong>State Management (Signals & Effects):</strong>
                      <ul>
                        <li>
                          Используется <code>signal</code> для состояния и <code>computed</code> для
                          селекторов.
                        </li>
                        <li>
                          Логика диалогов (alerts) об пустой БД встроена в
                          <code>loadItems(true)</code>.
                        </li>
                        <li>Централизованная обработка ошибок через <code>ErrorResponse</code>.</li>
                      </ul>
                    </div>
                  </div>
                  <div class="feature-item">
                    <div class="f-text">
                      <strong>Frontend UI (Premium Identity):</strong>
                      <ul>
                        <li>
                          <strong>Skeleton Loading:</strong> Использование
                          <code>nz-skeleton</code> при загрузке списка (Items.length === 0).
                        </li>
                        <li>
                          <strong>Form Grid:</strong> Строгое соблюдение сетки 12/24 и отступов
                          16px.
                        </li>
                        <li>
                          <strong>Lazy Tabs:</strong> Инициализация вкладок локализации через
                          <code>ng-template nz-tab</code>.
                        </li>
                      </ul>
                    </div>
                  </div>
                  <div class="feature-item">
                    <div class="f-text">
                      <strong>Seo Mapping:</strong>
                      <ul>
                        <li>Форма использует вложенный <code>SeoFormComponent</code>.</li>
                        <li>
                          Логика маппинга "плоских" полей БД в объект SEO инкапсулирована в методах
                          Save/Load сервиса состояния.
                        </li>
                      </ul>
                    </div>
                  </div>
                  <div class="feature-item">
                    <div class="f-text">
                      <strong>AutoMapper Profile (Mappings):</strong>
                      <pre><code>// Правильный маппинг:
dest.LanguageCode -> src.LanguageOfAggregator.Code
dest.LanguageName -> src.LanguageOfAggregator.Title</code></pre>
                    </div>
                  </div>
                  <div class="feature-item">
                    <div class="f-text">
                      <strong>Frontend (LanguageService):</strong>
                      <ul>
                        <li>
                          Путь импорта:
                          <code>&#64;language-app/services/language.service</code>.
                        </li>
                        <li>
                          Доступ к списку языков осуществляется через сигнал
                          <code>availableLanguages</code>.
                        </li>
                        <li>
                          Свойства <code>AppLanguage</code>: <code>code</code> и
                          <code>nativeTitle</code>.
                        </li>
                      </ul>
                    </div>
                  </div>
                  <div class="feature-item">
                    <div class="f-text">
                      <strong>Frontend UI & Components (Aurora v3.5):</strong>
                      <ul>
                        <li>
                          <strong>Create Flow:</strong> Реализовано создание через модальное окно с
                          OnPush и Signals.
                        </li>
                        <li>
                          <strong>Tabs:</strong> Использовать тег
                          <code>&lt;nz-tabset&gt;</code> (тег <code>&lt;nz-tabs&gt;</code> не
                          существует).
                        </li>
                        <li>
                          <strong>Modals:</strong> В <code>NzModalService.confirm()</code> параметр
                          кнопки — <code>nzOkDanger: true</code>.
                        </li>
                        <li>
                          <strong>SEO:</strong> Интегрирован <code>SeoFormComponent</code> с
                          маппингом плоских полей БД.
                        </li>
                      </ul>
                    </div>
                  </div>
                  <div class="feature-item">
                    <div class="f-text">
                      <strong>Sidebar & Routing:</strong>
                      <ul>
                        <li><strong>Menu:</strong> АГРЕГАТОР -> Справочники -> Разработчики.</li>
                        <li>
                          <strong>Route:</strong> <code>/agregator/references/developer</code>.
                        </li>
                        <li>
                          <strong>Lazy Loading:</strong>
                          <pre><code>&#123;
  path: 'agregator/references/developer',
  loadChildren: () => import('./...path...').then(m => m.DEVELOPER_OF_AGGREGATOR_ROUTES)
&#125;</code></pre>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </nz-card>
            </nz-card>

            <nz-card nzTitle="🛠️ Модель данных (C# Entity Implementation)">
              <av-help-copy-container
                title="DAL / Models / Aggregator / DeveloperOfAggregator.cs"
                [content]="entityImplementationCode"
                bgColor="#0f172a"
              ></av-help-copy-container>
            </nz-card>

            <nz-card nzTitle="Frontend Checklist (Angular / Signals)">
              <div class="checklist-grid">
                <div class="checklist-item">
                  <nz-tag nzColor="orange">Infrastructure</nz-tag>
                  <ul>
                    <li>[x] developer-of-aggregator.model.ts</li>
                    <li>[x] developer-of-aggregator-api.service.ts</li>
                    <li>[x] developer-of-aggregator-state.service.ts (Signals)</li>
                  </ul>
                </div>
                <div class="checklist-item">
                  <nz-tag nzColor="magenta">Components & UI</nz-tag>
                  <ul>
                    <li>[x] -manager.component.ts (Оркестратор)</li>
                    <li>[x] -list.component.ts (Таблица + Сортировка)</li>
                    <li>[x] -form.component.ts (FormGroup + Langs)</li>
                    <li>[x] -modal.component.ts</li>
                  </ul>
                </div>
              </div>
              <av-help-copy-container
                title="Эталонная структура файлов (Client)"
                [content]="clientFilesCode"
                bgColor="#1e1b4b"
              ></av-help-copy-container>
            </nz-card>
          </div>
        </nz-tab>
        <!-- 8. СПЕЦИФИКАЦИЯ AURORA V3.5 -->
        <nz-tab nzTitle="📋 Спецификация Aurora v3.5">
          <div class="help-section">
            <nz-card nzTitle="Глобальный чек-лист соответствия (Reference Checklist)">
              <p>
                Любая новая сущность в системе Агрегатора должна соответствовать следующим
                критериям:
              </p>

              <div class="logic-grid">
                <div class="logic-card">
                  <h5>Frontend (Angular 17+):</h5>
                  <ul>
                    <li>
                      <nz-tag nzColor="success">Signals</nz-tag> Полный переход на Signal-based
                      State.
                    </li>
                    <li><nz-tag nzColor="success">Standalone</nz-tag> Компоненты без модулей.</li>
                    <li>
                      <nz-tag nzColor="success">AvShowcase</nz-tag> Использование базовых
                      компонентов для CRUD.
                    </li>
                    <li>
                      <nz-tag nzColor="success">Localizations</nz-tag> Вкладки для всех активных
                      языков.
                    </li>
                  </ul>
                </div>
                <div class="logic-card">
                  <h5>Backend (.NET Core):</h5>
                  <ul>
                    <li>
                      <nz-tag nzColor="processing">FullAuditable</nz-tag> Наследование от базовых
                      сущностей аудита.
                    </li>
                    <li>
                      <nz-tag nzColor="processing">UnitOfWork</nz-tag> Регистрация в репозиториях.
                    </li>
                    <li>
                      <nz-tag nzColor="processing">AutoMapper</nz-tag> Наличие DTO и профилей
                      маппинга.
                    </li>
                    <li>
                      <nz-tag nzColor="processing">Migrations</nz-tag> Наличие чистых миграций без
                      конфликтов.
                    </li>
                  </ul>
                </div>
              </div>

              <div class="logic-box bg-dark" style="margin-top: 24px;">
                <h4 style="color: #52c41a;">🗂️ Эталонные файлы проекта:</h4>
                <pre style="font-size: 12px; color: #a6e22e;">
// Backend Core: 
DAL/Models/Aggregator/DeveloperOfAggregator.cs
// Frontend Page:
src/app/AGREGATOR/PAGES/DeveloperOfAggregatorPage/
// Documentation:
src/app/pages/help/developer-help/developer-help.component.ts</pre
                >
              </div>
            </nz-card>
          </div>
        </nz-tab>
      </nz-tabset>
    </div>
  `,
  styles: [
    `
      .help-container {
        padding: 32px;
        max-width: 1400px;
        margin: 0 auto;
        min-height: 800px;
      }
      .help-tabs {
        margin-top: 24px;
      }
      .help-section {
        display: flex;
        flex-direction: column;
        gap: 24px;
        padding-top: 16px;
      }

      .feature-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 16px;
        margin-top: 20px;
      }
      .feature-item {
        display: flex;
        gap: 12px;
        align-items: flex-start;
        padding: 16px;
        background: #fff;
        border-radius: 8px;
        border: 1px solid #e2e8f0;
      }
      .f-icon {
        font-size: 20px;
        color: #3b82f6;
      }
      .f-text {
        font-size: 14px;
        color: #475569;
      }

      /* Roadmap Timeline Styles */
      .roadmap-container {
        display: flex;
        flex-direction: column;
        gap: 0;
        padding-left: 20px;
        border-left: 2px solid #e2e8f0;
        margin: 20px 0;
      }
      .roadmap-step {
        position: relative;
        padding-bottom: 30px;
        padding-left: 30px;
      }
      .roadmap-step::before {
        content: '';
        position: absolute;
        left: -11px;
        top: 0;
        width: 20px;
        height: 20px;
        background: #fff;
        border: 2px solid #3b82f6;
        border-radius: 50%;
        z-index: 1;
      }
      .step-header {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 12px;
      }
      .roadmap-step ul {
        padding-left: 0;
        list-style: none;
        margin-top: 8px;
      }
      .roadmap-step li {
        position: relative;
        padding-left: 20px;
        margin-bottom: 8px;
        font-size: 14px;
        color: #64748b;
      }
      .roadmap-step li::before {
        content: '•';
        position: absolute;
        left: 0;
        color: #3b82f6;
        font-weight: bold;
      }
      .roadmap-step:last-child {
        padding-bottom: 0;
      }

      code {
        background: #f1f5f9;
        padding: 2px 6px;
        border-radius: 4px;
        color: #e11d48;
        font-size: 13px;
      }
    `,
  ],
})
export class DeveloperHelpComponent {
  baseUrl = 'https://api.example.com/'; // Используется для примеров в шаблоне

  coreFields = [
    { name: 'Id', type: 'int', desc: 'Первичный ключ (Identity)' },
    {
      name: 'Name',
      type: 'string(200)',
      desc: 'Техническое название вендора (Обязательное). Используется как Fallback для локализаций.',
    },
    {
      name: 'SystemCode',
      type: 'string(150)',
      desc: 'Уникальный системный код (Slug). Обязательное поле для формирования URL.',
    },
    { name: 'Website', type: 'string?', desc: 'URL официального сайта разработчика.' },
    { name: 'IconPath', type: 'string?', desc: 'Относительный путь к файлу логотипа в assets.' },
    { name: 'IsActive', type: 'bool', desc: 'Флаг активности записи. По умолчанию true.' },
    {
      name: 'SortOrder',
      type: 'int',
      desc: 'Приоритет ручной сортировки. Чем меньше число, тем выше в списке.',
    },
  ];

  locFields = [
    {
      name: 'DeveloperOfAggregatorId',
      type: 'int',
      desc: 'Внешний ключ (FK) на родительскую сущность.',
    },
    {
      name: 'LanguageOfAggregatorId',
      type: 'int',
      desc: 'Внешний ключ (FK) на справочник языков.',
    },
    {
      name: 'Name',
      type: 'string(200)',
      desc: 'Локализованное отображаемое имя (Отображается клиенту).',
    },
    {
      name: 'Description',
      type: 'string?',
      desc: 'Развернутое описание разработчика на конкретном языке.',
    },
    { name: 'MetaTitle', type: 'string?', desc: 'SEO-заголовок страницы (Title).' },
    { name: 'MetaDescription', type: 'string?', desc: 'SEO-описание страницы (Description).' },
  ];

  clientFilesCode = `src/app/AGREGATOR/PAGES/SPRAVKA/DeveloperOfAggregatorPage/
├── components/
│   ├── developer-of-aggregator-form/
│   ├── developer-of-aggregator-list/
│   ├── developer-of-aggregator-manager/
│   └── developer-of-aggregator-modal/
├── models/
│   └── developer-of-aggregator.model.ts
├── services/
│   ├── developer-of-aggregator-api.service.ts
│   └── developer-of-aggregator-state.service.ts
└── developer-of-aggregator.routes.ts`;

  iconFolderStructure = `Project_Server_Auth/wwwroot/
└── uploads/
    └── developers/
        ├── adobe.svg
        ├── apple.svg
        └── microsoft.svg`;

  iconListTemplate = `<div class="dev-avatar-container">
  @if (data.iconPath) {
    <!-- baseUrl берется из Environment или спец. пайпа -->
    <img [src]="baseUrl + data.iconPath" [alt]="data.name" class="dev-icon" />
  } @else {
    <div class="icon-fallback">
      <i nz-icon nzType="api"></i>
    </div>
  }
</div>`;

  serverSearchCode = `if (!string.IsNullOrWhiteSpace(request.SearchTerm))
{
    var search = request.SearchTerm.ToLower();
    query = query.Where(x =>
        x.Name.ToLower().Contains(search) ||
        x.SystemCode.ToLower().Contains(search) ||
        x.Localizations.Any(l => l.Name.ToLower().Contains(search))
    );
}`;

  serverSortingCode = `return request.SortBy switch
{
    DeveloperOfAggregatorSortField.Id => isAsc ? query.OrderBy(x => x.Id) : query.OrderByDescending(x => x.Id),
    DeveloperOfAggregatorSortField.Name => isAsc ? query.OrderBy(x => x.Name) : query.OrderByDescending(x => x.Name),
    DeveloperOfAggregatorSortField.SystemCode => isAsc ? query.OrderBy(x => x.SystemCode) : query.OrderByDescending(x => x.SystemCode),
    DeveloperOfAggregatorSortField.SortOrder => isAsc ? query.OrderBy(x => x.SortOrder) : query.OrderByDescending(x => x.SortOrder),
    DeveloperOfAggregatorSortField.ProgramsCount => isAsc ? query.OrderBy(x => x.Programs.Count) : query.OrderByDescending(x => x.Programs.Count),
    DeveloperOfAggregatorSortField.CreatedAt => isAsc ? query.OrderBy(x => x.CreatedAt) : query.OrderByDescending(x => x.CreatedAt),
    _ => query.OrderBy(x => x.Name)
};`;

  serverControllerCode = `[Route("api/v1/aggregator/developers")]
[ApiController]
public class DeveloperOfAggregatorController : ControllerBase
{
    [HttpGet("paged")]
    public async Task<ActionResult<DeveloperOfAggregatorPagedResponseDto>> GetPaged([FromQuery] DeveloperOfAggregatorPageRequestDto request)
    {
        // Универсальный поиск v1
        var items = await _service.GetPagedAsync(request);
        return Ok(items);
    }
}`;

  shardingBackendCode = `// Вспомогательный метод для GetShard
private string GetShard(string filename)
{
    if (string.IsNullOrEmpty(filename)) return "unknown";
    char firstChar = char.ToLower(filename[0]);
    // Если первая буква не латиница - берем цифру или 'other'
    return (firstChar >= 'a' && firstChar <= 'z') ? firstChar.ToString() : "0";
}

// Пример использования в Upload/CheckExists
var shard = GetShard(fileName);
var targetPath = Path.Combine(folder, shard, fileName);
if (!Directory.Exists(Path.Combine(_webHostEnvironment.WebRootPath, folder, shard)))
    Directory.CreateDirectory(...);`;

  fallbackLogicCode = `applyEnglishFallbacks(localizations: any[], technicalName: string): any[] {
  const enLocale = localizations.find(l => l.languageCode === 'en-US');
  return localizations.map(loc => ({
    ...loc,
    name: loc.name || enLocale?.name || technicalName,
    description: loc.description || enLocale?.description,
    metaTitle: loc.metaTitle || enLocale?.metaTitle,
    metaDescription: loc.metaDescription || enLocale?.metaDescription
  }));
}`;

  entityImplementationCode = `using DAL.Constants;
// ... other usings

[Table("developers_of_aggregator")]
public class DeveloperOfAggregator : FullAuditableEntityOfAggregator
{
    [Required, MaxLength(DeveloperConstants.NameMaxLength)]
    public string Name { get; set; } = string.Empty;

    [Required, MaxLength(DeveloperConstants.SlugMaxLength)]
    public string SystemCode { get; set; } = string.Empty;

    public string? Website { get; set; }
    public string? IconPath { get; set; }

    public bool IsActive { get; set; } = true;
    public int SortOrder { get; set; } = 0;

    public virtual ICollection<DeveloperOfAggregatorLocalization> Localizations { get; set; }
        = new List<DeveloperOfAggregatorLocalization>();
}`;

  actionPatterns = [
    {
      name: 'Просмотр',
      icon: 'eye',
      color: 'blue',
      colorName: 'Primary',
      method: 'openView()',
      ux: 'Открывает Modal с деталями (Read-only)',
    },
    {
      name: 'Редактировать',
      icon: 'edit',
      color: 'orange',
      colorName: 'Warning',
      method: 'updateState({selectedId})',
      ux: 'Открывает Modal с формой редактирования',
    },
    {
      name: 'В корзину',
      icon: 'rest',
      color: 'red',
      colorName: 'Error',
      method: 'delete()',
      ux: 'Soft Delete с подтверждением modal.confirm',
    },
    {
      name: 'Восстановить',
      icon: 'undo',
      color: 'green',
      colorName: 'Success',
      method: 'restore()',
      ux: 'Возврат из корзины в основной список',
    },
    {
      name: 'Hard Delete',
      icon: 'fire',
      color: 'volcano',
      colorName: 'Critical',
      method: 'hardDelete()',
      ux: 'Метод modal.challenge (Капча/Вопрос)',
    },
  ];

  goldenSampleDesc = `При проектировании новых сущностей всегда ориентируйтесь на эталонную реализацию:
  <br/><code>D:\\_PROGECT\\pr_srv_names\\DAL\\Models\\Aggregator\\PlatformOfAggregator.cs</code>`;

  listActionTemplateCode = `<div class="actions">
  &#64;if (data.isDeleted) {
    <!-- Кнопки для удаленных записей -->
    <button nz-button nzType="text" (click)="onRestore(data.id)">
      <i nz-icon nzType="undo" class="restore-icon"></i>
    </button>
    <button nz-button nzType="text" (click)="onHardDelete(data.id)">
      <i nz-icon nzType="fire" class="hard-delete-icon"></i>
    </button>
  } &#64;else {
    <!-- Стандартные кнопки управления -->
    <button nz-button nzType="text" (click)="onView(data.id)">
      <i nz-icon nzType="eye" class="view-icon"></i>
    </button>
    <button nz-button nzType="text" (click)="onEdit(data.id)">
      <i nz-icon nzType="edit" class="edit-icon"></i>
    </button>
    <button nz-button nzType="text" (click)="onDelete(data.id)">
      <i nz-icon nzType="rest" class="delete-icon"></i>
    </button>
  }
</div>`;

  listActionLogicCode = `// 1. Просмотр (Делегирование в State)
onView(id: number): void {
  this.state.openView(id);
}

// 2. Стандартное удаление (Confirm)
async onDelete(id: number): Promise<void> {
  const confirmed = await this.modalService.confirm({
    title: 'Удалить запись?',
    message: 'Запись будет перемещена в корзину.',
    confirmText: 'Удалить',
    confirmType: 'danger',
  });
  if (confirmed) this.state.delete(id);
}

// 3. Безвозвратное удаление (Challenge / Safety)
async onHardDelete(id: number): Promise<void> {
  const confirmed = await this.modalService.challenge(
    'ВНИМАНИЕ: Это действие безвозвратно удалит запись из базы данных.',
    '2 + 2 = ?',
    '4',
    'Удалить навсегда'
  );
  if (confirmed) this.state.hardDelete(id);
}`;

  toolbarFilterCode = `<!-- 1. Фильтр по языку -->
<nz-select [ngModel]="state.selectedLanguageId()" (ngModelChange)="onLanguageChange($event)">
  <nz-option [nzValue]="null" nzLabel="Все языки"></nz-option>
  &#64;for (lang of state.languages(); track lang.id) {
    <nz-option [nzValue]="lang.id" [nzLabel]="lang.nativeTitle"></nz-option>
  }
</nz-select>

<!-- 2. Переключатель Корзины -->
<nz-switch [ngModel]="state.showDeleted()" (ngModelChange)="onToggleTrash($event)"></nz-switch>

<!-- 3. Логика в компоненте (Reset Pagination) -->
onLanguageChange(id: number | null): void {
  this.state.setLanguageId(id); // Внутри вызывается updateState({pageNumber: 1})
}

onToggleTrash(show: boolean): void {
  this.state.setShowDeleted(show); // Внутри вызывается updateState({pageNumber: 1})
}`;

  headerAssemblyHtmlCode = `<div class="table-header">
  <div class="left-actions">
    <div class="search-box">
      <av-search [(value)]="searchTerm" (searchChange)="onSearchChange($event)"></av-search>
    </div>

    <!-- Фильтр языков -->
    <nz-select ...></nz-select>

    <!-- Капсула корзины -->
    <div class="trash-toggle" [class.active]="state.showDeleted()">
      <span class="label">КОРЗИНА</span>
      <nz-switch [ngModel]="state.showDeleted()" (ngModelChange)="onToggleTrash($event)"></nz-switch>
    </div>
  </div>

  <button nz-button nzType="primary" (click)="onAdd()">Добавить</button>
</div>`;

  headerAssemblyScssCode = `.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}

.left-actions {
  display: flex;
  gap: 16px;
  flex: 1; /* Растягивает левую часть */
  align-items: center;
}

.search-box {
  flex: 1; /* Растягивает поиск на все доступное место */
  max-width: 450px;
}

.trash-toggle {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 16px;
  border-radius: 99px; /* Pill design */
  background: #f8fafc;
  border: 1px solid #e2e8f0;

  &.active {
    background: #fef2f2;
    color: #ef4444;
    border-color: #fee2e2;
  }
}`;

  // --- SYSTEM REQUIREMENTS SECTION ---
  sysReqEnumCode = `public enum RequirementArchitecture
{
    Any       = 0,
    x86       = 1,
    x64       = 2,
    Arm64     = 3,  // Apple Silicon, ARM Windows
    Universal = 4   // macOS Universal Binary
}`;

  sysReqCoreCode = `[Table("system_requirements_of_aggregator")]
public class SystemRequirementOfAggregator : FullAuditableEntityOfAggregator
{
    public int VersionOfAggregatorId { get; set; }
    public int PlatformOfAggregatorId { get; set; }
    public RequirementArchitecture Architecture { get; set; }
    
    public int? MinOsVersionId { get; set; } // FK to PlatformOsVersion
    public int? MaxOsVersionId { get; set; } // FK to PlatformOsVersion

    public bool IsRecommended { get; set; }
    public int SortOrder { get; set; }

    public virtual ICollection<SystemRequirementOfAggregatorLocalization> Localizations { get; set; }
}`;

  sysReqJsonCode = `[
  {
    "platformCode": "windows",
    "versions": [
      { "code": "7", "name": "Windows 7", "sort": 20 },
      { "code": "10", "name": "Windows 10", "sort": 40 },
      { "code": "11", "name": "Windows 11", "sort": 50 }
    ]
  },
  {
    "platformCode": "macos",
    "versions": [
      { "code": "14", "name": "macOS Sonoma", "sort": 80 },
      { "code": "15", "name": "macOS Sequoia", "sort": 90 }
    ]
  }
]`;
}
