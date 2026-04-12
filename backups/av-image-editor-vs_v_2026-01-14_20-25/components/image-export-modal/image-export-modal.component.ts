import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NZ_MODAL_DATA, NzModalRef } from 'ng-zorro-antd/modal';
import { lastValueFrom } from 'rxjs';
import { AvImageUploadResult } from '../../models/image-result.model';
import { AvImagePersistenceService } from '../../services/av-image-persistence.service';

/**
 * Промежуточное окно экспорта.
 * Появляется после нажатия "Готово" в редакторе.
 */
@Component({
  selector: 'av-image-export-modal',
  standalone: true,
  imports: [CommonModule, NzButtonModule, NzIconModule],
  template: `
    <div class="export-container">
      <div class="export-header">
        <h3>Готовность к экспорту</h3>
        <p>Проверьте финальное изображение перед сохранением</p>
      </div>

      <div class="export-content">
        <!-- Превью финального результата -->
        <div class="preview-card">
          <div class="img-wrapper">
            <img [src]="data.dataUrl" alt="Export preview" />
          </div>
          <div class="img-info">
            <div class="info-item">
              <span class="label">Файл:</span>
              <span class="value">{{ data.name }}</span>
            </div>
            <div class="info-item">
              <span class="label">Размер:</span>
              <span class="value">{{ data.width }} x {{ data.height }} px</span>
            </div>
            <div class="info-item">
              <span class="label">Вес:</span>
              <span class="value">{{ (data.size / 1024).toFixed(1) }} KB</span>
            </div>
            <div class="info-item" style="margin-top: 8px;">
              <span class="label">SEO Alt:</span>
              <span class="value truncate">{{ data.metadata?.altText || '—' }}</span>
            </div>
          </div>
        </div>

        <!-- Секция действий -->
        <div class="export-actions">
          <button
            nz-button
            nzType="primary"
            nzBlock
            nzSize="large"
            (click)="uploadToServer()"
            [nzLoading]="isUploading"
          >
            <span nz-icon nzType="cloud-upload"></span>
            Отправить на сервер
          </button>

          <button nz-button nzType="default" nzBlock [disabled]="isUploading" (click)="close()">
            Вернуться в редактор
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .export-container {
        padding: 0;
        background: #ffffff;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial,
          sans-serif;
      }
      .export-header {
        padding: 24px 24px 0;
        margin-bottom: 24px;
        text-align: center;
        h3 {
          margin: 0;
          font-size: 20px;
          font-weight: 700;
          color: #1e293b;
        }
        p {
          margin: 4px 0 0;
          color: #64748b;
          font-size: 14px;
        }
      }
      .export-content {
        padding: 0 24px 24px;
      }
      .preview-card {
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        padding: 16px;
        margin-bottom: 24px;
        display: flex;
        gap: 20px;
        align-items: center;

        .img-wrapper {
          width: 120px;
          height: 120px;
          background: #fff;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          border: 1px solid #f1f5f9;
          flex-shrink: 0;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
          img {
            max-width: 100%;
            max-height: 100%;
            object-fit: contain;
          }
        }

        .img-info {
          flex: 1;
          min-width: 0;
        }

        .info-item {
          display: flex;
          gap: 8px;
          margin-bottom: 4px;
          font-size: 13px;
          .label {
            color: #94a3b8;
            font-weight: 500;
            white-space: nowrap;
          }
          .value {
            color: #334155;
            font-weight: 600;
          }
          .truncate {
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
        }
      }
      .export-actions {
        display: flex;
        flex-direction: column;
        gap: 12px;
        button {
          height: 48px;
          border-radius: 8px;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
      }
    `,
  ],
})
export class AvImageExportModalComponent {
  readonly data: AvImageUploadResult = inject(NZ_MODAL_DATA);
  private modalRef = inject(NzModalRef);
  private persistence = inject(AvImagePersistenceService);
  private msg = inject(NzMessageService);

  isUploading = false;

  async uploadToServer() {
    if (!this.data.dataUrl || !this.data.dataUrl.startsWith('data:')) {
      // Если это уже URL (например при редактировании существующей картинки без изменений),
      // то просто возвращаем как есть.
      this.modalRef.close({ ...this.data, isConfirmed: true });
      return;
    }

    this.isUploading = true;

    try {
      const response = await lastValueFrom(this.persistence.saveImage(this.data));

      if (response && response.success) {
        this.msg.success('Изображение успешно сохранено на сервере');
        // Заменяем локальный Base64 на серверный URL
        const result: AvImageUploadResult = {
          ...this.data,
          dataUrl: response.url, // "/uploads/..."
          imageId: response.imageId,
          file: undefined, // Base64 файл больше не нужен, у нас есть ссылка
          isConfirmed: true,
        };
        this.modalRef.close(result);
      } else {
        this.msg.error(response?.message || 'Ошибка сохранения на сервере');
      }
    } catch (err) {
      console.error('Export Upload Error:', err);
      this.msg.error('Не удалось загрузить изображение. Проверьте консоль.');
    } finally {
      this.isUploading = false;
    }
  }

  close() {
    this.modalRef.destroy();
  }
}
