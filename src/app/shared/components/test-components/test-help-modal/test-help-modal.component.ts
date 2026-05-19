import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import {
  HelpUniversalModalComponent,
  HelpBlock,
} from '@shared/components/help-universal-modal/help-universal-modal.component';

@Component({
  selector: 'app-test-help-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzButtonModule,
    NzCardModule,
    NzFormModule,
    NzInputModule,
    NzTypographyModule,
    NzIconModule,
    NzDividerModule,
  ],
  template: `
    <div style="padding: 24px; max-width: 1400px; margin: 0 auto;">
      <h1 nz-typography>Тестирование универсальной справки (Блочный режим)</h1>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px;">
        <!-- Секция 1: Настройки -->
        <div style="display: flex; flex-direction: column; gap: 24px;">
          <nz-card nzTitle="Основные метаданные">
            <form nz-form nzLayout="vertical">
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                <nz-form-item>
                  <nz-form-label>Иконка / Путь</nz-form-label>
                  <nz-form-control>
                    <input
                      nz-input
                      [(ngModel)]="liveData.icon"
                      name="icon"
                      (ngModelChange)="updateJson()"
                    />
                  </nz-form-control>
                </nz-form-item>
                <nz-form-item>
                  <nz-form-label>Ширина</nz-form-label>
                  <nz-form-control>
                    <input
                      nz-input
                      [(ngModel)]="liveData.width"
                      name="width"
                      (ngModelChange)="updateJson()"
                    />
                  </nz-form-control>
                </nz-form-item>
              </div>

              <nz-form-item>
                <nz-form-label>Заголовок Справки</nz-form-label>
                <nz-form-control>
                  <input
                    nz-input
                    [(ngModel)]="liveData.title"
                    name="title"
                    (ngModelChange)="updateJson()"
                  />
                </nz-form-control>
              </nz-form-item>

              <button
                nz-button
                nzBlock
                nzType="primary"
                (click)="openLiveHelp()"
                style="height: 45px;"
              >
                <span nz-icon nzType="thunderbolt"></span> Запустить Справку
              </button>
            </form>
          </nz-card>

          <nz-card nzTitle="Управление блоками (Быстрые действия)">
            <div style="display: flex; flex-wrap: wrap; gap: 8px;">
              <button nz-button (click)="addTestBlock()">+ Добавить блок</button>
              <button nz-button nzDanger (click)="clearBlocks()">Очистить блоки</button>
              <nz-divider nzType="vertical"></nz-divider>
              <button nz-button nzType="dashed" (click)="loadPreset('multi')">
                Пресет: Несколько разделов
              </button>
              <button nz-button nzType="dashed" (click)="loadPreset('legacy')">
                Пресет: Старый формат
              </button>
            </div>
          </nz-card>
        </div>

        <!-- Секция 2: JSON Редактор -->
        <nz-card nzTitle="Результирующий JSON (Data-Driven)">
          <div class="json-editor-wrapper">
            <div class="json-highlight-layer" [innerHTML]="highlightedJson"></div>
            <textarea
              nz-input
              class="json-textarea"
              [(ngModel)]="ngModelJson"
              (ngModelChange)="onJsonEdit($event)"
              (scroll)="syncScroll($event)"
              spellcheck="false"
            >
            </textarea>
          </div>
        </nz-card>
      </div>
    </div>
  `,
  styles: [
    `
      .json-editor-wrapper {
        position: relative;
        background: #272822;
        border-radius: 8px;
        height: 700px;
        overflow: hidden;
        border: 1px solid #444;
      }

      .json-highlight-layer,
      .json-textarea {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        padding: 16px;
        margin: 0;
        font-family: 'Fira Code', 'SFMono-Regular', Consolas, monospace;
        font-size: 13px;
        line-height: 1.5;
        white-space: pre-wrap;
        word-wrap: break-word;
        box-sizing: border-box;
        border: none;
      }

      .json-highlight-layer {
        color: #f8f8f2;
        pointer-events: none;
        z-index: 1;
        overflow-y: auto;
      }

      .json-textarea {
        background: transparent;
        color: transparent;
        caret-color: #f8f8f2;
        z-index: 2;
        resize: none;
        overflow-y: auto;
      }

      :host ::ng-deep .json-key {
        color: #66d9ef;
        font-weight: 600;
      }
      :host ::ng-deep .json-string {
        color: #e6db74;
      }
      :host ::ng-deep .json-number {
        color: #ae81ff;
      }
    `,
  ],
})
export class TestHelpModalComponent {
  private modalService = inject(NzModalService);

