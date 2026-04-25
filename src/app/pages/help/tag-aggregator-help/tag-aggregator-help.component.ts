import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HelpCopyContainerComponent, HelpPathHeaderComponent } from '@shared/components/ui';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';

@Component({
  selector: 'app-tag-aggregator-help',
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
    NzButtonModule,
    NzInputModule,
    NzSelectModule,
    NzSwitchModule,
    NzPaginationModule,
    NzToolTipModule,
    HelpCopyContainerComponent,
    HelpPathHeaderComponent,
  ],
  template: `
    <div class="help-container">
      <av-help-path-header
        title="Tag & Category System"
        subtitle="Техническая спецификация системы тегов и категорий (Aurora v3.5)."
        icon="🏷️"
        componentPath="src/app/pages/help/tag-aggregator-help/tag-aggregator-help.component.ts"
        [dalPath]="[
          'DAL/Models/Aggregator/TagOfAggregator.cs',
          'DAL/Models/Aggregator/Localizations/TagOfAggregatorLocalization.cs',
          'DAL/Models/Aggregator/CategoryTagOfAggregator.cs',
          'DAL/Models/Aggregator/Localizations/CategoryTagOfAggregatorLocalization.cs'
        ]"
      ></av-help-path-header>

      <nz-tabset nzType="card" class="help-tabs">
        <!-- 1. ОБЗОР -->
        <nz-tab nzTitle="🌟 Обзор">
          <div class="help-section">
            <nz-card nzTitle="Философия системы">
              <p>
                Система спроектирована по принципу <strong>«Полки и Этикетки»</strong>. Категории — это полки, которые задают базовый контекст (Цвет, Иконка), а теги — это конкретные метки, которые наследуют эти свойства или переопределяют их.
              </p>
              <div class="feature-grid">
                <div class="feature-item">
                  <i nz-icon nzType="share-alt" class="f-icon"></i>
                  <div class="f-text">
                    <strong>Умное наследование (Heritage):</strong> Теги могут использовать <code>inherit</code> для цвета и иконки, автоматически принимая стиль своей родительской категории.
                  </div>
                </div>
                <div class="feature-item">
                  <i nz-icon nzType="global" class="f-icon"></i>
                  <div class="f-text">
                    <strong>Красная точка (RequiresTranslation):</strong> Визуальный индикатор, сигнализирующий об отсутствии локализации на системный (дефолтный) язык приложения.
                  </div>
                </div>
                <div class="feature-item">
                  <i nz-icon nzType="safety-certificate" class="f-icon"></i>
                  <div class="f-text">
                    <strong>Delete Guard:</strong> Категория защищена от удаления (через ConflictException), если в ней есть активные теги.
                  </div>
                </div>
              </div>
            </nz-card>

            <nz-alert
              nzType="success"
              nzMessage="Reference Implementation / Золотой Эталон Aurora v3.5"
              nzDescription="Модуль является образцом реализации современных паттернов: Signals, Heritage Logic, CRUD v1 и умная система локализации."
              nzShowIcon
            ></nz-alert>
          </div>
        </nz-tab>

        <!-- 2. МОДЕЛЬ ДАННЫХ -->
        <nz-tab nzTitle="💾 Структура БД">
          <div class="help-section">
            <nz-card nzTitle="CategoryTagOfAggregator (Группы тегов)">
              <nz-table #catTable [nzData]="categoryFields" [nzFrontPagination]="false" nzSize="small">
                <thead>
                  <tr>
                    <th>Поле</th>
                    <th>Тип</th>
                    <th>Описание</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let f of catTable.data">
                    <td><code>{{ f.name }}</code></td>
                    <td><nz-tag>{{ f.type }}</nz-tag></td>
                    <td>{{ f.desc }}</td>
                  </tr>
                </tbody>
              </nz-table>
            </nz-card>

            <nz-card nzTitle="TagOfAggregator (Теги)">
              <nz-table #tagTable [nzData]="tagFields" [nzFrontPagination]="false" nzSize="small">
                <thead>
                  <tr>
                    <th>Поле</th>
                    <th>Тип</th>
                    <th>Описание</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let f of tagTable.data">
                    <td><code>{{ f.name }}</code></td>
                    <td><nz-tag>{{ f.type }}</nz-tag></td>
                    <td>{{ f.desc }}</td>
                  </tr>
                </tbody>
              </nz-table>
            </nz-card>
          </div>
        </nz-tab>

        <!-- 3. ОБСЛУЖИВАНИЕ (MAINTENANCE) -->
        <nz-tab nzTitle="🛠️ Обслуживание">
          <div class="help-section">
            <nz-card nzTitle="Maintenance & Data Seeding">
              <p>Система поддерживает быструю инициализацию и очистку данных через API. Это критически важно для разработки и тестирования.</p>
              
              <div class="logic-grid">
                <div class="logic-card" style="background: #fffbeb; border-color: #fef3c7;">
                   <h5 style="color: #92400e;"><i nz-icon nzType="warning"></i> Мастер-файл данных</h5>
                   <p style="font-size: 13px;">Теги и категории сидятся из **единого мастер-файла**, так как теги логически вложены в категории для сохранения связей.</p>
                   <code>Project_Server_Auth/.../CategoryTagOfAggregator/Jsons/category-tags-seed.json</code>
                </div>
                <div class="logic-card" style="background: #f0fdf4; border-color: #dcfce7;">
                   <h5 style="color: #166534;"><i nz-icon nzType="api"></i> Делегирование (Service Pattern)</h5>
                   <p style="font-size: 13px;">Метод <code>TagOfAggregatorService.SeedFromJsonAsync()</code> не имеет своего парсера, а делегирует задачу <code>CategoryService</code>.</p>
                   <code style="font-size: 11px;">return await _categoryService.SeedFromJsonAsync();</code>
                </div>
              </div>

              <div style="margin-top: 20px;">
                 <nz-alert nzType="info" nzMessage="Почему так?" nzDescription="Это гарантирует, что Foreign Keys (CategoryTagId) всегда будут валидными, так как теги создаются сразу в контексте своих категорий." nzShowIcon></nz-alert>
              </div>
            </nz-card>

            <nz-card nzTitle="Доступные команды обслуживания">
               <div class="feature-grid">
                 <div class="feature-item">
                   <i nz-icon nzType="cloud-download" class="f-icon"></i>
                   <div class="f-text">
                     <strong>Seed From JSON:</strong> Загружает эталонные данные. Безопасно только при пустой БД (есть проверка).
                   </div>
                 </div>
                 <div class="feature-item">
                   <i nz-icon nzType="rest" class="f-icon"></i>
                   <div class="f-text">
                     <strong>Clear Database:</strong> Вызывает <code>TRUNCATE</code> для таблиц тегов и локализаций. Сбрасывает ID.
                   </div>
                 </div>
               </div>
            </nz-card>
          </div>
        </nz-tab>

        <!-- 4. ПОИСК И СОРТИРОВКА -->
        <nz-tab nzTitle="🔍 Поиск и Сортировка">
          <div class="help-section">
            <nz-card nzTitle="Универсальный компонент поиска (AvSearchComponent)">
              <p>В модуле используется <strong>Universal Search Hero</strong> для мгновенной фильтрации тегов по Slug и Названию.</p>
              <div class="feature-grid">
                <div class="feature-item">
                  <i nz-icon nzType="thunderbolt" class="f-icon"></i>
                  <div class="f-text">
                    <strong>Реактивность:</strong> Использование <code>computed()</code> сигналов в State-сервисе для автоматического обновления списка при вводе.
                  </div>
                </div>
                <div class="feature-item">
                  <i nz-icon nzType="interaction" class="f-icon"></i>
                  <div class="f-text">
                    <strong>Two-way Signals:</strong> Синхронизация строки поиска <code>[(value)]="searchTerm"</code> между всеми частями UI.
                  </div>
                </div>
              </div>
            </nz-card>

            <nz-card nzTitle="Серверная фильтрация & Сортировка">
              <div class="logic-grid">
                <div class="logic-card">
                  <h4>Логика поиска (Backend)</h4>
                  <ul>
                    <li><strong>Поля:</strong> <code>Slug</code>, <code>Localizations.Name</code>.</li>
                    <li><strong>Регистр:</strong> Case-insensitive (ToLower).</li>
                  </ul>
                </div>
                <div class="logic-card">
                  <h4>Параметры сортировки</h4>
                  <ul>
                    <li><code>Id</code>, <code>Slug</code>, <code>SortOrder</code>.</li>
                    <li><code>CreatedAt</code>, <code>UpdatedAt</code>.</li>
                    <li><code>Type</code> (Тип тега).</li>
                  </ul>
                </div>
              </div>
            </nz-card>

            <av-help-copy-container
              title="Реализация серверного поиска (API Service)"
              [content]="serverSearchCode"
              bgColor="#1e293b"
            ></av-help-copy-container>
          </div>
        </nz-tab>

        <!-- 4. VISUAL & ARCHITECTURE -->
        <nz-tab nzTitle="🖼️ Visual">
          <div class="help-section">
            <nz-card nzTitle="Схема интерфейса (UI Architecture)">
              <div style="margin-bottom: 24px; border: 1px solid #f1f5f9; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                <img src="assets/images/help/tag-manager-v35.png" style="width: 100%; display: block;" alt="Tag Manager Mockup v3.5" />
              </div>

              <div class="logic-grid" style="margin-top: 24px;">
                <div class="logic-card full-width">
                  <h5>Визуальная схема архитектуры (UI Architecture)</h5>
                  
                  <div class="visual-diagram">
                    <!-- Root -->
                    <div class="v-row">
                      <div class="v-node root">[Page Container]</div>
                    </div>
                    
                    <div class="v-connector-main"></div>

                    <!-- Level 2: 3 Main Branches -->
                    <div class="v-row level-2">
                      <!-- Branch 1: Header -->
                      <div class="v-branch">
                        <div class="v-node secondary">[Page Header]</div>
                        <div class="v-connector-sub"></div>
                        <div class="v-row sub">
                          <div class="v-node leaf">Title Section</div>
                          <div class="v-node leaf">Header Actions (Modal/Page Toggle, Add Button)</div>
                        </div>
                      </div>

                      <!-- Branch 2: Content -->
                      <div class="v-branch">
                        <div class="v-node secondary">[Manager Content]</div>
                        <div class="v-connector-sub"></div>
                        <div class="v-node secondary">[List Component]</div>
                        <div class="v-connector-sub"></div>
                        <div class="v-row sub">
                          <div class="v-node leaf">Toolbar (Search, Language, Trash Toggle)</div>
                          <div class="v-node leaf">Data Table (Sorting, Actions)</div>
                          <div class="v-node leaf">Pagination Footer</div>
                        </div>
                      </div>

                      <!-- Branch 3: Status Bar -->
                      <div class="v-branch">
                        <div class="v-node secondary">[Sticky Status Bar]</div>
                        <div class="v-connector-sub"></div>
                        <div class="v-row sub">
                          <div class="v-node leaf">Stats (Total, Languages)</div>
                          <div class="v-node leaf">Loading State / Version</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style="margin-top: 20px;">
                    <av-help-copy-container 
                      title="Mermaid Source (для копирования)" 
                      [content]="mermaidDiagramCode" 
                      bgColor="#1e293b"
                    ></av-help-copy-container>
                  </div>
                </div>
              </div>
            </nz-card>
          </div>
        </nz-tab>

        <!-- 4. UI LAYOUT -->
        <nz-tab nzTitle="🎨 UI Layout">
          <div class="help-section">
            <nz-card nzTitle="Визуальный эталон интерфейса тегов">
               <div class="ui-mockup-v35">
                <!-- TOP HEADER -->
                <div class="mock-header">
                  <div>
                    <h2>Теги агрегатора <i nz-icon nzType="setting" style="font-size: 14px; color: #64748b;"></i></h2>
                    <div class="mock-subtitle">Справочник тегов и групп (Aurora v3.5 Reference) <span class="mock-badge">— Всего: 12</span></div>
                  </div>
                  <div class="mock-actions">
                     <div class="mock-mode-toggle">
                        <div class="active">Теги</div>
                        <div>Группы</div>
                     </div>
                     <button nz-button nzType="primary" class="mock-btn-primary">
                        <i nz-icon nzType="plus"></i>Добавить тег
                     </button>
                  </div>
                </div>

                <!-- CONTENT CARD -->
                <div class="mock-content-card">
                  <!-- TOOLBAR -->
                  <div class="mock-toolbar">
                    <div class="mock-search-box">
                      <i nz-icon nzType="search"></i>
                      <span>Поиск по названию или коду...</span>
                    </div>
                    <div class="mock-select" style="width: 160px;">Все категории</div>
                    <div class="mock-trash-toggle">
                      <span>КОРЗИНА</span>
                      <div class="mock-switch"></div>
                    </div>
                  </div>

                  <!-- TABLE -->
                  <table class="mock-table">
                    <thead>
                      <tr>
                        <th style="width: 50px;">ID</th>
                        <th>Название / Категория</th>
                        <th style="width: 140px;">Slug</th>
                        <th style="width: 80px;">Порядок</th>
                        <th>Стиль</th>
                        <th style="width: 100px;">Статус</th>
                        <th style="width: 140px; text-align: center;">Действия</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>12</td>
                        <td>
                          <div class="mock-entity">
                            <div class="mock-avatar" style="background: #eff6ff; color: #2563eb; border-color: #dbeafe;"><i nz-icon nzType="windows"></i></div>
                            <div>
                               <div class="name">Windows 11</div>
                               <div class="sub">Операционные системы</div>
                            </div>
                          </div>
                        </td>
                        <td><span class="mock-code">win11</span></td>
                        <td><span class="mock-order">5</span></td>
                        <td><nz-tag nzColor="blue">#0078d7</nz-tag></td>
                        <td><span class="mock-status active">Активен</span></td>
                        <td class="mock-actions-cell">
                          <i nz-icon nzType="eye"></i>
                          <i nz-icon nzType="edit" style="color: #3b82f6;"></i>
                          <i nz-icon nzType="delete" style="color: #f59e0b;"></i>
                          <i nz-icon nzType="sync" style="color: #ef4444;"></i>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <!-- BOTTOM STATUS -->
                <div class="mock-status-bar">
                   <div class="left"><i nz-icon nzType="database"></i> Всего тегов: 12 | <i nz-icon nzType="global"></i> Языки: OK</div>
                   <div class="right">Aurora v3.5.0</div>
                </div>
               </div>
            </nz-card>
          </div>
        </nz-tab>

        <!-- 5. ИКОНКИ И МЕДИА -->
        <nz-tab nzTitle="🖼️ Иконки и Медиа">
          <div class="help-section">
            <nz-card nzTitle="Гибридная система иконок (Aurora v3.5)">
              <p>Система поддерживает как стандартные иконки библиотеки, так и кастомные SVG-ассеты проекта.</p>
              
              <div class="logic-grid">
                <div class="logic-card">
                  <h5>📦 Хранение и ассеты</h5>
                  <ul>
                    <li><strong>Кастомные:</strong> <code>src/assets/twotone/</code> (например, <code>av-tag-default.svg</code>).</li>
                    <li><strong>Системные:</strong> Подтягиваются из <code>&#64;ant-design/icons-angular</code> и мапятся в <code>assets/nz-icon/</code> через <code>angular.json</code>.</li>
                  </ul>
                </div>
                <div class="logic-card">
                  <h5>🛠️ Рендеринг (isPath Logic)</h5>
                  <p>Компонент списка автоматически определяет тип иконки:</p>
                  <ul>
                    <li><strong>Если путь (/...):</strong> Используется <code>mask-image</code>. Это позволяет динамически красить любой SVG-файл в цвет тега.</li>
                    <li><strong>Если имя (tags):</strong> Используется стандартный <code>nz-icon</code>.</li>
                  </ul>
                </div>
              </div>

              <div class="logic-grid" style="margin-top: 24px;">
                <div class="logic-card full-width">
                   <h5>Логика Fallback (Backend Mapping)</h5>
                   <p>Формируется в <code>TagOfAggregatorProfile.cs</code>:</p>
                   <av-help-copy-container 
                    title="DisplayIcon Mapping" 
                    [content]="iconMappingCode" 
                    bgColor="#0f172a"
                   ></av-help-copy-container>
                </div>
              </div>

              <div class="logic-grid" style="margin-top: 24px;">
                <div class="logic-card full-width" style="background: #f8fafc;">
                   <h5>Реализация на фронтенде (HTML)</h5>
                   <p>Использование <code>mask-image</code> для кастомных SVG обеспечивает визуальную чистоту и поддержку тем:</p>
                   <av-help-copy-container 
                    title="Mask-Image Rendering" 
                    [content]="maskImageCode" 
                    bgColor="#1e293b"
                   ></av-help-copy-container>
                </div>
              </div>
            </nz-card>
          </div>
        </nz-tab>

        <!-- 6. УМНАЯ ЛОКАЛИЗАЦИЯ -->
        <nz-tab nzTitle="🌍 Локализация">
          <div class="help-section">
            <nz-card nzTitle="English Fallback & SEO">
              <p>Система Aurora v3.5 минимизирует ручную работу по заполнению переводов через механизм Fallback.</p>
              <div class="logic-grid">
                <div class="logic-card">
                  <h5>Приоритеты перевода:</h5>
                  <ul>
                    <li>Текущий выбранный язык.</li>
                    <li>Английская версия (en-US).</li>
                    <li>Поле <strong>Slug</strong> (как техническая заглушка).</li>
                  </ul>
                </div>
                <div class="logic-card">
                  <h5>RequiresTranslation:</h5>
                  <p>Если для системного языка нет перевода — в списке отображается красная точка. Это сигнал контент-менеджеру.</p>
                </div>
              </div>
            </nz-card>
          </div>
        </nz-tab>

        <!-- 7. ПОДРОБНАЯ ДОКУМЕНТАЦИЯ -->
        <nz-tab nzTitle="📖 Документация">
          <div class="help-section">
            <nz-card nzTitle="📋 Архитектура компонентов">
              <div class="architecture-grid">
                <div class="arch-item">
                  <div class="arch-header">
                    <i nz-icon nzType="layout" class="arch-icon"></i>
                    <strong>Демонстрационный компонент</strong>
                  </div>
                  <div class="arch-body">
                    <p><strong>Имя:</strong> <code>TagOfAggregatorManagerComponent</code></p>
                    <p><strong>Путь:</strong> <code class="path-code">src/app/AGREGATOR/PAGES/SPRAVKA/TagOfAggregatorPage/</code></p>
                    <div class="arch-desc">Административный интерфейс управления тегами агрегатора. Построен на базе Split-View паттерна.</div>
                  </div>
                </div>
                <div class="arch-item">
                  <div class="arch-header">
                    <i nz-icon nzType="build" class="arch-icon"></i>
                    <strong>Компонент контрол</strong>
                  </div>
                  <div class="arch-body">
                    <p><strong>Имя:</strong> <code>AvShowcaseComponent</code></p>
                    <p><strong>Путь:</strong> <code class="path-code">src/app/shared/components/ui/showcase/showcase.component.ts</code></p>
                    <div class="arch-desc">Универсальный контейнер для отображения контента с боковой панелью управления и встроенной анимацией переходов.</div>
                  </div>
                </div>
              </div>
            </nz-card>

            <nz-card nzTitle="📦 Менеджер тегов (v3.5 - Golden Sample)">
              <p>Центральный интерфейс для управления семантическими метками. Поддерживает иерархию категорий, SEO-оптимизацию и расширенное управление визуальными атрибутами.</p>
              
              <div class="feature-grid">
                <div class="feature-item">
                  <i nz-icon nzType="link" class="f-icon"></i>
                  <div class="f-text"><strong>Привязка к иерархии:</strong> Теги жестко связаны с категориями (One-to-Many).</div>
                </div>
                <div class="feature-item">
                  <i nz-icon nzType="bg-colors" class="f-icon"></i>
                  <div class="f-text"><strong>Heritage Logic:</strong> Динамическое наследование цвета и иконок от родителя.</div>
                </div>
                <div class="feature-item">
                  <i nz-icon nzType="translation" class="f-icon"></i>
                  <div class="f-text"><strong>RequiresTranslation:</strong> Визуальный контроль полноты локализаций.</div>
                </div>
                <div class="feature-item">
                  <i nz-icon nzType="delete" class="f-icon"></i>
                  <div class="f-text"><strong>Soft Delete:</strong> Режим работы с корзиной и восстановления данных.</div>
                </div>
              </div>
            </nz-card>

            <nz-card nzTitle="🔌 API компонента">
              <h5>⚙️ Публичные методы (State Interface)</h5>
              <nz-table #apiTableDoc [nzData]="[{method: 'loadItems(checkEmpty?: boolean)', return: 'void', desc: 'Загрузка списка с учетом фильтров, пагинации и состояния корзины.'}]" [nzFrontPagination]="false" nzSize="small">
                <thead>
                  <tr>
                    <th>Метод</th>
                    <th>Возвращает</th>
                    <th>Описание</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let data of apiTableDoc.data">
                    <td><code class="method-code">{{data.method}}</code></td>
                    <td><nz-tag nzColor="blue">{{data.return}}</nz-tag></td>
                    <td>{{data.desc}}</td>
                  </tr>
                </tbody>
              </nz-table>
            </nz-card>

            <nz-card nzTitle="💡 Примеры использования">
              <p>Регистрация в системе маршрутизации <code>app.routes.ts</code>:</p>
              <div class="code-snippet-simple">
                <code>{{ '{' }} path: 'agregator/references/tags', loadChildren: () => import(...) {{ '}' }}</code>
              </div>
            </nz-card>

            <nz-card nzTitle="👨‍💻 Инструкция для оператора (Как это работает)">
              <div class="operator-guide">
                <div class="guide-step">
                  <div class="g-header">
                    <span class="g-num">1</span>
                    <strong>Логика «Полки и Этикетки»</strong>
                  </div>
                  <p>Категория — это «Полка». Она задает контекст. Тег — это «Этикетка». Вы не можете создать тег без привязки к категории. Сначала создаем структуру категорий, затем наполняем их тегами.</p>
                </div>

                <div class="guide-step">
                  <div class="g-header">
                    <span class="g-num">2</span>
                    <strong>Настройка стиля (Heritage Logic)</strong>
                  </div>
                  <p>Используйте ключевое слово <code>inherit</code> в поле цвета тега. Тег автоматически примет цвет своей категории. Это позволяет менять дизайн сотен тегов одним кликом в настройках категории.</p>
                </div>

                <div class="guide-step">
                  <div class="g-header">
                    <span class="g-num">3</span>
                    <strong>Работа с языками (English Fallback)</strong>
                  </div>
                  <p>Всегда заполняйте вкладку <strong>English</strong>. Если переводы на другие языки отсутствуют, система не выдаст ошибку, а автоматически подставит данные из английской версии.</p>
                </div>

                <div class="guide-step">
                  <div class="g-header">
                    <span class="g-num">4</span>
                    <strong>Использование в проекте</strong>
                  </div>
                  <ul>
                    <li><strong>Фильтрация:</strong> Теги используются для мгновенного отбора софта в каталоге.</li>
                    <li><strong>Бейджи:</strong> Например, тег <code>verified</code> (Безопасность) отображается как яркий значок в карточке программы.</li>
                    <li><strong>SEO:</strong> Каждый тег генерирует свою посадочную страницу.</li>
                  </ul>
                </div>

                <div class="guide-step">
                  <div class="g-header">
                    <span class="g-num">5</span>
                    <strong>Безопасность (Trash Mode)</strong>
                  </div>
                  <p>Используйте «Корзину» вместо полного удаления. Это позволит восстановить тег со всеми его SEO-настройками и связями в любой момент без потери данных.</p>
                </div>
              </div>
            </nz-card>

            <nz-card nzTitle="📚 Архитектурные заметки">
              <div class="notes-container">
                <div class="note-box fallback">
                  <h5><i nz-icon nzType="safety"></i> English Fallback</h5>
                  <p>Для обеспечения UX, если перевод на текущий язык отсутствует, система использует иерархию: <strong>English (en-US) &rarr; Slug (URL)</strong>.</p>
                </div>
                <div class="note-box context">
                  <h5><i nz-icon nzType="cluster"></i> Управление и связи</h5>
                  <p>Теги — это не просто строки. Они представляют собой <strong>метаданные сущностей</strong>. Связь с категориями позволяет агрегатору строить сложные фильтры (например, "Все бесплатные игры для Windows 11").</p>
                </div>
                <div class="note-box usage">
                  <h5><i nz-icon nzType="rocket"></i> Использование в проекте</h5>
                  <p>Пример: тег <code>verified</code> с иконкой <code>check-circle</code> используется для пометки программ, прошедших проверку антивирусом. Цвет наследуется от категории "Безопасность".</p>
                </div>
              </div>
            </nz-card>
          </div>
        </nz-tab>

        <!-- 7. ROADMAP v3.5 -->
        <nz-tab nzTitle="🚀 Roadmap v3.5">
          <div class="help-section">
            <nz-card nzTitle="План развития системы тегов">
               <!-- HIGH LEVEL PHASES -->
               <div style="margin-bottom: 32px;">
                  <div class="roadmap-step">
                    <div class="step-header">
                      <nz-tag nzColor="success">DONE</nz-tag>
                      <strong>Фаза 1: Архитектура и База данных</strong>
                    </div>
                    <p>Проектирование таблиц, индексов и связей. Реализация DAL-моделей и миграций.</p>
                  </div>

                  <div class="roadmap-step">
                    <div class="step-header">
                      <nz-tag nzColor="success">DONE</nz-tag>
                      <strong>Фаза 2: Бэкенд-сервисы и API</strong>
                    </div>
                    <p>Создание Repositories, Services, AutoMapper Profiles и FluentValidation. Настройка контроллеров.</p>
                  </div>

                  <div class="roadmap-step">
                    <div class="step-header">
                      <nz-tag nzColor="processing">IN PROGRESS</nz-tag>
                      <strong>Фаза 3: Фронтенд-инфраструктура</strong>
                    </div>
                    <p>Создание API-клиентов, State-сервисов на сигналах и базовых моделей DTO.</p>
                  </div>

                  <div class="roadmap-step">
                    <div class="step-header">
                      <nz-tag nzColor="default">TODO</nz-tag>
                      <strong>Фаза 4: Пользовательский интерфейс</strong>
                    </div>
                    <p>Реализация менеджеров, списков и форм редактирования тегов/категорий.</p>
                  </div>

                  <div class="roadmap-step" style="border: none; padding-bottom: 0;">
                    <div class="step-header">
                      <nz-tag nzColor="default">TODO</nz-tag>
                      <strong>Фаза 5: Глобальная интеграция</strong>
                    </div>
                    <p>Роутинг, сайдбар, локализация интерфейса и финальное тестирование.</p>
                  </div>
               </div>

               <div style="margin-top: 40px; border-top: 2px solid #f1f5f9; padding-top: 32px;">
                  <h4 style="margin-bottom: 24px; color: #0f172a; font-weight: 800;">Как собрать такой модуль с нуля? (Пошаговый план)</h4>
                  
                  <div class="roadmap-container">
                    <!-- КАРТА МОДУЛЯ (Tree view logic) -->
                    <div style="margin-bottom: 30px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px;">
                      <h5 style="color: #1e293b; margin-bottom: 12px; font-weight: 700;">
                        <i nz-icon nzType="cluster" style="margin-right: 8px;"></i>
                        Карта Бэкенд-модуля (DAL & API)
                      </h5>
                      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                        <div class="tree-box">
                          <strong style="color: #0366d6; display: block; margin-bottom: 5px;">[DAL] Слой доступа к данным</strong>
                          ├── 📂 Models/Aggregator/<br />
                          │   ├── 📄 CategoryTagOfAggregator.cs<br />
                          │   └── 📄 TagOfAggregator.cs<br />
                          ├── 📂 Repositories/<br />
                          │   ├── 📄 TagOfAggregatorRepository.cs<br />
                          │   └── 📄 Interfaces/ITagOfAggregatorRepository.cs<br />
                          └── 📄 AppDbContext.Aggregator.cs
                        </div>
                        <div class="tree-box">
                          <strong style="color: #0366d6; display: block; margin-bottom: 5px;">[API] Слой логики и сервисов</strong>
                           ├── 📂 Controllers/<br />
                          │   └── 📄 TagOfAggregatorController.cs<br />
                          └── 📂 Pages/AGGREGATOR/<br />
                              ├── 📂 TagOfAggregator/ (Logic)<br />
                              └── 📂 CategoryTagOfAggregator/<br />
                                  └── 📂 Jsons/ (Master Seed Data)
                        </div>
                      </div>

                      <h5 style="color: #1e293b; margin: 24px 0 12px 0; font-weight: 700;">
                        <i nz-icon nzType="appstore" style="margin-right: 8px;"></i>
                        Карта Фронтенд-модуля (Angular v17+)
                      </h5>
                      <div class="tree-box" style="background: #fff; padding: 12px; border-radius: 4px; border: 1px dashed #cbd5e1;">
                         <div [innerHTML]="frontendMapCodeHtml"></div>
                      </div>
                    </div>

                    <!-- STEPS 1-13 -->
                    <div class="roadmap-step">
                      <div class="step-header"><nz-tag nzColor="blue">Step 1</nz-tag> <strong>Бэкенд: Модели и БД</strong></div>
                      <p>Создайте <code>Entity</code> и <code>Localization</code> в папке <code>DAL/Models/Aggregator</code>.</p>
                      <div class="logic-grid" style="margin-top: 10px;">
                        <div class="logic-card" style="background: #f0f9ff; border-color: #bae6fd;">
                          <h6 style="color: #0369a1; font-weight: 700;">Core Entity:</h6>
                          <ul style="font-size: 11px; color: #0c4a6e; padding-left: 15px;">
                            <li>Slug (Required) - Slug для URL</li>
                            <li>IsActive (bool) - По умолчанию true</li>
                            <li>SortOrder (int) - По умолчанию 0</li>
                            <li>IconPath/Color - inherit/системный</li>
                            <li>Унаследовано от: <code>FullAuditableEntityOfAggregator</code></li>
                          </ul>
                        </div>
                        <div class="logic-card" style="background: #fefce8; border-color: #fef08a;">
                          <h6 style="color: #a16207; font-weight: 700;">Naming Conventions:</h6>
                          <p style="font-size: 11px; color: #713f12; margin: 0;">
                            Table: <code>tags_of_aggregator</code> (plural)<br/>
                            Loc Table: <code>tag_of_aggregator_localizations</code>
                          </p>
                        </div>
                      </div>
                      <p style="margin-top: 10px; font-size: 11px; color: #94a3b8;">
                         <i nz-icon nzType="star"></i> <strong>Golden Sample:</strong> <code>DAL/Models/Aggregator/TagOfAggregator.cs</code>
                      </p>
                    </div>

                    <div class="roadmap-step">
                      <div class="step-header"><nz-tag nzColor="blue">Step 2</nz-tag> <strong>Бэкенд: Репозитории и UnitOfWork</strong></div>
                      <p>Реализуйте репозитории, добавьте их в <code>IUnitOfWork.cs</code> и зарегистрируйте в DI.</p>
                      <div class="logic-card" style="font-size: 11px; background: #fff; margin-top: 5px;">
                         <code>services.AddScoped&lt;ITagOfAggregatorRepository, TagOfAggregatorRepository&gt;();</code>
                      </div>
                    </div>

                    <div class="roadmap-step">
                      <div class="step-header"><nz-tag nzColor="blue">Step 3</nz-tag> <strong>Бэкенд: Логика и API</strong></div>
                      <p>Создайте сервис и контроллер с маршрутом <code>api/v1/aggregator/tags</code>. Реализуйте CRUD v1.</p>
                      <av-help-copy-container title="AI Prompt: Tag Controller" [content]="controllerPromptCode" bgColor="#1e293b"></av-help-copy-container>
                    </div>

                    <div class="roadmap-step">
                      <div class="step-header"><nz-tag nzColor="green">Step 4</nz-tag> <strong>Фронтенд: Инфраструктура</strong></div>
                      <p>Создайте папку модуля в <code>AGREGATOR/PAGES/SPRAVKA</code>. Реализуйте API и State сервисы.</p>
                      <div class="logic-card" style="background: #fdf2f8; border-color: #fbcfe8; font-size: 11px;">
                         <strong>State Logic:</strong> SSOT на базе <code>signal&lt;State&gt;</code> + <code>executeWithLoading()</code>.
                      </div>
                    </div>

                    <div class="roadmap-step">
                      <div class="step-header"><nz-tag nzColor="green">Step 5</nz-tag> <strong>Фронтенд: Функциональная спецификация UI</strong></div>
                      <p>Интегрируйте <code>AvSearch</code>, <code>nz-pagination</code> и переключатель корзины.</p>
                    </div>

                    <!-- STEPS 6-13 (Summary) -->
                    <div class="roadmap-step" style="border: none;">
                      <div class="step-header"><nz-tag nzColor="purple">Steps 6-13</nz-tag> <strong>Продвинутая логика</strong></div>
                      <p>Heritage Mapping, SEO Fallbacks, Trash Mode, Action Delegation, Icons Preview и Error Handling.</p>
                    </div>
                  </div>
               </div>

               <!-- SYSTEM CONSOLE (Exactly like sample) -->
               <div style="margin-top: 48px;">
                  <div class="console-box">
                    <div class="c-header">
                      <span>System Console</span>
                      <div class="c-dots"><span></span><span></span><span></span></div>
                    </div>
                    <div class="c-body">
                      <div class="line"><span class="t">[AURORA]</span> <span class="m">Система инициализирована...</span></div>
                      <div class="line"><span class="t">[DB]</span> <span class="m">Подключение к агрегатору OK</span></div>
                      <div class="line"><span class="t">[API]</span> <span class="m">v1.2.0 (Standard v3.5) ACTIVE</span></div>
                    </div>
                  </div>
               </div>
            </nz-card>
          </div>
        </nz-tab>

        <!-- 8. СПЕЦИФИКАЦИЯ AURORA v3.5 -->
        <nz-tab nzTitle="📋 Спецификация Aurora v3.5">
          <div class="help-section">
            <nz-card nzTitle="🛠️ Детализация реализации (Actions & Layout)">
               <nz-card nzTitle="Логика Actions и паттерны UI" class="inner-card" style="margin-bottom: 24px;">
                 <nz-table #actionsTable [nzData]="actionPatterns" [nzFrontPagination]="false" nzSize="small">
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
                     <tr *ngFor="let act of actionsTable.data">
                       <td><strong>{{ act.name }}</strong></td>
                       <td><i nz-icon [nzType]="act.icon"></i></td>
                       <td><nz-tag [nzColor]="act.color">{{ act.colorName }}</nz-tag></td>
                       <td><code>{{ act.method }}</code></td>
                       <td>{{ act.ux }}</td>
                     </tr>
                   </tbody>
                 </nz-table>
                 <div class="logic-grid" style="margin-top: 24px;">
                   <div class="logic-card full-width">
                     <h5>Кнопки в таблице (HTML)</h5>
                     <av-help-copy-container [content]="listActionTemplateCode" bgColor="#0f172a"></av-help-copy-container>
                   </div>
                 </div>
               </nz-card>

               <nz-card nzTitle="🎛️ Панель фильтров и Сборка Header" class="inner-card">
                 <div class="logic-grid">
                    <div class="logic-card">
                      <h5>Бизнес-логика</h5>
                      <ul>
                        <li><strong>Reset:</strong> Пагинация сбрасывается на 1.</li>
                        <li><strong>Safe Add:</strong> Кнопка скрыта в корзине.</li>
                      </ul>
                    </div>
                    <div class="logic-card">
                      <h5>Header Design</h5>
                      <ul>
                        <li><strong>Flex:</strong> Поиск занимает <code>flex: 1</code>.</li>
                        <li><strong>Pill:</strong> Корзина — капсула.</li>
                      </ul>
                    </div>
                 </div>
                 <div class="logic-grid" style="margin-top: 20px;">
                    <av-help-copy-container title="Filters Template" [content]="toolbarFilterCode" bgColor="#0f172a"></av-help-copy-container>
                    <av-help-copy-container title="Header Layout & Styles" [content]="headerAssemblyHtmlCode" bgColor="#1e293b"></av-help-copy-container>
                 </div>
               </nz-card>

               <nz-card nzTitle="Пример: GET-Контроллер (Standard v3.5)" style="margin-top: 24px;">
                 <av-help-copy-container title="C# Controller Pattern" [content]="serverControllerCode" bgColor="#0f172a"></av-help-copy-container>
               </nz-card>
            </nz-card>
          </div>
        </nz-tab>

        <!-- 9. FRONT CHECKLIST -->
        <nz-tab nzTitle="✅ Front Checklist">
          <div class="help-section">
            <nz-card nzTitle="План реализации Frontend (v3.5) — Полный чек-лист">
              <div class="checklist-grid">
                <div class="checklist-column">
                  <div class="phase-box">
                    <strong>🏗 Фаза 1: Инфраструктура и Модели</strong>
                    <ul>
                      <li>Создание структуры папок <code>CategoryTagOfAggregatorPage</code> и <code>TagOfAggregatorPage</code>.</li>
                      <li>Определение эндпоинтов в <code>end-points.ts</code> для обоих сущностей.</li>
                      <li>Создание интерфейсов DTO (Item, Detail, Create, Update) и интерфейса State.</li>
                    </ul>
                  </div>
                  <div class="phase-box">
                    <strong>📡 Фаза 2: API и State Services</strong>
                    <ul>
                      <li>Реализация <code>TagOfAggregatorApiService</code> (CRUD + Maintenance).</li>
                      <li>Реализация <code>TagOfAggregatorStateService</code> на Angular Signals (SSOT).</li>
                      <li>Внедрение <code>executeWithLoading()</code> для всех асинхронных операций.</li>
                      <li>Методы <code>seedFromJson()</code> и <code>clearDatabase()</code> в State.</li>
                    </ul>
                  </div>
                  <div class="phase-box">
                    <strong>🏷 Фаза 3: Компоненты Категорий</strong>
                    <ul>
                      <li>Реализация <code>CategoryManager</code> на базе <code>AvShowcaseComponent</code>.</li>
                      <li>Инлайн-редактирование названий и управление локализациями.</li>
                      <li>Внедрение <strong>Delete Guard</strong>: проверка на наличие тегов перед удалением.</li>
                    </ul>
                  </div>
                </div>

                <div class="checklist-column">
                  <div class="phase-box">
                    <strong>🏷 Фаза 4: Компоненты Тегов</strong>
                    <ul>
                      <li>Создание <code>TagManager</code>, <code>TagList</code> и <code>TagForm</code>.</li>
                      <li>Интеграция <code>AvSearchComponent</code> и привязка к сигналу <code>searchTerm</code>.</li>
                      <li>Режим корзины: фильтрация <code>isDeleted</code> и смена набора кнопок действий.</li>
                      <li><b>Red dot logic:</b> Отображение индикатора <code>RequiresTranslation</code>.</li>
                      <li>Форма: разделение на Основное, Локализации и SEO (English Fallback).</li>
                    </ul>
                  </div>
                  <div class="phase-box">
                    <strong>🚀 Фаза 5: Маршрутизация и Навигация</strong>
                    <ul>
                      <li>Регистрация дочерних роутов в <code>aggregator-pages.routes.ts</code>.</li>
                      <li>Добавление в <code>SidebarService</code> (Группа: Справочники, Иконка: <code>tags</code>).</li>
                      <li>Настройка хлебных крошек (Breadcrumbs).</li>
                    </ul>
                  </div>
                  <div class="phase-box">
                    <strong>🧪 Фаза 6: Полировка и UX</strong>
                    <ul>
                      <li>Проверка <strong>Heritage Logic</strong>: визуальный тест наследования цвета/иконок.</li>
                      <li>Тестирование Maintenance: сброс и наполнение базы через JSON.</li>
                      <li>Оптимизация производительности через <code>ChangeDetectionStrategy.OnPush</code>.</li>
                    </ul>
                  </div>
                </div>
              </div>

              <h6 style="margin-top: 32px; color: #64748b; font-size: 11px; text-transform: uppercase;">Markdown для копирования в таск-менеджер:</h6>
              <av-help-copy-container
                title="Frontend Checklist (Full v3.5)"
                [content]="frontendChecklistCode"
                bgColor="#0f172a"
              ></av-help-copy-container>
            </nz-card>
          </div>
        </nz-tab>
      </nz-tabset>

       <div class="footer-copy">Aurora Admin v1.0.0 | © 2026 Aurora Team</div>
    </div>
  `,
  styles: [`
    .help-container { padding: 0; min-height: 100vh; padding-bottom: 60px; }
    .help-tabs { margin-top: 24px; }
    .help-section { padding: 16px 0; display: flex; flex-direction: column; gap: 24px; }
    .feature-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px; margin-top: 16px; }
    .feature-item { display: flex; gap: 12px; padding: 16px; background: #f8fafc; border-radius: 12px; border: 1px solid #f1f5f9; }
    .f-icon { font-size: 20px; color: #3b82f6; margin-top: 2px; }
    .f-text { font-size: 13px; color: #475569; }
    
    .logic-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .logic-card { padding: 16px; border-radius: 8px; border: 1px solid #e2e8f0; }
    .logic-card.full-width { grid-column: 1 / -1; }
    .logic-card h6 { margin: 0 0 8px 0; }
    
    .tree-box { font-family: 'Consolas', monospace; font-size: 11px; color: #334155; line-height: 1.5; background: #fff; padding: 12px; border-radius: 4px; border: 1px dashed #cbd5e1; }

    /* UI MOCKUP */
    .ui-mockup-v35 { background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05); }
    .mock-header { padding: 20px 24px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #f1f5f9; }
    .mock-header h2 { margin: 0; font-size: 20px; font-weight: 800; }
    .mock-subtitle { font-size: 11px; color: #64748b; }
    .mock-badge { color: #2563eb; font-weight: 700; }
    .mock-actions { display: flex; gap: 12px; align-items: center; }
    .mock-mode-toggle { display: flex; background: #f1f5f9; padding: 4px; border-radius: 8px; font-size: 10px; font-weight: 700; }
    .mock-mode-toggle div { padding: 4px 10px; border-radius: 6px; }
    .mock-mode-toggle .active { background: #fff; color: #2563eb; }
    .mock-btn-primary { background: #2563eb; border: none; color: #fff; padding: 6px 16px; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer; }

    .mock-content-card { margin: 0 20px 20px; border: 1px solid #f1f5f9; border-radius: 12px; }
    .mock-toolbar { padding: 12px 16px; display: flex; gap: 12px; align-items: center; border-bottom: 1px solid #f1f5f9; }
    .mock-search-box { flex: 1; border: 1px solid #e2e8f0; height: 32px; border-radius: 6px; display: flex; align-items: center; padding: 0 10px; font-size: 11px; color: #94a3b8; }
    .mock-table { width: 100%; border-collapse: collapse; font-size: 11px; }
    .mock-table thead { background: #f8fafc; color: #64748b; }
    .mock-table th { padding: 10px 12px; text-align: left; }
    .mock-table td { padding: 12px; border-bottom: 1px solid #f1f5f9; }
    .mock-entity { display: flex; align-items: center; gap: 10px; }
    .mock-avatar { width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 1px solid; }

    .mock-status-bar { padding: 8px 20px; background: #f8fafc; border-top: 1px solid #f1f5f9; display: flex; justify-content: space-between; font-size: 10px; color: #94a3b8; }

    /* DOCUMENTATION TAB STYLES */
    .architecture-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .arch-item { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; transition: all 0.3s; }
    .arch-item:hover { border-color: #3b82f6; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
    .arch-header { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; color: #1e293b; }
    .arch-icon { color: #3b82f6; font-size: 18px; }
    .path-code { color: #0366d6; font-size: 11px; }
    .arch-desc { margin-top: 12px; font-size: 12px; color: #64748b; line-height: 1.5; }
    .method-code { color: #d946ef; font-weight: 600; }
    .code-snippet-simple { background: #1e293b; color: #fff; padding: 12px; border-radius: 6px; font-family: monospace; font-size: 12px; margin-top: 8px; }
    
    .notes-container { display: flex; flex-direction: column; gap: 16px; }
    .note-box { padding: 16px; border-radius: 8px; border-left: 4px solid; }
    .note-box h5 { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; font-weight: 700; }
    .note-box p { margin: 0; font-size: 13px; line-height: 1.6; }
    .note-box.fallback { background: #f0f9ff; border-left-color: #3b82f6; color: #1e40af; }
    .note-box.context { background: #f0fdf4; border-left-color: #22c55e; color: #166534; }
    .note-box.usage { background: #faf5ff; border-left-color: #a855f7; color: #6b21a8; }

    /* OPERATOR GUIDE */
    .operator-guide { display: flex; flex-direction: column; gap: 20px; }
    .guide-step { padding: 12px; border-radius: 8px; background: #fff; border: 1px solid #f1f5f9; }
    .g-header { display: flex; align-items: center; gap: 12px; margin-bottom: 8px; }
    .g-num { width: 24px; height: 24px; background: #1e293b; color: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; }
    .guide-step p, .guide-step ul { margin: 0; font-size: 13px; color: #475569; line-height: 1.5; }
    .guide-step ul { padding-left: 20px; margin-top: 8px; }

    /* ROADMAP STYLES */
    .roadmap-step { margin-bottom: 24px; padding-left: 20px; border-left: 2px solid #e2e8f0; position: relative; }
    .roadmap-step::before { content: ''; position: absolute; left: -6px; top: 0; width: 10px; height: 10px; border-radius: 50%; background: #e2e8f0; border: 2px solid #fff; }
    .step-header { margin-bottom: 8px; display: flex; align-items: center; gap: 8px; }
    .step-header strong { font-size: 14px; color: #1e293b; }

    /* CONSOLE */
    .console-box { background: #0f172a; border-radius: 8px; overflow: hidden; font-family: 'JetBrains Mono', monospace; }
    .c-header { background: #1e293b; padding: 6px 16px; display: flex; justify-content: space-between; align-items: center; }
    .c-header span { font-size: 10px; color: #94a3b8; font-weight: 700; text-transform: uppercase; }
    .c-dots { display: flex; gap: 4px; }
    .c-dots span { width: 6px; height: 6px; border-radius: 50%; background: #334155; }
    .c-body { padding: 12px 16px; font-size: 11px; }
    .c-body .line { margin-bottom: 4px; display: flex; gap: 8px; }
    .c-body .t { color: #22c55e; font-weight: 700; }
    .c-body .m { color: #cbd5e1; }

    .footer-copy { text-align: center; margin-top: 24px; font-size: 10px; color: #94a3b8; }

    /* VISUAL DIAGRAM STYLES */
    .visual-diagram { padding: 40px 24px; background: #f8fafc; border-radius: 12px; display: flex; flex-direction: column; align-items: center; overflow-x: auto; }
    .v-row { display: flex; justify-content: center; width: 100%; position: relative; }
    .v-row.level-2 { align-items: flex-start; gap: 40px; }
    .v-row.sub { gap: 12px; margin-top: 15px; flex-wrap: wrap; }
    .v-branch { display: flex; flex-direction: column; align-items: center; flex: 1; min-width: 200px; position: relative; }
    
    .v-node { padding: 10px 16px; border-radius: 6px; font-family: 'JetBrains Mono', 'Consolas', monospace; font-size: 11px; border: 1px solid #cbd5e1; background: #fff; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); text-align: center; line-height: 1.4; }
    .v-node.root { background: #eff6ff; border-color: #3b82f6; color: #1d4ed8; font-weight: 700; min-width: 180px; }
    .v-node.secondary { background: #f8fafc; font-weight: 600; min-width: 150px; }
    .v-node.leaf { background: #fff; font-size: 10px; color: #475569; border-style: dashed; max-width: 180px; }

    .v-connector-main { width: 2px; height: 25px; background: #cbd5e1; position: relative; }
    .v-connector-main::after { content: ''; position: absolute; bottom: 0; left: 50%; transform: translateX(-50%); width: 75%; height: 2px; background: #cbd5e1; }
    
    .v-connector-sub { width: 2px; height: 20px; background: #cbd5e1; }

    @media (max-width: 1200px) {
      .v-row.level-2 { flex-direction: column; gap: 40px; align-items: center; }
      .v-connector-main::after { display: none; }
    }
  `]
})
export class TagAggregatorHelpComponent {
  mermaidDiagramCode = `graph TD
    A["[Page Container]"] --> B["[Page Header]"]
    B --> B1["Title Section"]
    B --> B2["Header Actions (Modal/Page Toggle, Add Button)"]
  
    A --> D["[Manager Content]"]
    D --> E["[List Component]"]
    E --> E1["Toolbar (Search, Language, Trash Toggle)"]
    E --> E2["Data Table (Sorting, Actions)"]
    E --> E3["Pagination Footer"]
  
    A --> F["[Sticky Status Bar]"]
    F --> F1["Stats (Total, Languages)"]
    F --> F2["Loading State / Version"]`;

