import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzListModule } from 'ng-zorro-antd/list';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { IconLaboratoryService } from '../../../shared/services/icon-laboratory.service';

interface FileSystemItem {
  name: string;
  path: string;
  type: 'file' | 'folder';
  extension?: string;
  size?: number;
}

@Component({
  selector: 'av-rename-all',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzButtonModule,
    NzInputModule,
    NzTableModule,
    NzModalModule,
    NzListModule,
    NzCheckboxModule,
    NzCardModule,
    NzTagModule,
    NzEmptyModule,
    NzToolTipModule,
    NzIconModule,
    NzRadioModule,
  ],
  template: `
    <div class="rename-container">
      <!-- Header -->
      <div class="header-glass">
        <div class="title-section">
          <span
            nz-icon
            nzType="copy"
            nzTheme="outline"
            style="font-size: 32px; color: #60a5fa"
          ></span>
          <div>
            <h1>Универсальный файловый менеджер</h1>
            <p>Прямая операция копирования файлов на сервере. Без привязки к базе данных.</p>
          </div>
        </div>
      </div>

      <div class="main-layout">
        <!-- Explorer Section -->
        <div class="glass-card explorer">
          <div class="card-header">
            <div class="header-left">
              <span nz-icon nzType="folder-open" nzTheme="outline"></span>
              <h3>Проводник сервера</h3>
            </div>
            <div class="breadcrumb-mini">
              <span (click)="browse('')" class="crumb">Диски</span>
              @for (part of pathParts(); track $index) {
              <span class="sep">/</span>
              <span (click)="browseToPart($index)" class="crumb">{{ part }}</span>
              }
            </div>
          </div>

          <div class="explorer-list">
            <nz-list [nzLoading]="loading()" nzSize="small">
              @for (item of items(); track item.path) {
              <nz-list-item class="item-row" (click)="onItemClick(item)">
                <div class="item-main">
                  @if (isDrive(item)) {
                  <span nz-icon nzType="hdd" nzTheme="outline" style="color: #60a5fa"></span>
                  } @else if (item.type === 'folder') {
                  <span nz-icon nzType="folder" nzTheme="outline" style="color: #fbbf24"></span>
                  } @else {
                  <span nz-icon nzType="file-image" nzTheme="outline"></span>
                  }
                  <span class="name">{{ item.name }}</span>
                </div>
                <div class="item-actions">
                  @if (item.type === 'folder') {
                  <button
                    nz-button
                    nzSize="small"
                    nzType="text"
                    (click)="setAsSource(item); $event.stopPropagation()"
                    nz-tooltip
                    nzTooltipTitle="Источник (ОТКУДА)"
                  >
                    <span
                      nz-icon
                      nzType="logout"
                      nzTheme="outline"
                      style="transform: rotate(-90deg)"
                    ></span>
                  </button>
                  <button
                    nz-button
                    nzSize="small"
                    nzType="text"
                    (click)="setAsTarget(item); $event.stopPropagation()"
                    nz-tooltip
                    nzTooltipTitle="Цель (КУДА)"
                  >
                    <span
                      nz-icon
                      nzType="login"
                      nzTheme="outline"
                      style="transform: rotate(90deg)"
                    ></span>
                  </button>
                  } @else { @if (!copyAll()) {
                  <label
                    nz-checkbox
                    [ngModel]="isSelected(item)"
                    (ngModelChange)="toggleFile(item)"
                    (click)="$event.stopPropagation()"
                  ></label>
                  } }
                </div>
              </nz-list-item>
              } @empty {
              <nz-empty
                nzNotFoundImage="simple"
                nzNotFoundContent="Пусто или доступ запрещен"
              ></nz-empty>
              }
            </nz-list>
          </div>

          <div class="explorer-footer">
            <button nz-button (click)="goUp()" [disabled]="!currentPath()">
              <span nz-icon nzType="arrow-left" nzTheme="outline"></span> Назад
            </button>
            <button
              nz-button
              nzType="primary"
              nzGhost
              (click)="setAsSourceCurrent()"
              [disabled]="!currentPath()"
            >
              Выбрать текущую как ИСТОЧНИК
            </button>
            <button
              nz-button
              nzType="primary"
              nzGhost
              (click)="setAsTargetCurrent()"
              [disabled]="!currentPath()"
            >
              Выбрать текущую как ЦЕЛЬ
            </button>
          </div>
        </div>

        <!-- Configuration Section -->
        <div class="glass-card config">
          <div class="setup-group">
            <div class="setup-item">
              <label>ИСТОЧНИК (ОТКУДА):</label>
              <div class="input-with-label">
                <input
                  nz-input
                  [(ngModel)]="sourceFolderRaw"
                  (ngModelChange)="onPathChange('source', $event)"
                  placeholder="Напр: D:\\icons\\old"
                />
              </div>
              <div class="path-preview source">
                <span nz-icon nzType="select" nzTheme="outline"></span>
                {{ sourceFolder() || 'Путь не выбран' }}
              </div>
            </div>

            <div class="setup-item">
              <label>ЦЕЛЬ (КУДА):</label>
              <div class="input-with-label">
                <input
                  nz-input
                  [(ngModel)]="targetFolderRaw"
                  (ngModelChange)="onPathChange('target', $event)"
                  placeholder="Напр: D:\\icons\\new"
                />
              </div>
              <div class="path-preview target">
                <span nz-icon nzType="import" nzTheme="outline"></span>
                {{ targetFolder() || 'Путь не выбран' }}
              </div>
            </div>

            <div class="setup-item selection-mode">
              <label>Режим выбора файлов:</label>
              <nz-radio-group
                [ngModel]="copyAll()"
                (ngModelChange)="onModeChange($event)"
                nzButtonStyle="solid"
                nzSize="small"
              >
                <label nz-radio-button [nzValue]="true">Все .svg из папки</label>
                <label nz-radio-button [nzValue]="false">Выборочно (чекбоксом)</label>
              </nz-radio-group>
            </div>

            <div class="setup-item">
              <label>ПРЕФИКС (добавляется к именам):</label>
              <input nz-input [(ngModel)]="prefix" placeholder="напр: icon_v2_" />
            </div>
          </div>

          <div
            class="exec-section"
            [nz-tooltip]="isSamePath() ? 'Источник и цель не могут совпадать' : ''"
          >
            <button
              nz-button
              nzType="primary"
              nzBlock
              nzSize="large"
              [disabled]="!canExecute()"
              [nzLoading]="processing()"
              (click)="startCopy()"
            >
              <span
                nz-icon
                nzType="play-circle"
                nzTheme="outline"
                style="margin-right: 8px;"
              ></span>
              ЗАПУСТИТЬ КОПИРОВАНИЕ
            </button>
            @if (isSamePath()) {
            <div style="color: #f87171; font-size: 11px; margin-top: 8px; text-align: center;">
              ⚠️ Папки источника и цели должны различаться
            </div>
            }
          </div>

          @if (!copyAll()) {
          <div class="preview-mini">
            Выбрано файлов: <strong>{{ selectedFiles().length }}</strong>
            @if (selectedFiles().length > 0) {
            <button nz-button nzSize="small" nzType="text" nzDanger (click)="selectedFiles.set([])">
              Сбросить выбор
            </button>
            }
          </div>
          }
        </div>
      </div>

      <!-- Results log -->
      @if (results().length > 0) {
      <div class="results-panel">
        <div class="log-header">
          <h3>Журнал операций</h3>
          <button nz-button nzSize="small" nzType="text" (click)="results.set([])">
            Очистить лог
          </button>
        </div>
        <div class="log-scroll">
          @for (res of results(); track $index) {
          <div class="log-line" [class.err]="!res.success">
            {{ res.message }}
          </div>
          }
        </div>
      </div>
      }
    </div>
  `,
  styles: [
    `
      .rename-container {
        padding: 30px;
        min-height: 100vh;
        background: #0f172a;
        color: #e2e8f0;
        font-family: 'Inter', sans-serif;
      }

      .header-glass {
        background: rgba(30, 41, 59, 0.7);
        backdrop-filter: blur(12px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 16px;
        padding: 24px;
        margin-bottom: 30px;
      }

      .title-section {
        display: flex;
        align-items: center;
        gap: 20px;
      }

      .title-section h1 {
        margin: 0;
        color: white;
        font-size: 24px;
        font-weight: 700;
        letter-spacing: -0.5px;
      }

      .title-section p {
        margin: 4px 0 0 0;
        color: #94a3b8;
      }

      .main-layout {
        display: grid;
        grid-template-columns: 1.2fr 1fr;
        gap: 30px;
        align-items: start;
      }

      .glass-card {
        background: rgba(30, 41, 59, 0.5);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 16px;
        padding: 24px;
        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
      }

      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
        padding-bottom: 12px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      }

      .header-left {
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .header-left h3 {
        margin: 0;
        color: white;
        font-size: 18px;
      }

      .breadcrumb-mini {
        font-family: monospace;
        font-size: 13px;
        background: rgba(0, 0, 0, 0.2);
        padding: 4px 10px;
        border-radius: 6px;
        max-width: 350px;
        overflow-x: auto;
        white-space: nowrap;
      }

      .crumb {
        color: #818cf8;
        cursor: pointer;
      }

      .crumb:hover {
        text-decoration: underline;
      }

      .sep {
        color: #475569;
        margin: 0 4px;
      }

      .explorer-list {
        height: 500px;
        overflow-y: auto;
        margin-bottom: 20px;
        background: rgba(0, 0, 0, 0.1);
        border-radius: 8px;
        padding: 8px;
      }

      .item-row {
        cursor: pointer;
        color: #cbd5e1;
        border-radius: 6px;
        transition: all 0.2s;
        padding: 8px 12px !important;
        border: none !important;
        margin-bottom: 2px;
      }

      .item-row:hover {
        background: rgba(99, 102, 241, 0.15);
        color: white;
      }

      .item-main {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .item-actions {
        display: flex;
        gap: 4px;
      }

      .explorer-footer {
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
      }

      .setup-group {
        display: flex;
        flex-direction: column;
        gap: 20px;
        margin-bottom: 30px;
      }

      .setup-item label {
        display: block;
        font-weight: 600;
        color: #94a3b8;
        margin-bottom: 8px;
        font-size: 12px;
        text-transform: uppercase;
      }

      .path-preview {
        margin-top: 8px;
        font-family: monospace;
        font-size: 11px;
        padding: 8px;
        border-radius: 6px;
        background: rgba(0, 0, 0, 0.2);
        border: 1px solid rgba(255, 255, 255, 0.03);
      }

      .path-preview.source {
        color: #fbbf24;
      }
      .path-preview.target {
        color: #34d399;
      }

      .selection-mode {
        background: rgba(96, 165, 250, 0.05);
        padding: 12px;
        border-radius: 8px;
        border: 1px dashed rgba(96, 165, 250, 0.2);
      }

      .exec-section {
        margin-top: 20px;
      }

      .preview-mini {
        margin-top: 20px;
        font-size: 12px;
        color: #94a3b8;
        display: flex;
        align-items: center;
        justify-content: space-between;
        background: rgba(0, 0, 0, 0.1);
        padding: 10px;
        border-radius: 6px;
      }

      .results-panel {
        margin-top: 40px;
        background: #1e293b;
        border-radius: 16px;
        padding: 24px;
        border: 1px solid #334155;
      }

      .log-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
      }

      .log-scroll {
        height: 250px;
        overflow-y: auto;
        font-family: monospace;
        font-size: 12px;
        background: rgba(0, 0, 0, 0.3);
        padding: 12px;
        border-radius: 8px;
      }

      .log-line {
        padding: 3px 0;
        color: #34d399;
      }
      .log-line.err {
        color: #f87171;
      }
    `,
  ],
})
export class RenameAllComponent implements OnInit {
  private iconDataService = inject(IconLaboratoryService);
  private message = inject(NzMessageService);
  private modal = inject(NzModalService);

