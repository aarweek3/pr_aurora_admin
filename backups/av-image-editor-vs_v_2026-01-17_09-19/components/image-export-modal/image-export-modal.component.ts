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
import { AvImageEditorOutput, AvImageUploadResult } from '../../models/image-result.model';
import { AvImagePersistenceService } from '../../services/av-image-persistence.service';
import { AvImageSnippetService } from '../../services/av-image-snippet.service';

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
      <div class="exp-body">
        <!-- TOP ROW: PREVIEW & MAIN PARAMS -->
        <div class="exp-section main-params">
          <div class="exp-preview-col">
            <div
              class="exp-preview-box"
              [class.is-container]="containerEnabled"
              [style.width.px]="containerEnabled ? 180 : 180"
              [style.height.px]="containerEnabled ? 240 : 240"
            >
              <img [src]="data.dataUrl" alt="Preview" />
            </div>
            <div class="preview-hint" *ngIf="containerEnabled">Preview (Scaled for Modal)</div>
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
                    [class.active]="currentFormat === 'image/jpeg'"
                    (click)="changeFormat('image/jpeg')"
                    >JPG</span
                  >
                  <span
                    class="pill"
                    [class.active]="currentFormat === 'image/png'"
                    (click)="changeFormat('image/png')"
                    >PNG</span
                  >
                  <span
                    class="pill"
                    [class.active]="currentFormat === 'image/webp'"
                    (click)="changeFormat('image/webp')"
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
                    (nzOnAfterChange)="onQualityChange()"
                    [nzDisabled]="currentFormat === 'image/png'"
                    style="flex: 1; margin: 0 15px;"
                  ></nz-slider>
                  <input
                    nz-input
                    [(ngModel)]="tempQuality"
                    (blur)="onQualityChange()"
                    [disabled]="currentFormat === 'image/png'"
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

        <!-- ROW 2.5: CONTAINER SETTINGS -->
        <div class="exp-section container-settings">
          <div class="exp-field" style="margin-bottom: 0;">
            <label nz-checkbox [(ngModel)]="containerEnabled" class="bold-check"
              >ВКЛЮЧИТЬ КОНТЕЙНЕР (FIXED FRAME)</label
            >
          </div>

          <div class="container-controls" *ngIf="containerEnabled">
            <div class="exp-row">
              <div class="exp-field">
                <label>ШИРИНА КОНТЕЙНЕРА (PX)</label>
                <input nz-input type="number" [(ngModel)]="containerWidth" style="width: 100px;" />
              </div>
              <div class="exp-field">
                <label>ВЫСОТА КОНТЕЙНЕРА (PX)</label>
                <input nz-input type="number" [(ngModel)]="containerHeight" style="width: 100px;" />
              </div>
              <div class="exp-field">
                <label>ПРЕСЕТЫ РАЗМЕРОВ</label>
                <div class="exp-pills">
                  <span
                    *ngFor="let p of containerPresets"
                    class="pill"
                    [class.active]="containerWidth === p.w && containerHeight === p.h"
                    (click)="applyContainerPreset(p)"
                  >
                    {{ p.label }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

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
        transition: all 0.3s ease;

        img {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
          transition: all 0.3s ease;
        }

        &.is-container {
          border: 2px solid #3b82f6;
          box-shadow: 0 0 10px rgba(59, 130, 246, 0.2);
          background: #fff;
          position: relative;

          &::before {
            content: 'CONTAINER';
            position: absolute;
            top: 2px;
            left: 5px;
            font-size: 8px;
            font-weight: 900;
            color: #3b82f6;
            z-index: 10;
          }

          img {
            padding: 5px;
          }
        }
      }

      .preview-hint {
        font-size: 9px;
        color: #94a3b8;
        text-align: center;
        margin-top: 4px;
        text-transform: uppercase;
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

          &[nz-checkbox] {
            display: inline-flex;
            align-items: center;
            text-transform: none;
          }
        }
        .bold-check {
          font-size: 11px;
          font-weight: 800;
          color: #334155;
        }
      }
      .exp-pills {
        display: flex;
        gap: 5px;
        .pill {
          padding: 4px 12px;
          border: 1px solid #e2e8f0;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 700;
          color: #94a3b8;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          user-select: none;

          &:hover {
            border-color: #cbd5e1;
            background: #f8fafc;
            color: #64748b;
          }

          &:active {
            transform: scale(0.95);
          }

          &.active {
            background: #e0f2fe;
            border-color: #3b82f6;
            color: #2563eb;
            box-shadow: 0 0 0 1px rgba(59, 130, 246, 0.1);
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
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

          &:hover {
            background: #f8fafc;
            border-color: #cbd5e1;
            color: #1e293b;
          }

          &:active {
            transform: translateY(1px);
          }

          &.active {
            background: #3b82f6;
            color: #fff;
            border-color: #2563eb;
            box-shadow: 0 2px 4px rgba(37, 99, 235, 0.2);
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

      .container-settings {
        background: #f0f7ff;
        padding: 12px 20px;
        border-radius: 6px;
        display: block !important;
        border-left: 4px solid #3b82f6;

        .container-controls {
          margin-top: 15px;
          padding-top: 15px;
          border-top: 1px dashed #cfe2f3;
        }
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
          border-color: #94a3b8;
          color: #1e293b;
        }

        &:active {
          background: #e2e8f0;
          transform: translateY(1px);
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
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        box-shadow:
          0 4px 6px -1px rgba(37, 99, 235, 0.1),
          0 2px 4px -1px rgba(37, 99, 235, 0.06);

        &:hover:not(:disabled) {
          background: #1d4ed8;
          box-shadow:
            0 10px 15px -3px rgba(37, 99, 235, 0.2),
            0 4px 6px -2px rgba(37, 99, 235, 0.1);
        }

        &:active:not(:disabled) {
          background: #1e40af;
          transform: translateY(1px);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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
  private snippetService = inject(AvImageSnippetService);

  isUploading = false;
  tempQuality = 90;
  currentFormat: 'image/jpeg' | 'image/png' | 'image/webp' = 'image/jpeg';
  private originalDataUrl: string;

  // --- Настройки Контейнера (Row 2.5) ---
  containerEnabled = false;
  containerWidth = 600;
  containerHeight = 400;
  containerPresets = [
    { label: '600x400', w: 600, h: 400 },
    { label: '800x600', w: 800, h: 600 },
    { label: '1200x800', w: 1200, h: 800 },
    { label: 'Квадрат 400', w: 400, h: 400 },
  ];

  constructor() {
    this.originalDataUrl = this.data.dataUrl;
    this.tempQuality = this.data.metadata?.quality || 90;

    // Определяем текущий формат
    if (this.data.name.toLowerCase().endsWith('.png')) this.currentFormat = 'image/png';
    else if (this.data.name.toLowerCase().endsWith('.webp')) this.currentFormat = 'image/webp';
    else this.currentFormat = 'image/jpeg';

    // Инициализируем metadata если её нет
    if (!this.data.metadata) {
      this.data.metadata = { align: 'center' };
    }
    if (!this.data.metadata.align) {
      this.data.metadata.align = 'center';
    }
  }

  /**
   * Смена формата (JPG/PNG/WEBP)
   */
  changeFormat(format: 'image/jpeg' | 'image/png' | 'image/webp') {
    this.currentFormat = format;

    // Обновляем расширение в имени файла
    const nameWithoutExt = this.data.name.replace(/\.[^/.]+$/, '');
    let ext = 'jpg';
    if (format === 'image/png') ext = 'png';
    if (format === 'image/webp') ext = 'webp';
    this.data.name = `${nameWithoutExt}.${ext}`;
    this.recompressImage();
  }

  applyContainerPreset(preset: { w: number; h: number }) {
    this.containerWidth = preset.w;
    this.containerHeight = preset.h;
    this.containerEnabled = true;
  }

  /**
   * Срабатывает после изменения слайдера качества
   */
  onQualityChange() {
    if (this.currentFormat === 'image/png') return;
    this.recompressImage();
  }

  /**
   * Пересжатие изображения на клиенте
   */
  private async recompressImage() {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d')!;

      // Если PNG -> JPG, рисуем белый фон (чтобы прозрачность не стала черной)
      if (this.currentFormat === 'image/jpeg') {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      ctx.drawImage(img, 0, 0);

      const newUrl = canvas.toDataURL(this.currentFormat, this.tempQuality / 100);
      this.data.dataUrl = newUrl;

      // Рассчитываем примерный размер в байтах
      const head = 'data:' + this.currentFormat + ';base64,';
      this.data.size = Math.round(((newUrl.length - head.length) * 3) / 4);
    };
    img.src = this.originalDataUrl;
  }

  async uploadToServer() {
    // Сохраняем финальное качество в метаданные
    if (this.data.metadata) {
      this.data.metadata.quality = this.tempQuality;
    }

    if (!this.data.dataUrl || !this.data.dataUrl.startsWith('data:')) {
      // Если это уже URL, просто формируем финальный контракт
      const finalResult = this.generateFinalOutput(this.data.dataUrl, this.data.imageId);
      this.modalRef.close(finalResult);
      return;
    }

    this.isUploading = true;

    try {
      const response = await lastValueFrom(this.persistence.saveImage(this.data));

      if (response && response.success) {
        this.msg.success('Изображение успешно сохранено на сервере');
        const finalResult = this.generateFinalOutput(response.url, response.imageId);
        this.modalRef.close(finalResult);
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

  /**
   * Формирует финальный объект по контракту AvImageEditorOutput
   */
  private generateFinalOutput(
    url: string,
    imageId?: string,
  ): AvImageEditorOutput & { isConfirmed: boolean } {
    const meta = this.data.metadata || {};

    const output: AvImageEditorOutput = {
      url: url,
      imageId: imageId,
      name: this.data.name,
      width: this.data.width,
      height: this.data.height,
      size: this.data.size,
      format: this.currentFormat,
      alt: meta.altText || '',
      title: meta.titleText || '',
      caption: meta.caption || '',
      align: meta.align || 'center',
      link: {
        url: meta.linkUrl || '',
        isClickable: !!meta.isClickable,
        target: meta.isOpenNewWindow ? '_blank' : '_self',
      },
      htmlSnippet: this.buildHtmlSnippet(url, imageId),
    };

    return { ...output, isConfirmed: true };
  }

  /**
   * Генерация HTML-кода по стандарту Aurora через сервис
   */
  private buildHtmlSnippet(url: string, imageId?: string): string {
    const meta = this.data.metadata || {};

    return this.snippetService.buildHtml({
      url,
      imageId,
      alt: meta.altText || '',
      title: meta.titleText,
      caption: meta.caption,
      align: meta.align || 'center',
      width: this.data.width,
      height: this.data.height,
      link: {
        url: meta.linkUrl || '',
        isClickable: !!meta.isClickable,
        target: meta.isOpenNewWindow ? '_blank' : '_self',
      },
      container: {
        enabled: this.containerEnabled,
        width: this.containerWidth,
        height: this.containerHeight,
      },
    });
  }
  close() {
    this.modalRef.destroy();
  }
}