  actionPatterns = [
    { name: 'Просмотр', icon: 'eye', color: 'primary', colorName: 'Primary', method: 'openView()', ux: 'Открывает Modal с деталями (Read-only)' },
    { name: 'Редактировать', icon: 'edit', color: 'gold', colorName: 'Warning', method: 'openEditForm()', ux: 'Форма редактирования с SEO-блоком' },
    { name: 'В корзину', icon: 'delete', color: 'error', colorName: 'Error', method: 'softDelete()', ux: 'Мягкое удаление (isDeleted = true)' },
    { name: 'Восстановить', icon: 'sync', color: 'success', colorName: 'Success', method: 'restore()', ux: 'Возврат записи из корзины' },
    { name: 'Hard Delete', icon: 'fire', color: 'red', colorName: 'Critical', method: 'hardDelete()', ux: 'Метод modal.challenge (Капча)' },
  ];

  categoryFields = [
    { name: 'Slug', type: 'string', desc: 'Уникальный код для URL' },
    { name: 'Color', type: 'string', desc: 'HEX-код цвета' },
    { name: 'IsActive', type: 'bool', desc: 'Флаг активности' }
  ];

  tagFields = [
    { name: 'Slug', type: 'string', desc: 'Уникальный код (URL)' },
    { name: 'Color', type: 'string', desc: 'Цвет ("inherit" для наследования)' },
    { name: 'IsActive', type: 'bool', desc: 'Флаг активности' }
  ];