  loading = signal<boolean>(false);
  items = signal<FileSystemItem[]>([]);
  currentPath = signal<string>('');
  pathParts = signal<string[]>([]);

  sourceFolderRaw = '';
  targetFolderRaw = '';

  sourceFolder = signal<string>('');
  targetFolder = signal<string>('');
  prefix = '';
  copyAll = signal<boolean>(true); // Changed to signal for better reactivity
  selectedFiles = signal<FileSystemItem[]>([]);

  processing = signal<boolean>(false);
  results = signal<any[]>([]);

  ngOnInit() {
    this.browse('');
  }

  browse(path: string) {
    this.loading.set(true);
    this.iconDataService.browseFileSystem(path).subscribe({
      next: (data) => {
        this.items.set(data);
        this.currentPath.set(path);
        if (!path) {
          this.pathParts.set([]);
        } else {
          this.pathParts.set(path.split(/[\\/]/).filter((p) => p !== ''));
        }
        this.loading.set(false);
      },
      error: () => {
        this.message.error('Путь не найден или доступ заблокирован');
        this.loading.set(false);
      },
    });
  }

  browseToPart(idx: number) {
    const parts = this.pathParts().slice(0, idx + 1);
    let p = parts.join('\\');
    if (p.match(/^[A-Za-z]:$/)) p += '\\';
    this.browse(p);
  }

