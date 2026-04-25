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
  selector: 'app-category-aggregator-help',
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
        title="Category Of Aggregator Model"
        subtitle="Техническая спецификация сущности Категория программ в системе агрегатора."
        icon="📁"
        componentPath="src/app/pages/help/category-aggregator-help/category-aggregator-help.component.ts"
        [dalPath]="[
          'DAL/Models/Aggregator/CategoryOfAggregator.cs',
          'DAL/Models/Aggregator/Localizations/CategoryOfAggregatorLocalization.cs'
        ]"
      ></av-help-path-header>

      <nz-tabset nzType="card" class="help-tabs">
        <!-- 1. ОБЗОР -->
        <nz-tab nzTitle="🌟 Обзор">
          <div class="help-section">
            <nz-card nzTitle="Назначение">
              <p>
                Сущность <strong>CategoryOfAggregator</strong> предназначена для создания
                иерархической структуры разделов агрегатора. Она позволяет группировать приложения
                по тематическим категориям (Игры, Мультимедиа и т.д.) с поддержкой вложенности.
              </p>
              <div class="feature-grid">
                <div class="feature-item">
                  <i nz-icon nzType="cluster" class="f-icon"></i>
                  <div class="f-text">
                    <strong>Иерархия (Tree Structure):</strong> Поддержка неограниченной
                    вложенности категорий через механизм <code>ParentId</code>.
                  </div>
                </div>
                <div class="feature-item">
                  <i nz-icon nzType="translation" class="f-icon"></i>
                  <div class="f-text">
                    <strong>Smart Fallback & SEO:</strong> Автозаполнение пустых переводов и
                    полноценная поддержка Meta-тегов для продвижения категорий в ПС.
                  </div>
                </div>
                <div class="feature-item">
                  <i nz-icon nzType="file-protect" class="f-icon"></i>
                  <div class="f-text">
                    <strong>System Protection:</strong> Флаг <code>IsSystem</code> защищает базовые
                    разделы от случайного удаления администратором.
                  </div>
                </div>
              </div>
            </nz-card>

            <nz-alert
              nzType="success"
              nzMessage="Hierarchical Standard / Золотой Эталон Иерархии"
              nzDescription="Модуль категорий является эталонной реализацией древовидных справочников в Aurora v3.5, сочетая в себе аудит, мягкое удаление и DX-словари локализации."
              nzShowIcon
            ></nz-alert>
          </div>
        </nz-tab>

        <!-- 2. МОДЕЛЬ ДАННЫХ -->
        <nz-tab nzTitle="💾 Структура БД">
          <div class="help-section">
            <nz-card nzTitle="Core Entity (CategoryOfAggregator)">
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

            <nz-card nzTitle="Localization (CategoryOfAggregatorLocalization)">
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
                В модуле категорий поиск интегрирован в заголовочную часть и работает по принципу
                реактивного фильтра.
              </p>

              <div class="feature-grid">
                <div class="feature-item">
                  <i nz-icon nzType="search" class="f-icon"></i>
                  <div class="f-text">
                    <strong>Глубокий поиск:</strong> Ищет совпадения по <code>Slug</code>,
                    <code>CanonicalName</code> и локализованным заголовкам на всех языках.
                  </div>
                </div>
                <div class="feature-item">
                  <i nz-icon nzType="filter" class="f-icon"></i>
                  <div class="f-text">
                    <strong>Фильтрация иерархии:</strong> При поиске отображаются только
                    соответствующие категории (логика отображения путей зависит от настроек UI).
                  </div>
                </div>
              </div>

              <div class="logic-card full-width" style="margin-top: 16px;">
                <h4>Техническая интеграция:</h4>
                <ul>
                  <li>
                    <strong>Debounce Time:</strong> 300мс для предотвращения избыточных запросов.
                  </li>
                  <li>
                    <strong>State Sync:</strong> Использование Signal-базированного стейта для
                    хранения строки поиска.
                  </li>
                </ul>
              </div>
            </nz-card>

            <nz-card nzTitle="Серверная фильтрация (Backend Pattern)">
              <p>
                Бэкенд реализует эффективную фильтрацию через Entity Framework Core с учетом
                многоязычности.
              </p>

              <div class="logic-grid">
                <div class="logic-card">
                  <h4>Логика поиска (C#)</h4>
                  <ul>
                    <li>
                      <strong>Поля:</strong> <code>CanonicalName</code>, <code>Slug</code> и
                      <code>Name</code> в локализациях.
                    </li>
                    <li>
                      <strong>Учет регистра:</strong> Автоматическая конвертация в нижний регистр на стороне БД.
                    </li>
                  </ul>
                </div>
                <div class="logic-card">
                  <h4>Параметры сортировки</h4>
                  <ul>
                    <li><code>SortOrder</code> (Ручной приоритет).</li>
                    <li><code>Name</code> (Алфавитный порядок).</li>
                    <li><code>ChildrenCount</code> (По количеству подкатегорий).</li>
                  </ul>
                </div>
              </div>
            </nz-card>

            <av-help-copy-container
              title="Пример: LINQ запрос для поиска категорий"
              [content]="serverSearchCode"
              bgColor="#1e293b"
            ></av-help-copy-container>
          </div>
        </nz-tab>

        <nz-tab nzTitle="🖼️ Visual">
          <div class="help-section">
            <nz-card nzTitle="Схема интерфейса (UI Architecture)">
              <!-- ИДЕАЛЬНАЯ ВЕРСТКА МАКЕТА КАТЕГОРИЙ v3.5 -->
              <div class="ui-mockup-v35" style="margin-bottom: 32px;">
                <!-- TOP HEADER -->
                <div class="mock-header">
                  <div>
                    <div style="display: flex; align-items: center; gap: 8px;">
                      <h2 style="margin: 0;">Категории программ Агрегатора</h2>
                      <i nz-icon nzType="setting" style="font-size: 16px; color: #64748b; cursor: pointer;"></i>
                    </div>
                    <div class="mock-subtitle">Управление иерархией и разделами каталога (Aurora v3.5 Reference) <span class="mock-badge">— Всего: 8</span></div>
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

                <!-- CONTENT AREA -->
                <div class="mock-content-card" style="margin: 0; border-radius: 0; border: none;">
                  <!-- TOOLBAR -->
                  <div class="mock-toolbar" style="border-bottom: 1px solid #f0f0f0;">
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

                  <!-- TREE TABLE -->
                  <table class="mock-table">
                    <thead>
                      <tr>
                        <th style="width: 60px;">ID <i nz-icon nzType="caret-up" style="font-size: 10px; color: #bfbfbf;"></i></th>
                        <th>Категория <i nz-icon nzType="caret-up" style="font-size: 10px; color: #bfbfbf;"></i></th>
                        <th>Slug</th>
                        <th style="width: 100px;">Порядок</th>
                        <th style="width: 100px;">Программы</th>
                        <th style="width: 100px;">Статус</th>
                        <th style="width: 140px; text-align: center;">Действия</th>
                      </tr>
                    </thead>
                    <tbody>
                      <!-- Row 1: Root -->
                      <tr>
                        <td>1</td>
                        <td>
                          <div style="display: flex; align-items: center; gap: 8px;">
                            <div class="mock-tree-expander"><i nz-icon nzType="minus-square"></i></div>
                            <div class="mock-icon-box" style="background: #f0f7ff; color: #1890ff;"><i nz-icon nzType="desktop"></i></div>
                            <span class="mock-dot" style="background: #1890ff;"></span>
                            <strong>Операционные системы</strong>
                          </div>
                        </td>
                        <td><span class="mock-slug">operating-systems</span></td>
                        <td><span class="mock-order">1</span></td>
                        <td><div class="mock-tag-count"><i nz-icon nzType="appstore"></i> 45</div></td>
                        <td><span class="mock-status-active">Активен</span></td>
                        <td class="mock-actions-cell">
                          <i nz-icon nzType="eye"></i>
                          <i nz-icon nzType="edit" style="color: #1890ff;"></i>
                          <i nz-icon nzType="delete" style="color: #fa8c16;"></i>
                          <i nz-icon nzType="fire" style="color: #ff4d4f;"></i>
                        </td>
                      </tr>
                      <!-- Row 2: Sub -->
                      <tr>
                        <td>2</td>
                        <td>
                          <div style="display: flex; align-items: center; gap: 8px; padding-left: 24px;">
                            <div class="mock-tree-expander"><i nz-icon nzType="minus-square"></i></div>
                            <div class="mock-icon-box" style="background: #e6fffb; color: #13c2c2;"><i nz-icon nzType="windows"></i></div>
                            <span class="mock-dot" style="background: #13c2c2;"></span>
                            Windows
                          </div>
                        </td>
                        <td><span class="mock-slug">os/windows</span></td>
                        <td><span class="mock-order">1</span></td>
                        <td><div class="mock-tag-count"><i nz-icon nzType="appstore"></i> 22</div></td>
                        <td><span class="mock-status-active">Активен</span></td>
                        <td class="mock-actions-cell">
                          <i nz-icon nzType="eye"></i>
                          <i nz-icon nzType="edit" style="color: #1890ff;"></i>
                          <i nz-icon nzType="delete" style="color: #fa8c16;"></i>
                          <i nz-icon nzType="fire" style="color: #ff4d4f;"></i>
                        </td>
                      </tr>
                      <!-- Row 3: Sub-Sub -->
                      <tr>
                        <td>3</td>
                        <td>
                          <div style="display: flex; align-items: center; gap: 8px; padding-left: 64px;">
                            <div style="display: flex; gap: 4px; color: #bfbfbf; font-size: 8px;"><i nz-icon nzType="minus"></i><i nz-icon nzType="minus"></i></div>
                            <span class="mock-dot" style="background: #52c41a;"></span>
                            Windows 11 Tools
                          </div>
                        </td>
                        <td><span class="mock-slug">os/windows/win11</span></td>
                        <td><span class="mock-order">1</span></td>
                        <td><div class="mock-tag-count"><i nz-icon nzType="appstore"></i> 12</div></td>
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
                  <div class="mock-pagination" style="background: #fafafa;">
                    <div class="mock-pg-item"><i nz-icon nzType="left"></i></div>
                    <div class="mock-pg-item active">1</div>
                    <div class="mock-pg-item"><i nz-icon nzType="right"></i></div>
                    <div style="margin-left: 12px; color: #8c8c8c; font-size: 13px;">Показано 1-8 из 8</div>
                    <div class="mock-pg-select">10 на странице <i nz-icon nzType="down" style="font-size: 10px;"></i></div>
                    <div style="margin-left: 12px; color: #8c8c8c; font-size: 13px;">Перейти к: <span class="mock-pg-goto">1-1</span></div>
                  </div>
                </div>
              </div>

              <div class="logic-grid" style="margin-top: 40px;">
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
                          <div class="v-node leaf">Title & Breadcrumbs</div>
                          <div class="v-node leaf">Header Actions (Add Category, Expand All)</div>
                        </div>
                      </div>

                      <!-- Branch 2: Content -->
                      <div class="v-branch">
                        <div class="v-node secondary">[Category Manager]</div>
                        <div class="v-connector-sub"></div>
                        <div class="v-node secondary">[Tree List Component]</div>
                        <div class="v-connector-sub"></div>
                        <div class="v-row sub">
                          <div class="v-node leaf">Toolbar (Search, Sync, Trash)</div>
                          <div class="v-node leaf">Hierarchical Tree Table</div>
                          <div class="v-node leaf">Inline Actions (CRUD)</div>
                        </div>
                      </div>

                      <!-- Branch 3: Status Bar -->
                      <div class="v-branch">
                        <div class="v-node secondary">[Status Bar]</div>
                        <div class="v-connector-sub"></div>
                        <div class="v-row sub">
                          <div class="v-node leaf">Totals (Root, Subs)</div>
                          <div class="v-node leaf">State (Loading, Last Sync)</div>
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
            <nz-card nzTitle="Визуальный эталон интерфейса категорий">
              <div
                class="ui-mockup-v35"
                style="border: 1px solid #f1f5f9; border-radius: 16px; overflow: hidden; background: #fff; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05); font-family: 'Inter', system-ui, -apple-system, sans-serif;"
              >
                <!-- TOP HEADER -->
                <div
                  style="padding: 24px 32px; display: flex; justify-content: space-between; align-items: flex-start; background: linear-gradient(135deg, #fff 0%, #f8fafc 100%);"
                >
                  <div>
                    <h2
                      style="margin: 0; font-size: 24px; font-weight: 800; color: #0f172a; display: flex; align-items: center; gap: 10px;"
                    >
                      Категории Агрегатора
                      <i
                        nz-icon
                        nzType="cluster"
                        style="font-size: 16px; color: #64748b; cursor: pointer;"
                      ></i>
                    </h2>
                    <div
                      style="font-size: 13px; color: #64748b; margin-top: 4px; display: flex; align-items: center; gap: 12px;"
                    >
                      Управление иерархией разделов программного каталога
                      <span
                        style="background: #eff6ff; color: #2563eb; padding: 2px 10px; border-radius: 12px; font-weight: 600; font-size: 11px; border: 1px solid #dbeafe;"
                        >— Уровней: 2</span
                      >
                    </div>
                  </div>

                  <div style="display: flex; gap: 16px; align-items: center;">
                    <button
                      nz-button
                      nzType="primary"
                      style="background: #2563eb; border-radius: 6px; height: 38px; font-weight: 600;"
                    >
                      <i nz-icon nzType="plus" style="margin-right: 6px;"></i>Создать категорию
                    </button>
                  </div>
                </div>

                <!-- TABLE MOCKUP -->
                <div
                  style="margin: 0 24px 24px; background: #fff; border: 1px solid #f1f5f9; border-radius: 12px; overflow: hidden;"
                >
                  <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
                    <thead style="background: #f8fafc; color: #475569; border-bottom: 1px solid #f1f5f9;">
                      <tr>
                        <th style="padding: 12px 20px; text-align: left; width: 60px;">ID</th>
                        <th style="padding: 12px; text-align: left;">Категория / Слаг</th>
                        <th style="padding: 12px; text-align: left; width: 120px;">Родитель</th>
                        <th style="padding: 12px; text-align: left; width: 80px;">Порядок</th>
                        <th style="padding: 12px; text-align: left; width: 100px;">Системная</th>
                        <th style="padding: 12px; text-align: center; width: 140px;">Действия</th>
                      </tr>
                    </thead>
                    <tbody style="color: #334155;">
                      <tr style="border-bottom: 1px solid #f1f5f9;">
                        <td style="padding: 16px 20px;">1</td>
                        <td style="padding: 12px;">
                          <div style="display: flex; align-items: center; gap: 12px;">
                            <div
                              style="width: 32px; height: 32px; background: #f0fdf4; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #16a34a; border: 1px solid #dcfce7;"
                            >
                              <i nz-icon nzType="rocket"></i>
                            </div>
                            <div>
                              <div style="font-weight: 600;">Игры</div>
                              <div style="font-size: 11px; color: #94a3b8;">games</div>
                            </div>
                          </div>
                        </td>
                        <td style="padding: 12px; color: #94a3b8;">—</td>
                        <td style="padding: 12px;">1</td>
                        <td style="padding: 12px;"><nz-tag nzColor="blue">Да</nz-tag></td>
                        <td style="padding: 12px; text-align: center;">
                          <div style="display: flex; justify-content: center; gap: 12px; color: #94a3b8;">
                            <i nz-icon nzType="eye"></i>
                            <i nz-icon nzType="edit" style="color: #3b82f6;"></i>
                            <i nz-icon nzType="delete" style="color: #f59e0b;"></i>
                          </div>
                        </td>
                      </tr>
                      <tr style="border-bottom: 1px solid #f1f5f9;">
                        <td style="padding: 16px 20px;">2</td>
                        <td style="padding: 12px;">
                          <div style="display: flex; align-items: center; gap: 12px; padding-left: 20px;">
                            <div
                              style="width: 32px; height: 32px; background: #f0f9ff; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #0284c7; border: 1px solid #e0f2fe;"
                            >
                              <i nz-icon nzType="interaction"></i>
                            </div>
                            <div>
                              <div style="font-weight: 600;">Аркады</div>
                              <div style="font-size: 11px; color: #94a3b8;">arcades</div>
                            </div>
                          </div>
                        </td>
                        <td style="padding: 12px; color: #64748b;">Игры</td>
                        <td style="padding: 12px;">1</td>
                        <td style="padding: 12px;"><nz-tag nzColor="default">Нет</nz-tag></td>
                        <td style="padding: 12px; text-align: center;">
                          <div style="display: flex; justify-content: center; gap: 12px; color: #94a3b8;">
                            <i nz-icon nzType="eye"></i>
                            <i nz-icon nzType="edit" style="color: #3b82f6;"></i>
                            <i nz-icon nzType="delete" style="color: #f59e0b;"></i>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div style="margin-top: 30px; background: #f0f9ff; border-radius: 12px; padding: 20px; border: 1px solid #bae6fd;">
                <h5 style="color: #0369a1; font-weight: 700; display: flex; align-items: center; gap: 8px;">
                  <i nz-icon nzType="info-circle"></i> Иерархический UI
                </h5>
                <p style="font-size: 13px; color: #0c4a6e; margin-top: 10px;">
                  Для категорий используется отступ (padding-left) для визуализации вложенности в таблице.
                  Это позволяет пользователю видеть структуру дерева без необходимости переходить на отдельные страницы.
                </p>
              </div>
            </nz-card>
          </div>
        </nz-tab>

        <!-- 5. ИКОНКИ И МЕДИА -->
        <nz-tab nzTitle="🖼️ Иконки и Медиа">
          <div class="help-section">
            <nz-card nzTitle="Вариант 2: Динамическое хранилище (Рекомендуемый)">
              <p>
                Иконки загружаются через интерфейс админки (кнопка "Выбрать/Загрузить") 
                и сохраняются на сервере в папке <code>uploads/categories/</code>.
              </p>
              
              <div class="logic-grid">
                <div class="logic-card">
                  <h5>🌟 Плюсы:</h5>
                  <p>Полная свобода — вы можете менять иконки прямо в браузере без участия программиста.</p>
                </div>
                <div class="logic-card">
                  <h5>⚠️ Минусы:</h5>
                  <p>Требует настройки прав доступа на сервере к папке загрузок.</p>
                </div>
              </div>

              <div style="margin-top: 24px;">
                <h5>📋 План реализации (Media Gallery):</h5>
                <div class="roadmap-container">
                   <div class="roadmap-step">
                      <strong>1. Backend Инфраструктура</strong>
                      <ul>
                        <li>Настройка папки <code>wwwroot/uploads/aggregator/categories/</code>.</li>
                        <li>Реализация <code>GET /api/v1/media/list?folder=categories</code> для получения списка всех доступных иконок.</li>
                        <li>Обновление сидера для автоматической регистрации иконок из JSON (копирование из seed-assets в uploads).</li>
                      </ul>
                   </div>
                   <div class="roadmap-step">
                      <strong>2. UI-компонент "Media Gallery Modal"</strong>
                      <ul>
                        <li>Модальное окно со списком всех SVG иконок в виде сетки с превью.</li>
                        <li>Функции поиска по названию и загрузки новых файлов с компьютера.</li>
                      </ul>
                   </div>
                   <div class="roadmap-step">
                      <strong>3. Контрол "AvIconPicker"</strong>
                      <ul>
                        <li>Интеграция в форму категории вместо обычного текстового поля.</li>
                        <li>Превью текущей иконки, поддержка Drag-and-Drop и быстрый выбор из галереи.</li>
                      </ul>
                   </div>
                </div>
              </div>

              <nz-alert nzType="success" nzMessage="Реализация: Мы будем использовать текущий ImageServiceUniversal и настроим компонент выбора иконок." nzShowIcon style="margin-top: 16px;"></nz-alert>
              
              <div style="margin-top: 24px;">
                <h5>📂 Иконки агрегатора (Стандарт v3.5):</h5>
                <p>Ниже перечислены базовые иконки, поставляемые в папке <code>documentations/icons/</code> и их назначение:</p>
                <nz-table #iconsTable [nzData]="standardIcons" [nzFrontPagination]="false" nzSize="small">
                  <thead>
                    <tr>
                      <th>Файл</th>
                      <th>Назначение</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let icon of iconsTable.data">
                      <td><code>{{ icon.file }}</code></td>
                      <td>{{ icon.desc }}</td>
                    </tr>
                  </tbody>
                </nz-table>
              </div>

              <div style="margin-top: 16px;">
                <h5>Техническая деталь:</h5>
                <p><code>ImageServiceUniversal</code> загружает файл, а в БД сохраняется относительный путь, например <code>categories/icon_123.svg</code>.</p>
              </div>
            </nz-card>
          </div>
        </nz-tab>

        <!-- 6. ЛОКАЛИЗАЦИЯ -->
        <nz-tab nzTitle="🌍 Локализация">
          <div class="help-section">
            <nz-card nzTitle="DX-Словари (Backend Helpers)">
              <p>
                В модели реализованы <code>[NotMapped]</code> словари для мгновенного доступа к переводам.
              </p>
              <av-help-copy-container
                title="Использование в коде"
                [content]="dxDictionaryCode"
                bgColor="#1e293b"
              ></av-help-copy-container>

              <div style="margin-top: 20px;">
                <h5>Механизм Fallback для SEO:</h5>
                <p>Если MetaDescription не заполнен для языка RU, система попробует взять его из EN локализации.</p>
              </div>
            </nz-card>
          </div>
        </nz-tab>

        <!-- 7. ROADMAP -->
        <nz-tab nzTitle="🚀 Roadmap v3.5">
          <div class="help-section">
            <nz-card nzTitle="План реализации модуля">
              <div class="roadmap-container">
                <div class="roadmap-step">
                  <div class="step-header">
                    <nz-tag nzColor="blue">Step 1</nz-tag>
                    <strong>Бэкенд: Модели и БД</strong>
                  </div>
                  <ul>
                    <li>Создайте <code>CategoryOfAggregator</code> в <code>DAL/Models/Aggregator</code>.</li>
                    <li>Реализуйте иерархию через <code>ParentId</code> и <code>Children</code>.</li>
                    <li>Добавьте SEO-поля в модель локализации.</li>
                  </ul>
                </div>
                <div class="roadmap-step">
                  <div class="step-header">
                    <nz-tag nzColor="blue">Step 2</nz-tag>
                    <strong>API и Сервисы</strong>
                  </div>
                  <ul>
                    <li>Реализуйте репозиторий с поддержкой загрузки деревьев (Include).</li>
                    <li>Создайте контроллер с методом получения иерархического списка.</li>
                  </ul>
                </div>
                <div class="roadmap-step">
                  <div class="step-header">
                    <nz-tag nzColor="blue">Step 3</nz-tag>
                    <strong>Frontend UI</strong>
                  </div>
                  <ul>
                    <li>Создайте компоненты List/Form/Manager.</li>
                    <li>Интегрируйте выбор родительской категории в форму создания.</li>
                  </ul>
                </div>
              </div>
            </nz-card>
          </div>
        </nz-tab>
        <!-- 8. JSON & ИМПОРТ -->
        <nz-tab nzTitle="📦 JSON & Импорт">
          <div class="help-section">
            <nz-card nzTitle="Предустановленные категории (Aurora v3.5 Standard)">
              <p>
                В системе поставляется готовый набор из <strong>227 категорий</strong>, 
                структурированных и переведенных на RU/EN. Этот файл является эталоном для начального наполнения БД.
              </p>
              
              <div class="logic-grid">
                <div class="logic-card">
                  <h5>📂 Местоположение файла:</h5>
                  <p><strong>Backend:</strong> <code>Project_Server_Auth/Pages/AGGREGATOR/CategoryOfAggregator/Jsons/CategoryOfAggregator.json</code></p>
                  <p><strong>Frontend:</strong> <code>src/app/AGREGATOR/PAGES/SPRAVKA/CategoryOfAggregatorPage/Jsons/CategoryOfAggregator.json</code></p>
                </div>
                <div class="logic-card">
                  <h5>⚙️ Команда импорта (API):</h5>
                  <p><code>POST api/v1/aggregator/categories/maintenance/seed</code></p>
                  <nz-alert nzType="info" nzMessage="Метод полностью очищает таблицу перед импортом, восстанавливая эталонное состояние." nzShowIcon></nz-alert>
                </div>
              </div>

              <div style="margin-top: 24px;">
                <h5>Структура JSON (v3.5):</h5>
                <p>Файл использует плоскую структуру со ссылками через <code>Id</code> и <code>ParentId</code>. При импорте иерархия восстанавливается автоматически.</p>
                <av-help-copy-container
                  title="Пример записи категории"
                  [content]="jsonSampleCode"
                  bgColor="#1e293b"
                ></av-help-copy-container>
              </div>

              <div class="logic-card full-width" style="margin-top: 16px; border-left: 4px solid #1890ff;">
                <h4>Правила трансформации из v2 в v3.5:</h4>
                <ul>
                  <li><strong>ParentCategoryId</strong> переименован в <strong>ParentId</strong>.</li>
                  <li><strong>InternalCode</strong> переименован в <strong>CanonicalName</strong>.</li>
                  <li><strong>IconKey</strong> переименован в <strong>IconPath</strong>.</li>
                  <li>Локализации теперь требуют <strong>LanguageOfAggregatorId</strong> вместо <code>LanguageId</code>.</li>
                </ul>
              </div>
            </nz-card>
          </div>
        </nz-tab>
      </nz-tabset>
    </div>
  `,
  styles: [
    `
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
      .roadmap-step li { font-size: 14px; color: #64748b; margin-bottom: 8px; }
      code { background: #f1f5f9; padding: 2px 6px; border-radius: 4px; color: #e11d48; font-size: 13px; }
      .logic-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
      .logic-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; }
      .full-width { grid-column: span 2; }

      /* UI MOCKUP V3.5 (REAL UI STYLE) */
      .ui-mockup-v35 { background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05); border: 1px solid #f0f0f0; }
      .mock-header { padding: 24px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #f8fafc; }
      .mock-header h2 { font-weight: 800; color: #1e293b; }
      .mock-subtitle { font-size: 13px; color: #64748b; margin-top: 4px; }
      .mock-badge { color: #1890ff; font-weight: 700; background: #e6f7ff; padding: 2px 8px; border-radius: 4px; }
      .mock-actions { display: flex; gap: 16px; align-items: center; }
      .mock-segmented { display: flex; background: #f5f5f5; padding: 4px; border-radius: 8px; font-size: 13px; }
      .mock-segmented div { padding: 4px 16px; border-radius: 6px; cursor: pointer; color: #595959; }
      .mock-segmented .active { background: #1890ff; color: #fff; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
      
      .mock-btn-primary { background: #1890ff; border: none; color: #fff; padding: 8px 16px; border-radius: 6px; font-size: 13px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 8px; }

      .mock-content-card { border-top: 1px solid #f0f0f0; }
      .mock-toolbar { padding: 16px; display: flex; gap: 16px; align-items: center; background: #fff; }
      .mock-search-box { flex: 1; border: 1px solid #d9d9d9; height: 40px; border-radius: 8px; display: flex; align-items: center; padding: 0 16px; color: #bfbfbf; font-size: 13px; }
      .mock-select { border: 1px solid #d9d9d9; height: 40px; border-radius: 8px; display: flex; align-items: center; padding: 0 16px; color: #595959; font-size: 13px; }
      .mock-trash-toggle { display: flex; align-items: center; gap: 8px; color: #595959; font-size: 12px; font-weight: 700; }
      .mock-switch { width: 40px; height: 20px; background: #bfbfbf; border-radius: 10px; position: relative; }
      .mock-switch::after { content: ''; position: absolute; left: 2px; top: 2px; width: 16px; height: 16px; background: #fff; border-radius: 50%; }

      .mock-table { width: 100%; border-collapse: collapse; font-size: 13px; }
      .mock-table th { background: #fafafa; padding: 12px 16px; color: #595959; font-weight: 600; text-align: left; border-bottom: 1px solid #f0f0f0; }
      .mock-table td { padding: 16px; border-bottom: 1px solid #f0f0f0; color: #262626; }
      
      .mock-tree-expander { color: #8c8c8c; cursor: pointer; font-size: 16px; display: flex; align-items: center; }
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
    `,
  ],
})
export class CategoryAggregatorHelpComponent {
  baseUrl = '';

  coreFields = [
    { name: 'Id', type: 'int', desc: 'Первичный ключ.' },
    { name: 'CanonicalName', type: 'string(255)', desc: 'Технический идентификатор (для кода).' },
    { name: 'Slug', type: 'string(100)', desc: 'ЧПУ-имя для URL.' },
    { name: 'ParentId', type: 'int?', desc: 'ID родительской категории (Tree support).' },
    { name: 'IconPath', type: 'string?', desc: 'Путь к иконке.' },
    { name: 'IsSystem', type: 'bool', desc: 'Флаг системной записи.' },
    { name: 'IsActive', type: 'bool', desc: 'Флаг активности.' },
    { name: 'SortOrder', type: 'int', desc: 'Приоритет сортировки.' },
  ];

  locFields = [
    { name: 'Name', type: 'string(255)', desc: 'Название раздела.' },
    { name: 'Description', type: 'string?', desc: 'Описание раздела.' },
    { name: 'MetaTitle', type: 'string(200)', desc: 'SEO Title.' },
    { name: 'MetaDescription', type: 'string(500)', desc: 'SEO Description.' },
  ];

  serverSearchCode = `query = query.Where(x =>
    x.CanonicalName.ToLower().Contains(search) ||
    x.Slug.ToLower().Contains(search) ||
    x.Localizations.Any(l => l.Name.ToLower().Contains(search))
);`;

  dxDictionaryCode = `// Прямой доступ к локализации без LINQ
var nameRu = category.LocalizedNames["ru-RU"];
var descEn = category.LocalizedDescriptions["en-US"];`;

  mermaidDiagramCode = `graph TD
    A["[Category Page]"] --> B["[Page Header]"]
    B --> B1["Title & Breadcrumbs"]
    B --> B2["Actions (Add Category, Expand All)"]
    
    A --> C["[Category Manager]"]
    C --> D["[Tree List Component]"]
    D --> D1["Toolbar (Search, Sync, Trash)"]
    D --> D2["Hierarchical Tree Table"]
    D2 --> D2a["Parent/Child Rows"]
    D2 --> D2b["Inline Actions (Edit, Move, Delete)"]
    
    A --> E["[Status Bar]"]
    E --> E1["Totals (Root, Subcategories)"]
    E --> E2["State (Loading, Last Sync)"]`;

  jsonSampleCode = `{
  "Id": 1,
  "ParentId": null,
  "CanonicalName": "MULTIMEDIA",
  "Slug": "multimedia",
  "IconPath": "category_multimedia",
  "IsActive": true,
  "IsSystem": false,
  "SortOrder": 10,
  "Localizations": [
    {
      "LanguageOfAggregatorId": 1,
      "Name": "Multimedia",
      "Description": "Audio, video, graphic and multimedia software suites.",
      "MetaTitle": "Multimedia Software",
      "MetaDescription": "Audio, video, graphic and multimedia software"
    }
  ]
}`;

  standardIcons = [
    { file: 'category_multimedia.svg', desc: 'Папка с медиа-символом (для корня).' },
    { file: 'multimedia_audio.svg', desc: 'Музыкальная нота (для раздела Аудио).' },
    { file: 'audio_players.svg', desc: 'Кнопка Play.' },
    { file: 'audio_editors.svg', desc: 'Звуковые волны.' },
    { file: 'audio_converters.svg', desc: 'Стрелки конвертации.' },
    { file: 'audio_cd.svg', desc: 'Диск.' },
    { file: 'audio_dj.svg', desc: 'Наушники.' },
    { file: 'audio_plugins.svg', desc: 'VST/плагин.' },
  ];
}