  serverSearchCode = `if (!string.IsNullOrWhiteSpace(req.SearchTerm)) {
    var search = req.SearchTerm.ToLower();
    query = query.Where(x => x.Slug.ToLower().Contains(search) || 
                             x.Localizations.Any(l => l.Name.ToLower().Contains(search)));
}`;

  heritageLogicCode = `.ForMember(d => d.DisplayColor, opt => opt.MapFrom(s => 
    s.Color == "inherit" && s.Category != null ? s.Category.Color : s.Color))`;

  iconMappingCode = `.ForMember(d => d.DisplayIcon, opt => opt.MapFrom(s =>
    s.IconPath ?? (s.Category != null ? s.Category.IconPath : "assets/twotone/av-tag-default.svg")))`;

  maskImageCode = `<div 
  [style.background-color]="data.displayColor"
  [style.mask-image]="'url(' + data.displayIcon + ')'"
  style="mask-size: contain; mask-repeat: no-repeat;"
></div>`;

  controllerPromptCode = `Создай TagOfAggregatorController.cs.
1. Маршрут: [Route("api/v1/aggregator/tags")].
2. Методы: GetPaged, GetById, Create, Update, Delete, Restore.`;

  listActionTemplateCode = `<td class="action-cell">
  @if (!data.isDeleted) {
    <i nz-icon nzType="eye" (click)="view(data.id)"></i>
    <i nz-icon nzType="edit" (click)="edit(data.id)" class="text-blue"></i>
    <i nz-icon nzType="delete" (click)="softDelete(data.id)" class="text-orange"></i>
  } @else {
    <i nz-icon nzType="sync" (click)="restore(data.id)" class="text-green"></i>
    <i nz-icon nzType="fire" (click)="hardDelete(data.id)" class="text-red"></i>
  }
</td>`;

