import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { AvImageStudioModalComponent } from '@shared/components/av-image-studio-modal/av-image-studio-modal.component';
import { AvImageUploadResult } from '@shared/components/av-image-studio-modal/models/av-image-studio-modal.model';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzModalService } from 'ng-zorro-antd/modal';

@Component({
  selector: 'app-test-image-studio',
  standalone: true,
  imports: [CommonModule, NzButtonModule, NzInputModule, FormsModule],
  template: `
    <div class="stand-container">
      <header class="stand-header">
        <h2>🎨 AvImageStudio Debug Stand</h2>
        <p>Стенд для отладки верстки и логики компонента Студии Изображений.</p>
      </header>

      <div class="stand-body">
        <!-- Input section -->
        <div class="control-panel">
          <label>URL картинки для теста:</label>
          <div class="input-row">
            <input nz-input [(ngModel)]="testImageUrl" placeholder="https://..." />
            <button nz-button nzType="primary" (click)="openStudio()">Открыть Студию</button>
          </div>
          <div class="quick-links">
            <button
              nz-button
              nzType="link"
              (click)="testImageUrl = 'https://images.unsplash.com/photo-1542831371-29b0f74f9713'"
            >
              Sample 1
            </button>
            <button
              nz-button
              nzType="link"
              (click)="
                testImageUrl = 'https://images.unsplash.com/photo-1506744038136-46273834b3fb'
              "
            >
              Sample 2
            </button>
          </div>
        </div>

        <!-- Result section (Always visible) -->
        <div class="result-panel">
          <h3>Результат обработки:</h3>

          <div class="result-grid">
            <!-- Visual Preview -->
            <div class="preview-box">
              <div class="label">Визуальный превью (вставлено как HTML):</div>
              <div class="fixed-container-300">
                <div
                  class="render-area-dynamic"
                  [innerHTML]="safeHtml || '<i>Ожидание данных...</i>'"
                ></div>
              </div>
            </div>

            <!-- Fixed Test Box -->
            <div class="preview-box">
              <div class="label">Тест контейнера (Прямая ссылка 300x300):</div>
              <div class="fixed-container-300">
                <img
                  src="https://localhost:7233/uploads/studio/2026/01/11/111111-d332ffe6.jpg"
                  alt="Static Test"
                  class="fit-image"
                />
              </div>
              <p style="font-size: 10px; color: #555; margin-top: 10px;">
                URL: .../111111-d332ffe6.jpg
              </p>
            </div>
          </div>

          <div class="code-box" style="margin-top: 30px;">
            <div class="label">Код (figure):</div>
            <pre><code>{{ generatedHtml || 'HTML код появится здесь...' }}</code></pre>

            <div class="label" style="margin-top: 20px;">RAW JSON:</div>
            <pre><code class="json">{{ (lastResult | json) || 'JSON объект появится здесь...' }}</code></pre>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .stand-container {
        padding: 40px;
        max-width: 1400px;
        margin: 0 auto;
        color: #e0e0e0;
        font-family: 'Segoe UI', sans-serif;
      }
      .stand-header h2 {
        color: #fff;
        margin: 0;
      }
      .stand-header p {
        color: #888;
        margin: 8px 0 24px;
      }

      .control-panel {
        background: #2a2a2a;
        padding: 24px;
        border-radius: 8px;
        border: 1px solid #333;
        margin-bottom: 30px;
      }
      .control-panel label {
        display: block;
        margin-bottom: 8px;
        color: #aaa;
        font-size: 12px;
      }
      .input-row {
        display: flex;
        gap: 12px;
      }
      .quick-links {
        margin-top: 8px;
      }

      .result-panel h3 {
        color: #52c41a;
        margin-bottom: 20px;
      }
      .result-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 30px;
      }

      .preview-box,
      .code-box {
        background: #1a1a1a;
        border: 1px solid #333;
        border-radius: 8px;
        padding: 20px;
      }
      .label {
        font-size: 11px;
        text-transform: uppercase;
        color: #666;
        font-weight: 700;
        margin-bottom: 12px;
      }

      .render-area-dynamic {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #000;
      }

      .fixed-container-300 {
        width: 300px;
        height: 300px;
        background: #fff;
        border: 2px solid #52c41a;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
        margin: 0 auto;
        border-radius: 4px;
        position: relative;
      }

      .fixed-container-300 .fit-image {
        width: 100%;
        height: 100%;
        object-fit: contain; /* Вписываем картинку в 300x300 */
        display: block;
      }

      /* Стили для имитации реального контента внутри динамической зоны */
      .av-image-figure {
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
      }
      .av-image-figure img {
        max-width: 100% !important;
        max-height: 100% !important;
        height: auto !important;
        width: auto !important;
        display: block;
        object-fit: contain;
      }
      .av-align-center {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
      }
      .av-align-left {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        text-align: left;
      }
      .av-align-right {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        text-align: right;
      }
      figcaption {
        margin-top: 8px;
        font-size: 14px;
        color: #666;
        font-style: italic;
      }

      pre {
        background: #000;
        padding: 15px;
        border-radius: 4px;
        overflow-x: auto;
        border: 1px solid #222;
      }
      code {
        color: #d4d4d4;
        font-family: 'Consolas', monospace;
        font-size: 13px;
      }
      .json {
        color: #9cdcfe;
      }

      /* Figure styling for the preview */
      ::ng-deep figure.av-image-figure {
        margin: 0;
        padding: 10px;
        border: 1px dashed #ccc;
        display: inline-block;
      }
      ::ng-deep figure.av-image-figure img {
        max-width: 100%;
        height: auto;
        display: block;
      }
      ::ng-deep figure.av-image-figure figcaption {
        margin-top: 8px;
        font-size: 13px;
        color: #666;
        font-style: italic;
        text-align: center;
      }
    `,
  ],
})
export class TestImageStudioComponent {
  private modal = inject(NzModalService);

