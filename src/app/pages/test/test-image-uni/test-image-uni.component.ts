import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild, inject, signal } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AvUniversalUploadModalComponent } from '@shared/components/av-universal-upload-modal/av-universal-upload-modal.component';
import { HelpPathHeaderComponent } from '@shared/components/ui';
import {
  ImageServiceUniversal,
  MediaUploadResponse,
} from '@shared/services/image-service-universal.service';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzTypographyModule } from 'ng-zorro-antd/typography';

/**
 * Тестовый компонент для проверки универсальной системы загрузки изображений.
 * Реализует паттерн, описанный в документации Aurora v3.5.
 */
@Component({
  selector: 'app-test-image-uni',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NzCardModule,
    NzButtonModule,
    NzInputModule,
    NzIconModule,
    NzAlertModule,
    NzTypographyModule,
    NzTagModule,
    NzModalModule,
    HelpPathHeaderComponent,
  ],
  template: `
    <div class="test-container">
      <av-help-path-header
        title="Test Image UNI"
        subtitle="Экспериментальный стенд для проверки ImageServiceUniversal и UniversalMediaController."
        icon="🖼️"
        componentPath="src/app/pages/test/test-image-uni/test-image-uni.component.ts"
      ></av-help-path-header>

      <div class="content-grid">
        <!-- Левая часть: Управление -->
        <div class="control-panel">
          <nz-card nzTitle="Настройки загрузки" [nzBordered]="false" class="glass-card">
            <div class="field-item">
              <label>Папка на сервере (folder):</label>
              <input
                nz-input
                [ngModel]="targetFolder()"
                (ngModelChange)="targetFolder.set($event)"
                placeholder="Напр. general или avatars/users"
              />
              <div class="hint">
                Файл будет сохранен в: <strong>uploads/{{ targetFolder() || 'general' }}</strong>
              </div>
            </div>

            <div class="field-item" style="margin-top: 20px;">
              <div class="test-controls">
                <input
                  #fileInput
                  type="file"
                  (change)="onFileSelected($event)"
                  accept="image/*"
                  style="display: none"
                />

                <div class="btns-row">
                  <button
                    nz-button
                    nzType="default"
                    (click)="fileInput.click()"
                    [disabled]="isUploading()"
                  >
                    <span nz-icon nzType="file-image"></span>
                    1. Выбрать картинку
                  </button>

                  <button
                    nz-button
                    nzType="primary"
                    (click)="onSave()"
                    [disabled]="!selectedFile() || isUploading()"
                  >
                    <span nz-icon [nzType]="isUploading() ? 'loading' : 'save'"></span>
                    2. Сохранить на диск
                  </button>
                </div>
                <div *ngIf="selectedFile()" style="margin-top: 8px; font-size: 12px; color: #666;">
                  Выбран файл: <strong>{{ selectedFile()?.name }}</strong>
                </div>
              </div>
            </div>

            <div class="field-item" style="margin-top: 24px;">
              <label>Альтернативный метод:</label>
              <button
                nz-button
                nzType="dashed"
                nzBlock
                style="height: 48px;"
                (click)="openUploadModal()"
              >
                <span nz-icon nzType="appstore-add"></span>
                Открыть универсальное модальное окно
              </button>
            </div>

            <div class="field-item" style="margin-top: 24px;" *ngIf="lastResponse()">
              <label>Результат ответа (relativePath):</label>
              <nz-input-group [nzSuffix]="copyIcon">
                <input nz-input [value]="lastResponse()?.relativePath" readonly />
              </nz-input-group>
              <ng-template #copyIcon>
                <i nz-icon nzType="copy" style="cursor: pointer" (click)="copyPath()"></i>
              </ng-template>
            </div>
          </nz-card>

          <nz-alert
            *ngIf="error()"
            nzType="error"
            [nzMessage]="error()"
            nzShowIcon
            style="margin-top: 16px;"
          ></nz-alert>
        </div>

        <!-- Правая часть: Предпросмотр -->
        <div class="preview-panel">
          <nz-card nzTitle="Предпросмотр (Live Preview)" [nzBordered]="false" class="glass-card">
            <div class="image-wrapper">
              <img
                [src]="imgService.getAssetUrl(lastResponse()?.relativePath)"
                alt="Uploaded preview"
                class="main-preview"
              />
            </div>

            <div class="image-info" *ngIf="lastResponse()">
              <div class="info-row">
                <span class="label">Full URL:</span>
                <a [href]="lastResponse()?.fullUrl" target="_blank" class="value link">
                  {{ lastResponse()?.fullUrl }}
                  <i nz-icon nzType="external-link"></i>
                </a>
              </div>
              <div class="info-row">
                <span class="label">Размер:</span>
                <nz-tag nzColor="blue" class="value"
                  >{{ (lastResponse()?.size ?? 0) / 1024 | number: '1.0-2' }} KB</nz-tag
                >
              </div>
              <div class="info-row">
                <span class="label">Имя:</span>
                <span class="value">{{ lastResponse()?.fileName }}</span>
              </div>
            </div>
          </nz-card>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .test-container {
        padding: 24px;
        max-width: 1300px;
        margin: 0 auto;
      }
      .content-grid {
        display: grid;
        grid-template-columns: 450px 1fr;
        gap: 24px;
        margin-top: 24px;
      }
      .glass-card {
        background: rgba(255, 255, 255, 0.7);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.3);
        border-radius: 16px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.05);
      }
      .field-item label {
        display: block;
        margin-bottom: 8px;
        font-weight: 600;
        color: #1e293b;
      }
      .hint {
        display: block;
        margin-top: 4px;
        font-size: 12px;
        color: #64748b;
      }
      .upload-actions {
        display: flex;
        gap: 12px;
      }
      .image-wrapper {
        width: 100%;
        height: 300px;
        background: #f8fafc;
        border: 1px dashed #cbd5e1;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
        margin-bottom: 20px;
      }
      .btns-row {
        display: flex;
        gap: 12px;
        align-items: center;
      }
      .test-controls {
        background: #f1f5f9;
        padding: 16px;
        border-radius: 12px;
        border: 1px solid #e2e8f0;
      }
      .main-preview {
        max-width: 100%;
        max-height: 100%;
        object-fit: contain;
      }
      .image-info {
        display: flex;
        flex-direction: column;
        gap: 12px;
        padding-top: 16px;
        border-top: 1px solid #e2e8f0;
      }
      .info-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 13px;
      }
      .info-row .label {
        color: #64748b;
        font-weight: 500;
      }
      .info-row .value {
        color: #1e293b;
        font-weight: 600;
      }
      .link {
        color: #2563eb;
        text-decoration: none;
      }
      .link:hover {
        text-decoration: underline;
      }
    `,
  ],
})
export class TestImageUniComponent {
  public imgService = inject(ImageServiceUniversal);
  private message = inject(NzMessageService);
  private modal = inject(NzModalService);

