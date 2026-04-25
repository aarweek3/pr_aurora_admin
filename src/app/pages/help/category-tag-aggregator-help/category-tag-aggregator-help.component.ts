import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { HelpCopyContainerComponent, HelpPathHeaderComponent } from '@shared/components/ui';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzTagModule } from 'ng-zorro-antd/tag';

@Component({
  selector: 'app-category-tag-aggregator-help',
  standalone: true,
  imports: [
    CommonModule,
    NzCardModule,
    NzTabsModule,
    NzTableModule,
    NzTagModule,
    NzIconModule,
    NzAlertModule,
    HelpCopyContainerComponent,
    HelpPathHeaderComponent,
  ],
  template: `
    <div class="help-container">
      <av-help-path-header
        title="Category Tag Of Aggregator Model"
        subtitle="Техническая спецификация сущности Категория Тегов в системе агрегатора."
        icon="📂"
        componentPath="src/app/pages/help/category-tag-aggregator-help/category-tag-aggregator-help.component.ts"
        [dalPath]="[
          'DAL/Models/Aggregator/CategoryTagOfAggregator.cs',
          'DAL/Models/Aggregator/Localizations/CategoryTagOfAggregatorLocalization.cs'
        ]"
      ></av-help-path-header>

      <nz-tabset nzType="card" class="help-tabs">
        <!-- 1. ОБЗОР -->
        <nz-tab nzTitle="🌟 Обзор">
          <div class="help-section">
            <nz-card nzTitle="Назначение">
              <p>
                Сущность <strong>CategoryTagOfAggregator</strong> предназначена для классификации и группировки тегов. 
                Она является ключевым справочником для структурирования ПО по типам, лицензиям и другим категориям в системе агрегатора.
              </p>
              <div class="feature-grid">
                <div class="feature-item">
                  <i nz-icon nzType="cluster" class="f-icon"></i>
                  <div class="f-text">
                    <strong>Группировка тегов:</strong> Автоматическое распределение тегов по смысловым контейнерам для удобства фильтрации.
                  </div>
                </div>
                <div class="feature-item">
                  <i nz-icon nzType="global" class="f-icon"></i>
                  <div class="f-text">
                    <strong>Smart Fallback:</strong> Автозаполнение пустых переводов из английской локализации или технического Slug.
                  </div>
                </div>
                <div class="feature-item">
                  <i nz-icon nzType="layout" class="f-icon"></i>
                  <div class="f-text">
                    <strong>Dual-Mode UI:</strong> Работа в режиме модального окна для быстрых правок или на отдельной странице для глубокого редактирования.
                  </div>
                </div>
              </div>
            </nz-card>

            <nz-alert
              nzType="success"
              nzMessage="Reference Implementation / Золотой Эталон Aurora v3.5"
              nzDescription="Модуль является образцом реализации современных паттернов Signals, CRUD v1, алфавитное шардирование и умная система локализации."
              nzShowIcon
            ></nz-alert>
          </div>
        </nz-tab>

        <!-- 2. СТРУКТУРА ДАННЫХ -->
        <nz-tab nzTitle="💾 Структура БД">
          <div class="help-section">
            <nz-card nzTitle="Core Entity (CategoryTagOfAggregator)">
              <nz-table #coreTable [nzData]="coreFields" [nzFrontPagination]="false" nzSize="small">
                <thead>
                  <tr><th>Поле</th><th>Тип</th><th>Описание</th></tr>
                </thead>
                <tbody>
                  <tr *ngFor="let f of coreTable.data">
                    <td><code>{{ f.name }}</code></td>
                    <td><nz-tag>{{ f.type }}</nz-tag></td>
                    <td>{{ f.desc }}</td>
                  </tr>
                </tbody>
              </nz-table>
            </nz-card>

            <nz-card nzTitle="Localization (CategoryTagOfAggregatorLocalization)">
              <nz-table #locTable [nzData]="locFields" [nzFrontPagination]="false" nzSize="small">
                <thead>
                  <tr><th>Поле</th><th>Тип</th><th>Описание</th></tr>
                </thead>
                <tbody>
                  <tr *ngFor="let f of locTable.data">
                    <td><code>{{ f.name }}</code></td>
                    <td><nz-tag>{{ f.type }}</nz-tag></td>
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
            <nz-card nzTitle="Логика универсального поиска">
              <p>Поиск реализован на стороне БД (IQueryable) и охватывает как технические поля, так и все локализации одновременно.</p>
              <av-help-copy-container title="Linq Implementation" [content]="serverSearchCode" bgColor="#0f172a"></av-help-copy-container>
            </nz-card>
            <nz-card nzTitle="Серверная сортировка">
               <av-help-copy-container title="Sort Switch (C#)" [content]="serverSortingCode" bgColor="#1e1b4b"></av-help-copy-container>
            </nz-card>
          </div>
        </nz-tab>

        <nz-tab nzTitle="🖼️ Visual">
          <div class="help-section">
            <nz-card nzTitle="Схема интерфейса (UI Architecture)">
              <div style="margin-bottom: 24px; border: 1px solid #f1f5f9; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                <img src="assets/images/help/category-tag-manager-v35.jpg" style="width: 100%; display: block;" alt="Category Tag Manager Mockup v3.5" />
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
                          <div class="v-node leaf">Title & Gear Icon</div>
                          <div class="v-node leaf">Header Actions (Modal/Page Toggle, Add Category)</div>
                        </div>
                      </div>

                      <!-- Branch 2: Content -->
                      <div class="v-branch">
                        <div class="v-node secondary">[Manager Content]</div>
                        <div class="v-connector-sub"></div>
                        <div class="v-node secondary">[List Component]</div>
                        <div class="v-connector-sub"></div>
                        <div class="v-row sub">
                          <div class="v-node leaf">Toolbar (Search, Language, Trash)</div>
                          <div class="v-node leaf">Data Table (Flat List)</div>
                          <div class="v-node leaf">Action Buttons (4 types)</div>
                        </div>
                      </div>

                      <!-- Branch 3: Status Bar -->
                      <div class="v-branch">
                        <div class="v-node secondary">[Status Bar]</div>
                        <div class="v-connector-sub"></div>
                        <div class="v-row sub">
                          <div class="v-node leaf">Stats (Total Records)</div>
                          <div class="v-node leaf">System State (Lang, Version)</div>
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
            <nz-card nzTitle="Визуальный эталон интерфейса (Category Tags)">
              <div class="ui-mockup-v35">
                <!-- TOP HEADER -->
                <div class="mock-header">
                  <div>
                    <div style="display: flex; align-items: center; gap: 8px;">
                      <h2 style="margin: 0;">Категории тегов Агрегатора</h2>
                      <i nz-icon nzType="setting" style="font-size: 16px; color: #64748b; cursor: pointer;"></i>
                    </div>
                    <div class="mock-subtitle">Управление иерархией и группами тегов (Aurora v3.5 Reference) <span class="mock-badge">— Всего: 4</span></div>
                  </div>
                  <div class="mock-actions">
                    <div class="mock-segmented">
                      <div class="active">Модалка</div>
                      <div>Страница</div>
                    </div>
                    <button nz-button nzType="primary" class="mock-btn-primary">
                      <i nz-icon nzType="plus"></i>Добавить категорию
                    </button>
                  </div>
                </div>

                <!-- CONTENT CARD -->
                <div class="mock-content-card">
                  <!-- TOOLBAR -->
                  <div class="mock-toolbar">
                    <div class="mock-search-box">
                      <i nz-icon nzType="search"></i>
                      <span>Поиск по названию или Slug...</span>
                    </div>
                    <div class="mock-select" style="width: 160px;">Фильтр по языку <i nz-icon nzType="down" style="font-size: 10px; margin-left: auto;"></i></div>
                    <div class="mock-trash-toggle">
                      <span>КОРЗИНА</span>
                      <div class="mock-switch"></div>
                    </div>
                  </div>

                  <!-- TABLE -->
                  <table class="mock-table">
                    <thead>
                      <tr>
                        <th style="width: 60px;">ID <i nz-icon nzType="caret-up" style="font-size: 10px; color: #bfbfbf;"></i></th>
                        <th>Категория <i nz-icon nzType="caret-up" style="font-size: 10px; color: #bfbfbf;"></i></th>
                        <th>Slug <i nz-icon nzType="caret-up" style="font-size: 10px; color: #bfbfbf;"></i></th>
                        <th style="width: 100px;">Порядок <i nz-icon nzType="caret-up" style="font-size: 10px; color: #bfbfbf;"></i></th>
                        <th style="width: 100px;">Теги <i nz-icon nzType="caret-up" style="font-size: 10px; color: #bfbfbf;"></i></th>
                        <th style="width: 100px;">Статус <i nz-icon nzType="caret-up" style="font-size: 10px; color: #bfbfbf;"></i></th>
                        <th style="width: 140px; text-align: center;">Действия</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>1</td>
                        <td>
                          <div style="display: flex; align-items: center; gap: 12px;">
                            <div class="mock-icon-box" style="background: #f0f7ff; color: #1890ff;"><i nz-icon nzType="desktop"></i></div>
                            <span class="mock-dot" style="background: #1890ff;"></span>
                            Операционные системы
                          </div>
                        </td>
                        <td><span class="mock-slug">operating-systems</span></td>
                        <td><span class="mock-order">1</span></td>
                        <td><div class="mock-tag-count"><i nz-icon nzType="tag"></i> 2</div></td>
                        <td><span class="mock-status-active">Активен</span></td>
                        <td class="mock-actions-cell">
                          <i nz-icon nzType="eye"></i>
                          <i nz-icon nzType="edit" style="color: #1890ff;"></i>
                          <i nz-icon nzType="delete" style="color: #fa8c16;"></i>
                          <i nz-icon nzType="fire" style="color: #ff4d4f;"></i>
                        </td>
                      </tr>
                      <tr>
                        <td>2</td>
                        <td>
                          <div style="display: flex; align-items: center; gap: 12px;">
                            <div class="mock-icon-box" style="background: #e6fffb; color: #13c2c2;"><i nz-icon nzType="scissor"></i></div>
                            <span class="mock-dot" style="background: #13c2c2;"></span>
                            Безопасность
                          </div>
                        </td>
                        <td><span class="mock-slug">security-safety</span></td>
                        <td><span class="mock-order">2</span></td>
                        <td><div class="mock-tag-count"><i nz-icon nzType="tag"></i> 2</div></td>
                        <td><span class="mock-status-active">Активен</span></td>
                        <td class="mock-actions-cell">
                          <i nz-icon nzType="eye"></i>
                          <i nz-icon nzType="edit" style="color: #1890ff;"></i>
                          <i nz-icon nzType="delete" style="color: #fa8c16;"></i>
                          <i nz-icon nzType="fire" style="color: #ff4d4f;"></i>
                        </td>
                      </tr>
                      <tr>
                        <td>3</td>
                        <td>
                          <div style="display: flex; align-items: center; gap: 12px;">
                            <div class="mock-icon-box" style="background: #f6ffed; color: #52c41a;"><i nz-icon nzType="safety-certificate"></i></div>
                            <span class="mock-dot" style="background: #52c41a;"></span>
                            Тип лицензии
                          </div>
                        </td>
                        <td><span class="mock-slug">license-types</span></td>
                        <td><span class="mock-order">3</span></td>
                        <td><div class="mock-tag-count"><i nz-icon nzType="tag"></i> 3</div></td>
                        <td><span class="mock-status-active">Активен</span></td>
                        <td class="mock-actions-cell">
                          <i nz-icon nzType="eye"></i>
                          <i nz-icon nzType="edit" style="color: #1890ff;"></i>
                          <i nz-icon nzType="delete" style="color: #fa8c16;"></i>
                          <i nz-icon nzType="fire" style="color: #ff4d4f;"></i>
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  <!-- PAGINATION -->
                  <div class="mock-pagination">
                    <div class="mock-pg-item"><i nz-icon nzType="left"></i></div>
                    <div class="mock-pg-item active">1</div>
                    <div class="mock-pg-item"><i nz-icon nzType="right"></i></div>
                    <div style="margin-left: 12px; color: #8c8c8c; font-size: 13px;">Показано 1-4 из 4</div>
                    <div class="mock-pg-select">10 на странице <i nz-icon nzType="down" style="font-size: 10px;"></i></div>
                    <div style="margin-left: 12px; color: #8c8c8c; font-size: 13px;">Перейти к: <span class="mock-pg-goto">1-1</span></div>
                  </div>
                </div>
              </div>
            </nz-card>
          </div>
        </nz-tab>

        <!-- 5. ИКОНКИ И МЕДИА -->
        <nz-tab nzTitle="🖼️ Иконки и Медиа">
          <div class="help-section">
            <nz-card nzTitle="Алфавитное шардирование">
              <p>Для оптимизации файловой системы иконки категорий распределяются по подпапкам (a-z) на основе Slug.</p>
              <av-help-copy-container title="Folder Structure" [content]="iconFolderStructure" bgColor="#0f172a"></av-help-copy-container>
            </nz-card>
          </div>
        </nz-tab>

        <!-- 6. ЛОКАЛИЗАЦИЯ -->
        <nz-tab nzTitle="🌍 Локализация">
          <div class="help-section">
            <nz-card nzTitle="English Fallback Logic">
              <p>Обеспечивает отсутствие пустых полей при отсутствии перевода на текущий язык.</p>
              <av-help-copy-container title="Fallback Logic (TS)" [content]="fallbackLogicCode" bgColor="#0f172a"></av-help-copy-container>
            </nz-card>
          </div>
        </nz-tab>

        <!-- 7. ROADMAP V3.5 -->
        <nz-tab nzTitle="🚀 Roadmap v3.5">
          <div class="help-section">
            <h3>Как собрать такой модуль с нуля? (Пошаговый план)</h3>
            
            <nz-card nzTitle="Карта Бэкенд-модуля (DAL & API)" style="margin-bottom: 24px; background: #fafafa;">
              <div style="font-family: monospace; font-size: 12px; line-height: 1.5;">
                <strong style="color: #0366d6;">[DAL] Слой доступа к данным</strong><br/>
                ├── 📂 Models/Aggregator/<br/>
                │   ├── 📄 CategoryTagOfAggregator.cs<br/>
                │   └── 📄 Localizations/CategoryTag...Localization.cs<br/>
                ├── 📂 Repositories/<br/>
                │   ├── 📄 CategoryTagOfAggregatorRepository.cs<br/>
                │   └── 📄 Interfaces/ICategoryTagOfAgg...Repository.cs<br/>
                ├── 📄 AppDbContext.Aggregator.cs<br/>
                └── 📄 AggregatorModelConfiguration.cs<br/>
                <br/>
                <strong style="color: #0366d6;">[API] Слой логики и сервисов</strong><br/>
                ├── 📂 Controllers/<br/>
                │   └── 📄 CategoryTagOfAggregatorController.cs<br/>
                └── 📂 Pages/AGGREGATOR/CategoryTagOfAggregator/<br/>
                    ├── 📂 Dtos/CategoryTagOfAggregatorDto.cs<br/>
                    ├── 📂 Interfaces/ICategoryTagOfAgg...Service.cs<br/>
                    ├── 📂 Services/CategoryTagOfAggregatorService.cs<br/>
                    ├── 📂 Mappings/CategoryTagOfAggregatorProfile.cs<br/>
                    ├── 📂 Validators/CategoryTagOfAgg...Validators.cs<br/>
                    └── 📂 Jsons/CategoryTagOfAggregator.json
              </div>
            </nz-card>

            <div class="roadmap-container">
              <!-- Step 1 -->
              <div class="roadmap-step">
                <div class="step-header"><nz-tag nzColor="blue">Step 1</nz-tag> <strong>Бэкенд: Модели и БД</strong></div>
                <ul>
                  <li>Создайте Entity и Localization в папке <code>DAL/Models/Aggregator</code>.</li>
                  <li><strong>Core Entity:</strong> Slug (Slug), IsActive, SortOrder, IconPath, Color.</li>
                  <li><strong>Localization Entity:</strong> Name, Description, MetaTitle/Description.</li>
                  <li>Добавьте их в <code>AppDbContext.Aggregator.cs</code> и настройте в <code>AggregatorModelConfiguration.cs</code>.</li>
                </ul>
              </div>

              <!-- Step 2 -->
              <div class="roadmap-step">
                <div class="step-header"><nz-tag nzColor="blue">Step 2</nz-tag> <strong>Бэкенд: Репозитории и UnitOfWork</strong></div>
                <ul>
                  <li>Реализуйте <code>IRepository</code> и <code>Repository</code> в папке <code>DAL/Repositories</code>.</li>
                  <li>Добавьте свойство в <code>IUnitOfWork.cs</code> и его реализацию в <code>UnitOfWork.cs</code>.</li>
                  <li>Зарегистрируйте репозиторий в <code>ServiceCollectionExtensions.cs</code>.</li>
                </ul>
              </div>

              <!-- Step 3 -->
              <div class="roadmap-step">
                <div class="step-header"><nz-tag nzColor="blue">Step 3</nz-tag> <strong>Бэкенд: Логика и API</strong></div>
                <ul>
                  <li>Реализуйте <code>IService</code> и зарегистрируйте его в DI.</li>
                  <li><strong>Контроллер:</strong> <code>api/v1/aggregator/category-tags</code>.</li>
                  <li>Поддержка GetPaged, CRUD, Seed и Clear.</li>
                </ul>
                <av-help-copy-container title="AI Prompt: Создание Контроллера" [content]="aiPromptController" bgColor="#2d2d2d"></av-help-copy-container>
              </div>

              <!-- Step 4 -->
              <div class="roadmap-step">
                <div class="step-header"><nz-tag nzColor="green">Step 4</nz-tag> <strong>Фронтенд: Инфраструктура</strong></div>
                <ul>
                  <li>Создайте папку модуля в <code>AGREGATOR/PAGES/SPRAVKA</code>.</li>
                  <li>Реализуйте API сервис и State Service на базе <code>signal&lt;State&gt;</code>.</li>
                </ul>
              </div>

              <!-- Step 5 -->
              <div class="roadmap-step">
                <div class="step-header"><nz-tag nzColor="green">Step 5</nz-tag> <strong>Фронтенд: Спецификация UI</strong></div>
                <ul>
                  <li>🔭 <strong>Поиск:</strong> На базе <code>AvSearchComponent</code>.</li>
                  <li>📑 <strong>Пагинация:</strong> <code>nz-pagination</code> (pageIndex, pageSize).</li>
                  <li>🌍 <strong>Фильтрация:</strong> Выпадающий список языков.</li>
                  <li>🏗️ <strong>OnInit:</strong> Вызов <code>loadItems()</code> и инициализация языков.</li>
                </ul>
              </div>

              <!-- Step 6 -->
              <div class="roadmap-step">
                <div class="step-header"><nz-tag nzColor="gold">Step 6</nz-tag> <strong>Премиум Логика: Маппинг и Fallbacks</strong></div>
                <ul>
                  <li><strong>SEO Mapping:</strong> Маппинг <code>MetaTitle/Description</code> из массива локализаций.</li>
                  <li><strong>Form Save:</strong> Применение <code>English Fallbacks</code> перед отправкой на сервер.</li>
                </ul>
              </div>

              <!-- Step 7 -->
              <div class="roadmap-step">
                <div class="step-header"><nz-tag nzColor="magenta">Step 7</nz-tag> <strong>Системные проверки (Guards)</strong></div>
                <ul>
                  <li><strong>Language Guard:</strong> Блокировка создания при отсутствии языков.</li>
                  <li><strong>Seed Guard:</strong> Проверка <code>total() > 0</code> перед сидингом.</li>
                </ul>
              </div>

              <!-- Step 8-10 -->
              <div class="roadmap-step">
                <div class="step-header"><nz-tag nzColor="orange">Steps 8-10</nz-tag> <strong>Фильтрация и Корзина</strong></div>
                <ul>
                  <li><strong>Step 8:</strong> Реактивный поиск через сигнал <code>searchTerm</code>.</li>
                  <li><strong>Step 9:</strong> Делегирование действий в <code>StateService</code>.</li>
                  <li><strong>Step 10:</strong> Режим Корзины (Soft Delete) с визуальным алертом.</li>
                </ul>
              </div>

              <!-- Step 11-13 -->
              <div class="roadmap-step">
                <div class="step-header"><nz-tag nzColor="cyan">Steps 11-13</nz-tag> <strong>Завершение и Ошибки</strong></div>
                <ul>
                  <li><strong>Step 11:</strong> Управление иконками и предварительный просмотр.</li>
                  <li><strong>Step 12:</strong> Регистрация роутов в <code>aggregator-pages.routes.ts</code>.</li>
                  <li><strong>Step 13:</strong> Нотификации через <code>NzMessageService</code>.</li>
                </ul>
              </div>
            </div>
          </div>
        </nz-tab>

        <!-- 8. СПЕЦИФИКАЦИЯ AURORA V3.5 -->
        <nz-tab nzTitle="📋 Спецификация Aurora v3.5">
          <div class="help-section">
            <nz-card nzTitle="Технический чек-лист Aurora v3.5">
              <div class="feature-grid">
                <div class="feature-item"><div class="f-text"><strong>Soft Delete:</strong> Все объекты поддерживают мягкое удаление через IsDeleted.</div></div>
                <div class="feature-item"><div class="f-text"><strong>Signals SSOT:</strong> Единый источник истины в StateService.</div></div>
                <div class="feature-item"><div class="f-text"><strong>SEO Integration:</strong> Встроенный SeoFormComponent с маппингом.</div></div>
                <div class="feature-item"><div class="f-text"><strong>Error Handling:</strong> catchError в executeWithLoading.</div></div>
              </div>
            </nz-card>
          </div>
        </nz-tab>
      </nz-tabset>
    </div>
  `,
  styles: [`
    .help-container { padding: 32px; max-width: 1400px; margin: 0 auto; min-height: 800px; }
    .help-tabs { margin-top: 24px; }
    .help-section { display: flex; flex-direction: column; gap: 24px; padding-top: 16px; }
    .feature-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 16px; margin-top: 20px; }
    .feature-item { display: flex; gap: 12px; align-items: flex-start; padding: 16px; background: #fff; border-radius: 8px; border: 1px solid #e2e8f0; }
    .f-icon { font-size: 20px; color: #3b82f6; }
    .f-text { font-size: 14px; color: #475569; }
    .roadmap-container { display: flex; flex-direction: column; padding-left: 20px; border-left: 2px solid #e2e8f0; margin: 20px 0; }
    .roadmap-step { position: relative; padding-bottom: 30px; padding-left: 30px; }
    .roadmap-step::before { content: ''; position: absolute; left: -11px; top: 0; width: 20px; height: 20px; background: #fff; border: 2px solid #3b82f6; border-radius: 50%; z-index: 1; }
    .step-header { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
    .roadmap-step ul { padding-left: 0; list-style: none; margin-top: 8px; }
    .roadmap-step li { position: relative; padding-left: 20px; margin-bottom: 8px; font-size: 14px; color: #64748b; }
    .roadmap-step li::before { content: '•'; position: absolute; left: 0; color: #3b82f6; font-weight: bold; }
    code { background: #f1f5f9; padding: 2px 6px; border-radius: 4px; color: #e11d48; font-size: 13px; }

    /* UI MOCKUP V3.5 (REAL UI STYLE) */
    .ui-mockup-v35 { background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05); }
    .mock-header { padding: 24px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #f8fafc; }
    .mock-header h2 { font-weight: 800; color: #1e293b; }
    .mock-subtitle { font-size: 13px; color: #64748b; margin-top: 4px; }
    .mock-badge { color: #1890ff; font-weight: 700; background: #e6f7ff; padding: 2px 8px; border-radius: 4px; }
    .mock-actions { display: flex; gap: 16px; align-items: center; }
    .mock-segmented { display: flex; background: #f5f5f5; padding: 4px; border-radius: 8px; font-size: 13px; }
    .mock-segmented div { padding: 4px 16px; border-radius: 6px; cursor: pointer; color: #595959; }
    .mock-segmented .active { background: #1890ff; color: #fff; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    
    .mock-content-card { margin: 0 24px 24px; border: 1px solid #f0f0f0; border-radius: 12px; }
    .mock-toolbar { padding: 16px; display: flex; gap: 16px; align-items: center; background: #fff; }
    .mock-search-box { flex: 1; border: 1px solid #d9d9d9; height: 40px; border-radius: 8px; display: flex; align-items: center; padding: 0 16px; color: #bfbfbf; }
    .mock-select { border: 1px solid #d9d9d9; height: 40px; border-radius: 8px; display: flex; align-items: center; padding: 0 16px; color: #595959; font-size: 13px; }
    .mock-trash-toggle { display: flex; align-items: center; gap: 8px; color: #595959; font-size: 12px; font-weight: 700; }
    .mock-switch { width: 40px; height: 20px; background: #bfbfbf; border-radius: 10px; position: relative; }
    .mock-switch::after { content: ''; position: absolute; left: 2px; top: 2px; width: 16px; height: 16px; background: #fff; border-radius: 50%; }

    .mock-table { width: 100%; border-collapse: collapse; font-size: 13px; }
    .mock-table th { background: #fafafa; padding: 12px 16px; color: #595959; font-weight: 600; text-align: left; border-bottom: 1px solid #f0f0f0; }
    .mock-table td { padding: 16px; border-bottom: 1px solid #f0f0f0; color: #262626; }
    
    .mock-icon-box { width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 16px; }
    .mock-dot { width: 6px; height: 6px; border-radius: 50%; }
    .mock-slug { color: #1890ff; background: #e6f7ff; padding: 2px 8px; border-radius: 4px; font-family: monospace; }
    .mock-order { border: 1px solid #ffd591; background: #fffbe6; color: #fa8c16; padding: 2px 8px; border-radius: 4px; }
    .mock-tag-count { display: flex; align-items: center; gap: 4px; color: #1890ff; }
    .mock-status-active { color: #52c41a; background: #f6ffed; border: 1px solid #b7eb8f; padding: 2px 8px; border-radius: 4px; font-size: 12px; }
    .mock-actions-cell { display: flex; gap: 16px; font-size: 16px; color: #8c8c8c; justify-content: center; }
    .mock-actions-cell i { cursor: pointer; }

    .mock-pagination { padding: 16px; display: flex; align-items: center; gap: 8px; border-top: 1px solid #f0f0f0; }
    .mock-pg-item { min-width: 32px; height: 32px; border: 1px solid #d9d9d9; border-radius: 4px; display: flex; align-items: center; justify-content: center; cursor: pointer; }
    .mock-pg-item.active { border-color: #1890ff; color: #1890ff; }
    .mock-pg-select { border: 1px solid #d9d9d9; padding: 0 12px; height: 32px; border-radius: 4px; display: flex; align-items: center; gap: 8px; margin-left: 12px; }
    .mock-pg-goto { border: 1px solid #d9d9d9; padding: 2px 8px; border-radius: 4px; }

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
export class CategoryTagAggregatorHelpComponent {
  coreFields = [
    { name: 'Id', type: 'int', desc: 'Identity PK' },
    { name: 'Slug', type: 'string(150)', desc: 'Техническое название (Slug). Обязательное.' },
    { name: 'IconPath', type: 'string?', desc: 'Относительный путь к иконке.' },
    { name: 'Color', type: 'string?', desc: 'Hex-код цвета для UI.' },
    { name: 'IsActive', type: 'bool', desc: 'Статус активности.' },
    { name: 'SortOrder', type: 'int', desc: 'Приоритет сортировки.' }
  ];

  locFields = [
    { name: 'Name', type: 'string(200)', desc: 'Локализованное имя (Витрина).' },
    { name: 'Description', type: 'string?', desc: 'Описание категории.' },
    { name: 'MetaTitle', type: 'string?', desc: 'SEO Title.' },
    { name: 'MetaDescription', type: 'string?', desc: 'SEO Description.' }
  ];

  serverSearchCode = `query = query.Where(x => 
    x.Slug.ToLower().Contains(search) || 
    x.Localizations.Any(l => l.Name.ToLower().Contains(search))
);`;

  serverSortingCode = `return request.SortBy switch {
    CategoryTagSortField.Id => isAsc ? query.OrderBy(x => x.Id) : query.OrderByDescending(x => x.Id),
    CategoryTagSortField.Name => isAsc ? query.OrderBy(x => x.Slug) : query.OrderByDescending(x => x.Slug),
    _ => query.OrderBy(x => x.Slug)
};`;

  iconFolderStructure = `wwwroot/uploads/category-tags/
├── a/ (shard)
│   └── apps.svg
└── m/
    └── music.svg`;

  fallbackLogicCode = `applyEnglishFallbacks(locs: any[], slug: string): any[] {
  const en = locs.find(l => l.languageCode === 'en-US');
  return locs.map(l => ({
    ...l,
    name: l.name || en?.name || slug
  }));
}`;

  aiPromptController = `/* Промпт для реализации контроллера (v3.5) */
Создай CategoryTagOfAggregatorController.cs.
1. Маршрут: [Route("api/v1/aggregator/category-tags")].
2. Методы: GetPaged, GetById, Create, Update, Delete, Restore, Seed, Clear.
3. Для медиа: Используй UniversalMediaController с папкой "category-tags".`;

  mermaidDiagramCode = `graph TD
    A["[Category Tag Page]"] --> B["[Page Header]"]
    B --> B1["Title & Gear Icon"]
    B --> B2["Actions (Modal/Page Toggle, Add Category)"]
    
    A --> C["[Manager Content]"]
    C --> D["[List Component]"]
    D --> D1["Toolbar (Search, Language, Trash)"]
    D --> D2["Data Table (Flat)"]
    D2 --> D2a["Columns: ID, Category, Slug, Sort, Tags, Status"]
    D2 --> D2b["Actions: View, Edit, Trash, Hard Delete"]
    
    A --> E["[Status Bar]"]
    E --> E1["Stats (Total Records)"]
    E --> E2["State (Language Init, Version)"]`;
}