  testImageUrl = 'https://images.unsplash.com/photo-1542831371-29b0f74f9713';
  lastResult: AvImageUploadResult | null = null;
  generatedHtml = '';
  safeHtml: SafeHtml = '';
  private sanitizer = inject(DomSanitizer);

  openStudio() {
    const modalRef = this.modal.create({
      nzTitle: 'Aurora Image Studio',
      nzContent: AvImageStudioModalComponent,
      nzData: {
        imageUrl: this.testImageUrl,
        metadata: { altText: 'Sample Alt', titleText: 'Sample Title' },
      },
      nzWidth: 1200,
      nzFooter: null,
      nzMaskClosable: false,
      nzClosable: true,
      nzStyle: { top: '20px' },
    });

    modalRef.afterClose.subscribe((result: AvImageUploadResult | undefined) => {
      console.log('Studio result received:', result);
      if (result) {
        this.lastResult = result;
        const html = this.buildFigureTag(result);
        console.log('Built Figure HTML:', html);
        this.generatedHtml = html;
        this.safeHtml = this.sanitizer.bypassSecurityTrustHtml(html);
      }
    });
  }

  private buildFigureTag(res: AvImageUploadResult): string {
    const meta = res.metadata;
    if (!meta) return `<img src="${res.dataUrl}" alt="" />`;

    const alignClass = meta.align ? ` av-align-${meta.align}` : '';
    const alt = meta.altText ? ` alt="${meta.altText}"` : '';
    const title = meta.titleText ? ` title="${meta.titleText}"` : '';
    const style = `style="width: ${res.width}px; height: auto;"`;

    const fullUrl = res.dataUrl;
    let imgHtml = `<img src="${fullUrl}"${alt}${title} ${style} />`;

    if (meta.isClickable && meta.linkUrl) {
      const target = meta.isOpenNewWindow ? ' target="_blank"' : '';
      imgHtml = `<a href="${meta.linkUrl}"${target}>${imgHtml}</a>`;
    }

    const captionHtml = meta.caption ? `<figcaption>${meta.caption}</figcaption>` : '';

    return `<figure class="av-image-figure${alignClass}">\n  ${imgHtml}\n  ${captionHtml}\n</figure>`;
  }
}