  goUp() {
    const parts = this.pathParts();
    if (parts.length <= 1) this.browse('');
    else {
      parts.pop();
      let p = parts.join('\\');
      if (p.match(/^[A-Za-z]:$/)) p += '\\';
      this.browse(p);
    }
  }

  isDrive(item: FileSystemItem) {
    return item.path.match(/^[A-Za-z]:[\\/]?$/);
  }

  onItemClick(item: FileSystemItem) {
    if (item.type === 'folder') this.browse(item.path);
    else if (!this.copyAll()) this.toggleFile(item);
  }

  private normalize(p: string): string {
    return (p || '')
      .toLowerCase()
      .replace(/[\\/]+$/, '')
      .trim();
  }

  onPathChange(type: 'source' | 'target', val: string) {
    const other =
      type === 'source' ? this.normalize(this.targetFolder()) : this.normalize(this.sourceFolder());
    if (this.normalize(val) === other && val !== '') {
      this.message.warning('Источник и цель не могут быть одинаковыми');
      if (type === 'source') this.sourceFolderRaw = this.sourceFolder();
      else this.targetFolderRaw = this.targetFolder();
      return;
    }
    if (type === 'source') this.sourceFolder.set(val);
    else this.targetFolder.set(val);
  }

  onModeChange(isAll: boolean) {
    this.copyAll.set(isAll);
    if (isAll) {
      this.selectedFiles.set([]); // Clear manual selections when switching to 'All'
    }
  }

