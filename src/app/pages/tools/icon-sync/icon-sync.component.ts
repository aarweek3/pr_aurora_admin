import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { LoggerConsoleService } from '../../../shared/logger-console/services/logger-console.service';
import { IconDataService } from '@core/services/icon/icon-data.service';

@Component({
  selector: 'av-icon-sync',
  standalone: true,
  imports: [CommonModule, NzButtonModule, NzIconModule, NzSpinModule],
  template: `
    <div class="sync-wrapper">
      <!-- Background Decorative Elements -->
      <div class="blob blob-1"></div>
      <div class="blob blob-2"></div>

      <div class="sync-glass">
        <div class="sync-header">
          <div class="title-group">
            <div class="title-icon">
              <span nz-icon nzType="sync" [nzSpin]="isSyncing()"></span>
            </div>
            <div class="title-text">
              <h1>Синхронизация иконок</h1>
              <p>Обновление базы данных и реестра на основе файлов в src/assets/icons</p>
            </div>
          </div>
          <div class="actions">
            <button
              nz-button
              nzType="primary"
              [nzLoading]="isSyncing()"
              (click)="startSync()"
              class="sync-btn"
            >
              <span nz-icon nzType="cloud-sync" *ngIf="!isSyncing()"></span>
              {{ isSyncing() ? 'Синхронизация...' : 'Начать синхронизацию' }}
            </button>
          </div>
        </div>

        <div class="sync-content">
          <div class="stats-grid" *ngIf="result()">
            <div class="stat-card">
              <span class="label">Категорий</span>
              <span class="value">{{ result()?.categoriesProcessed || 0 }}</span>
            </div>
            <div class="stat-card">
              <span class="label">Иконок</span>
              <span class="value">{{ result()?.iconsProcessed || 0 }}</span>
            </div>
            <div class="stat-card">
              <span class="label">Статус</span>
              <span class="value" [class.success]="result()?.success">
                {{ result()?.success ? 'Готово' : 'Ошибка' }}
              </span>
            </div>
          </div>

          <div class="log-container shadow-sm">
            <div class="log-header">
              <span>Логи процесса</span>
              <div class="log-actions">
                <button class="log-btn" (click)="copyLogs()" [disabled]="logs().length === 0">
                  <span nz-icon nzType="copy"></span> Копировать
                </button>
                <button class="log-btn" (click)="clearLogs()" [disabled]="logs().length === 0">
                  <span nz-icon nzType="delete"></span> Очистить
                </button>
              </div>
            </div>
            <div class="log-viewport" #logViewport>
              <div
                *ngFor="let log of logs()"
                class="log-entry"
                [class.error]="log.message.includes('❌')"
              >
                <span class="timestamp">[{{ log.timestamp }}]</span>
                <span class="message">{{ log.message }}</span>
              </div>
              <div *ngIf="logs().length === 0" class="empty-logs">
                <span nz-icon nzType="info-circle" style="font-size: 32px"></span>
                <p>Нажмите «Начать синхронизацию» для запуска процесса</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .sync-wrapper {
        position: relative;
        min-height: 100%;
        padding: 40px;
        background: #f8fafc;
        overflow: hidden;
      }

      .blob {
        position: absolute;
        filter: blur(80px);
        z-index: 0;
        opacity: 0.5;
        border-radius: 50%;
      }

      .blob-1 {
        width: 400px;
        height: 400px;
        background: #6366f1;
        top: -100px;
        right: -100px;
        animation: float 20s infinite alternate;
      }

      .blob-2 {
        width: 300px;
        height: 300px;
        background: #ec4899;
        bottom: -50px;
        left: -50px;
        animation: float 15s infinite alternate-reverse;
      }

      @keyframes float {
        from {
          transform: translate(0, 0) scale(1);
        }
        to {
          transform: translate(50px, 50px) scale(1.1);
        }
      }

      .sync-glass {
        position: relative;
        z-index: 1;
        background: rgba(255, 255, 255, 0.7);
        backdrop-filter: blur(20px);
        border: 1px solid rgba(255, 255, 255, 0.8);
        border-radius: 24px;
        max-width: 1000px;
        margin: 0 auto;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        box-shadow: 0 20px 50px rgba(0, 0, 0, 0.05);
      }

      .sync-header {
        padding: 32px 40px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid #f1f5f9;
        background: rgba(255, 255, 255, 0.5);
      }

      .title-group {
        display: flex;
        align-items: center;
        gap: 20px;
      }

      .title-icon {
        width: 48px;
        height: 48px;
        background: #6366f1;
        color: white;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 8px 16px rgba(99, 102, 241, 0.3);
      }

      .title-text h1 {
        margin: 0;
        font-size: 24px;
        font-weight: 800;
        color: #1e293b;
        letter-spacing: -0.5px;
      }

      .title-text p {
        margin: 4px 0 0;
        color: #64748b;
        font-size: 14px;
      }

      .sync-btn {
        height: 44px;
        padding: 0 24px;
        border-radius: 12px;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 10px;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }

      .sync-content {
        padding: 40px;
        display: flex;
        flex-direction: column;
        gap: 32px;
      }

      .stats-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 24px;
      }

      .stat-card {
        background: white;
        padding: 24px;
        border-radius: 16px;
        display: flex;
        flex-direction: column;
        gap: 8px;
        border: 1px solid #f1f5f9;
        transition: transform 0.3s;
      }

      .stat-card:hover {
        transform: translateY(-4px);
      }

      .stat-card .label {
        font-size: 12px;
        font-weight: 700;
        color: #94a3b8;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .stat-card .value {
        font-size: 32px;
        font-weight: 800;
        color: #1e293b;
      }

      .stat-card .value.success {
        color: #10b981;
      }

      .log-container {
        flex: 1;
        background: #1e293b;
        border-radius: 16px;
        display: flex;
        flex-direction: column;
        overflow: hidden;
      }

      .log-header {
        background: #0f172a;
        padding: 12px 20px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        color: #94a3b8;
        font-size: 12px;
        font-weight: 600;
      }

      .log-actions {
        display: flex;
        gap: 8px;
      }

      .log-btn {
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid #334155;
        color: #94a3b8;
        padding: 4px 10px;
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.2s;
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 11px;
      }

      .log-btn:hover:not(:disabled) {
        color: white;
        border-color: #475569;
        background: rgba(255, 255, 255, 0.1);
      }

      .log-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .log-viewport {
        height: 400px;
        overflow-y: auto;
        padding: 20px;
        font-family: 'JetBrains Mono', 'Fira Code', monospace;
        font-size: 13px;
        line-height: 1.6;
      }

      .log-entry {
        margin-bottom: 4px;
        display: flex;
        gap: 12px;
      }

      .log-entry .timestamp {
        color: #64748b;
        flex-shrink: 0;
      }

      .log-entry .message {
        color: #e2e8f0;
      }

      .log-entry.error .message {
        color: #fca5a5;
      }

      .empty-logs {
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        color: #475569;
        gap: 16px;
      }

      .empty-logs p {
        margin: 0;
        font-size: 14px;
      }
    `,
  ],
})
export class IconSyncComponent {
  private iconLabService = inject(IconDataService);
  private message = inject(NzMessageService);
  private logger = inject(LoggerConsoleService).getLogger('IconSync');

