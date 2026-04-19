import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzSkeletonModule } from 'ng-zorro-antd/skeleton';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { FormsModule } from '@angular/forms';
import { AvTinymceControlComponent } from '../../../../assets/controls/tinymce-control/tinymce-control.component';
import { MarkdownControlComponent } from '../../../../assets/controls/markdown-control/markdown-control.component';
import { IconLaboratoryService } from '@shared/services/icon-laboratory.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { HelpPathHeaderComponent } from '@shared/components/ui';


@Component({
  selector: 'app-help-documentation',
  standalone: true,
  imports: [
    CommonModule,
    NzPageHeaderModule,
    NzCardModule,
    NzTypographyModule,
    NzSkeletonModule,
    NzButtonModule,
    NzIconModule,
    FormsModule,
    AvTinymceControlComponent,
    MarkdownControlComponent,
    ClipboardModule,
    NzToolTipModule,
    HelpPathHeaderComponent
  ],
  template: `
    <div class="help-container">
      <nz-page-header
        class="site-page-header"
        [nzTitle]="title()"
        nzSubtitle="Редактирование документации (Direct Editor Mode)"
      >
        <nz-page-header-extra>
          <div class="header-actions">
            <button nz-button nzType="primary" (click)="saveContent()" [nzLoading]="saving()">
              <span nz-icon nzType="save"></span> Сохранить изменения
            </button>
          </div>
        </nz-page-header-extra>
      </nz-page-header>

      <av-help-path-header
        [title]="title()"
        subtitle="Редактирование документации (Direct Editor Mode)"
        icon="✍️"
        componentPath="src/app/pages/help/help-documentation/help-documentation.component.ts"
        [docPath]="'src/documentation/' + currentFileName"
      ></av-help-path-header>

      <nz-card [nzLoading]="loading()" style="margin: 16px;">
        <div class="editor-section">
          @if (editorType() === 'tinymce') {
            <av-tinymce-control
              [(ngModel)]="editValue"
              [height]="700"
              label="Редактор TinyMCE (файл: {{ currentFileName }})">
            </av-tinymce-control>
          } @else {
            <av-markdown-control
              [(ngModel)]="editValue"
              height="700px"
              label="Редактор EasyMDE (файл: {{ currentFileName }})">
            </av-markdown-control>
          }
        </div>
      </nz-card>
      
      <!-- Конец редактора -->
    </div>
  `,
  styles: [`
    .help-header { display: none; }
    .header-actions {
      display: flex;
      gap: 8px;
    }
    .editor-section {
      background: #fff;
      min-height: 700px;
    }
    .debug-info-block {
      margin: 16px;
      padding: 16px;
      border: 1px solid #e8e8e8;
      background: #fafafa;
      border-radius: 8px;
    }
    .info-row {
      display: flex;
      align-items: center;
      margin-bottom: 8px;
      gap: 12px;
    }
    .info-label {
      font-weight: 600;
      color: #595959;
      min-width: 140px;
    }
    .info-path {
      background: #fff;
      padding: 2px 8px;
      border: 1px solid #d9d9d9;
      border-radius: 4px;
      font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
      font-size: 13px;
      color: #1890ff;
      flex: 1;
    }
    .info-actions {
      display: flex;
      gap: 4px;
    }
    .copy-btn, .open-btn {
      color: #8c8c8c;
      transition: all 0.3s;
    }
    .copy-btn:hover {
      color: #1890ff;
      background: #e6f7ff;
    }
    .open-btn:hover {
      color: #52c41a;
      background: #f6ffed;
    }
    .related-files-section {
      margin-top: 20px;
      padding-top: 15px;
      border-top: 1px dashed #d9d9d9;
    }
    .divider-text {
      font-size: 12px;
      font-weight: 700;
      color: #8c8c8c;
      text-transform: uppercase;
      margin-bottom: 12px;
      letter-spacing: 1px;
    }
    .info-row.mini {
      margin-bottom: 4px;
      gap: 8px;
    }
    .info-row.mini .info-label {
      min-width: 100px;
      font-size: 12px;
    }
    .info-row.mini .info-path {
      font-size: 11px;
      padding: 1px 6px;
      color: #595959;
    }
    .raw-data-section {
      margin-top: 16px;
      border-top: 1px solid #e8e8e8;
      padding-top: 12px;
    }
    .debug-pre {
      max-height: 300px;
      overflow: auto;
      background: #272822;
      color: #f8f8f2;
      padding: 12px;
      border-radius: 4px;
      font-size: 12px;
      margin-top: 8px;
    }
    summary {
      cursor: pointer;
      color: #8c8c8c;
      outline: none;
      user-select: none;
    }
    summary:hover {
      color: #595959;
    }
  `]
})
export class HelpDocumentationComponent implements OnInit {
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);
  private iconLabService = inject(IconLaboratoryService);
  private message = inject(NzMessageService);

  title = signal<string>('Справка');
  content = signal<string>(''); // Оригинал
  editValue = signal<string>(''); // Рабочая область
  
  loading = signal<boolean>(true);
  saving = signal<boolean>(false);
  
  editorType = signal<'tinymce' | 'markdown'>('tinymce');
  currentFileName = '';

  ngOnInit(): void {
    this.route.data.subscribe(data => {
      this.title.set(data['title'] || 'Справка');
      this.currentFileName = data['fileName'];
      this.editorType.set(data['editorType'] || 'tinymce');
      
      if (this.currentFileName) {
        this.loadDocumentation(this.currentFileName);
      }
    });
  }

  saveContent(): void {
    if (!this.currentFileName) return;

    this.saving.set(true);
    const savePath = `src/documentation/`;
    
    this.iconLabService.saveToDisk(this.currentFileName, savePath, this.editValue()).subscribe({
      next: () => {
        this.content.set(this.editValue());
        this.saving.set(false);
        this.message.success('Файл ' + this.currentFileName + ' успешно сохранен!');
      },
      error: (err) => {
        this.message.error('Ошибка сохранения: ' + err.message);
        this.saving.set(false);
      }
    });
  }

  private loadDocumentation(fileName: string): void {
    this.loading.set(true);
    const url = `/documentation/${fileName}?t=${Date.now()}`;
    
    this.http.get(url, { responseType: 'text' }).subscribe({
      next: (val) => {
        this.content.set(val);
        this.editValue.set(val); // Сразу загружаем в редактор
        this.loading.set(false);
      },
      error: (err) => {
        this.content.set('Ошибка загрузки: ' + err.message);
        this.loading.set(false);
      }
    });
  }

  openInEditor(path: string): void {
    this.iconLabService.openFile(path).subscribe({
      next: () => this.message.success('Запрос на открытие файла отправлен'),
      error: (err) => this.message.error('Не удалось открыть файл: ' + (err.error?.message || err.message))
    });
  }
}
