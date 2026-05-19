import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ImageEditorMainComponent } from '@shared/components/av-image-editor-vs/components/image-editor-main/image-editor-main.component';
import { ImageEditorConfig } from '@shared/components/av-image-editor-vs/models/editor-config.model';
import { AvImageEditorOutput } from '@shared/components/av-image-editor-vs/models/image-result.model';
import { AvMonitorService } from '@shared/components/ui';
import { VSModalService } from '@shared/components/ui/vs-modal-compromise';

@Component({
  selector: 'app-test-image-editor-vs',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="test-stand">
      <header class="test-header">
        <h1>🛠️ Стенд отладки: Image Editor VS</h1>
        <p>Тестирование автономного редактора на базе движка Compromise</p>
        <p>файл теста test-image-editor-vs.component.ts</p>
        <p>файл компонента загрузки картинки src/app/shared/components/av-image-editor-vs</p>
      </header>

      <main class="test-content">
        <!-- ПАНЕЛЬ УПРАВЛЕНИЯ СТЕНДОМ -->
        <section class="config-panel">
          <h3 class="section-title">Библиотека образцов</h3>
          <div class="test-buttons">
            <button
              class="test-btn portrait"
              (click)="
                openEditor('https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800')
              "
            >
              👩 Портрет (Высокий)
            </button>
            <button
              class="test-btn landscape"
              (click)="
                openEditor('https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200')
              "
            >
              🏞️ Пейзаж (Широкий)
            </button>
            <button
              class="test-btn small"
              (click)="openEditor('https://cdn-icons-png.flaticon.com/512/168/168728.png')"
            >
              🎨 Иконка (Маленькая)
            </button>
            <button
              class="test-btn heavy"
              (click)="openEditor('https://wallpapers.com/images/featured/4k-m88p6n7t6k90r896.jpg')"
            >
              🚀 Тяжелое фото 4K
            </button>
          </div>

          <h3 class="section-title" style="margin-top: 24px;">Настройки запуска</h3>
          <div class="settings-grid">
            <div class="setting-item">
              <label>Aspect Ratio:</label>
              <select #ratioSelect class="test-select">
                <option value="0">Свободный</option>
                <option value="1">1:1 (Квадрат)</option>
                <option value="1.777">16:9 (HD)</option>
                <option value="0.75">3:4 (Портрет)</option>
              </select>
            </div>
          </div>
        </section>

        <!-- ЗОНА РЕЗУЛЬТАТА -->
        <section class="result-lab">
          <h3 class="section-title">Лаборатория результата</h3>

          <div class="result-placeholder" *ngIf="!lastResult">
            Ожидание обработки изображения...
          </div>

          <div class="result-card" *ngIf="lastResult">
            <div class="result-preview-group">
              <div class="preview-item">
                <label>Raw (img):</label>
                <div class="preview-box">
                  <img [src]="lastResult.url" alt="Result" />
                </div>
              </div>
              <div class="preview-item">
                <label>Real World (figure):</label>
                <div
                  class="preview-box figure-render"
                  [innerHTML]="safeHtml || lastResult.htmlSnippet"
                ></div>
              </div>
            </div>
            <div class="result-info">
              <div class="info-row">
                <span class="info-label">Статус:</span>
                <span class="info-value status-ok">Готово</span>
              </div>
              <div class="info-row">
                <span class="info-label">Размеры:</span>
                <span class="info-value">{{ lastResult.width }} × {{ lastResult.height }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Формат / Вес:</span>
                <span class="info-value"
                  >{{ lastResult.format }} / {{ (lastResult.size / 1024).toFixed(1) }} KB</span
                >
              </div>
              <div class="info-row">
                <span class="info-label">Alt:</span>
                <span class="info-value">{{ lastResult.alt }}</span>
              </div>

              <div class="snippet-box" *ngIf="lastResult.htmlSnippet">
                <label>HTML Snippet:</label>
                <code>{{ lastResult.htmlSnippet }}</code>
              </div>

              <div class="actions-row">
                <button class="monitor-btn" (click)="showMonitor()">🖥️ Monitor Data</button>
              </div>

              <pre class="debug-json">{{ lastResultJson }}</pre>
            </div>
          </div>
        </section>
      </main>

      <!-- НОВЫЙ БЛОК: ОТОБРАЖЕНИЕ В ПОЛНЫЙ РАЗМЕР (Actual Render) -->
      <section class="actual-render-stand" *ngIf="lastResult">
        <h3 class="section-title">Actual Render Stage (1:1)</h3>
        <div class="render-backdrop">
          <div class="article-emulator">
            <div class="canvas-1-to-1" [innerHTML]="safeHtml || lastResult.htmlSnippet"></div>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [
    `
      .test-stand {
        padding: 0;
        color: #e0e0e0;
        font-family:
          'Segoe UI',
          system-ui,
          -apple-system,
          sans-serif;
      }

      .test-header {
        margin-bottom: 32px;
        border-bottom: 1px solid #333;
        padding-bottom: 16px;
        h1 {
          color: #fff;
          margin: 0;
          font-size: 28px;
        }
        p {
          color: #888;
          margin: 5px 0 0;
        }
      }

      .test-content {
        display: grid;
        grid-template-columns: 350px 1fr;
        gap: 32px;
      }

      .section-title {
        font-size: 14px;
        text-transform: uppercase;
        letter-spacing: 1px;
        color: #007acc;
        margin-bottom: 16px;
      }

      /* КНОПКИ */
      .test-buttons {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .test-btn {
        background: #333;
        border: 1px solid #444;
        color: #fff;
        padding: 12px 16px;
        text-align: left;
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.2s;
        font-size: 14px;
        &:hover {
          background: #444;
          border-color: #007acc;
          transform: translateX(5px);
        }
        &.portrait {
          border-left: 4px solid #ff4d4f;
        }
        &.landscape {
          border-left: 4px solid #52c41a;
        }
        &.small {
          border-left: 4px solid #1890ff;
        }
        &.heavy {
          border-left: 44px solid #faad14;
        }
      }

      /* НАСТРОЙКИ */
      .test-select {
        width: 100%;
        background: #1e1e1e;
        border: 1px solid #444;
        color: #ccc;
        padding: 8px;
        border-radius: 4px;
        margin-top: 5px;
      }

      /* РЕЗУЛЬТАТЫ */
      .result-lab {
        background: #1e1e1e;
        border-radius: 12px;
        padding: 24px;
        border: 1px solid #333;
        min-height: 400px;
      }

      .result-placeholder {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 300px;
        color: #444;
        font-style: italic;
        border: 2px dashed #444;
        border-radius: 8px;
      }

      .result-card {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 24px;
      }

      .result-preview-group {
        display: flex;
        flex-direction: column;
        gap: 16px;
        .preview-item {
          label {
            font-size: 10px;
            color: #666;
            margin-bottom: 4px;
            display: block;
            text-transform: uppercase;
          }
          .preview-box {
            background: #111;
            padding: 10px;
            border-radius: 8px;
            border: 1px solid #333;
            img {
              max-width: 100%;
              border-radius: 4px;
              box-shadow: 0 5px 15px rgba(0, 0, 0, 0.5);
            }
          }
          .figure-render {
            background: #fff;
            color: #000;
            ::ng-deep figure {
              margin: 0;
              img {
                max-width: 100%;
                height: auto;
              }
            }
          }
        }
      }

      .result-info {
        .info-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid #333;
        }
        .info-label {
          color: #888;
        }
        .info-value {
          color: #fff;
          font-weight: 600;
        }
        .status-ok {
          color: #52c41a;
        }
      }

      .debug-json {
        background: #000;
        padding: 12px;
        border-radius: 6px;
        font-size: 11px;
        color: #a9d1ff;
        margin-top: 16px;
        overflow-x: auto;
        max-height: 200px;
      }

      .snippet-box {
        margin-top: 16px;
        background: #111;
        padding: 10px;
        border-radius: 4px;
        border: 1px solid #333;
        label {
          display: block;
          font-size: 10px;
          color: #666;
          text-transform: uppercase;
          margin-bottom: 4px;
        }
        code {
          font-family: 'Consolas', monospace;
          color: #ce9178;
          font-size: 12px;
          word-break: break-all;
        }
      }

      .actions-row {
        margin-top: 16px;
      }

      .monitor-btn {
        background: #007acc;
        color: white;
        border: none;
        padding: 8px 16px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 12px;
        &:hover {
          background: #005f99;
        }
      }

      .actual-render-stand {
        margin-top: 48px;
        padding-top: 32px;
        border-top: 1px solid #333;

        .render-backdrop {
          background: #111;
          padding: 60px 20px;
          border-radius: 12px;
          border: 1px solid #333;
          overflow-x: auto;
          display: flex;
          justify-content: center;
        }

        .article-emulator {
          background: #fff;
          width: 800px;
          padding: 40px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
          position: relative;
          min-height: 200px;
          flex-shrink: 0;

          &::before {
            content: 'Article Content Preview (800px)';
            position: absolute;
            top: 10px;
            left: 10px;
            font-size: 10px;
            color: #bfbfbf;
            text-transform: uppercase;
            letter-spacing: 1px;
          }

          .canvas-1-to-1 {
            ::ng-deep figure {
              margin: 0;
            }
          }
        }
      }
    `,
  ],
})
export class TestImageEditorVsComponent {
  private readonly vsModal = inject(VSModalService);
  private readonly monitor = inject(AvMonitorService);
  private readonly sanitizer = inject(DomSanitizer);

  lastResult: AvImageEditorOutput | null = null;
  lastResultJson = '';
  safeHtml: SafeHtml | null = null;

  openEditor(imageUrl: string): void {
    const config: ImageEditorConfig = {
      image: imageUrl,
      title: 'Aurora Studio VS (Debug Stand)',
      defaultQuality: 90,
      defaultFormat: 'image/jpeg',
    };

    console.log('🚀 Opening Editor with config:', config);

    const ref = this.vsModal.open(ImageEditorMainComponent, {
      title: 'Aurora Studio VS - Debug Stand',
      width: '75vw',
      height: '90vh',
      data: config,
      resizable: true,
      draggable: true,
    });

    ref.afterClosed().subscribe((result: AvImageEditorOutput) => {
      if (result) {
        console.log('💎 Editor returned result:', result);
        this.lastResult = result;
        this.lastResultJson = JSON.stringify(result, null, 2);
        this.safeHtml = this.sanitizer.bypassSecurityTrustHtml(result.htmlSnippet);
      }
    });
  }

  showMonitor(): void {
    if (!this.lastResult) return;

    this.monitor.show({
      title: 'Data Monitoring',
      imageUrl: this.lastResult.url,
      imageHtml: this.lastResult.htmlSnippet,
      imageJson: this.lastResult,
      data: [
        {
          name: 'File',
          value: 'src/app/pages/tools/test-image-editor-vs/test-image-editor-vs.component.ts',
        },

        { name: 'File Name', value: this.lastResult.name },
        { name: 'Dimensions', value: `${this.lastResult.width}x${this.lastResult.height}` },
        { name: 'Format', value: this.lastResult.format },
        { name: 'Alt Text', value: this.lastResult.alt },
        { name: 'Align', value: this.lastResult.align },
        { name: 'HTML Snippet', value: this.lastResult.htmlSnippet },
      ],
    });
  }
}
