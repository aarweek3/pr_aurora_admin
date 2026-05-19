import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { HelpPathHeaderComponent } from '@shared/components/ui';

@Component({
  selector: 'app-language-aggregator-help',
  standalone: true,
  imports: [
    CommonModule,
    NzCardModule,
    NzTypographyModule,
    NzDividerModule,
    NzTagModule,
    NzTableModule,
    NzIconModule,
    HelpPathHeaderComponent,
  ],
  template: `
    <div class="help-page-container">
      <av-help-path-header
        title="Языки Агрегатора (Справочник)"
        subtitle="Документация по управлению языками агрегатора, их инициализации и очередности."
        icon="🌍"
        componentPath="src/app/AGREGATOR/PAGES/SPRAVKA/LanguageOfAggregator"
        [dalPath]="['DAL/Models/Aggregator/LanguageOfAggregator.cs']"
        [docPath]="[
          'wwwroot/data/default-aggregator-languages.json',
          'wwwroot/data/default-languages.json',
        ]"
      ></av-help-path-header>

      <nz-card class="doc-card" nzTitle="📂 Источники данных (JSON)">
        <p>
          Инициализация языков в системе Агрегатора происходит на стороне бэкенда. При выполнении
          команды <strong>Initialize</strong>, сервер ищет файлы конфигурации в следующем порядке:
        </p>

        <div class="path-list">
          <div class="path-item">
            <nz-tag nzColor="blue">1. Основной</nz-tag>
            <code>wwwroot/data/default-aggregator-languages.json</code>
          </div>
          <div class="path-item">
            <nz-tag nzColor="default">2. Резервный</nz-tag>
            <code>wwwroot/data/default-languages.json</code>
          </div>
        </div>

        <div class="notice-box info">
          <span nz-icon nzType="info-circle"></span>
          <p>
            При инициализации система проверяет <strong>Code</strong> (например, en-US) на
            уникальность. Если язык уже существует в БД, он не будет перезаписан или дублирован.
          </p>
        </div>
      </nz-card>

      <nz-divider></nz-divider>

      <div class="doc-section">
        <h2 nz-typography>📜 Список языков по умолчанию (Sort Order)</h2>
        <p>
          Ниже приведен список языков в том порядке, в котором они добавляются в базу данных при
          первичной инициализации:
        </p>

        <nz-table
          #basicTable
          [nzData]="languages"
          [nzFrontPagination]="false"
          nzSize="middle"
          class="order-table"
        >
          <thead>
            <tr>
              <th nzWidth="80px">№</th>
              <th nzWidth="100px">Code</th>
              <th nzWidth="80px">Short</th>
              <th>Наименование (Native)</th>
              <th nzWidth="100px">RTL</th>
              <th nzWidth="150px">Статус</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let data of basicTable.data">
              <td>
                <strong>{{ data.sort }}</strong>
              </td>
              <td>
                <code>{{ data.code }}</code>
              </td>
              <td>
                <nz-tag>{{ data.short }}</nz-tag>
              </td>
              <td>{{ data.title }} ({{ data.native }})</td>
              <td>
                <span
                  *ngIf="data.rtl"
                  nz-icon
                  nzType="swap"
                  nzTheme="outline"
                  style="color: #fa8c16;"
                  nz-tooltip="Right-to-Left writing"
                ></span>
                <span *ngIf="!data.rtl">-</span>
              </td>
              <td>
                <nz-tag *ngIf="data.system" nzColor="warning">System</nz-tag>
                <nz-tag *ngIf="data.default" nzColor="success">Default</nz-tag>
              </td>
            </tr>
          </tbody>
        </nz-table>
      </div>

      <nz-divider></nz-divider>

      <div class="doc-section">
        <h2 nz-typography>⚙️ Техническая реализация</h2>
        <p>Архитектура модуля построена по стандарту <strong>Aurora v3.5</strong>:</p>
        <ul>
          <li>
            <strong>Backend Service:</strong> <code>LanguageOfAggregatorService.cs</code> (метод
            <code>InitializeAsync</code>).
          </li>
          <li>
            <strong>API Endpoint:</strong>
            <code>POST /api/v1/aggregator/languages/initialize</code>.
          </li>
          <li>
            <strong>Frontend API:</strong> <code>LanguageAggregatorApiService.initialize()</code>.
          </li>
        </ul>

        <h4 nz-typography>Критические операции:</h4>
        <div class="m-item">
          <nz-tag nzColor="error">Hard Reset</nz-tag>
          <p>
            Полная очистка таблицы <code>languages_of_aggregator</code> через
            <code>TRUNCATE CASCADE</code>. Сбрасывает <strong>RESTART IDENTITY</strong> (ID снова
            начнутся с 1).
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .help-page-container {
        padding: 24px;
        max-width: 1100px;
        margin: 0 auto;
      }
      .doc-card {
        margin-bottom: 24px;
        border-radius: 8px;
      }
      .path-list {
        background: #f5f5f5;
        padding: 16px;
        border-radius: 4px;
        margin: 12px 0;
      }
      .path-item {
        margin-bottom: 8px;
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .path-item code {
        color: #c41d7f;
        font-weight: 500;
      }
      .notice-box {
        display: flex;
        gap: 12px;
        padding: 12px 16px;
        border-radius: 6px;
        margin-top: 16px;
      }
      .notice-box.info {
        background: #e6f7ff;
        border-left: 4px solid #1890ff;
      }
      .notice-box nz-icon {
        font-size: 20px;
        color: #1890ff;
        margin-top: 2px;
      }
      .notice-box p {
        margin: 0;
      }
      .order-table {
        margin-top: 16px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
      }
      .doc-section {
        margin-bottom: 40px;
      }
      .m-item {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        margin-top: 12px;
      }
      .m-item p {
        margin: 0;
      }
    `,
  ],
})
export class LanguageAggregatorHelpComponent {
  languages = [
    {
      sort: 1,
      code: 'en-US',
      short: 'EN',
      title: 'English',
      native: 'English',
      rtl: false,
      default: true,
      system: true,
    },
    {
      sort: 2,
      code: 'ru-RU',
      short: 'RU',
      title: 'Russian',
      native: 'Русский',
      rtl: false,
      default: false,
      system: true,
    },
    {
      sort: 3,
      code: 'es-ES',
      short: 'ES',
      title: 'Spanish',
      native: 'Español',
      rtl: false,
      default: false,
      system: false,
    },
    {
      sort: 4,
      code: 'zh-CN',
      short: 'ZH',
      title: 'Chinese Simplified',
      native: '简体中文',
      rtl: false,
      default: false,
      system: false,
    },
    {
      sort: 5,
      code: 'de-DE',
      short: 'DE',
      title: 'German',
      native: 'Deutsch',
      rtl: false,
      default: false,
      system: false,
    },
    {
      sort: 6,
      code: 'fr-FR',
      short: 'FR',
      title: 'French',
      native: 'Français',
      rtl: false,
      default: false,
      system: false,
    },
    {
      sort: 7,
      code: 'pt-BR',
      short: 'PT',
      title: 'Portuguese',
      native: 'Português',
      rtl: false,
      default: false,
      system: false,
    },
    {
      sort: 8,
      code: 'ja-JP',
      short: 'JA',
      title: 'Japanese',
      native: '日本語',
      rtl: false,
      default: false,
      system: false,
    },
    {
      sort: 9,
      code: 'ar-SA',
      short: 'AR',
      title: 'Arabic',
      native: 'العربية',
      rtl: true,
      default: false,
      system: false,
    },
    {
      sort: 10,
      code: 'tr-TR',
      short: 'TR',
      title: 'Turkish',
      native: 'Türkçe',
      rtl: false,
      default: false,
      system: false,
    },
    {
      sort: 11,
      code: 'pl-PL',
      short: 'PL',
      title: 'Polish',
      native: 'Polski',
      rtl: false,
      default: false,
      system: false,
    },
  ];
}