  liveData: any = {
    helpId: 'live-test',
    title: 'Мой блочный тест',
    subtitle: 'Конструктор документации',
    icon: '🚀',
    width: 1100,
    blocks: [
      {
        id: 'intro',
        title: 'Введение',
        content: '<h3>Добро пожаловать!</h3><p>Теперь справка состоит из блоков.</p>',
        type: 'standard',
      },
      {
        id: 'warning',
        title: 'Важное предупреждение',
        content: '<p>Будьте осторожны при редактировании категорий!</p>',
        type: 'warning',
      },
    ],
    componentPath:
      'src/app/shared/components/test-components/test-help-modal/test-help-modal.component.ts',
    docPath: 'src/assets/documentation/live-test.json',
  };

  ngModelJson = '';
  highlightedJson = '';

  constructor() {
    this.updateJson();
  }

  updateJson(): void {
    const json = JSON.stringify(this.liveData, null, 2);
    this.ngModelJson = json;
    this.highlightedJson = this.applyHighlighting(json);
  }

  onJsonEdit(newVal: string): void {
    this.highlightedJson = this.applyHighlighting(newVal);
    try {
      const parsed = JSON.parse(newVal);
      this.liveData = { ...parsed };
    } catch (e) {}
  }

  addTestBlock(): void {
    const newBlock: HelpBlock = {
      id: `b_${Date.now()}`,
      title: 'Новый раздел',
      content: '<p>Текст нового раздела...</p>',
      type: 'standard',
    };
    this.liveData.blocks = [...(this.liveData.blocks || []), newBlock];
    this.updateJson();
  }

  clearBlocks(): void {
    this.liveData.blocks = [];
    this.updateJson();
  }

  loadPreset(type: string): void {
    if (type === 'multi') {
      this.liveData.blocks = [
        { id: '1', title: 'Шаг 1', content: '<p>Первое действие...</p>', type: 'standard' },
        { id: '2', title: 'Внимание', content: '<p>Важная информация!</p>', type: 'warning' },
        { id: '3', title: 'Результат', content: '<p>Итог операции.</p>', type: 'info' },
      ];
      delete this.liveData.content;
    } else if (type === 'legacy') {
      this.liveData.content = '<h3>Старый добрый HTML</h3><p>Одной строкой без блоков.</p>';
      delete this.liveData.blocks;
    }
    this.updateJson();
  }

  applyHighlighting(json: string): string {
    if (!json) return '';
    let html = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    html = html.replace(/"([^"]+)":/g, '<span class="json-key">"$1"</span>:');
    html = html.replace(/: "([^"]*)"/g, ': <span class="json-string">"$1"</span>');
    html = html.replace(/: (\d+)/g, ': <span class="json-number">$1</span>');
    return html;
  }

  syncScroll(event: any): void {
    const layer = document.querySelector('.json-highlight-layer');
    if (layer) layer.scrollTop = event.target.scrollTop;
  }

  openLiveHelp(): void {
    this.modalService.create({
      nzTitle: undefined,
      nzContent: HelpUniversalModalComponent,
      nzData: { ...this.liveData },
      nzFooter: null,
      nzWidth: this.liveData.width,
      nzCentered: true,
      nzClassName: 'help-universal-modal-wrapper',
    });
  }
}
