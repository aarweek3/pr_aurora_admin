import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NZ_MODAL_DATA, NzModalRef } from 'ng-zorro-antd/modal';
import { NzSliderModule } from 'ng-zorro-antd/slider';
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
  imports: [
    CommonModule,
    FormsModule,
    NzButtonModule,
    NzIconModule,
    NzCheckboxModule,
    NzInputModule,
    NzSliderModule,
  ],
  template: `
    <div class="exp-modal">
      <!-- HEADER -->
      <div class="exp-header">
        <div class="exp-title">Настройки изображения (Готовность к экспорту)</div>
        <button class="exp-close" (click)="close()"><span nz-icon nzType="close"></span></button>
      </div>

      <div class="exp-body">
        <!-- TOP ROW: PREVIEW & MAIN PARAMS -->
        <div class="exp-section main-params">
          <div class="exp-preview-col">
            <div class="exp-preview-box">
              <img [src]="data.dataUrl" alt="Preview" />
            </div>
          </div>

          <div class="exp-fields-col">
            <div class="exp-row">
              <div class="exp-field flex-3">
                <label>НАЗВАНИЕ ФАЙЛА</label>
                <input nz-input [(ngModel)]="data.name" placeholder="filename" />
              </div>
              <div class="exp-field flex-1">
                <label>РАСШИРЕНИЕ</label>
                <div class="exp-pills">
                  <span
                    class="pill"
                    [class.active]="
                      data.name.toLowerCase().endsWith('.jpg') ||
                      data.name.toLowerCase().endsWith('.jpeg')
                    "
                    >JPG</span
                  >
                  <span class="pill" [class.active]="data.name.toLowerCase().endsWith('.png')"
                    >PNG</span
                  >
                  <span class="pill" [class.active]="data.name.toLowerCase().endsWith('.webp')"
                    >WEBP</span
                  >
                </div>
              </div>
            </div>

            <div class="exp-row" style="margin-top: 15px;">
              <div class="exp-field flex-3">
                <label>КАЧЕСТВО (COMPRESSION)</label>
                <div class="exp-quality-row">
                  <nz-slider
                    [nzMin]="1"
                    [nzMax]="100"
                    [(ngModel)]="tempQuality"
                    style="flex: 1; margin: 0 15px;"
                  ></nz-slider>
                  <input
                    nz-input
                    [(ngModel)]="tempQuality"
                    style="width: 55px; text-align: center;"
                  />
                </div>
              </div>
              <div class="exp-field flex-1">
                <label>РАЗМЕРЫ (PX)</label>
                <div class="exp-static-val">{{ data.width }} x {{ data.height }}</div>
              </div>
              <div class="exp-field flex-1">
                <label>ВЕС (КБ)</label>
                <div class="exp-static-val">{{ (data.size / 1024).toFixed(1) }} KB</div>
              </div>
            </div>

            <div class="exp-row" style="margin-top: 15px;">
              <div class="exp-field" *ngIf="data.metadata">
                <label>РАСПОЛОЖЕНИЕ</label>
                <div class="exp-align-group">
                  <button
                    class="align-btn"
                    [class.active]="data.metadata.align === 'left'"
                    (click)="data.metadata.align = 'left'"
                  >
                    <span nz-icon nzType="align-left"></span>
                  </button>
                  <button
                    class="align-btn"
                    [class.active]="data.metadata.align === 'center'"
                    (click)="data.metadata.align = 'center'"
                  >
                    <span nz-icon nzType="align-center"></span>
                  </button>
                  <button
                    class="align-btn"
                    [class.active]="data.metadata.align === 'right'"
                    (click)="data.metadata.align = 'right'"
                  >
                    <span nz-icon nzType="align-right"></span>
                  </button>
                  <button
                    class="align-btn"
                    [class.active]="data.metadata.align === 'full'"
                    (click)="data.metadata.align = 'full'"
                  >
                    <span nz-icon nzType="column-width"></span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="exp-divider"></div>

        <!-- BOTTOM ROW: SEO & BEHAVIOR -->
        <div class="exp-section secondary-params" *ngIf="data.metadata">
          <div class="exp-col-6">
            <h4 class="sec-title">SEO И АТРИБУТЫ</h4>
            <div class="exp-field">
              <label>Alt текст (Описание)</label>
              <input
                nz-input
                [(ngModel)]="data.metadata.altText"
                placeholder="Описание для поисковиков..."
              />
            </div>
            <div class="exp-field">
              <label>Заголовок (Title)</label>
              <input
                nz-input
                [(ngModel)]="data.metadata.titleText"
                placeholder="Всплывающая подсказка..."
              />
            </div>
            <div class="exp-field">
              <label>Подпись под фото (Caption)</label>
              <textarea
                nz-input
                [(ngModel)]="data.metadata.caption"
                rows="3"
                placeholder="Текст под фото..."
              ></textarea>
            </div>
          </div>

          <div class="exp-col-6" style="border-left: 1px solid #eef2f6; padding-left: 20px;">
            <h4 class="sec-title">ССЫЛКА И ПОВЕДЕНИЕ</h4>
            <div class="exp-field">
              <label>URL ссылки</label>
              <input nz-input [(ngModel)]="data.metadata.linkUrl" placeholder="https://..." />
            </div>
            <div class="exp-row" style="margin-top: 10px;">
              <label nz-checkbox [(ngModel)]="data.metadata.isClickable">Кликабельное</label>
              <label
                nz-checkbox
                [(ngModel)]="data.metadata.isOpenNewWindow"
                style="margin-left: 20px;"
                >В новом окне</label
              >
            </div>
          </div>
        </div>
      </div>

      <!-- FOOTER -->
      <div class="exp-footer">
        <div class="status-info" *ngIf="data">
          NAME: <span>{{ data.name }}</span> | FORMAT:
          <span>{{ data.name.split('.').pop()?.toUpperCase() }}</span> | WEIGHT:
          <span>{{ (data.size / 1024).toFixed(1) }} KB</span> | ALIGN:
          <span>{{ data.metadata?.align || 'Center' }}</span>
        </div>
        <div class="footer-btns">
          <button class="btn-cancel" (click)="close()">Вернуться в редактирование</button>
          <button class="btn-submit" (click)="uploadToServer()" [disabled]="isUploading">
            <span nz-icon nzType="cloud-upload" *ngIf="!isUploading"></span>
            {{ isUploading ? 'Сохранение...' : 'Вставить картинку в редактор' }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .exp-modal {
        background: #fff;
        color: #1a202c;
        display: flex;
        flex-direction: column;
        height: auto;
      }
      .exp-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 20px;
        background: #f8fafc;
        border-bottom: 1px solid #e2e8f0;
        .exp-title {
          font-weight: 700;
          font-size: 14px;
          color: #334155;
          text-transform: uppercase;
        }
        .exp-close {
          border: none;
          background: none;
          cursor: pointer;
          color: #94a3b8;
          font-size: 18px;
          &:hover {
            color: #1e293b;
          }
        }
      }
      .exp-body {
        padding: 20px;
        flex: 1;
      }
      .exp-section {
        display: flex;
        gap: 20px;
      }
      .exp-preview-col {
        width: 180px;
        flex-shrink: 0;
      }
      .exp-preview-box {
        width: 180px;
        height: 240px;
        background: #f1f5f9;
        border: 1px solid #cbd5e1;
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
        img {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
        }
      }
      .exp-fields-col {
        flex: 1;
      }
      .exp-row {
        display: flex;
        gap: 15px;
        align-items: flex-end;
      }
      .exp-col-6 {
        flex: 1;
      }
      .flex-3 {
        flex: 3;
      }
      .flex-1 {
        flex: 1;
      }
      .exp-field {
        margin-bottom: 12px;
        label {
          display: block;
          font-size: 10px;
          font-weight: 700;
          color: #64748b;
          text-transform: uppercase;
          margin-bottom: 5px;
        }
      }
      .exp-pills {
        display: flex;
        gap: 5px;
        .pill {
          padding: 4px 10px;
          border: 1px solid #e2e8f0;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 600;
          color: #94a3b8;
          &.active {
            background: #e0f2fe;
            border-color: #3b82f6;
            color: #2563eb;
          }
        }
      }
      .exp-static-val {
        font-size: 14px;
        font-weight: 700;
        color: #1e293b;
        height: 32px;
        display: flex;
        align-items: center;
      }
      .exp-quality-row {
        display: flex;
        align-items: center;
        width: 100%;
      }
      .exp-align-group {
        display: flex;
        gap: 5px;
        .align-btn {
          width: 36px;
          height: 32px;
          border: 1px solid #e2e8f0;
          background: #fff;
          border-radius: 4px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #64748b;
          transition: all 0.2s;
          &:hover {
            background: #f8fafc;
          }
          &.active {
            background: #3b82f6;
            color: #fff;
            border-color: #2563eb;
          }
        }
      }
      .exp-divider {
        height: 1px;
        background: #eef2f6;
        margin: 20px 0;
      }
      .sec-title {
        font-size: 12px;
        font-weight: 700;
        color: #334155;
        margin-bottom: 15px;
        text-transform: uppercase;
      }
      .exp-footer {
        background: #f8fafc;
        border-top: 1px solid #e2e8f0;
        padding: 12px 20px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        .status-info {
          font-family: monospace;
          font-size: 11px;
          color: #64748b;
          font-weight: 600;
          span {
            color: #2563eb;
          }
        }
        .footer-btns {
          display: flex;
          gap: 10px;
        }
      }
      .btn-cancel {
        background: #fff;
        border: 1px solid #cbd5e1;
        border-radius: 4px;
        padding: 8px 16px;
        font-size: 13px;
        font-weight: 600;
        color: #475569;
        cursor: pointer;
        transition: all 0.2s;
        &:hover {
          background: #f1f5f9;
        }
      }
      .btn-submit {
        background: #2563eb;
        border: none;
        color: #fff;
        border-radius: 4px;
        padding: 8px 20px;
        font-size: 13px;
        font-weight: 700;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 8px;
        transition: all 0.2s;
        &:hover {
          background: #1d4ed8;
        }
        &:disabled {
          opacity: 0.6;
          cursor: not-allowed;
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
  tempQuality = 90;

  constructor() {
    this.tempQuality = this.data.metadata?.quality || 90;
    // Инициализируем metadata если её нет
    if (!this.data.metadata) {
      this.data.metadata = { align: 'center' };
    }
    if (!this.data.metadata.align) {
      this.data.metadata.align = 'center';
    }
  }

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