  toolbarFilterCode = `<div class="header-assembly">
  <av-search [(value)]="searchTerm" class="search-fluid"></av-search>
  <div class="trash-capsule" [class.active]="showDeleted()">
     <span>TRASH</span><nz-switch [(ngModel)]="showDeleted"></nz-switch>
  </div>
</div>`;

  headerAssemblyHtmlCode = `.header-assembly { display: flex; gap: 16px; align-items: center; }
.search-fluid { flex: 1; }
.trash-capsule { background: #f1f5f9; padding: 4px 12px; border-radius: 99px; }`;

  serverControllerCode = `[HttpGet]
public async Task<ActionResult<PagedResult<TagItemDto>>> GetPaged([FromQuery] TagFilterRequest request) 
{
    var query = _unitOfWork.Tags.GetQuery();
    if (!string.IsNullOrEmpty(request.Search)) 
        query = query.Where(x => x.Slug.Contains(request.Search));
    return await query.ToPagedResultAsync(request);
}`;

  frontendMapCodeHtml = `
<strong style="color: #0366d6;">src/app/AGREGATOR/PAGES/SPRAVKA/TagOfAggregatorPage/</strong><br/>
├── 📂 <span style="color: #6aab73;">components/</span> (List, Form, Modal, Inline, View)<br/>
├── 📂 <span style="color: #6aab73;">models/</span> (DTOs + State Interface)<br/>
├── 📂 <span style="color: #6aab73;">services/</span><br/>
│   ├── 📄 tag-of-aggregator-api.service.ts<br/>
│   └── 📄 tag-of-aggregator-state.service.ts<br/>
├── 📄 tag-of-aggregator-manager.component.ts<br/>
├── 📄 tag-of-aggregator.routes.ts<br/>
└── 📄 end-points.ts`;

