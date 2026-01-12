import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzModalModule, NzModalRef } from 'ng-zorro-antd/modal';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzSliderModule } from 'ng-zorro-antd/slider';
import { NzSpinModule } from 'ng-zorro-antd/spin';

import { AvImageProcessingService } from '../../av-image-processing.service';
import { AvCropPreset, AvExportSettings, AvImageMetadata, AvRect } from '../../av-image.model';
import { CropCanvasComponent } from '../crop-canvas/crop-canvas.component';

@Component({
  selector: 'app-image-editor-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzModalModule,
    NzButtonModule,
    NzGridModule,
    NzSliderModule,
    NzRadioModule,
    NzIconModule,
    NzSpinModule,
    NzInputModule,
    NzCheckboxModule,
    CropCanvasComponent,
  ],
  template: `
    <div class="editor-container">
      <p>
        image-editor-modal.component
        <!-- ROW 1: PREVIEW & SETTINGS -->
      </p>

      <div class="main-row">
        <!-- LEFT: PREVIEW / CROP -->
        <div class="col-preview">
          <!-- Окружение для CROP -->
          <div class="crop-wrapper">
            <nz-spin [nzSpinning]="isLoading" style="width: 100%; height: 100%;">
              <app-crop-canvas
                *ngIf="imageSrc"
                [imageSrc]="imageSrc"
                [aspectRatio]="currentPreset.ratio || null"
                [externalCrop]="externalCropRect"
                (cropChange)="onCropChange($event)"
              ></app-crop-canvas>
            </nz-spin>
          </div>
        </div>

        <!-- RIGHT: SETTINGS -->
        <div class="col-settings">
          <div class="settings-group">
            <label class="group-label">НАЗВАНИЕ ФАЙЛА</label>
            <input nz-input [(ngModel)]="meta.fileName" placeholder="Введите имя файла" />
          </div>

          <div class="settings-group">
            <label class="group-label">РАСШИРЕНИЕ</label>
            <nz-radio-group [(ngModel)]="exportSettings.format" nzButtonStyle="solid">
              <label nz-radio-button nzValue="image/jpeg">JPG</label>
              <label nz-radio-button nzValue="image/png">PNG</label>
              <label nz-radio-button nzValue="image/webp">WEBP</label>
            </nz-radio-group>
          </div>

          <div class="settings-group" *ngIf="exportSettings.format !== 'image/png'">
            <div class="flex-between">
              <label class="group-label">КАЧЕСТВО (COMPRESSION)</label>
              <div class="metrics">
                <span class="m-val highlight">
                  {{ (originalSize / 1024).toFixed(0) }} KB <span style="color:#bfbfbf">/</span>
                  {{ (estimatedSize / 1024).toFixed(0) }} KB
                </span>
              </div>
            </div>
            <div class="slider-row">
              <div class="slider-wrap">
                <nz-slider
                  [(ngModel)]="exportSettings.quality"
                  [nzMin]="10"
                  [nzMax]="100"
                  (ngModelChange)="recalcSize()"
                ></nz-slider>
              </div>
              <div class="slider-val-box">{{ exportSettings.quality }}</div>
            </div>
          </div>

          <!-- Manual Crop Inputs -->
          <div class="settings-group">
            <label class="group-label">РАЗМЕРЫ (КРОП)</label>
            <div class="size-inputs">
              <div class="size-field">
                <span>W:</span>
                <input
                  nz-input
                  type="number"
                  [(ngModel)]="manualWidth"
                  (ngModelChange)="updateCropFromInputs()"
                />
              </div>
              <div class="size-field">
                <span>H:</span>
                <input
                  nz-input
                  type="number"
                  [(ngModel)]="manualHeight"
                  (ngModelChange)="updateCropFromInputs()"
                />
              </div>
              <button nz-button nzType="default" nzSize="small" (click)="resetCrop()">
                <span nz-icon nzType="reload"></span>
              </button>
            </div>
          </div>

          <div class="settings-group">
            <label class="group-label">РАСПОЛОЖЕНИЕ</label>
            <div class="align-buttons">
              <button
                class="align-btn"
                [class.active]="meta.align === 'left'"
                (click)="meta.align = 'left'"
              >
                <span nz-icon nzType="align-left"></span>
              </button>
              <button
                class="align-btn"
                [class.active]="meta.align === 'center'"
                (click)="meta.align = 'center'"
              >
                <span nz-icon nzType="align-center"></span>
              </button>
              <button
                class="align-btn"
                [class.active]="meta.align === 'right'"
                (click)="meta.align = 'right'"
              >
                <span nz-icon nzType="align-right"></span>
              </button>
              <button
                class="align-btn"
                [class.active]="meta.align === 'justify'"
                (click)="meta.align = 'justify'"
              >
                <span nz-icon nzType="menu"></span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- DIVIDER -->
      <div class="hor-divider"></div>

      <!-- ROW 2: SEO & ATTRIBUTES -->
      <div class="secondary-row" nz-row [nzGutter]="24">
        <!-- SEO SECTION -->
        <div nz-col nzSpan="12" class="col-seo">
          <h4 class="section-title">SEO И АТРИБУТЫ</h4>
          <div class="seo-box">
            <div class="form-item">
              <label>Alt текст (Описание)</label>
              <input
                nz-input
                [(ngModel)]="meta.altText"
                placeholder="Описание для поисковиков..."
              />
            </div>
            <div class="form-item">
              <label>Заголовок (Title)</label>
              <input nz-input [(ngModel)]="meta.titleText" placeholder="Всплывающая подсказка..." />
            </div>
            <div class="form-item">
              <label>Подпись под фото (Caption)</label>
              <textarea nz-input [(ngModel)]="meta.caption" rows="2" placeholder=""></textarea>
            </div>
          </div>
        </div>

        <!-- LINK SECTION -->
        <div nz-col nzSpan="12" class="col-link">
          <h4 class="section-title">ССЫЛКА И ПОВЕДЕНИЕ</h4>
          <div class="link-box">
            <div class="form-item">
              <label>URL ссылки</label>
              <input
                nz-input
                [(ngModel)]="meta.linkUrl"
                placeholder="https://..."
                [disabled]="!meta.isClickable"
              />
            </div>

            <div class="checkbox-group">
              <label nz-checkbox [(ngModel)]="meta.isClickable">Кликабельное</label>
            </div>
            <div class="checkbox-group">
              <label nz-checkbox [(ngModel)]="meta.isOpenNewWindow" [nzDisabled]="!meta.isClickable"
                >В новом окне</label
              >
            </div>
          </div>
        </div>
      </div>

      <!-- ROW 3: FOOTER & STATUS -->
      <div class="footer-row">
        <div class="status-bar">
          <span>NAME: {{ meta.fileName }}</span>
          <span class="sep"></span>
          <span>FORMAT: {{ exportSettings.format.split('/')[1] | uppercase }}</span>
          <span class="sep"></span>
          <span>WEIGHT: {{ (estimatedSize / 1024).toFixed(1) }} KB</span>
          <span class="sep"></span>
          <span>ALIGN: {{ meta.align | titlecase }}</span>
        </div>

        <div class="footer-actions">
          <button nz-button nzType="default" (click)="close()">Отмена</button>
          <button nz-button nzType="primary" (click)="save()" [nzLoading]="isProcessing">
            Вставить картинку в редактор
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      /* GLOBAL */
      .editor-container {
        display: flex;
        flex-direction: column;
        height: 750px;
        margin: -24px;
        background: #fff;
        font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        color: #333;
      }

      .hor-divider {
        height: 2px;
        background: #52c41a;
        width: 100%;
      }

      /* ROW 1 */
      .main-row {
        flex: 1; /* Occupy remaining space */
        display: flex;
        min-height: 400px;
        overflow: hidden;
      }

      .col-preview {
        flex: 0 0 500px; /* Fixed width for canvas area */
        background: #f0f2f5; /* Light gray background */
        border-right: 2px solid #52c41a;
        position: relative;
      }

      .crop-wrapper {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px; /* Padding inside the gray area */
      }

      .col-settings {
        flex: 1;
        padding: 24px;
        overflow-y: auto;
      }

      /* TYPOGRAPHY */
      .group-label {
        font-size: 11px;
        font-weight: 800;
        color: #8c8c8c;
        text-transform: uppercase;
        display: block;
        margin-bottom: 8px;
      }
      .section-title {
        font-size: 11px;
        font-weight: 900;
        text-transform: uppercase;
        margin-bottom: 15px;
      }

      /* CONTROLS */
      .settings-group {
        margin-bottom: 24px;
      }
      .slider-row {
        display: flex;
        align-items: center;
        gap: 15px;
        margin-top: 5px;
      }
      .slider-wrap {
        flex: 1;
      }
      .slider-val-box {
        width: 40px;
        text-align: center;
        border: 1px solid #d9d9d9;
        border-radius: 4px;
        padding: 4px;
        font-weight: 600;
        font-size: 12px;
      }
      .align-buttons {
        display: flex;
        gap: 8px;
      }
      .align-btn {
        width: 36px;
        height: 36px;
        border: 1px solid #d9d9d9;
        background: #fff;
        border-radius: 4px;
        cursor: pointer;
        color: #595959;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .align-btn.active {
        background: #e6f7ff;
        border-color: #1890ff;
        color: #1890ff;
      }

      .size-inputs {
        display: flex;
        gap: 10px;
        align-items: center;
      }
      .size-field {
        display: flex;
        align-items: center;
        gap: 5px;
        width: 100px;
      }
      .size-field span {
        font-size: 11px;
        font-weight: bold;
        color: #8c8c8c;
      }

      /* SEO ROW */
      .secondary-row {
        height: 250px;
        padding: 20px 30px;
        background: #fafafa;
        border-bottom: 2px solid #52c41a;
      }
      .seo-box,
      .link-box {
        background: #fff;
        border: 1px solid #f0f0f0;
        border-radius: 4px;
        padding: 15px;
        height: 100%;
        overflow-y: auto;
      }
      .form-item {
        margin-bottom: 10px;
      }
      .form-item label {
        font-size: 11px;
        font-weight: 600;
        display: block;
        margin-bottom: 4px;
      }

      /* FOOTER */
      .footer-row {
        height: 60px;
        padding: 0 24px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: #fff;
      }
      .status-bar {
        font-family: monospace;
        font-size: 11px;
        font-weight: 700;
        text-transform: uppercase;
      }
      .sep {
        display: inline-block;
        width: 1px;
        height: 10px;
        background: #d9d9d9;
        margin: 0 10px;
        vertical-align: middle;
      }
      .footer-actions {
        display: flex;
        gap: 12px;
      }
    `,
  ],
})
export class AvImageEditorModalComponent implements OnInit {
  readonly #modal = inject(NzModalRef);
  readonly #imageService = inject(AvImageProcessingService);