  setAsSource(item: FileSystemItem) {
    if (this.normalize(item.path) === this.normalize(this.targetFolder())) {
      this.message.warning('Эта папка уже выбрана как ЦЕЛЬ');
      return;
    }
    this.sourceFolder.set(item.path);
    this.sourceFolderRaw = item.path;
  }
  setAsTarget(item: FileSystemItem) {
    if (this.normalize(item.path) === this.normalize(this.sourceFolder())) {
      this.message.warning('Эта папка уже выбрана как ИСТОЧНИК');
      return;
    }
    this.targetFolder.set(item.path);
    this.targetFolderRaw = item.path;
  }
  setAsSourceCurrent() {
    const p = this.currentPath();
    if (this.normalize(p) === this.normalize(this.targetFolder())) {
      this.message.warning('Текущая папка уже выбрана как ЦЕЛЬ');
      return;
    }
    this.sourceFolder.set(p);
    this.sourceFolderRaw = p;
  }
  setAsTargetCurrent() {
    const p = this.currentPath();
    if (this.normalize(p) === this.normalize(this.sourceFolder())) {
      this.message.warning('Текущая папка уже выбрана как ИСТОЧНИК');
      return;
    }
    this.targetFolder.set(p);
    this.targetFolderRaw = p;
  }

  toggleFile(item: FileSystemItem) {
    if (this.copyAll()) return;
    const list = this.selectedFiles();
    const idx = list.findIndex((f) => f.path === item.path);
    if (idx > -1) this.selectedFiles.set(list.filter((f) => f.path !== item.path));
    else this.selectedFiles.set([...list, item]);
  }

  isSelected(item: FileSystemItem) {
    return this.selectedFiles().some((f) => f.path === item.path);
  }

  canExecute() {
    const src = this.sourceFolder()
      ?.toLowerCase()
      .replace(/[\\/]$/, '');
    const dst = this.targetFolder()
      ?.toLowerCase()
      .replace(/[\\/]$/, '');
    return this.sourceFolder() && this.targetFolder() && src !== dst && !this.processing();
  }

  isSamePath() {
    const src = this.sourceFolder()
      ?.toLowerCase()
      .replace(/[\\/]$/, '');
    const dst = this.targetFolder()
      ?.toLowerCase()
      .replace(/[\\/]$/, '');
    return this.sourceFolder() && this.targetFolder() && src === dst;
  }

  startCopy() {
    const modeText = this.copyAll()
      ? 'ВСЕХ .svg файлов'
      : `ВЫБРАННЫХ (${this.selectedFiles().length}) файлов`;
    this.modal.confirm({
      nzTitle: 'Подтвердите операцию',
      nzContent: `Будет выполнено копирование ${modeText} из [${this.sourceFolder()}] в [${this.targetFolder()}] с префиксом "${
        this.prefix
      }"`,
      nzOnOk: () => this.run(),
    });
  }

  private run() {
    this.processing.set(true);
    const files = this.copyAll() ? [] : this.selectedFiles().map((f) => f.name);

    this.iconDataService
      .bulkRename(files, this.targetFolder(), this.prefix, this.sourceFolder())
      .subscribe({
        next: (resp) => {
          this.processing.set(false);
          this.message.success('Операция завершена!');
          const logs = resp.data.operations.map((op: any) => ({
            success: op.success,
            message: op.success
              ? `✅ ${op.originalName} -> ${op.newName}`
              : `❌ ${op.originalName}: ${op.errorMessage}`,
          }));
          this.results.set([...logs, ...this.results()]);
          // If we were in manual mode, clear selections after success
          if (!this.copyAll()) this.selectedFiles.set([]);
        },
        error: (err) => {
          this.processing.set(false);
          this.message.error(err.error?.message || 'Ошибка сервера');
        },
      });
  }
}
