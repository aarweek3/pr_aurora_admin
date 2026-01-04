import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IconLaboratoryService } from '@shared/services/icon-laboratory.service';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzListModule } from 'ng-zorro-antd/list';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { IconComponent } from '../../../app/shared/components/ui/icon/icon.component';

@Component({
  selector: 'av-test-file-browser',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IconComponent,
    NzButtonModule,
    NzInputModule,
    NzModalModule,
    NzSpinModule,
    NzCardModule,
    NzListModule,
    NzBreadCrumbModule,
  ],
  template: `
    <div style="padding: 24px; max-width: 1000px; margin: 0 auto;">
      <nz-card nzTitle="🚀 Тест Серверного Браузера Файлов" [nzExtra]="extraTemplate">
        <div style="display: flex; flex-direction: column; gap: 20px;">
          <!-- Главный Контрол -->
          <div class="control-section">
            <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #475569;"
              >Выбранный путь на сервере:</label
            >
            <div style="display: flex; gap: 8px;">
              <input
                nz-input
                [value]="selectedPath()"
                readonly
                placeholder="Путь не выбран"
                style="background: #f8fafc;"
              />
              <button nz-button nzType="primary" (click)="openBrowser()">
                <av-icon type="actions/av_eye" [size]="16" style="margin-right: 8px;"></av-icon>
                Обзор сервера...
              </button>
            </div>
          </div>

          <!-- Лог событий -->
          <div class="log-section" style="margin-top: 20px;">
            <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #475569;"
              >Журнал действий:</label
            >
            <div
              style="height: 200px; overflow-y: auto; background: #1e293b; color: #38bdf8; padding: 12px; border-radius: 8px; font-family: monospace; font-size: 13px;"
            >
              @for (log of actionLogs(); track $index) {
              <div style="margin-bottom: 4px;">
                <span style="color: #94a3b8;">[{{ log.time }}]</span> {{ log.message }}
              </div>
              } @if (actionLogs().length === 0) {
              <div style="color: #64748b;">Ожидание действий...</div>
              }
            </div>
          </div>
        </div>
      </nz-card>

      <!-- Модальное окно браузера -->
      <nz-modal
        [(nzVisible)]="isBrowserOpen"
        nzTitle="Проводник сервера"
        (nzOnCancel)="isBrowserOpen.set(false)"
        [nzFooter]="browserFooter"
        nzWidth="800px"
      >
        <ng-container *nzModalContent>
          <div class="browser-wrapper">
            <!-- Тулбар -->
            <div style="display: flex; gap: 8px; margin-bottom: 16px;">
              <button nz-button (click)="goUp()" title="Назад" [disabled]="!currentPath()">
                <av-icon type="av_arrow_left" [size]="16"></av-icon>
              </button>
              <button nz-button (click)="loadPath('')" title="К дискам">
                <av-icon type="av_e_hard-drive" [size]="16"></av-icon>
              </button>
              <input
                nz-input
                [value]="currentPath() || 'Список дисков'"
                readonly
                style="flex: 1;"
              />
              <button
                nz-button
                nzType="dashed"
                (click)="toggleCreateFolder()"
                title="Создать папку"
              >
                <av-icon type="actions/av_add" [size]="16"></av-icon>
              </button>
            </div>

            <!-- Режим создания папки -->
            @if (isCreatingFolder()) {
            <div
              style="margin-bottom: 16px; padding: 12px; background: #f0f7ff; border: 1px solid #bae7ff; border-radius: 4px; display: flex; gap: 8px;"
            >
              <input
                nz-input
                placeholder="Имя новой папки"
                [(ngModel)]="newFolderName"
                (keyup.enter)="createFolder()"
                #folderInput
              />
              <button nz-button nzType="primary" (click)="createFolder()" [nzLoading]="isLoading()">
                Создать
              </button>
              <button nz-button (click)="isCreatingFolder.set(false)">Отмена</button>
            </div>
            }

            <!-- Список элементов -->
            <div
              class="browser-scroll"
              style="height: 400px; overflow-y: auto; border: 1px solid #f1f5f9; border-radius: 6px;"
            >
              @if (isLoading()) {
              <div
                style="display: flex; justify-content: center; align-items: center; height: 100%;"
              >
                <nz-spin nzSimple></nz-spin>
              </div>
              } @else {
              <div style="display: grid; grid-template-columns: 1fr;">
                @for (item of items(); track item.path) {
                <div
                  (click)="item.type !== 'file' ? loadPath(item.path) : null"
                  style="display: flex; align-items: center; padding: 10px 16px; cursor: pointer; border-bottom: 1px solid #f8fafc;"
                  class="hover-item"
                >
                  <av-icon
                    [type]="
                      item.type === 'drive'
                        ? 'av_e_hard-drive'
                        : item.type === 'folder'
                        ? 'av_folder'
                        : 'av_file'
                    "
                    [size]="20"
                    [style.color]="
                      item.type === 'drive'
                        ? '#6366f1'
                        : item.type === 'folder'
                        ? '#3b82f6'
                        : '#94a3b8'
                    "
                    style="margin-right: 12px;"
                  ></av-icon>
                  <span style="flex: 1;">{{ item.name }}</span>
                  @if (item.type !== 'file') {
                  <button
                    nz-button
                    nzType="link"
                    (click)="$event.stopPropagation(); selectPath(item.path)"
                  >
                    Выбрать
                  </button>
                  }
                </div>
                }
              </div>
              }
            </div>
          </div>
        </ng-container>
        <ng-template #browserFooter>
          <button nz-button (click)="isBrowserOpen.set(false)">Закрыть</button>
          <button
            nz-button
            nzType="primary"
            (click)="selectPath(currentPath())"
            [disabled]="!currentPath()"
          >
            Выбрать текущую
          </button>
        </ng-template>
      </nz-modal>

      <ng-template #extraTemplate>
        <span style="color: #10b981; font-weight: bold;">v1.0.0-TEST</span>
      </ng-template>
    </div>
  `,
  styles: [
    `
      .hover-item:hover {
        background: #f1f5f9;
      }
      .browser-scroll::-webkit-scrollbar {
        width: 6px;
      }
      .browser-scroll::-webkit-scrollbar-thumb {
        background: #cbd5e1;
        border-radius: 3px;
      }
    `,
  ],
})
export class TestFileBrowserComponent {
  private iconLabService = inject(IconLaboratoryService);
  private message = inject(NzMessageService);

