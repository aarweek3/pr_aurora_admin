import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzModalRef } from 'ng-zorro-antd/modal';

@Component({
  selector: 'app-debug-modal',
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
  ],
  template: `
    <!-- HEADER: Photoshop Title Bar -->
    <div class="debug-container">
      <div class="header">
        <div class="header-left" style="flex: 1; display: flex; align-items: center; gap: 8px;">
          <div class="ps-label" style="margin: 0; white-space: nowrap;">URL картинки:</div>
          <input
            class="ps-input"
            style="flex: 1; max-width: 400px;"
            [(ngModel)]="imageUrl"
            placeholder="https://..."
          />
        </div>
        <div class="header-right">
          <button class="ps-btn ps-btn-primary" style="height: 22px;">Загрузить картинку</button>
        </div>
      </div>

      <div class="body-row">
        <!-- LEFT: PREVIEW AREA (With Checkerboard) -->
        <div class="col-left">
          <div class="checkerboard"></div>
          <div class="preview-image-mock">
            <div style="color: #444; font-size: 20px; font-weight: 800;">ПРЕДПРОСМОТР</div>
          </div>

          <!-- Tool Overlays -->
          <div class="preview-tools">
            <div class="ps-btn-group">
              <button class="ps-tool-btn active">4-Up</button>
              <button class="ps-tool-btn">2-Up</button>
              <button class="ps-tool-btn">Оптимизация</button>
              <button class="ps-tool-btn">Оригинал</button>
            </div>
          </div>
        </div>

        <!-- RIGHT: SETTINGS PANEL -->
        <div class="col-right">
          <!-- Format Panel -->
          <div class="ps-panel">
            <div class="ps-panel-title">Настройки формата</div>
            <div style="display: flex; gap: 4px; margin-bottom: 8px;">
              <select class="ps-input" style="flex: 1;">
                <option>JPEG</option>
                <option>PNG-24</option>
                <option>PNG-8</option>
                <option>GIF</option>
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
                value="90"
              />
            </div>
            <div class="ps-slider-container">
              <div class="ps-slider">
                <div class="ps-slider-fill"></div>
                <div class="ps-slider-thumb"></div>
              </div>
            </div>
          </div>

          <!-- Optimization & Alignment Panel -->
          <div class="ps-panel">
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
                <button class="ps-align-btn">←</button>
                <button class="ps-align-btn active">■</button>
                <button class="ps-align-btn">→</button>
              </div>
            </div>
          </div>

          <!-- Image Size & Crop Panel -->
          <div class="ps-panel">
            <div class="ps-panel-title">
              Размер и Обрезка
              <div class="ps-tab-mini">
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

            <!-- Rectangle Settings -->
            <div *ngIf="cropShape === 'rectangle'">
              <div style="display: flex; gap: 8px; align-items: flex-end; margin-bottom: 12px;">
                <div style="flex: 1;">
                  <div class="ps-label" style="font-size: 9px;">Ширина:</div>
                  <input
                    type="number"
                    class="ps-input"
                    style="width: 100%;"
                    [(ngModel)]="targetWidth"
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
              <!-- Description -->
              <div style="display: flex; align-items: center; gap: 4px;">
                <div class="ps-label" style="width: 100px; margin: 0;">Описание:</div>
                <input class="ps-input" style="flex: 1;" [(ngModel)]="seoDescription" />
              </div>
              <!-- Title -->
              <div style="display: flex; align-items: center; gap: 4px;">
                <div class="ps-label" style="width: 100px; margin: 0;">Заголовок (Title):</div>
                <input class="ps-input" style="flex: 1;" [(ngModel)]="seoTitle" />
              </div>
              <!-- Tooltip -->
              <div style="display: flex; align-items: center; gap: 4px;">
                <div class="ps-label" style="width: 100px; margin: 0;">Подсказка:</div>
                <input class="ps-input" style="flex: 1;" [(ngModel)]="seoTooltip" />
              </div>
              <!-- Caption -->
              <div style="display: flex; align-items: center; gap: 4px;">
                <div class="ps-label" style="width: 100px; margin: 0;">Подпись под фото:</div>
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
        <span>JPEG 90% | 25.75 KB | 2 сек &#64; 1Мбит/с | 100% масштаб</span>
      </div>

      <div class="footer">
        <div style="flex: 1; display: flex; align-items: center;">
          <span style="font-weight: 700; font-size: 11px; color: #aaa; font-family: sans-serif;"
            >Сохранить для Web - image.jpg</span
          >
        </div>
        <button class="ps-btn" style="width: 70px;">Отмена</button>
        <button class="ps-btn" (click)="applyQuickResize()" style="width: 70px;">Готово</button>
        <button
          class="ps-btn ps-btn-primary"
          (click)="applyTargetSize()"
          style="width: 90px; font-weight: 700;"
        >
          Сохранить...
        </button>
      </div>
    </div>
  `,
  styles: [
    `
      .debug-container {
        display: flex;
        flex-direction: column;
        width: 100%;
        height: 880px;
        position: relative;
        z-index: 100;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial,
          sans-serif;
        color: #d9d9d9;
        background: #262626;
        overflow: hidden;
        font-size: 11px;
      }

      .header {
        height: 40px;
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

      .preview-image-mock {
        width: 80%;
        height: 80%;
        background: rgba(255, 255, 255, 0.02);
        border: 1px solid #444;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10;
        box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
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
        color: #999;
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
        margin-top: 4px;
      }

      .ps-slider {
        flex: 1;
        height: 4px;
        background: #111;
        border-radius: 2px;
        position: relative;
      }

      .ps-slider-fill {
        width: 90%;
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
        left: 90%;
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

      .ps-align-btn:hover {
        background: #555;
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
        color: #888;
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
export class DebugModalComponent {
  readonly #modal = inject(NzModalRef);
  // Crop shape state: 'rectangle' or 'circle'
  cropShape: 'rectangle' | 'circle' = 'rectangle';

  // Resize control state
  targetWidth = 176;
  targetHeight = 240;
  targetLocked = false;

  quickWidth = 220;
  quickHeight = 300;
  quickLocked = true;

  fixedProportions = false;
  showGrid = true;

  presets = [
    { icon: '📷', label: 'Instagram Post', size: '1080 × 1080' },
    { icon: '📱', label: 'Instagram Story', size: '1080 × 1920' },
    { icon: '▶️', label: 'YouTube Thumb', size: '1280 × 720' },
    { icon: '📺', label: 'Full HD', size: '1920 × 1080' },
    { icon: '🎬', label: 'TikTok Video', size: '1080 × 1920' },
    { icon: '👤', label: 'Facebook Post', size: '1200 × 630' },
    { icon: '🐦', label: 'Twitter Post', size: '1200 × 675' },
    { icon: '💼', label: 'LinkedIn Cover', size: '1584 × 396' },
  ];

  // Circle crop state
  circleRadius = 100;
  circleX = 150;
  circleY = 150;

  setCropShape(shape: 'rectangle' | 'circle'): void {
    this.cropShape = shape;
  }

  toggleTargetLock(): void {
    this.targetLocked = !this.targetLocked;
  }

  toggleQuickLock(): void {
    this.quickLocked = !this.quickLocked;
  }

  applyTargetSize(): void {
    console.log('Apply target size:', this.targetWidth, this.targetHeight);
  }

  applyQuickResize(): void {
    console.log('Apply quick resize:', this.quickWidth, this.quickHeight);
  }

  applyPreset(preset: any): void {
    console.log('Apply preset:', preset);
  }

  applyCircleCrop(): void {
    console.log('Apply circle crop:', this.circleRadius, this.circleX, this.circleY);
  }

  seoAlt = '';
  seoDescription = '';
  seoTitle = '';
  seoTooltip = '';
  seoCaption = '';

  // Link state
  linkUrl = '';
  linkClickable = false;
  linkInNewWindow = false;

  imageUrl = '';
}