  frontendChecklistCode = `# Чек-лист: Создание фронтенд-модуля Tag & Category System (v3.5)

## 🏗 Фаза 1: Инфраструктура и Модели
- [ ] Создание структуры папок CategoryTagOfAggregatorPage и TagOfAggregatorPage
- [ ] Определение эндпоинтов в end-points.ts для обоих сущностей
- [ ] Создание интерфейсов DTO (Item, Detail, Create, Update) и интерфейса State

## 📡 Фаза 2: API и State Services
- [ ] Реализация TagOfAggregatorApiService (CRUD + Maintenance)
- [ ] Реализация TagOfAggregatorStateService на Angular Signals (SSOT)
- [ ] Внедрение executeWithLoading() для всех асинхронных операций
- [ ] Методы seedFromJson() и clearDatabase() в State

## 🏷 Фаза 3: Компоненты Категорий
- [ ] Реализация CategoryManager на базе AvShowcaseComponent
- [ ] Инлайн-редактирование названий и управление локализациями
- [ ] Внедрение Delete Guard: проверка на наличие тегов перед удалением

## 🏷 Фаза 4: Компоненты Тегов
- [ ] Создание TagManager, TagList и TagForm
- [ ] Интеграция AvSearchComponent и привязка к сигналу searchTerm
- [ ] Режим корзины: фильтрация isDeleted и смена набора кнопок действий
- [ ] Red dot logic: Отображение индикатора RequiresTranslation
- [ ] Форма: разделение на Основное, Локализации и SEO (English Fallback)

## 🚀 Фаза 5: Маршрутизация и Навигация
- [ ] Регистрация дочерних роутов в aggregator-pages.routes.ts
- [ ] Добавление в SidebarService (Группа: Справочники, Иконка: tags)
- [ ] Настройка хлебных крошек (Breadcrumbs)

## 🧪 Фаза 6: Полировка и UX
- [ ] Проверка Heritage Logic: визуальный тест наследования цвета/иконок
- [ ] Тестирование Maintenance: сброс и наполнение базы через JSON
- [ ] Оптимизация производительности через ChangeDetectionStrategy.OnPush
  `;
}