  // Сигналы для управления состоянием
  targetFolder = signal<string>('general');
  selectedFile = signal<File | null>(null);
  isUploading = signal<boolean>(false);
  lastResponse = signal<MediaUploadResponse | null>(null);
  error = signal<string | null>(null);

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  onFileSelected(event: any): void {
    const file = event.target.files?.[0];
    if (!file) return;

    this.selectedFile.set(file);
    this.lastResponse.set(null); // Сбрасываем старый ответ

    console.group('[TestImageUni] ФАЙЛ ВЫБРАН (ОЖИДАНИЕ СОХРАНЕНИЯ)');
    console.log('Данные файла:', {
      name: file.name,
      size: `${(file.size / 1024).toFixed(2)} KB`,
      type: file.type,
    });
    console.groupEnd();

    this.message.info(`Файл "${file.name}" готов к сохранению`);
  }

  onSave(): void {
    const file = this.selectedFile();
    if (!file) return;

    const startTime = performance.now();
    console.group('[TestImageUni] ПРОЦЕСС СОХРАНЕНИЯ (Base64)');
    console.log('1. Отправка на:', this.targetFolder());
    console.groupEnd();

    this.isUploading.set(true);
    this.error.set(null);

    this.imgService.upload(file, this.targetFolder()).subscribe({
      next: (res) => {
        const endTime = performance.now();
        console.log(`[TestImageUni] ✅ Сохранено! Время: ${(endTime - startTime).toFixed(1)}ms`);
        console.log('[TestImageUni] Ответ сервера:', res);

        this.lastResponse.set(res);
        this.isUploading.set(false);
        this.selectedFile.set(null); // Сбрасываем после успеха
        this.message.success('Файл успешно сохранен на сервере!');
      },
      error: (err) => {
        console.error('[TestImageUni] ❌ Ошибка:', err);
        this.error.set(err.message || 'Ошибка при сохранении');
        this.isUploading.set(false);
        this.message.error('Ошибка сохранения');
      },
    });
  }

  copyPath(): void {
    const path = this.lastResponse()?.relativePath;
    if (path) {
      navigator.clipboard.writeText(path);
      this.message.info('Путь скопирован в буфер обмена');
    }
  }

  /**
   * Демонстрация вызова универсального модального окна
   */
  openUploadModal(): void {
    const modalRef = this.modal.create({
      nzContent: AvUniversalUploadModalComponent,
      nzData: {
        folder: this.targetFolder(),
        title: 'Универсальный загрузчик изображения',
        placeholder: 'Выберите фото для вашего проекта',
      },
      nzFooter: null,
      nzWidth: 700,
      nzClassName: 'aurora-modal-glass',
    });

    modalRef.afterClose.subscribe((result: MediaUploadResponse | undefined) => {
      if (result) {
        console.log('[TestImageUni] Модал вернул результат:', result);
        this.lastResponse.set(result);
        this.message.success(`Файл "${result.fileName}" загружен через модал!`);
      }
    });
  }
}
