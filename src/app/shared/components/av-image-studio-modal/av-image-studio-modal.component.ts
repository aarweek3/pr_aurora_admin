import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnInit,
  effect,
  inject,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NZ_MODAL_DATA, NzModalRef } from 'ng-zorro-antd/modal';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { lastValueFrom } from 'rxjs';
import { CropCanvasComponent } from './crop-canvas/crop-canvas.component';
import { AvImageUploadResult, AvRect } from './models/av-image-studio-modal.model';
import { AvImageStudioIngestionService } from './services/av-image-studio-ingestion.service';
import { AvImageStudioPersistenceService } from './services/av-image-studio-persistence.service';

@Component({
  selector: 'app-av-image-studio-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzGridModule,
    NzCheckboxModule,
    NzInputNumberModule,
    NzInputModule,
    NzIconModule,
    NzButtonModule,
    NzSpinModule,
    CropCanvasComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- HEADER: Photoshop Title Bar -->
    <div class="debug-container">
      <div class="header">
        <div class="header-left" style="flex: 1; display: flex; align-items: center; gap: 8px;">
          <div class="ps-label" style="margin: 0; white-space: nowrap;">Файл:</div>
          <div class="ps-label" style="color: #fff; font-weight: 700;">{{ fileName }}</div>
        </div>

        <div
          class="header-center"
          style="flex: 2; display: flex; align-items: center; gap: 8px; justify-content: center;"
        >
          <div class="ps-label" style="margin: 0;">URL:</div>
          <input
            class="ps-input"
            style="width: 300px;"
            #urlInput
            placeholder="Вставьте ссылку..."
            (keyup.enter)="loadUrl(urlInput.value)"
          />
          <button class="ps-btn" (click)="loadUrl(urlInput.value)">Загрузить</button>
        </div>

        <div
          class="header-right"
          style="flex: 1; display: flex; gap: 8px; justify-content: flex-end;"
        >
          <input
            type="file"
            #fileInput
            style="display: none;"
            (change)="onFileChange($event)"
            accept="image/*"
          />
          <button class="ps-btn ps-btn-primary" style="height: 22px;" (click)="fileInput.click()">
            Обзор...
          </button>
        </div>
      </div>

      <div class="body-row">
        <!-- LEFT: PREVIEW AREA (With Checkerboard & Drop Zone) -->
        <div
          class="col-left"
          (dragover)="onDragOver($event)"
          (drop)="onDrop($event)"
          [class.dragging]="isDragging"
        >
          <div class="checkerboard"></div>

          <nz-spin [nzSpinning]="loader.isLoading()">
            <div class="preview-wrap" *ngIf="imageUrl">
              <app-crop-canvas
                *ngIf="!isResultPreview && isCropEnabled"
                [imageSrc]="imageUrl"
                [aspectRatio]="currentAspectRatio"
                [isCircle]="cropShape === 'circle'"
                [externalCrop]="externalCrop"
                (cropChange)="onCropChange($event)"
              ></app-crop-canvas>

              <div
                *ngIf="!isResultPreview && !isCropEnabled"
                class="preview-image-simple-container"
              >
                <img [src]="imageUrl" class="preview-image-simple" />
              </div>

              <div *ngIf="isResultPreview" class="result-preview-container">
                <img [src]="processedPreviewUrl" class="preview-image" />
                <div class="preview-badge">ПРЕДПРОСМОТР РЕЗУЛЬТАТА</div>
              </div>
            </div>

            <div class="preview-image-mock" *ngIf="!imageUrl && !loader.isLoading()">
              <div style="text-align: center;">
                <div style="color: #555; font-size: 40px; margin-bottom: 10px;">
                  <span nz-icon nzType="picture"></span>
                </div>
                <div
                  style="color: #444; font-size: 14px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;"
                >
                  Перетащите изображение сюда
                </div>
                <div style="color: #333; font-size: 11px; margin-top: 5px;">
                  или используйте кнопки сверху
                </div>
              </div>
            </div>
          </nz-spin>

          <!-- Error Message Overlay -->
          <div class="error-overlay" *ngIf="loader.error()">
            <span nz-icon nzType="warning" nzTheme="outline"></span>
            {{ loader.error()?.message }}
            <button class="ps-btn ps-btn-primary" (click)="loader.reset()">OK</button>
          </div>

          <!-- Tool Overlays -->
          <div class="preview-tools" *ngIf="imageUrl">
            <div class="ps-btn-group">
              <button
                class="ps-tool-btn"
                [class.active]="!isResultPreview"
                (click)="isResultPreview = false"
              >
                Редактор
              </button>
              <button
                class="ps-tool-btn"
                [class.active]="isResultPreview"
                (click)="applyCropPreview()"
                [disabled]="!imageUrl"
              >
                Результат
              </button>
            </div>
          </div>
        </div>

        <!-- RIGHT: SETTINGS PANEL -->
        <div class="col-right">
          <!-- Format Panel -->
          <div class="ps-panel">
            <div class="ps-panel-title">Настройки формата</div>
            <div style="display: flex; gap: 4px; margin-bottom: 8px;">
              <select class="ps-input" style="flex: 1;" [(ngModel)]="exportFormat">
                <option value="image/jpeg">JPEG</option>
                <option value="image/png">PNG-24</option>
                <option value="image/webp">WebP</option>
              </select>
              <select class="ps-input" style="width: 100px;">
                <option>Максимум</option>
                <option>Очень выс.</option>
              </select>
            </div>

            <div style="display: flex; align-items: center; justify-content: space-between;">
              <div class="ps-label" style="margin: 0;">Качество:</div>
              <input
                type="number"
                class="ps-input"
                style="width: 80px; text-align: center;"
                [(ngModel)]="quality"
              />
            </div>
            <div class="ps-slider-container">
              <div class="ps-slider">
                <div class="ps-slider-fill" [style.width.%]="quality"></div>
                <div class="ps-slider-thumb" [style.left.%]="quality"></div>
              </div>
            </div>
          </div>

          <!-- Optimization & Alignment Panel -->
          <div class="ps-panel">
            <div class="ps-panel-title">Оптимизация и Расположение</div>
            <div
              style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 10px;"
            >
              <label class="ps-checkbox-label">
                <input type="checkbox" checked /> Прогрессивный
              </label>
              <label class="ps-checkbox-label">
                <input type="checkbox" checked /> Оптимизировать
              </label>
            </div>

            <div style="display: flex; align-items: center; justify-content: space-between;">
              <div class="ps-label" style="margin: 0;">Выравнивание:</div>
              <div class="ps-align-grid">
                <button
                  class="ps-align-btn"
                  [class.active]="align === 'left'"
                  (click)="align = 'left'"
                >
                  ←
                </button>
                <button
                  class="ps-align-btn"
                  [class.active]="align === 'center'"
                  (click)="align = 'center'"
                >
                  ■
                </button>
                <button
                  class="ps-align-btn"
                  [class.active]="align === 'right'"
                  (click)="align = 'right'"
                >
                  →
                </button>
              </div>
            </div>
          </div>

          <!-- Image Size & Crop Panel -->
          <div class="ps-panel">
            <div class="ps-panel-title">
              Размер и Обрезка
              <div style="margin-left: auto; display: flex; align-items: center; gap: 6px;">
                <label class="ps-checkbox-label" style="text-transform: none; margin: 0;">
                  <input
                    type="checkbox"
                    [ngModel]="isCropEnabled"
                    (ngModelChange)="onCropToggle($event)"
                  />
                  Рамка
                </label>
                <!-- Mini tabs for shape -->
                <div class="ps-tab-mini" *ngIf="isCropEnabled">
                  <button
                    [class.active]="cropShape === 'rectangle'"
                    (click)="setCropShape('rectangle')"
                  >
                    ■
                  </button>
                  <button [class.active]="cropShape === 'circle'" (click)="setCropShape('circle')">
                    ●
                  </button>
                </div>
              </div>
            </div>

            <!-- Rectangle Settings (Only if Enabled) -->
            <div *ngIf="cropShape === 'rectangle' && isCropEnabled">
              <div style="display: flex; gap: 8px; align-items: flex-end; margin-bottom: 12px;">
                <div style="flex: 1;">
                  <div class="ps-label" style="font-size: 9px;">Ширина:</div>
                  <input
                    type="number"
                    class="ps-input"
                    style="width: 100%;"
                    [(ngModel)]="targetWidth"
                    (ngModelChange)="onTargetWidthChange()"
                  />
                </div>
                <button
                  class="ps-btn"
                  (click)="toggleTargetLock()"
                  style="height: 22px; padding: 0 4px;"
                >
                  {{ targetLocked ? '🔒' : '🔓' }}
                </button>
                <div style="flex: 1;">
                  <div class="ps-label" style="font-size: 9px;">Высота:</div>
                  <input
                    type="number"
                    class="ps-input"
                    style="width: 100%;"
                    [(ngModel)]="targetHeight"
                    (ngModelChange)="onTargetHeightChange()"
                  />
                </div>
              </div>
            </div>

            <!-- Circle Settings -->
            <div *ngIf="cropShape === 'circle'">
              <div
                style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 4px; margin-bottom: 12px;"
              >
                <div>
                  <div class="ps-label" style="font-size: 9px;">Радиус:</div>
                  <input
                    type="number"
                    class="ps-input"
                    style="width: 100%;"
                    [(ngModel)]="circleRadius"
                  />
                </div>
                <div>
                  <div class="ps-label" style="font-size: 9px;">X:</div>
                  <input
                    type="number"
                    class="ps-input"
                    style="width: 100%;"
                    [(ngModel)]="circleX"
                  />
                </div>
                <div>
                  <div class="ps-label" style="font-size: 9px;">Y:</div>
                  <input
                    type="number"
                    class="ps-input"
                    style="width: 100%;"
                    [(ngModel)]="circleY"
                  />
                </div>
              </div>
            </div>

            <div class="ps-label" style="margin-bottom: 6px;">Пресеты:</div>
            <div class="presets-grid">
              <div class="preset-item" *ngFor="let preset of presets" (click)="applyPreset(preset)">
                <div class="preset-icon">{{ preset.icon }}</div>
                <div class="preset-label">{{ preset.label.split(' ')[0] }}</div>
                <div class="preset-size">{{ preset.size.split(' ')[0] }}</div>
              </div>
            </div>

            <!-- Image Resizing Panel (New) -->
            <div
              *ngIf="showResizePanel"
              class="ps-panel"
              style="margin-top: 8px; border-color: #00d9ff; background: #2a2a2a;"
            >
              <div class="ps-panel-title" style="color: #fff; border-bottom: none; margin: 0;">
                Увеличить размер изображения
              </div>
              <div class="ps-label" style="margin-bottom: 8px;">
                Текущий: {{ targetWidth }} × {{ targetHeight }}
              </div>

              <div style="display: flex; gap: 8px; align-items: flex-end; margin-bottom: 8px;">
                <div style="flex: 1;">
                  <div class="ps-label" style="font-size: 9px;">Новая ширина:</div>
                  <input
                    type="number"
                    class="ps-input"
                    style="width: 100%; border-color: #555;"
                    [(ngModel)]="resizeWidth"
                    (ngModelChange)="onResizeWidthChange()"
                  />
                </div>
                <button
                  class="ps-btn"
                  (click)="resizeLocked = !resizeLocked"
                  style="height: 22px; padding: 0 4px; background: #444;"
                >
                  {{ resizeLocked ? '🔒' : '🔓' }}
                </button>
                <div style="flex: 1;">
                  <div class="ps-label" style="font-size: 9px;">Новая высота:</div>
                  <input
                    type="number"
                    class="ps-input"
                    style="width: 100%; border-color: #555;"
                    [(ngModel)]="resizeHeight"
                    (ngModelChange)="onResizeHeightChange()"
                  />
                </div>
              </div>

              <div style="display: flex; gap: 4px;">
                <button
                  class="ps-btn ps-btn-primary"
                  style="flex: 2; height: 26px; font-weight: 700;"
                  (click)="applyResize()"
                >
                  ПРИМЕНИТЬ
                </button>
                <button
                  class="ps-btn"
                  style="flex: 1; height: 26px;"
                  (click)="showResizePanel = false"
                >
                  ОТМЕНА
                </button>
              </div>
            </div>

            <button
              class="ps-btn"
              style="width: 100%; margin-top: 8px; height: 26px; border: 1px dashed #555;"
              (click)="toggleResizePanel()"
              *ngIf="!showResizePanel"
            >
              Изменить размер изображения...
            </button>

            <button
              class="ps-btn ps-btn-primary"
              style="width: 100%; margin: 8px 0; height: 28px; font-weight: 700;"
              (click)="applyCropPreview()"
              [disabled]="!imageUrl"
            >
              ✨ Обрезать и посмотреть
            </button>
          </div>

          <!-- Metadata & Behavior -->
          <div class="ps-panel">
            <div class="ps-panel-title">Атрибуты и SEO</div>
            <div style="display: flex; flex-direction: column; gap: 4px;">
              <!-- Alt -->
              <div style="display: flex; align-items: center; gap: 4px;">
                <div class="ps-label" style="width: 100px; margin: 0;">Alt текст:</div>
                <input
                  class="ps-input"
                  style="flex: 1;"
                  [(ngModel)]="seoAlt"
                  placeholder="Текст для Alt..."
                />
              </div>
              <!-- Title -->
              <div style="display: flex; align-items: center; gap: 4px;">
                <div class="ps-label" style="width: 100px; margin: 0;">Заголовок (Title):</div>
                <input class="ps-input" style="flex: 1;" [(ngModel)]="seoTitle" />
              </div>
              <!-- Description -->
              <div style="display: flex; align-items: center; gap: 4px;">
                <div class="ps-label" style="width: 100px; margin: 0;">Описание:</div>
                <input class="ps-input" style="flex: 1;" [(ngModel)]="seoDescription" />
              </div>

              <!-- Caption -->
              <div style="display: flex; align-items: center; gap: 4px;">
                <div class="ps-label" style="width: 100px; margin: 0;">Подпись (Caption):</div>
                <input class="ps-input" style="flex: 1;" [(ngModel)]="seoCaption" />
              </div>

              <div style="margin-top: 4px;">
                <label class="ps-checkbox-label">
                  <input type="checkbox" [(ngModel)]="linkClickable" /> Кликабельная ссылка
                </label>
              </div>

              <!-- Link Details (Shown only if Clickable) -->
              <div
                *ngIf="linkClickable"
                style="display: flex; flex-direction: column; gap: 6px; margin-top: 4px; padding: 6px; background: #333; border-radius: 2px;"
              >
                <div style="display: flex; align-items: center; gap: 4px;">
                  <div class="ps-label" style="width: 50px; margin: 0;">URL:</div>
                  <input
                    class="ps-input"
                    style="flex: 1;"
                    [(ngModel)]="linkUrl"
                    placeholder="https://..."
                  />
                </div>
                <label class="ps-checkbox-label">
                  <input type="checkbox" [(ngModel)]="linkInNewWindow" /> Открывать в новом окне
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="status-bar">
        <span>
          {{ exportFormat.split('/')[1].toUpperCase() }} {{ quality }}% |
          {{ (estimatedSize / 1024).toFixed(2) }} KB | 2 сек &#64; 1Мбит/с | 100% масштаб
          <span *ngIf="imageUrl"> | Исходник: {{ originalWidth }}×{{ originalHeight }}</span>
        </span>
      </div>

      <div class="footer">
        <div style="flex: 1; display: flex; align-items: center;">
          <span style="font-weight: 700; font-size: 11px; color: #aaa; font-family: sans-serif;"
            >Сохранить для Web - {{ fileName }}</span
          >
        </div>
        <button class="ps-btn" style="width: 70px;" (click)="cancel()">Отмена</button>
        <button
          class="ps-btn ps-btn-primary"
          (click)="save()"
          style="width: 90px; font-weight: 700;"
          [disabled]="!imageUrl || loader.isLoading()"
        >
          Готово
        </button>
      </div>

      <!-- RE-SIZE HANDLE -->
      <div class="resize-handle" (mousedown)="onResizeStart($event)">
        <span nz-icon nzType="drag" nzTheme="outline" style="transform: rotate(45deg);"></span>
      </div>
    </div>
  `,
  styles: [
    `
      .debug-container {
        display: flex;
        flex-direction: column;
        width: 100%;
        height: 100%;
        min-height: 700px;
        position: relative;
        z-index: 100;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial,
          sans-serif;
        color: #d9d9d9;
        background: #262626;
        overflow: hidden;
        border-radius: 4px;
        font-size: 11px;
      }

      .resize-handle {
        position: absolute;
        right: 0;
        bottom: 0;
        width: 20px;
        height: 20px;
        cursor: nwse-resize;
        z-index: 2000;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #666;
        background: linear-gradient(135deg, transparent 50%, rgba(255, 255, 255, 0.05) 50%);
        transition: color 0.2s, background 0.2s;
      }

      .resize-handle:hover {
        color: #00d9ff;
        background: linear-gradient(135deg, transparent 50%, rgba(0, 217, 255, 0.1) 50%);
      }

      .header {
        height: 48px;
        background: #333;
        border-bottom: 1px solid #1a1a1a;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 12px;
        flex-shrink: 0;
      }

      .body-row {
        flex: 1;
        display: flex;
        min-height: 0;
      }

      .col-left {
        flex: 1;
        background: #191919;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        overflow: hidden;
        transition: background 0.3s;
      }

      /* Fix: Ensure spinner container fills the flex space so image fits 100% */
      nz-spin {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
      }
      ::ng-deep .ant-spin-container {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .col-left.dragging {
        background: #333;
        border: 2px dashed #0078d4;
      }

      .checkerboard {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-image: linear-gradient(45deg, #222 25%, transparent 25%),
          linear-gradient(-45deg, #222 25%, transparent 25%),
          linear-gradient(45deg, transparent 75%, #222 75%),
          linear-gradient(-45deg, transparent 75%, #222 75%);
        background-size: 20px 20px;
        background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
      }

      .preview-wrap {
        z-index: 10;
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px; /* Уменьшим паддинг, чтобы дать больше места */
        overflow: hidden; /* Жестко обрезаем всё, что вылезает */
        position: relative;
      }

      app-crop-canvas {
        width: 100%;
        height: 100%;
        /* box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5); Уберем тень с канваса, она может сбивать размеры */
        display: flex; /* Важно для того, чтобы канвас сам мог центрировать контент */
        justify-content: center;
        align-items: center;
      }

      .preview-image-simple-container {
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        overflow: hidden;
      }
      .preview-image-simple {
        max-width: 100%;
        max-height: 100%;
        object-fit: contain;
        display: block;
      }

      .preview-image {
        max-width: 100%;
        max-height: calc(100% - 40px); /* Leaving space for the badge below */
        object-fit: contain;
        display: block;
        border: 1px solid #444;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
      }

      .result-preview-container {
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 12px;
        width: 100%;
        height: 100%;
      }

      .preview-badge {
        background: #52c41a;
        color: #000;
        padding: 2px 8px;
        font-size: 9px;
        font-weight: 800;
        border-radius: 2px;
      }

      .preview-image-mock {
        width: 80%;
        height: 80%;
        background: rgba(255, 255, 255, 0.02);
        border: 1px solid #444;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10;
      }

      .error-overlay {
        position: absolute;
        top: 20px;
        padding: 10px 20px;
        background: #8b0000;
        color: #fff;
        border-radius: 4px;
        z-index: 50;
        display: flex;
        align-items: center;
        gap: 10px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
      }

      .preview-tools {
        position: absolute;
        bottom: 12px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 20;
      }

      .col-right {
        width: 320px;
        background: #333;
        border-left: 1px solid #1a1a1a;
        padding: 12px;
        display: flex;
        flex-direction: column;
        gap: 10px;
        overflow-y: auto;
      }

      .ps-panel {
        background: #3c3c3c;
        border-radius: 2px;
        padding: 8px 10px;
        border: 1px solid #484848;
      }

      .ps-panel-title {
        font-size: 10px;
        font-weight: 700;
        color: #00d9ff;
        margin-bottom: 8px;
        text-transform: uppercase;
        border-bottom: 1px solid #484848;
        padding-bottom: 4px;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .ps-label {
        font-size: 10px;
        color: #aaa;
        margin-bottom: 2px;
      }

      .ps-input {
        background: #1a1a1a;
        border: 1px solid #454545;
        color: #ddd;
        font-size: 11px;
        height: 22px;
        padding: 0 6px;
        border-radius: 2px;
      }

      .ps-slider-container {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-top: 10px;
      }

      .ps-slider {
        flex: 1;
        height: 4px;
        background: #111;
        border-radius: 2px;
        position: relative;
      }

      .ps-slider-fill {
        height: 100%;
        background: #0078d4;
        border-radius: 2px;
      }

      .ps-slider-thumb {
        width: 10px;
        height: 10px;
        background: #ccc;
        border-radius: 50%;
        position: absolute;
        top: 50%;
        transform: translate(-50%, -50%);
      }

      .presets-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 4px;
      }

      .preset-item {
        background: #444;
        border: 1px solid #555;
        padding: 4px 2px;
        border-radius: 2px;
        text-align: center;
        cursor: pointer;
      }

      .preset-item:hover {
        background: #555;
        border-color: #0078d4;
      }
      .preset-icon {
        font-size: 14px;
      }
      .preset-label,
      .preset-size {
        font-size: 8px;
        display: block;
        overflow: hidden;
        white-space: nowrap;
      }

      .ps-btn {
        background: #4a4a4a;
        color: #eee;
        border: 1px solid #222;
        border-radius: 2px;
        height: 24px;
        cursor: pointer;
        padding: 0 12px;
        font-size: 11px;
      }

      .ps-btn-primary {
        background: #0078d4;
        border-color: #005a9e;
      }

      .ps-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .ps-btn-group {
        display: flex;
        background: #222;
        border-radius: 3px;
        padding: 2px;
      }

      .ps-tool-btn {
        background: transparent;
        border: none;
        color: #999;
        font-size: 10px;
        padding: 4px 8px;
        cursor: pointer;
        border-radius: 2px;
      }

      .ps-tool-btn.active {
        background: #3c3c3c;
        color: #fff;
      }

      .ps-checkbox-label {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 10px;
        color: #ccc;
      }

      .ps-align-grid {
        display: grid;
        grid-template-columns: repeat(3, 24px);
        gap: 2px;
        justify-content: center;
        background: #2a2a2a;
        padding: 4px;
        border-radius: 2px;
        width: fit-content;
      }

      .ps-align-btn {
        width: 24px;
        height: 24px;
        background: #444;
        border: 1px solid #333;
        color: #999;
        font-size: 12px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .ps-align-btn.active {
        background: #0078d4;
        color: #fff;
        border-color: #005a9e;
      }

      .ps-tab-mini {
        display: flex;
        background: #222;
        padding: 2px;
        border-radius: 2px;
      }

      .ps-tab-mini button {
        background: transparent;
        border: none;
        color: #777;
        font-size: 12px;
        padding: 0 6px;
        cursor: pointer;
      }

      .ps-tab-mini button.active {
        background: #4a4a4a;
        color: #fff;
        border-radius: 1px;
      }

      .status-bar {
        height: 24px;
        background: #262626;
        border-top: 1px solid #1a1a1a;
        display: flex;
        align-items: center;
        padding: 0 12px;
        font-size: 10px;
        color: #00d9ff;
      }

      .footer {
        height: 48px;
        background: #333;
        border-top: 1px solid #1a1a1a;
        display: flex;
        align-items: center;
        justify-content: flex-end;
        padding: 0 12px;
        gap: 8px;
      }
    `,
  ],
})
export class AvImageStudioModalComponent implements OnInit {
  readonly #modal = inject(NzModalRef);
  readonly data = inject(NZ_MODAL_DATA, { optional: true });
  readonly loader = inject(AvImageStudioIngestionService);
  readonly persistence = inject(AvImageStudioPersistenceService);
  private cdr = inject(ChangeDetectorRef);
  private el = inject(ElementRef);

  // Source (bound to Signal)
  imageUrl: string | null = null;
  fileName = 'Выберите файл...';
  estimatedSize = 0;
  isDragging = false;

  // State
  cropShape: 'rectangle' | 'circle' = 'rectangle';
  align: 'left' | 'center' | 'right' = 'center';
  exportFormat: 'image/jpeg' | 'image/png' | 'image/webp' = 'image/jpeg';
  quality = 90;

  // Resize
  targetWidth = 800;
  targetHeight = 600;
  targetLocked = true;

  // Original image dimensions (for display in status bar)
  originalWidth = 0;
  originalHeight = 0;

  // Metadata
  seoAlt = '';
  seoTitle = '';
  seoDescription = '';
  seoCaption = '';
  linkUrl = '';
  linkClickable = false;
  linkInNewWindow = false;

  presets = [
    { icon: '📷', label: 'Instagram Post', size: '1080 × 1080', ratio: 1 },
    { icon: '📱', label: 'Instagram Story', size: '1080 × 1920', ratio: 9 / 16 },
    { icon: '▶️', label: 'YouTube Thumb', size: '1280 × 720', ratio: 16 / 9 },
    { icon: '📺', label: 'Full HD', size: '1920 × 1080', ratio: 16 / 9 },
    { icon: '🎬', label: 'TikTok Video', size: '1080 × 1920', ratio: 9 / 16 },
    { icon: '👤', label: 'Facebook Post', size: '1200 × 630', ratio: 1.91 },
    { icon: '🐦', label: 'Twitter Post', size: '1200 × 675', ratio: 16 / 9 },
    { icon: '💼', label: 'LinkedIn Cover', size: '1584 × 396', ratio: 4 },
  ];

  // Circle crop state

  // Explicit state for aspect ratio to solve NG0100
  currentAspectRatio: number | null = null;

  /**
   * Manually updates the aspect ratio based on current state.
   * Call this whenever crop shape, lock state, or dimensions change.
   */
  updateAspectRatio() {
    const oldRatio = this.currentAspectRatio;
    if (this.cropShape === 'circle') {
      this.currentAspectRatio = 1;
    } else if (this.targetLocked && this.targetHeight && this.targetHeight > 0) {
      // Round to avoid float jitter
      this.currentAspectRatio = Math.round((this.targetWidth / this.targetHeight) * 10000) / 10000;
    } else {
      this.currentAspectRatio = null;
    }
    console.log(
      `[StudioModal] updateAspectRatio: lock=${this.targetLocked}, old=${oldRatio}, new=${this.currentAspectRatio}`,
    );
  }
  circleRadius = 100;
  circleX = 150;
  circleY = 150;

  // Preview Mode State
  isResultPreview = false;
  processedPreviewUrl: string | null = null;

  // New crop-related state
  currentCrop: AvRect | null = null;
  externalCrop: AvRect | null = null;
  isCropEnabled = false;

  // Image Resize State
  showResizePanel = false;
  resizeWidth = 0;
  resizeHeight = 0;
  resizeLocked = true;
  private resizeRatio = 1;

  toggleResizePanel() {
    this.showResizePanel = !this.showResizePanel;
    if (this.showResizePanel) {
      this.resizeWidth = this.targetWidth;
      this.resizeHeight = this.targetHeight;
      this.resizeRatio = this.targetHeight > 0 ? this.targetWidth / this.targetHeight : 1;
    }
  }

  onResizeWidthChange() {
    if (this.resizeLocked && this.resizeRatio > 0) {
      this.resizeHeight = Math.round(this.resizeWidth / this.resizeRatio);
    }
  }

  onResizeHeightChange() {
    if (this.resizeLocked && this.resizeRatio > 0) {
      this.resizeWidth = Math.round(this.resizeHeight * this.resizeRatio);
    }
  }

  applyResize() {
    this.targetWidth = this.resizeWidth;
    this.targetHeight = this.resizeHeight;
    this.showResizePanel = false;
    this.updateAspectRatio();
    this.syncExternalCrop();
  }

  onTargetWidthChange() {
    if (this.targetLocked && this.currentAspectRatio) {
      this.targetHeight = Math.round(this.targetWidth / this.currentAspectRatio);
    } else {
      this.updateAspectRatio();
    }
    this.syncExternalCrop();
  }

  onTargetHeightChange() {
    if (this.targetLocked && this.currentAspectRatio) {
      this.targetWidth = Math.round(this.targetHeight * this.currentAspectRatio);
    } else {
      this.updateAspectRatio();
    }
    this.syncExternalCrop();
  }

  onCropToggle(enabled: boolean) {
    this.isCropEnabled = enabled;
    if (enabled) {
      // Инициализируем кроп текущими размерами, чтобы они не сбросились
      this.externalCrop = {
        x: 0,
        y: 0,
        width: this.targetWidth,
        height: this.targetHeight,
      };
    }
  }

  onCropChange(rect: AvRect) {
    this.currentCrop = rect;
    // Синхронизируем размеры в инпутах с рамкой кропа
    this.targetWidth = Math.round(rect.width);
    this.targetHeight = Math.round(rect.height);
    this.cdr.markForCheck();
  }

  // Called when width/height inputs change to update the canvas
  syncExternalCrop() {
    if (this.targetWidth && this.targetHeight) {
      // Create a temporary external crop to move the box
      // (Simplified logic: we just pass dimensions, the canvas will center or resize)
      this.externalCrop = {
        x: this.currentCrop?.x || 0,
        y: this.currentCrop?.y || 0,
        width: this.targetWidth,
        height: this.targetHeight,
      };
    }
  }

  async applyCropPreview() {
    if (!this.imageUrl) return;
    this.loader.isLoading.set(true);
    try {
      this.processedPreviewUrl = await this.generateProcessedImage();
      this.isResultPreview = true;
    } catch (err) {
      console.error('Preview failed:', err);
    } finally {
      this.loader.isLoading.set(false);
    }
  }

  constructor() {
    // Реакция на изменения в сервисе загрузки
    effect(() => {
      const result = this.loader.currentResult();
      if (result) {
        this.imageUrl = result.dataUrl;
        this.fileName = result.fileName;
        this.estimatedSize = result.fileSize;
        // Save original dimensions for status bar
        this.originalWidth = result.width;
        this.originalHeight = result.height;
        // Reset default dims if new image loaded
        this.targetWidth = result.width;
        this.targetHeight = result.height;
        this.updateAspectRatio(); // <-- Update ratio on image load
      } else {
        this.imageUrl = null;
        this.fileName = 'Выберите файл...';
        this.estimatedSize = 0;
      }
    });
  }

  ngOnInit() {
    console.log(
      '%c [StudioModal] COMPONENT INITIALIZED ',
      'background: #00d9ff; color: #000; font-weight: bold;',
    );
    if (this.data?.imageUrl) {
      this.loader.loadFromUrl(this.data.imageUrl);
    }
    if (this.data?.aspectRatio) {
      this.currentAspectRatio = this.data.aspectRatio;
      this.targetLocked = true;
    }
    if (this.data?.metadata) {
      this.seoAlt = this.data.metadata.altText || '';
      this.seoTitle = this.data.metadata.titleText || '';
      this.seoCaption = this.data.metadata.caption || '';
    }
    this.updateAspectRatio(); // <-- Init default ratio
  }

  loadUrl(url: string) {
    if (url) {
      this.loader.loadFromUrl(url);
    }
  }

  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.loader.loadFromFile(file);
    }
  }

  // Drag-and-Drop Handlers
  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragging = true;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragging = false;
    this.loader.handleDrop(event);
  }

  setCropShape(shape: 'rectangle' | 'circle'): void {
    console.log(`[StudioModal] setCropShape: ${shape}`);
    this.cropShape = shape;
    this.updateAspectRatio(); // <-- Update on shape change
  }

  toggleTargetLock(): void {
    this.targetLocked = !this.targetLocked;
    console.warn('!!! LOCK TOGGLED !!! New state:', this.targetLocked);
    window.alert('Lock toggled to: ' + this.targetLocked);
    this.updateAspectRatio(); // <-- Update on lock toggle
  }

  testKlkz(): void {
    console.log(
      '%c [StudioModal] KLKZ CLICKED ',
      'background: #ff0000; color: #fff; font-size: 20px;',
    );
    window.alert('KLKZ IS WORKING!');
  }

  // --- MODAL RESIZE LOGIC ---
  onResizeStart(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();

    const startX = event.clientX;
    const startY = event.clientY;

    // Ищем КОРРЕКТНЫЙ контейнер конкретно этого модала (через ближайшего родителя)
    const modalWrapper = this.el.nativeElement.closest('.ant-modal') as HTMLElement;
    const modalContent = this.el.nativeElement.closest('.ant-modal-content') as HTMLElement;

    if (!modalWrapper || !modalContent) return;

    const startWidth = modalWrapper.offsetWidth;
    const startHeight = modalContent.offsetHeight;

    const onMouseMove = (e: MouseEvent) => {
      requestAnimationFrame(() => {
        const deltaX = e.clientX - startX;
        const deltaY = e.clientY - startY;

        const newWidth = Math.max(startWidth + deltaX, 800);
        const newHeight = Math.max(startHeight + deltaY, 600);

        modalWrapper.style.width = `${newWidth}px`;
        modalContent.style.height = `${newHeight}px`;

        // Триггерим ресайз для внутренних компонентов (например, канваса)
        window.dispatchEvent(new Event('resize'));
        this.cdr.markForCheck();
      });
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      // Фиксируем изменения в CDK Overlay если нужно через триггер ресайза
      window.dispatchEvent(new Event('resize'));
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }

  applyPreset(preset: any): void {
    const [w, h] = preset.size.split(' × ').map(Number);
    this.targetWidth = w;
    this.targetHeight = h;
    this.syncExternalCrop();
    this.updateAspectRatio(); // <-- Update after preset load
  }

  cancel() {
    this.#modal.close();
  }

  async save() {
    this.loader.isLoading.set(true);
    try {
      // Если кроп выключен, принудительно ставим полный размер оригинала
      if (!this.isCropEnabled && this.imageUrl) {
        this.currentCrop = { x: 0, y: 0, width: this.originalWidth, height: this.originalHeight };
      }

      const processedDataUrl = await this.generateProcessedImage();
      console.log('Image Studio: Processed image generated, length:', processedDataUrl.length);

      const file = this.dataURLtoFile(processedDataUrl, this.fileName);
      console.log('Image Studio: File object created:', file.name, file.size, 'bytes');

      const result: AvImageUploadResult = {
        dataUrl: processedDataUrl,
        file: file,
        name: this.fileName,
        width: this.targetWidth,
        height: this.targetHeight,
        size: file.size,
        metadata: {
          fileName: this.fileName,
          altText: this.seoAlt,
          titleText: this.seoTitle,
          caption: this.seoCaption,
          align: this.align,
          linkUrl: this.linkUrl,
          isClickable: this.linkClickable,
          isOpenNewWindow: this.linkInNewWindow,
        },
      };

      // ➔ Отправляем на сервер!
      try {
        console.log('Image Studio: Sending for persistence...', result.name);
        const uploadResponse = await lastValueFrom(this.persistence.saveImage(result));
        console.log('Image Studio: Persistence response:', uploadResponse);
        if (uploadResponse.success) {
          // Возвращаем относительный путь, чтобы он корректно работал через Proxy и TinyMCE
          result.dataUrl = uploadResponse.url; // e.g. "/uploads/images/..."
          console.log('Image Studio: Final result dataUrl (relative):', result.dataUrl);
          // Можно добавить и imageId если нужен
        }
      } catch (uploadErr) {
        console.warn('Image Studio: Server upload failed, returning local result:', uploadErr);
        // Продолжаем с локальным результатом, если сервер упал
      }

      this.#modal.close(result);
    } catch (err) {
      console.error('Failed to process image:', err);
      // Fallback to original if processing fails (e.g. tainted canvas)
      const result: Partial<AvImageUploadResult> = {
        dataUrl: this.imageUrl || '',
        name: this.fileName,
        width: this.targetWidth,
        height: this.targetHeight,
        size: this.estimatedSize,
        metadata: {
          fileName: this.fileName,
          altText: this.seoAlt,
          titleText: this.seoTitle,
          caption: this.seoCaption,
          align: this.align,
          linkUrl: this.linkUrl,
          isClickable: this.linkClickable,
          isOpenNewWindow: this.linkInNewWindow,
        },
      };
      this.#modal.close(result);
    } finally {
      this.loader.isLoading.set(false);
    }
  }

  private dataURLtoFile(dataurl: string, filename: string): File {
    const arr = dataurl.split(',');
    const mime = arr[0].match(/:(.*?);/)![1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  }

  /**
   * Применение кропа и ресайза через Canvas
   */
  private generateProcessedImage(): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.imageUrl || !this.currentCrop) {
        return resolve(this.imageUrl || '');
      }

      const img = new Image();
      // Если это проксированный URL, то CORS не страшен
      if (this.imageUrl.startsWith('http')) {
        img.crossOrigin = 'anonymous';
      }

      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) throw new Error('Could not get canvas context');

          const crop = this.currentCrop!;

          // Результирующий размер
          canvas.width = this.targetWidth;
          canvas.height = this.targetHeight;

          // Если круг - рисуем маску
          if (this.cropShape === 'circle') {
            ctx.beginPath();
            ctx.arc(
              canvas.width / 2,
              canvas.height / 2,
              Math.min(canvas.width, canvas.height) / 2,
              0,
              Math.PI * 2,
            );
            ctx.clip();
          }

          // Рисуем обрезанную часть оригинала в целевой размер
          ctx.drawImage(
            img,
            crop.x,
            crop.y,
            crop.width,
            crop.height, // Откуда (Source)
            0,
            0,
            canvas.width,
            canvas.height, // Куда (Destination)
          );

          // Экспорт. Если круг - форсируем поддержку прозрачности (WebP или PNG)
          let finalFormat = this.exportFormat;
          if (this.cropShape === 'circle' && finalFormat === 'image/jpeg') {
            finalFormat = 'image/webp'; // JPEG не умеет в прозрачность
          }

          const dataUrl = canvas.toDataURL(finalFormat, this.quality / 100);
          resolve(dataUrl);
        } catch (e) {
          reject(e);
        }
      };

      img.onerror = () => reject(new Error('Failed to load image for processing'));
      img.src = this.imageUrl!;
    });
  }

  applyQuickResize(): void {}
  applyTargetSize(): void {}
  applyCircleCrop(): void {}
}