  private readonly STORAGE_KEY = 'av_icon_sync_state';

  isSyncing = signal(false);
  logs = signal<{ message: string; timestamp: string }[]>([]);
  result = signal<any>(null);

  constructor() {
    this.restoreState();
  }

  private saveState() {
    const state = {
      logs: this.logs(),
      result: this.result(),
    };
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(state));
  }

  private restoreState() {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    if (saved) {
      try {
        const state = JSON.parse(saved);
        if (state.logs) this.logs.set(state.logs);
        if (state.result) this.result.set(state.result);
        this.logger.info('Состояние синхронизации восстановлено из localStorage');
      } catch (e) {
        localStorage.removeItem(this.STORAGE_KEY);
      }
    }
  }

  startSync() {
    if (this.isSyncing()) return;

    this.isSyncing.set(true);
    this.logs.set([{ message: '🔄 Запуск синхронизации...', timestamp: this.getNow() }]);
    this.saveState();
    this.result.set(null);
    this.logger.info('Пользователь запустил синхронизацию иконок');

    this.iconLabService.syncIcons().subscribe({
      next: (res: any) => {
        const serverLogs = res.logs || res.Logs;
        const now = this.getNow();

        if (serverLogs && Array.isArray(serverLogs)) {
          const formatted = serverLogs.map((m: string) => ({
            message: m,
            timestamp: now,
          }));
          this.logs.set(formatted);
        } else {
          this.addLog('✅ Синхронизация завершена (отчет от сервера пуст)');
        }

        this.result.set(res);
        this.saveState(); // Важно: сохраняем результат сразу
        this.isSyncing.set(false);
        this.logger.info('Синхронизация успешно завершена', res);
      },
      error: (err) => {
        this.addLog(`❌ Ошибка: ${err.message || 'Неизвестная ошибка сервера'}`);
        this.saveState();
        this.isSyncing.set(false);
        this.logger.error('Ошибка синхронизации', err);
      },
    });
  }

  addLog(msg: string) {
    const entry = { message: msg, timestamp: this.getNow() };
    this.logs.update((prev) => [...prev, entry]);
    this.saveState();
    this.logger.info(msg);
  }

  clearLogs() {
    this.logs.set([]);
    this.result.set(null);
    localStorage.removeItem(this.STORAGE_KEY);
  }

  copyLogs() {
    const text = this.logs()
      .map((log) => `[${log.timestamp}] ${log.message}`)
      .join('\n');
    navigator.clipboard.writeText(text).then(() => {
      this.message.success('Логи скопированы в буфер обмена');
    });
  }

  getNow() {
    return new Date().toLocaleTimeString();
  }
}