  file: File | null = null;

  imageSrc: string | null = null;
  isLoading = true;
  isProcessing = false;

  meta: AvImageMetadata = {
    fileName: '',
    align: 'center',
    isClickable: false,
    isOpenNewWindow: false,
  };
  originalSize = 0;
  estimatedSize = 0;
  exportSettings: AvExportSettings = { format: 'image/jpeg', quality: 90 };

  currentPreset: AvCropPreset = { id: 'free', label: 'Free', ratio: null };
  currentCrop: AvRect | null = null;

  // Manual inputs
  manualWidth = 0;
  manualHeight = 0;
  externalCropRect: AvRect | null = null; // Сигнал для канваса

  ngOnInit(): void {
    const data = this.#modal.getConfig().nzData;
    if (data && data.file) {
      this.file = data.file;
      this.meta.fileName = this.file!.name.split('.')[0];
      this.loadFile();
    }
  }

  loadFile() {
    if (!this.file) return;
    this.originalSize = this.file.size;
    this.#imageService.readAsDataUrl(this.file).subscribe({
      next: (url) => {
        this.imageSrc = url;
        this.isLoading = false;
        this.recalcSize();
      },
      error: () => (this.isLoading = false),
    });
  }

  // Вызывается, когда кроп меняется МЫШКОЙ
  onCropChange(rect: AvRect) {
    this.currentCrop = rect;
    // Обновляем инпуты, но ТОЛЬКО если фокус не в них (чтобы не прыгало при вводе)
    if (document.activeElement?.tagName !== 'INPUT') {
      this.manualWidth = rect.width;
      this.manualHeight = rect.height;
    }
    this.recalcSize();
  }

  // Вызывается, когда юзер вводит цифры
  updateCropFromInputs() {
    if (!this.currentCrop) return;
    // Создаем новый Rect на основе текущего X/Y но с новыми W/H
    // (Это простая логика, можно усложнить центрированием)
    this.externalCropRect = {
      ...this.currentCrop,
      width: this.manualWidth,
      height: this.manualHeight,
    };
    // Канвас его подхватит и эмитнет обратно onCropChange, который обновит currentCrop но не инпуты
  }

  resetCrop() {
    // Сброс через "нулевой" externalCrop не сработает, надо придумать сигнал сброса
    // Пока просто установим полную ширину для теста (или просто currentPreset)
    // TODO: Реализовать полноценный Reset в будущем
  }

  recalcSize() {
    // Простая эвристика размера
    const ratio = this.exportSettings.quality / 100;
    const pxFactor = this.currentCrop
      ? (this.currentCrop.width * this.currentCrop.height) / 1000000
      : 1;
    // Это очечнь грубая оценка, но лучше чем ничего.
    this.estimatedSize = this.originalSize * ratio * (this.currentCrop ? 0.8 : 1);
  }

  save() {
    if (!this.imageSrc) return;
    this.isProcessing = true;

    this.#imageService.loadImage(this.imageSrc).subscribe((img) => {
      const state = { cropRect: this.currentCrop };
      this.#imageService.processImage(img, state, this.exportSettings).subscribe({
        next: (res) => {
          this.isProcessing = false;
          res.metadata = { ...this.meta };
          const ext = this.exportSettings.format.split('/')[1];
          res.name = `${this.meta.fileName}.${ext}`;
          this.#modal.close(res);
        },
        error: (err) => {
          console.error(err);
          this.isProcessing = false;
        },
      });
    });
  }

  close() {
    this.#modal.close();
  }
}
