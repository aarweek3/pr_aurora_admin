import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { HelpCopyContainerComponent, HelpPathHeaderComponent } from '@shared/components/ui';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzTimelineModule } from 'ng-zorro-antd/timeline';
import { 
  ARCHITECTURE_ENUM_CODE, 
  OS_VERSION_MODEL_CODE, 
  PLATFORM_OS_SEED_JSON, 
  SYSR_LOCALIZATION_MODEL_CODE, 
  SYSTEM_REQUIREMENT_MODEL_CODE, 
  VERSION_SPEC_EXAMPLE_DATA,
  SERVER_SEARCH_CODE
} from './version-spec-help.data';

@Component({
  selector: 'app-version-spec-help',
  standalone: true,
  imports: [
    CommonModule,
    NzCardModule,
    NzTabsModule,
    NzTableModule,
    NzTimelineModule,
    NzAlertModule,
    NzTagModule,
    NzDividerModule,
    HelpCopyContainerComponent,
    HelpPathHeaderComponent,
  ],
  template: `
    <div class="help-container">
      <av-help-path-header
        title="Спецификация: Системные требования и Версии ОС"
        subtitle="Архитектурное руководство по реализации структурированных требований к ПО."
        icon="⚙️"
        [componentPath]="'src/app/pages/help/version-spec-help/version-spec-help.component.ts'"
      ></av-help-path-header>

      <nz-alert
        nzType="info"
        nzMessage="Цель архитектуры"
        nzDescription="Обеспечить гибкое управление системными требованиями (Windows 7/10/11, x64/x86, Android 5.0+) без хардкода в приложении. Требования привязаны к конкретной версии программы."
        nzShowIcon
        class="main-alert"
      ></nz-alert>

      <nz-tabset nzType="card" class="help-tabs">
        <!-- 1. OVERVIEW -->
        <nz-tab nzTitle="📖 1. Обзор">
          <div class="tab-content">
            <nz-card nzTitle="Введение: Системные требования">
              <div class="logic-box bg-blue">
                <p><b>Что за задача?</b> Представь страницу программы VLC. Юзер хочет знать: «А запустится ли это у меня?». Он должен увидеть: 🪟 Windows (от Win 7, x64), 🍎 macOS (от 10.13) и т.д.</p>
              </div>

              <div class="model-section" style="margin-top: 24px;">
                <h3>Почему не просто текст?</h3>
                <p>Можно было бы написать одно поле "Requirements" и вбить туда текст руками. Но это <b>плохо</b>, потому что:</p>
                <ul>
                  <li>Нельзя отфильтровать программы "для Windows 7".</li>
                  <li>Нельзя автоматически подсветить нужную ОС пользователю.</li>
                  <li>Разные редакторы напишут по-разному ("Win7", "Windows 7", "W7"), и будет каша.</li>
                </ul>
              </div>

              <div class="model-section" style="margin-top: 16px;">
                <h3>Что нужно сделать (Порядок действий)</h3>
                <nz-timeline>
                  <nz-timeline-item nzColor="blue"><b>1. Бэкенд (C#):</b> Создать Enum архитектур, модели таблиц, добавить их в DbContext и запустить миграцию.</nz-timeline-item>
                  <nz-timeline-item nzColor="blue"><b>2. API:</b> Написать DTO и Контроллер (CRUD: получить, добавить, обновить, удалить).</nz-timeline-item>
                  <nz-timeline-item nzColor="green"><b>3. Фронтенд (Angular):</b> Добавить интерфейсы и создать UI-секцию в карточке версии для управления требованиями.</nz-timeline-item>
                </nz-timeline>
              </div>
            </nz-card>

            <nz-card nzTitle="Архитектурное решение: Enum vs Таблица в БД">
              <div class="logic-box bg-blue">
                <p><b>Вопрос от Junior:</b> Почему для архитектур процессоров (x64, Arm64) мы создаем <code>Enum</code> в коде, а для версий ОС (Windows 10, 11) — целую таблицу в базе данных?</p>
              </div>

              <div class="model-section" style="margin-top: 24px;">
                <h3>1. Как это хранится в базе (Performance)</h3>
                <p>В таблице требований будет просто колонка <code>Architecture</code> с типом <code>INT</code>. В ней лежат цифры: 0, 1, 2...</p>
                <ul>
                  <li><b>Это быстро:</b> Процессору легче сравнивать числа, чем строки.</li>
                  <li><b>Это компактно:</b> Одно число занимает в десятки раз меньше места, чем название "Apple Silicon (Arm64)".</li>
                </ul>
              </div>

              <div class="model-section" style="margin-top: 16px;">
                <h3>2. Статичность данных vs Динамика</h3>
                <p><b>Золотое правило:</b> Если данные не меняются годами — используй Enum. Если данные добавляются часто — используй таблицу.</p>
                <ul>
                  <li><b>Архитектуры:</b> Новые типы процессоров появляются раз в 5-10 лет. Нам не нужно давать админу возможность "создавать" новые архитектуры кнопкой.</li>
                  <li><b>ОС:</b> Новые версии Windows, macOS и Android выходят каждый год. Мы хотим добавлять их в справочник без пересборки всего бэкенда.</li>
                </ul>
              </div>

              <div class="model-section" style="margin-top: 16px;">
                <h3>3. Удобство разработки (DX)</h3>
                <p>C# "из коробки" понимает, что цифра <code>2</code> — это <code>x64</code>. В коде ты пишешь красиво: <code>if (req.Architecture == RequirementArchitecture.x64)</code>, а не работаешь с магическими числами или строками.</p>
              </div>

              <div class="model-section" style="margin-top: 16px;">
                <h3>4. А как же UI (Angular)?</h3>
                <p>В админке мы не заставляем пользователя вводить цифры. Мы создаем константу-массив на фронтенде, которая мапит Enum на понятные названия. Пользователь видит "x64" в выпадающем списке, а на бэкенд улетает цифра 2.</p>
              </div>

              <nz-alert
                nzType="info"
                nzMessage="Вывод для Junior"
                nzDescription="Использование Enum для архитектур — это идеальный баланс. Мы экономим место в базе, ускоряем поиск и при этом сохраняем читаемость кода. Таблица здесь была бы лишним усложнением (Overengineering)."
                nzShowIcon
              ></nz-alert>
            </nz-card>

            <nz-card nzTitle="Шаг 1 — Что уже есть в системе?">
              <p>Перед тем как создавать новое, вспомним, на чем мы стоим:</p>
              <div class="model-section">
                <h3>1. PlatformsOfAggregator (Справочник)</h3>
                <p>Уже содержит: <code>1=Windows</code>, <code>2=macOS</code>, <code>3=Android</code> и т.д.</p>
              </div>
              <div class="model-section" style="margin-top: 12px;">
                <h3>2. VersionsOfAggregator</h3>
                <p>Это версии софта (например, VLC v3.0.20). Именно к ним мы и будем «подцеплять» наши требования.</p>
              </div>
            </nz-card>

            <nz-card nzTitle="Механика справочника версий ОС (Lookup Table)">
              <div class="logic-box bg-dark">
                <p>В отличие от архитектур, для ОС мы используем таблицу <code>PlatformOsVersion</code>. Это позволяет динамически расширять список систем.</p>
              </div>

              <div class="model-section" style="margin-top: 24px;">
                <h3>1. Как устроена таблица справочника</h3>
                <p>Здесь мы один раз прописываем все версии для каждой платформы:</p>
                <nz-table #osTable nzSize="small" [nzData]="['']" [nzFrontPagination]="false" [nzShowPagination]="false">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>PlatformId</th>
                      <th>VersionCode</th>
                      <th>DisplayName (что видит юзер)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td>1</td><td>1 (Windows)</td><td>"7"</td><td>Windows 7</td></tr>
                    <tr><td>2</td><td>1 (Windows)</td><td>"10"</td><td>Windows 10</td></tr>
                    <tr><td>3</td><td>1 (Windows)</td><td>"11"</td><td>Windows 11</td></tr>
                    <tr><td>4</td><td>2 (macOS)</td><td>"14"</td><td>macOS Sonoma</td></tr>
                  </tbody>
                </nz-table>
              </div>

              <div class="model-section" style="margin-top: 16px;">
                <h3>2. Как это используется в требованиях?</h3>
                <p>В основной таблице требований мы не пишем текст "Windows 10", мы просто ставим <b>ID</b> из таблицы выше:</p>
                <div class="logic-box">
                  <b>Requirement #100:</b> VLC 3.0.20 -> Platform: 1 (Win) -> MinOsVersionId: <b>2</b> (ссылка на Windows 10)
                </div>
              </div>

              <div class="model-section" style="margin-top: 16px;">
                <h3>Почему это круто?</h3>
                <ul>
                  <li><b>Порядок в данных:</b> Никаких опечаток вроде "Win10" или "Window 10". Строго один вариант из списка.</li>
                  <li><b>Умный выбор в админке:</b> Когда ты выбираешь платформу "Windows", система подтянет только те версии, которые относятся к Windows.</li>
                  <li><b>Легко обновлять:</b> Вышла Windows 12? Просто добавь одну строку в справочник.</li>
                </ul>
              </div>
            </nz-card>

            <nz-card nzTitle="🔗 Интеграция в Программу (Связи)">
              <div class="logic-box bg-blue">
                <p>Как вся эта механика справочников встраивается в основную логику Aurora?</p>
              </div>

              <div class="model-section" style="margin-top: 24px;">
                <h3>Схема «Моста» (Bridge Pattern)</h3>
                <p>Системные требования не висят в воздухе. Они привязаны к конкретной <b>Версии</b> программы:</p>
                <div class="tree-view">
                  📂 Программа (Photoshop)<br />
                  └── 📂 Версия (v25.0)<br />
                      └── 📄 <span class="file-new">Коллекция SystemRequirements</span><br />
                          ├── ⚙️ Req 1: Windows + x64 + Win 10+<br />
                          └── ⚙️ Req 2: macOS + Arm64 + Sonoma+
                </div>
              </div>

              <div class="model-section" style="margin-top: 16px;">
                <h3>Почему это сделано именно так?</h3>
                <ul>
                  <li><b>Гибкость:</b> У версии 1.0 могут быть одни требования, а у версии 2.0 (спустя 5 лет) — совсем другие.</li>
                  <li><b>Множественность:</b> Одна версия программы может одновременно иметь требования и для Windows, и для macOS, и для Linux.</li>
                  <li><b>Простота запросов:</b> Чтобы узнать, пойдет ли программа у юзера, нам достаточно загрузить список требований для выбранной версии.</li>
                </ul>
              </div>

              <nz-alert
                nzType="success"
                nzMessage="Технический итог"
                nzDescription="Entity Framework сам свяжет эти таблицы. Нам останется только вызвать .Include(x => x.SystemRequirements) при получении данных о версии."
                nzShowIcon
              ></nz-alert>
            </nz-card>

            <nz-card nzTitle="🌍 Шаг 3 — локализация (перевод доп. текста)">
              <p>К каждой строке требований можно добавить текст на разных языках — например, информацию о RAM или фреймворках.</p>
              
              <div class="model-section">
                <h3>Таблица system_requirement_localizations:</h3>
                <nz-table nzSize="small" [nzData]="['']" [nzFrontPagination]="false" [nzShowPagination]="false">
                  <thead>
                    <tr>
                      <th>id</th>
                      <th>requirementId</th>
                      <th>languageId</th>
                      <th>additionalNotes</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td>1</td><td>100</td><td>1 (EN)</td><td>Requires .NET 6, 4GB RAM</td></tr>
                    <tr><td>2</td><td>100</td><td>2 (RU)</td><td>Требуется .NET 6, 4 ГБ RAM</td></tr>
                  </tbody>
                </nz-table>
              </div>
            </nz-card>

            <nz-card nzTitle="💎 Что такое Architecture?">
              <p>Это тип процессора и его разрядность. Мы используем следующие стандарты:</p>
              <ul>
                <li><b>x86</b> — 32-bit (для очень старых программ или спец. софта).</li>
                <li><b>x64</b> — 64-bit (стандарт для современных Windows и Linux).</li>
                <li><b>Arm64</b> — Apple Silicon (M1/M2/M3) и новые ноутбуки на ARM Windows.</li>
                <li><b>Universal</b> — Сборки для macOS, работающие и на Intel, и на Apple Silicon.</li>
                <li><b>Any</b> — Не важно (типично для Android/iOS).</li>
              </ul>
            </nz-card>

            <nz-card nzTitle="🖥️ Как это выглядит в админке (UI)?">
              <p>В карточке <b>Версии программы</b> появится новая секция «Системные требования»:</p>
              <div class="logic-box bg-blue">
                [ + Добавить требование ] <br />
                ------------------------------------------------------------ <br />
                Windows | x64 | Win 10+ | "Требуется .NET 6" [ Изменить ] [ Удалить ] <br />
                macOS | Arm64 | Sonoma+ | "Apple Silicon native" [ Изменить ] [ Удалить ]
              </div>
            </nz-card>
          </div>
        </nz-tab>

        <!-- 2. DATA MODELS -->
        <nz-tab nzTitle="📊 2. Модели данных (C#)">
          <div class="tab-content">
            <nz-card nzTitle="Новые сущности (DAL/Models/Aggregator)">
              <p>Для реализации системы требований создаются 4 новых файла:</p>
              
              <div class="model-section">
                <h3>1. Architecture Enum</h3>
                <p><code>/Enums/RequirementArchitecture.cs</code></p>
                <av-help-copy-container [content]="architectureEnumCode"></av-help-copy-container>
              </div>

              <nz-divider></nz-divider>

              <div class="model-section">
                <h3>2. Platform OS Version (Справочник версий)</h3>
                <p><code>PlatformOsVersionOfAggregator.cs</code></p>
                <p class="desc">Хранит список версий для каждой ОС (Windows 10, macOS Sonoma и т.д.).</p>
                <av-help-copy-container [content]="osVersionModelCode"></av-help-copy-container>
              </div>

              <nz-divider></nz-divider>

              <div class="model-section">
                <h3>3. System Requirement (Основные требования)</h3>
                <p><code>SystemRequirementOfAggregator.cs</code></p>
                <p class="desc">Связывает версию программы с платформой, архитектурой и версией ОС.</p>
                <av-help-copy-container [content]="sysReqModelCode"></av-help-copy-container>
              </div>

              <nz-divider></nz-divider>

              <div class="model-section">
                <h3>4. Localization (Текстовые примечания)</h3>
                <p><code>/Localizations/SystemRequirementOfAggregatorLocalization.cs</code></p>
                <av-help-copy-container [content]="locModelCode"></av-help-copy-container>
              </div>
            </nz-card>
          </div>
        </nz-tab>

        <!-- 3. EXISTING MODIFICATIONS -->
        <nz-tab nzTitle="🛠️ 3. Изменения существующих моделей">
          <div class="tab-content">
            <nz-card nzTitle="Связи в текущих классах">
              <p>Чтобы новые таблицы "заработали", нужно обновить существующие сущности:</p>
              
              <div class="logic-box bg-blue">
                <b>VersionOfAggregator.cs</b>
                <pre>public virtual ICollection&lt;SystemRequirementOfAggregator&gt; SystemRequirements &#123; get; set; &#125;</pre>
                <p><small>Версия теперь "знает" свои требования.</small></p>
              </div>

              <div class="logic-box bg-blue" style="margin-top: 12px;">
                <b>PlatformOfAggregator.cs</b>
                <pre>public virtual ICollection&lt;PlatformOsVersionOfAggregator&gt; OsVersions &#123; get; set; &#125;</pre>
                <p><small>Платформа теперь содержит список своих версий (Win7, Win10...).</small></p>
              </div>

              <nz-divider></nz-divider>

              <div class="logic-box bg-dark">
                <b>AppDbContext.Aggregator.cs</b>
                <p>Не забудьте добавить новые DbSet:</p>
                <pre>public DbSet&lt;PlatformOsVersionOfAggregator&gt; PlatformOsVersions &#123; get; set; &#125;\npublic DbSet&lt;SystemRequirementOfAggregator&gt; SystemRequirements &#123; get; set; &#125;</pre>
              </div>
            </nz-card>
          </div>
        </nz-tab>

        <!-- 4. LOGIC & EXAMPLES -->
        <nz-tab nzTitle="💡 4. Логика и Примеры">
          <div class="tab-content">
            <nz-card nzTitle="Как работает Min/Max OS Version?">
              <div class="logic-box">
                <p>Мы используем логику <b>"От и До"</b>. В 99% случаев заполняется только MinOsVersion.</p>
                <ul>
                  <li><b>Min: Windows 7, Max: NULL</b> — Работает на Win 7, 8, 10, 11 и всех будущих.</li>
                  <li><b>Min: Windows 10, Max: Windows 11</b> — Работает только на 10 и 11.</li>
                </ul>
                <p>Это избавляет от необходимости обновлять все программы при выходе новой Windows 12 — она автоматически попадет в диапазон "Windows 7+".</p>
              </div>
            </nz-card>

            <nz-card nzTitle="Пример данных (VLC 3.0.20)">
              <nz-table #basicTable [nzData]="exampleData" [nzFrontPagination]="false" nzSize="small">
                <thead>
                  <tr>
                    <th>Платформа</th>
                    <th>Архитектура</th>
                    <th>Мин. ОС</th>
                    <th>Тип</th>
                    <th>Доп. текст</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let data of basicTable.data">
                    <td>{{ data.platform }}</td>
                    <td><nz-tag>{{ data.arch }}</nz-tag></td>
                    <td>{{ data.minOs }}</td>
                    <td>
                      <nz-tag [nzColor]="data.isRec ? 'green' : 'blue'">
                        {{ data.isRec ? 'Рекомендуем' : 'Минимум' }}
                      </nz-tag>
                    </td>
                    <td><small>{{ data.notes }}</small></td>
                  </tr>
                </tbody>
              </nz-table>
            </nz-card>
          </div>
        </nz-tab>

        <!-- 5. SEARCH & SORT -->
        <nz-tab nzTitle="🔍 5. Поиск и Сортировка">
          <div class="tab-content">
            <nz-card nzTitle="Универсальный компонент поиска (AvSearchComponent)">
              <p>В модуле используется <b>Universal Search Hero</b> — стандартизированный компонент Aurora из <code>&#64;shared/components/ui/search</code>.</p>
              
              <div class="logic-box bg-blue">
                <ul>
                  <li><b>Реактивный Debounce:</b> Автоматическая задержка в 300мс при наборе текста, чтобы минимизировать нагрузку на БД.</li>
                  <li><b>Two-way Signals:</b> Использование <code>model signal</code> для мгновенной синхронизации строки поиска между компонентами.</li>
                </ul>
              </div>

              <div class="model-section" style="margin-top: 16px;">
                <h3>Техническая интеграция</h3>
                <pre>&lt;av-search [(value)]="searchTerm" (onSearch)="onSearchChange($event)"&gt;</pre>
                <ul style="margin-top: 8px;">
                  <li><b>Входные данные:</b> <code>avPlaceholder</code> (подсказка), <code>avLoading</code> (индикация процесса).</li>
                  <li><b>Событие onSearch:</b> Срабатывает автоматически после паузы или мгновенно при нажатии Enter.</li>
                </ul>
              </div>
            </nz-card>

            <nz-card nzTitle="Серверная фильтрация & Сортировка (Backend Pattern)">
              <p>Поиск и сортировка выполняются на стороне базы данных PostgreSQL для обеспечения производительности.</p>
              
              <div class="model-section">
                <h3>Логика поиска (C#)</h3>
                <ul>
                  <li><b>Поля:</b> <code>Name</code>, <code>SystemCode</code> и локализованные имена в <code>Localizations</code>.</li>
                  <li><b>Регистр:</b> Поиск регистронезависимый (используется <code>ToLower()</code>).</li>
                  <li><b>SEO:</b> Исключено (поля MetaTitle/Description не участвуют в поиске).</li>
                </ul>
              </div>

              <div class="model-section" style="margin-top: 16px;">
                <h3>Параметры сортировки</h3>
                <ul>
                  <li><code>Id</code>, <code>Name</code>, <code>SystemCode</code>.</li>
                  <li><code>SortOrder</code> (Приоритет в каталоге).</li>
                  <li><code>ProgramsCount</code> — <b>New!</b> Сортировка по количеству софта.</li>
                </ul>
              </div>

              <div class="logic-box bg-dark" style="margin-top: 16px;">
                <b>Пример реализации:</b>
                <av-help-copy-container [content]="serverSearchCode"></av-help-copy-container>
              </div>
            </nz-card>
          </div>
        </nz-tab>

        <!-- 6. INITIAL DATA (JSON) -->
        <nz-tab nzTitle="📦 6. Начальные данные (JSON)">
          <div class="tab-content">
            <nz-card nzTitle="Файлы для сидирования (DAL/SeedData/Aggregator/)">
              <p>Для автоматического заполнения справочников при старте системы используем JSON файлы.</p>
              
              <div class="model-section">
                <h3>platform_os_versions.json</h3>
                <p class="desc">Полный список из 48 версий ОС для первичной загрузки в БД.</p>
                <av-help-copy-container [content]="fullJsonSeedData"></av-help-copy-container>
              </div>
 
              <div class="logic-box bg-blue" style="margin-top: 16px;">
                <b>💡 Совет для Junior:</b> При загрузке этого JSON бэкенд должен сначала найти 
                <code>PlatformId</code> по полю <code>platformCode</code>, чтобы правильно связать данные.
              </div>
            </nz-card>
          </div>
        </nz-tab>

        <!-- 7. IMPLEMENTATION ROADMAP -->
        <nz-tab nzTitle="🚀 7. План реализации">
          <div class="tab-content">
            <nz-card nzTitle="Как собрать модуль System Requirements с нуля? (Пошаговый план)">
              
              <!-- КАРТА МОДУЛЯ -->
              <div class="map-box">
                <h5 class="map-title"><i nz-icon nzType="cluster"></i> Карта Бэкенд-модуля (DAL & API)</h5>
                <div class="map-grid">
                  <div class="map-column">
                    <strong class="map-label">[DAL] Слой доступа к данным</strong>
                    <div class="tree-view">
                      ├── 📂 Models/Aggregator/<br />
                      │ ├── 📄 PlatformOsVersionOfAggregator.cs<br />
                      │ ├── 📄 SystemRequirementOfAggregator.cs<br />
                      │ └── 📄 Localizations/SystemReq...Localization.cs<br />
                      ├── 📂 Repositories/<br />
                      │ ├── 📄 SystemRequirementRepository.cs<br />
                      │ └── 📄 Interfaces/ISystemReq...Repository.cs<br />
                      ├── 📄 AppDbContext.Aggregator.cs<br />
                      └── 📄 AggregatorModelConfiguration.cs
                    </div>
                  </div>
                  <div class="map-column">
                    <strong class="map-label">[API] Слой логики и сервисов</strong>
                    <div class="tree-view">
                      ├── 📂 Controllers/OsVersionController.cs<br />
                      ├── 📂 Dtos/SystemRequirementDto.cs<br />
                      ├── 📂 Interfaces/ISystemRequirementService.cs<br />
                      ├── 📂 Services/SystemRequirementService.cs<br />
                      └── 📂 Mappings/SystemRequirementProfile.cs
                    </div>
                  </div>
                </div>
              </div>

              <div class="roadmap-container" style="margin-top: 32px;">
                <!-- STEP 1 -->
                <div class="roadmap-step">
                  <div class="step-header"><nz-tag nzColor="blue">Step 1</nz-tag> <strong>Модели и БД</strong></div>
                  <div class="step-body">
                    <ul>
                      <li>Создать Entity и Localization в <code>DAL/Models/Aggregator</code>.</li>
                      <li>Унаследовать Core от <code>FullAuditableEntityOfAggregator</code>, Loc от <code>AuditableEntity</code>.</li>
                      <li>Добавить в <code>AppDbContext</code> и настроить связи в <code>AggregatorModelConfiguration</code>.</li>
                      <li>Миграция: <code>dotnet ef migrations add AddSystemRequirements --project DAL</code>.</li>
                    </ul>
                  </div>
                </div>

                <!-- STEP 2 -->
                <div class="roadmap-step">
                  <div class="step-header"><nz-tag nzColor="blue">Step 2</nz-tag> <strong>Репозитории и UnitOfWork</strong></div>
                  <div class="step-body">
                    <ul>
                      <li>Реализовать <code>SystemRequirementRepository</code>.</li>
                      <li>Добавить свойство в <code>IUnitOfWork.cs</code> и его реализацию в <code>UnitOfWork.cs</code>.</li>
                      <li>Зарегистрировать в <code>ServiceCollectionExtensions.cs</code>.</li>
                    </ul>
                  </div>
                </div>

                <!-- STEP 3 -->
                <div class="roadmap-step">
                  <div class="step-header"><nz-tag nzColor="blue">Step 3</nz-tag> <strong>Логика и API (Контроллер)</strong></div>
                  <div class="step-body">
                    <ul>
                      <li><nz-tag nzColor="success">OK</nz-tag> GetPaged с фильтром по PlatformId (для ОС)</li>
                      <li><nz-tag nzColor="success">OK</nz-tag> Логика проверки совместимости</li>
                      <li><nz-tag nzColor="processing">NEXT</nz-tag> Метод SeedOsVersionsAsync (48 версий ОС)</li>
                      <li><nz-tag nzColor="processing">IN PROGRESS</nz-tag> Интеграция коллекции требований в VersionOfAggregator</li>
                    </ul>
                  </div>
                </div>

                <!-- FRONTEND MAP -->
                <div class="map-box" style="margin-top: 40px; border-color: #52c41a;">
                  <h5 class="map-title" style="color: #52c41a;"><i nz-icon nzType="layout"></i> Карта Фронтенд-модуля (Angular v17+)</h5>
                  <div class="tree-view">
                    src/app/AGREGATOR/PAGES/SPRAVKA/SystemRequirementPage/<br />
                    ├── 📂 components/ (List, Form, Modal, InlineEditor)<br />
                    ├── 📂 models/ (DTO и State интерфейсы)<br />
                    ├── 📂 services/<br />
                    │ ├── 📄 system-requirement-api.service.ts // API v1<br />
                    │ └── 📄 system-requirement-state.service.ts // Signals SSOT<br />
                    ├── 📄 system-requirement-manager.component.ts // Оркестратор<br />
                    └── 📄 system-requirement.routes.ts
                  </div>
                </div>

                <!-- STEP 4 -->
                <div class="roadmap-step" style="margin-top: 32px;">
                  <div class="step-header"><nz-tag nzColor="green">Step 4</nz-tag> <strong>Фронтенд: Инфраструктура</strong></div>
                  <div class="step-body">
                    <ul>
                      <li><nz-tag nzColor="success">OK</nz-tag> <b>API Service:</b> Реализовать методы с использованием <code>HttpParams</code>.</li>
                      <li><nz-tag nzColor="success">OK</nz-tag> <b>State Service:</b> Внедрить SSOT на базе <code>signal&lt;State&gt;</code>.</li>
                      <li><nz-tag nzColor="success">OK</nz-tag> Использовать <code>executeWithLoading()</code> для всех асинхронных операций.</li>
                    </ul>
                  </div>
                </div>

                <!-- STEP 5 -->
                <div class="roadmap-step">
                  <div class="step-header"><nz-tag nzColor="green">Step 5</nz-tag> <strong>Функциональная спецификация UI</strong></div>
                  <div class="step-body">
                    <ul>
                      <li><nz-tag nzColor="success">OK</nz-tag> <b>Поиск:</b> <code>AvSearchComponent</code> (реактивный debounce 300мс).</li>
                      <li><nz-tag nzColor="success">OK</nz-tag> <b>Пагинация:</b> <code>nz-pagination</code> (связка с pageIndex/pageSize в стейте).</li>
                      <li><nz-tag nzColor="success">OK</nz-tag> <b>Корзина:</b> Переключатель режима отображения удаленных записей.</li>
                      <li><nz-tag nzColor="success">OK</nz-tag> <b>Таблица:</b> Сортировка по клику на заголовок (сброс на страницу 1).</li>
                    </ul>
                  </div>
                </div>

                <!-- STEP 6 -->
                <div class="roadmap-step">
                  <div class="step-header"><nz-tag nzColor="green">Step 6</nz-tag> <strong>Премиум Логика: Fallbacks</strong></div>
                  <div class="step-body">
                    <p><b>English Fallbacks:</b> Если при сохранении локализованное поле пустое — автоматически копируется значение из en-US вкладки.</p>
                  </div>
                </div>

                <!-- STEP 7-13 SUMMARY -->
                <div class="logic-box bg-blue" style="margin-top: 24px;">
                  <b>Финальные шаги (7-13):</b>
                  <ul>
                    <li>Добавить Guards (LanguageGuard, SeedGuard).</li>
                    <li>Настроить роутинг в <code>aggregator-pages.routes.ts</code>.</li>
                    <li>Добавить пункт в Sidebar через <code>SidebarService</code>.</li>
                    <li>Обработка ошибок через <code>NzMessageService</code>.</li>
                  </ul>
                </div>
              </div>
            </nz-card>

            <nz-card nzTitle="Эталонная реализация (Sample)">
              <p>При проектировании всегда ориентируйтесь на код существующих модулей:</p>
              <ul>
                <li>Бэкенд Entity: <code>DAL/Models/Aggregator/PlatformOfAggregator.cs</code></li>
                <li>Фронтенд State: <code>services/platform-of-aggregator-state.service.ts</code></li>
              </ul>
            </nz-card>
          </div>
        </nz-tab>

        <!-- 8. CHECK BACK -->
        <nz-tab nzTitle="✅ 8. Check Back">
          <div class="tab-content">
            <nz-card nzTitle="Backend Implementation Progress">
              <p>Отслеживание реализации серверной части System Requirements согласно утвержденному плану.</p>

              <div class="model-section">
                <h3>1. Models & DAL (Слой данных)</h3>
                <ul>
                  <li><nz-tag nzColor="success">OK</nz-tag> Сущности PlatformOsVersion / SystemRequirement сконфигурированы</li>
                  <li><nz-tag nzColor="success">OK</nz-tag> Таблицы локализаций созданы в <code>/Localizations</code></li>
                  <li><nz-tag nzColor="success">OK</nz-tag> Миграции БД применены</li>
                </ul>
              </div>

              <div class="model-section" style="margin-top: 16px;">
                <h3>2. Repositories (Слой доступа)</h3>
                <ul>
                  <li><nz-tag nzColor="success">OK</nz-tag> Репозитории для новых сущностей реализованы</li>
                  <li><nz-tag nzColor="success">OK</nz-tag> UnitOfWork расширен новыми свойствами</li>
                  <li><nz-tag nzColor="success">OK</nz-tag> DI регистрация в ServiceCollection</li>
                </ul>
              </div>

              <div class="model-section" style="margin-top: 16px;">
                <h3>3. Service Layer (Бизнес-логика)</h3>
                <ul>
                  <li><nz-tag nzColor="success">OK</nz-tag> GetPaged с фильтром по PlatformId (для ОС)</li>
                  <li><nz-tag nzColor="success">OK</nz-tag> Логика проверки совместимости (Min/Max OS Logic)</li>
                  <li><nz-tag nzColor="success">OK</nz-tag> Метод <code>SeedOsVersionsAsync</code> (48 версий ОС)</li>
                  <li><nz-tag nzColor="success">OK</nz-tag> Интеграция коллекции требований в <code>VersionOfAggregator</code></li>
                </ul>
              </div>

              <div class="model-section" style="margin-top: 16px;">
                <h3>4. API Controllers (Эндпоинты)</h3>
                <ul>
                  <li><nz-tag nzColor="success">OK</nz-tag> Контроллер <code>OsVersionController</code> реализован</li>
                  <li><nz-tag nzColor="success">OK</nz-tag> Поддержка Soft & Hard Delete</li>
                </ul>
              </div>

              <nz-alert
                nzType="info"
                nzMessage="Метод обновления"
                nzDescription="Данный список будет обновляться ИИ-ассистентом по мере завершения каждого этапа реализации."
                nzShowIcon
                style="margin-top: 24px;"
              ></nz-alert>
            </nz-card>

            <nz-card nzTitle="System Console">
              <div class="map-grid">
                <div class="logic-box bg-blue">
                  <strong>Система</strong><br/>
                  <nz-tag nzColor="success">BACKEND READY</nz-tag>
                </div>
                <div class="logic-box bg-blue">
                  <strong>Backend</strong><br/>
                  <nz-tag nzColor="success">API 100%</nz-tag>
                </div>
                <div class="logic-box bg-blue">
                  <strong>Данные</strong><br/>
                  <nz-tag nzColor="default">EMPTY</nz-tag>
                </div>
                <div class="logic-box bg-blue">
                  <strong>Валидация</strong><br/>
                  <nz-tag nzColor="default">NONE</nz-tag>
                </div>
              </div>
            </nz-card>

            <nz-card nzTitle="📝 Детальный лог действий (Activity Log)">
              <div class="logic-box bg-dark">
                <pre>// --- Начало реализации System Requirements (v3.5) ---
[ПОДГОТОВКА]
- [OK] Архитектурная документация создана
- [OK] Справочник на 48 версий ОС подготовлен (JSON)
- [OK] Дизайн системы требований утвержден
[ШАГ 1: Модели и Контекст]
- [OK] Создание RequirementArchitecture.cs
- [OK] Создание PlatformOsVersionOfAggregator.cs
- [OK] Создание SystemRequirementOfAggregator.cs
- [OK] Создание SystemRequirementOfAggregatorLocalization.cs
- [OK] Регистрация в AppDbContext и Configuration
- [OK] dotnet ef migrations add AddSystemRequirements
- [OK] dotnet ef database update
[ШАГ 2: Репозитории]
- [OK] ISystemRequirementRepository / PlatformOsVersionRepository
- [OK] Расширение UnitOfWork
[ШАГ 3: Логика и API]
- [OK] DTOs и AutoMapper Profile
- [OK] OsVersionService и SystemRequirementService
- [OK] OsVersionController (api/v1/aggregator/os-versions)
- [OK] SeedOsVersionsAsync (JSON Seeding)
[ИТОГ] Бэкенд полностью готов к интеграции с UI.</pre>
              </div>
            </nz-card>
          </div>
        </nz-tab>

        <!-- 9. CHECK FRONT -->
        <nz-tab nzTitle="✅ 9. Check Front">
          <div class="tab-content">
            <nz-card nzTitle="Frontend Implementation Progress">
              <p>Отслеживание реализации клиентской части System Requirements согласно утвержденному плану.</p>
1
              <div class="model-section">
                <h3>1. Infrastructure (Signals & API)</h3>
                <ul>
                  <li><nz-tag nzColor="success">OK</nz-tag> API Service реализован (v1 Integration)</li>
                  <li><nz-tag nzColor="success">OK</nz-tag> State Service (Signals SSOT) настроен</li>
                  <li><nz-tag nzColor="success">OK</nz-tag> Интерфейсы DTO / State созданы</li>
                </ul>
              </div>

              <div class="model-section" style="margin-top: 16px;">
                <h3>2. UI Components</h3>
                <ul>
                  <li><nz-tag nzColor="success">OK</nz-tag> Менеджер-компонент (Orchestrator)</li>
                  <li><nz-tag nzColor="success">OK</nz-tag> Форма редактирования (Form / Modal)</li>
                  <li><nz-tag nzColor="success">OK</nz-tag> Интерактивный список (List View)</li>
                </ul>
              </div>

              <div class="model-section" style="margin-top: 16px;">
                <h3>3. Advanced Logic</h3>
                <ul>
                  <li><nz-tag nzColor="success">OK</nz-tag> Валидация полей (Validators)</li>
                  <li><nz-tag nzColor="success">OK</nz-tag> Механика English Fallbacks</li>
                  <li><nz-tag nzColor="success">OK</nz-tag> Поиск и фильтрация (AvSearch)</li>
                </ul>
              </div>

              <div class="model-section" style="margin-top: 16px;">
                <h3>4. Integration</h3>
                <ul>
                  <li><nz-tag nzColor="success">OK</nz-tag> Роутинг в <code>aggregator-pages</code></li>
                  <li><nz-tag nzColor="success">OK</nz-tag> Sidebar пункт меню</li>
                </ul>
              </div>
            </nz-card>

            <nz-card nzTitle="📝 Frontend Activity Log">
              <div class="logic-box bg-dark">
                <pre>// --- Начало реализации Frontend (Angular v17+) ---
[ПОДГОТОВКА]
- [OK] Структура папок в AGREGATOR/PAGES/SPRAVKA создана
[ШАГ 4: Инфраструктура]
- [OK] Реализация API Service
- [OK] Настройка State Service (Signals)
[ШАГ 5: UI]
- [OK] Создан OsVersionManager (Dictionary)
- [OK] Создан SystemRequirementManager (Orchestrator)
- [OK] Реализована модальная форма с локализацией
[ШАГ 6: Интеграция]
- [OK] Роутинг зарегистрирован
- [OK] Пункт меню "Версии ОС" добавлен в Sidebar</pre>
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
        max-width: 1200px;
        margin: 0 auto;
      }
      .main-alert {
        margin: 24px 0;
      }
      .help-tabs {
        margin-top: 24px;
      }
      .tab-content {
        display: flex;
        flex-direction: column;
        gap: 24px;
        padding: 24px 0;
      }
      .model-section h3 {
        margin-bottom: 4px;
        color: #1890ff;
      }
      .model-section .desc {
        color: #8c8c8c;
        font-size: 13px;
        margin-bottom: 12px;
      }
      .logic-box {
        padding: 16px;
        background: #fafafa;
        border-radius: 8px;
        border-left: 4px solid #1890ff;
      }
      .bg-blue { background: #e6f7ff; }
      .bg-dark { 
        background: #001529; 
        color: #fff;
        border-left-color: #52c41a;
      }
      .bg-dark pre { color: #a6e22e; }
      pre {
        margin: 8px 0;
        font-family: monospace;
      }

      /* ROADMAP STYLES */
      .roadmap-container {
        display: flex;
        flex-direction: column;
        gap: 32px;
        padding-top: 16px;
      }
      .map-box {
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        padding: 24px;
      }
      .map-title {
        color: #0f172a;
        font-weight: 700;
        margin-bottom: 20px;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .map-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 24px;
      }
      .map-label {
        display: block;
        color: #2563eb;
        font-size: 12px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-bottom: 12px;
      }
      .tree-view {
        font-family: 'Consolas', monospace;
        font-size: 13px;
        line-height: 1.6;
        color: #475569;
        background: #fff;
        padding: 16px;
        border-radius: 8px;
        border: 1px dashed #cbd5e1;
      }
      .tree-view .folder { color: #0891b2; font-weight: 600; }
      .tree-view .file-new { color: #059669; font-weight: 600; }

      .roadmap-step {
        border-left: 3px solid #e2e8f0;
        padding-left: 24px;
        position: relative;
      }
      .roadmap-step::before {
        content: '';
        position: absolute;
        left: -9px;
        top: 0;
        width: 15px;
        height: 15px;
        border-radius: 50%;
        background: #fff;
        border: 3px solid #cbd5e1;
      }
      .step-header {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 12px;
      }
      .step-header strong {
        font-size: 16px;
        color: #1e293b;
      }
      .step-body ul {
        margin: 0;
        padding-left: 20px;
        color: #64748b;
      }
      .step-body li {
        margin-bottom: 8px;
      }
    `,
  ],
})
export class VersionSpecHelpComponent {
  architectureEnumCode = ARCHITECTURE_ENUM_CODE;
  osVersionModelCode = OS_VERSION_MODEL_CODE;
  sysReqModelCode = SYSTEM_REQUIREMENT_MODEL_CODE;
  locModelCode = SYSR_LOCALIZATION_MODEL_CODE;
  fullJsonSeedData = PLATFORM_OS_SEED_JSON;
  exampleData = VERSION_SPEC_EXAMPLE_DATA;
  serverSearchCode = SERVER_SEARCH_CODE;
}
