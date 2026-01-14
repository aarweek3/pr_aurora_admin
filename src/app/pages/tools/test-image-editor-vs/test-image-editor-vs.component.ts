import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ImageEditorMainComponent } from '@shared/components/av-image-editor-vs/components/image-editor-main/image-editor-main.component';
import { ImageEditorConfig } from '@shared/components/av-image-editor-vs/models/editor-config.model';
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
            <div class="result-preview">
              <img [src]="lastResult.dataUrl" alt="Result" />
            </div>
            <div class="result-info">
              <div class="info-row">
                <span class="info-label">Статус:</span>
                <span class="info-value status-ok">Готово</span>
              </div>
              <div class="info-row">
                <span class="info-label">Размеры:</span>
                <span class="info-value">1200 × 800</span>
              </div>
              <div class="info-row">
                <span class="info-label">Вес:</span>
                <span class="info-value">145 KB</span>
              </div>
              <pre class="debug-json">{{ lastResultJson }}</pre>
            </div>
          </div>
        </section>
      </main>
    </div>
  `,
  styles: [
    `
      .test-stand {
        padding: 0;
        color: #e0e0e0;
        font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
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

      .result-preview {
        background: #111;
        padding: 10px;
        border-radius: 8px;
        img {
          max-width: 100%;
          border-radius: 4px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
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
      }
    `,
  ],
})
export class TestImageEditorVsComponent {
  private readonly vsModal = inject(VSModalService);

  lastResult: any = null;
  lastResultJson: string = '';

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
      width: '95vw',
      height: '90vh',
      data: config,
      resizable: true,
      draggable: true,
    });

    ref.afterClosed().subscribe((result) => {
      if (result) {
        console.log('💎 Editor returned result:', result);
        this.lastResult = {
          dataUrl: imageUrl, // Временно используем оригинал для теста верстки
        };
        this.lastResultJson = JSON.stringify(result, null, 2);
      }
    });
  }
}
