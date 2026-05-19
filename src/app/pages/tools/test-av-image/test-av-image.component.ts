import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms'; // Важно для ngModel
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTypographyModule } from 'ng-zorro-antd/typography';

import { AvImagePickerComponent } from '@shared/components/av-image-uploader/av-image-picker.component';
import { AvImageProcessingService } from '@shared/components/av-image-uploader/av-image-processing.service';
import {
  AvExportSettings,
  AvImageUploadResult,
} from '@shared/components/av-image-uploader/av-image.model';

@Component({
  selector: 'app-test-av-image',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzCardModule,
    NzGridModule,
    NzTypographyModule,
    NzButtonModule,
    NzIconModule,
    AvImagePickerComponent, // Наш новый компонент
  ],
  template: `
    <div class="container">
      <h1 nz-typography>Тестирование AvImageUploader 🖼️</h1>

      <div nz-row [nzGutter]="16">
        <div nz-col nzSpan="12">
          <nz-card nzTitle="Picker Component (Интеграция в формы)">
            <p>Попробуйте загрузить изображение через UI:</p>

            <!-- THE PICKER -->
            <div style="height: 200px; margin-bottom: 20px;">
              <av-image-picker [(ngModel)]="pickerUrl"></av-image-picker>
            </div>

            <div class="debug-val" *ngIf="pickerUrl">
              <strong>Model Value:</strong>
              <div class="code">
                {{ pickerUrl | slice: 0 : 50 }}... (Base64 Length: {{ pickerUrl.length }})
              </div>
            </div>
          </nz-card>
        </div>

        <div nz-col nzSpan="12">
          <nz-card nzTitle="Лог событий">
            <div class="log-console">
              <div *ngFor="let log of logs">{{ log }}</div>
            </div>
          </nz-card>
        </div>
      </div>

      <div nz-row [nzGutter]="16" style="margin-top: 20px;">
        <div nz-col nzSpan="24">
          <nz-card nzTitle="Core Service Playground (Low Level Test)">
            <div style="display: flex; gap: 20px;">
              <div>
                <input #fileInput type="file" (change)="onFileSelected($event)" accept="image/*" />
                <div *ngIf="originalImage" class="controls-panel">
                  <p>
                    Исходный размер: {{ originalImage.naturalWidth }} x
                    {{ originalImage.naturalHeight }}
                  </p>
                  <hr />
                  <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                    <button nz-button nzType="default" (click)="testResize(300)">
                      Resize to 300px
                    </button>
                    <button nz-button nzType="default" (click)="testCropCenter()">
                      Crop Center (50%)
                    </button>
                    <button nz-button nzType="primary" (click)="testConvert('image/webp')">
                      Convert to WebP
                    </button>
                  </div>
                </div>
              </div>

              <div
                style="flex: 1; text-align: center; background: #f0f2f5; padding: 10px; border-radius: 8px;"
              >
                <div *ngIf="result">
                  <img [src]="result.dataUrl" class="preview-img" />
                  <div class="info-tag">
                    {{ result.width }}x{{ result.height }} |
                    {{ (result.size / 1024).toFixed(1) }} KB |
                    {{ result.file.type }}
                  </div>
                </div>
                <span *ngIf="!result" style="color: #999; line-height: 200px;"
                  >Результат обработки сервисом</span
                >
              </div>
            </div>
          </nz-card>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .container {
        padding: 24px;
      }
      .debug-val {
        margin-top: 10px;
        padding: 10px;
        background: #e6f7ff;
        border: 1px solid #91d5ff;
        border-radius: 4px;
      }
      .code {
        font-family: monospace;
        word-break: break-all;
        color: #0050b3;
        font-size: 12px;
      }
      .preview-img {
        max-width: 100%;
        max-height: 300px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      }
      .info-tag {
        margin-top: 10px;
        font-family: monospace;
        background: #333;
        color: #fff;
        padding: 4px 10px;
        border-radius: 4px;
        display: inline-block;
      }
      .controls-panel {
        margin-top: 15px;
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .log-console {
        background: #1e1e1e;
        color: #00ff00;
        padding: 12px;
        height: 200px;
        overflow-y: auto;
        font-family: monospace;
        font-size: 12px;
        border-radius: 4px;
      }
    `,
  ],
})
export class TestAvImageComponent {
  private imageService = inject(AvImageProcessingService);

  logs: string[] = [];
  pickerUrl: string | null = null; // Для ngModel

  originalImage: HTMLImageElement | null = null;
  result: AvImageUploadResult | null = null;

  constructor() {
    this.addLog('Test Component Ready.');
  }

  addLog(msg: string) {
    this.logs.unshift(`> ${msg}`);
  }

  // --- Core Service Tests ---
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    this.addLog(`File selected: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`);
    this.imageService.readAsDataUrl(file).subscribe((url) => {
      this.imageService.loadImage(url).subscribe((img) => {
        this.originalImage = img;
        this.runProcess();
      });
    });
  }

  testResize(width: number) {
    if (!this.originalImage) return;
    const ratio = this.originalImage.naturalHeight / this.originalImage.naturalWidth;
    const height = Math.round(width * ratio);
    this.runProcess({ targetSize: { width, height }, quality: 90, format: 'image/jpeg' });
  }

  testCropCenter() {
    if (!this.originalImage) return;
    const w = this.originalImage.naturalWidth;
    const h = this.originalImage.naturalHeight;
    const cropRect = { x: w * 0.25, y: h * 0.25, width: w * 0.5, height: h * 0.5 };
    this.runProcess({ quality: 90, format: 'image/jpeg' }, { cropRect });
  }

  testConvert(format: any) {
    this.runProcess({ quality: 80, format });
  }

  private runProcess(
    settings: AvExportSettings = { quality: 90, format: 'image/jpeg' },
    stateOverrides: any = {},
  ) {
    if (!this.originalImage) return;
    const state = {
      scale: 1,
      rotation: 0,
      flipH: false,
      flipV: false,
      cropRect: null,
      isProcessing: true,
      originalImage: this.originalImage,
      ...stateOverrides,
    };

    const start = performance.now();
    this.imageService.processImage(this.originalImage, state, settings).subscribe({
      next: (res) => {
        const time = (performance.now() - start).toFixed(0);
        this.result = res;
        this.addLog(`Service: Processed in ${time}ms | ${res.width}x${res.height}`);
      },
      error: (err) => this.addLog(`ERROR: ${err}`),
    });
  }
}