  // Состояние браузера
  isBrowserOpen = signal(false);
  currentPath = signal('');
  items = signal<any[]>([]);
  isLoading = signal(false);

  // Результат и Логи
  selectedPath = signal('');
  actionLogs = signal<{ time: string; message: string }[]>([]);

  // Создание папки
  isCreatingFolder = signal(false);
  newFolderName = '';

  addLog(msg: string) {
    const time = new Date().toLocaleTimeString();
    this.actionLogs.update((prev) => [{ time, message: msg }, ...prev].slice(0, 50));
  }

  openBrowser() {
    this.isBrowserOpen.set(true);
    this.addLog('Открыт браузер файлов');
    this.loadPath(this.selectedPath() || '');
  }

  loadPath(path: string) {
    this.isLoading.set(true);
    this.currentPath.set(path);
    this.isCreatingFolder.set(false);

    this.iconLabService.browseFileSystem(path).subscribe({
      next: (res) => {
        this.items.set(res);
        this.isLoading.set(false);
        this.addLog(`Переход: ${path || 'Список дисков'}`);
      },
      error: (err) => {
        this.message.error('Ошибка доступа к директории');
        this.isLoading.set(false);
        this.addLog(`❌ Ошибка доступа: ${path}`);
      },
    });
  }

  goUp() {
    const current = this.currentPath();
    if (!current) return;

    if (current.length <= 3) {
      this.loadPath('');
      return;
    }

    const lastSlash = Math.max(current.lastIndexOf('/'), current.lastIndexOf('\\'));
    if (lastSlash > 0) {
      let parent = current.substring(0, lastSlash);
      if (parent.endsWith(':')) parent += '/';
      this.loadPath(parent);
    } else {
      this.loadPath('');
    }
  }

  selectPath(path: string) {
    if (!path) return;
    this.selectedPath.set(path);
    this.isBrowserOpen.set(false);
    this.addLog(`✅ ВЫБРАН ПУТЬ: ${path}`);
    this.message.success('Путь успешно выбран');
  }

  toggleCreateFolder() {
    if (!this.currentPath()) {
      this.message.warning('Сначала выберите диск');
      return;
    }
    this.isCreatingFolder.update((v) => !v);
  }

  createFolder() {
    const name = this.newFolderName.trim();
    if (!name) return;

    const current = this.currentPath();
    const fullPath =
      current.endsWith('/') || current.endsWith('\\') ? current + name : current + '/' + name;

    this.isLoading.set(true);
    this.iconLabService.createDirectory(fullPath).subscribe({
      next: () => {
        this.message.success(`Папка "${name}" создана`);
        this.addLog(`📁 Создана папка: ${name}`);
        this.newFolderName = '';
        this.isCreatingFolder.set(false);
        this.loadPath(current);
      },
      error: () => {
        this.message.error('Ошибка при создании папки');
        this.isLoading.set(false);
      },
    });
  }
}
