import { CommonModule } from '@angular/common';
import { Component, Inject, Input, OnInit, Optional, signal, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HelpPathHeaderComponent } from '@shared/components/ui';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NZ_MODAL_DATA, NzModalModule, NzModalRef } from 'ng-zorro-antd/modal';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { HttpClient } from '@angular/common/http';
import { Clipboard } from '@angular/cdk/clipboard';
import { IconLaboratoryService } from '@shared/services/icon-laboratory.service';
import { animate, style, transition, trigger } from '@angular/animations';
import { AvTinymceControlComponent } from '../../../../assets/controls/tinymce-control/tinymce-control.component';

export type HelpModalMode = 'view' | 'edit';

export interface HelpBlock {
  id: string;
  title: string;
  content: string;
  type: 'standard' | 'warning' | 'info' | 'danger';
}

@Component({
  selector: 'av-help-universal-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzModalModule,
    NzButtonModule,
    NzCardModule,
    NzIconModule,
    NzTypographyModule,
    NzToolTipModule,
    HelpPathHeaderComponent,
    AvTinymceControlComponent,
  ],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-10px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0, transform: 'translateY(-10px)' })),
      ]),
    ]),
  ],
  template: `
    <div class="help-modal-container">
      <!-- Шапка модального окна (Драггабельная) -->
      <div class="help-header" (mousedown)="onDragStart($event)">
        <div class="header-content">
          <div class="title-group">
            <div class="header-icon-box">
              @if (isIconPath(icon)) {
                <img [src]="icon" class="header-icon-img" (error)="onIconError($event)" />
              } @else if (isAntIcon(icon)) {
                <span nz-icon [nzType]="icon" class="header-ant-icon"></span>
              } @else if (icon && !iconError) {
                <span class="header-icon-text">{{ icon }}</span>
              } @else {
                <span nz-icon nzType="read" class="header-ant-icon"></span>
              }
            </div>
            <div class="text-group vertical">
              <h2 nz-typography class="main-title">{{ title }}</h2>
              @if (subtitle) {
                <p nz-typography nzType="secondary" class="sub-title">{{ subtitle }}</p>
              }
              @if (docPath) {
                <div 
                  class="header-path-tag" 
                  nz-tooltip 
                  nzTooltipTitle="Нажмите, чтобы скопировать путь"
                  (click)="copyPath(docPath)"
                >
                  <span nz-icon nzType="copy"></span>
                  <code>{{ docPath }}</code>
                </div>
              }
            </div>
          </div>

            <div class="header-actions">
              <!-- Кнопка Глаз для управления видимостью блоков (только в режиме просмотра) -->
              @if (mode() === 'view') {
                <button
                  nz-button
                  nz-tooltip
                  (click)="showBlocks.set(!showBlocks())"
                  [nzTooltipTitle]="showBlocks() ? 'Скрыть подробности' : 'Показать подробности'"
                  [class.active-toggle]="showBlocks()"
                  class="eye-btn"
                >
                  <span nz-icon [nzType]="showBlocks() ? 'eye' : 'eye-invisible'"></span>
                </button>

                <div class="header-divider"></div>
              }

              <!-- Кнопки управления режимом (Редактировать/Сохранить) -->
              <div class="mode-actions">
                @if (mode() === 'view') {
                  <button nz-button nzType="default" (click)="toggleMode()" class="action-btn">
                    <span nz-icon nzType="edit"></span> Редактировать
                  </button>
                } @else {
                  <button nz-button nzType="primary" (click)="save()" class="action-btn">
                    <span nz-icon nzType="save"></span> Сохранить
                  </button>
                  <button nz-button nzType="default" (click)="toggleMode()" class="action-btn">Отмена</button>
                }
              </div>

              <!-- Разделитель -->
              <div class="header-divider"></div>

              <!-- Системные контроли размера -->
              <div class="size-control-group">
                <button
                  nz-button
                  nz-tooltip
                  (click)="toggleWidthPlus50()"
                  [nzTooltipTitle]="isWidthLarge() ? 'Вернуть ширину' : 'Увеличить ширину (+50%)'"
                  [class.active]="isWidthLarge()"
                >
                  <span nz-icon nzType="column-width"></span>
                </button>

                <button
                  nz-button
                  nz-tooltip
                  (click)="toggleHeight30()"
                  [nzTooltipTitle]="isHeight30() ? 'Вернуть высоту' : 'Высота +30%'"
                  [class.active]="isHeight30()"
                >
                  <span nz-icon nzType="column-height"></span>
                </button>

                <button
                  nz-button
                  nz-tooltip
                  (click)="toggleFullscreen()"
                  [nzTooltipTitle]="isFullscreen() ? 'Выйти из полноэкранного режима' : 'На весь экран'"
                  [class.active]="isFullscreen()"
                >
                  <span nz-icon [nzType]="isFullscreen() ? 'fullscreen-exit' : 'fullscreen'"></span>
                </button>
              </div>

              <!-- Кнопка закрытия -->
              <div class="header-divider"></div>
              <button nz-button nzType="text" (click)="close()" class="close-btn-header">
                <span nz-icon nzType="close"></span>
              </button>
            </div>
        </div>
      </div>

      <!-- Контентная часть (Блочная структура) -->
      <div class="help-content-scrollable" [class.height-30]="isHeight30()">
        <div class="help-content-container">
          @if (mode() === 'view') {
            <!-- 1. Секция REFERENCE (Всегда видна) -->
            @if (reference().length > 0) {
              <div class="reference-section">
                @for (ref of reference(); track ref.id) {
                  <section class="help-block-view reference-block" [ngClass]="'block-' + ref.type">
                    @if (ref.title) {
                      <h3 class="block-title">{{ ref.title }}</h3>
                    }
                    <div class="block-body" [innerHTML]="ref.content"></div>
                  </section>
                }
              </div>
            }

            <!-- 2. Секция BLOCKS (Скрыта по умолчанию, управляется иконкой Глаз) -->
            @if (showBlocks()) {
              <div class="blocks-section" [@fadeIn]>
                <!-- Традиционные блоки (без группы) -->
                @for (block of blocks(); track block.id) {
                  <section class="help-block-view" [ngClass]="'block-' + block.type">
                    @if (block.title) {
                      <h3 class="block-title">{{ block.title }}</h3>
                    }
                    <div class="block-body" [innerHTML]="block.content"></div>
                  </section>
                }

                <!-- Группа: Основной -->
                @if (blocksMain().length > 0) {
                  <div class="blocks-group-container">
                    <h2 class="blocks-group-header main"><span nz-icon nzType="appstore"></span> Основной</h2>
                    @for (block of blocksMain(); track block.id) {
                      <section class="help-block-view" [ngClass]="'block-' + block.type">
                        @if (block.title) {
                          <h3 class="block-title">{{ block.title }}</h3>
                        }
                        <div class="block-body" [innerHTML]="block.content"></div>
                      </section>
                    }
                  </div>
                }

                <!-- Группа: Front -->
                @if (blocksFront().length > 0) {
                  <div class="blocks-group-container">
                    <h2 class="blocks-group-header front"><span nz-icon nzType="layout"></span> Front</h2>
                    @for (block of blocksFront(); track block.id) {
                      <section class="help-block-view" [ngClass]="'block-' + block.type">
                        @if (block.title) {
                          <h3 class="block-title">{{ block.title }}</h3>
                        }
                        <div class="block-body" [innerHTML]="block.content"></div>
                      </section>
                    }
                  </div>
                }

                <!-- Группа: Сервер -->
                @if (blocksServer().length > 0) {
                  <div class="blocks-group-container">
                    <h2 class="blocks-group-header server"><span nz-icon nzType="database"></span> Сервер</h2>
                    @for (block of blocksServer(); track block.id) {
                      <section class="help-block-view" [ngClass]="'block-' + block.type">
                        @if (block.title) {
                          <h3 class="block-title">{{ block.title }}</h3>
                        }
                        <div class="block-body" [innerHTML]="block.content"></div>
                      </section>
                    }
                  </div>
                }
              </div>
            }

            @if (reference().length === 0 && (!showBlocks() || blocks().length === 0)) {
              <div class="content-placeholder">
                <span nz-icon nzType="info-circle" style="font-size: 48px; margin-bottom: 16px; opacity: 0.2;"></span>
                <p>Документация пуста или основные блоки скрыты.</p>
                <button nz-button nzType="link" (click)="showBlocks.set(true)">Показать все блоки</button>
              </div>
            }
          } @else {
            <div class="edit-mode-container">
              <!-- Редактирование Reference -->
              <div class="edit-section-header">
                <h3 class="section-title"><span nz-icon nzType="info-circle"></span> Общая справка (Reference)</h3>
                <p class="section-hint">Этот раздел виден пользователю всегда при открытии справки.</p>
              </div>
              
              <div class="edit-blocks-list">
                @for (block of reference(); track block.id; let i = $index) {
                  <nz-card [nzTitle]="blockTitleTpl" [nzExtra]="blockExtraTpl" class="edit-block-card reference-card">
                    <ng-template #blockTitleTpl>
                      <div class="block-title-edit">
                        <span class="block-number ref">REF</span>
                        <input nz-input [(ngModel)]="block.title" placeholder="Заголовок справки" class="title-input" />
                      </div>
                    </ng-template>
                    <ng-template #blockExtraTpl>
                      <button nz-button nzType="text" nzDanger (click)="removeReferenceBlock(i)">
                        <span nz-icon nzType="delete"></span>
                      </button>
                    </ng-template>

                    <av-tinymce-control
                      [(ngModel)]="block.content"
                      [height]="250"
                      label="Текст справки">
                    </av-tinymce-control>
                  </nz-card>
                }
                <button nz-button nzType="dashed" nzBlock (click)="addReferenceBlock()" class="add-block-btn">
                  <span nz-icon nzType="plus"></span> Добавить блок в общую справку
                </button>
              </div>

              <div class="header-divider" style="margin: 32px 0; width: 100%; height: 2px;"></div>

              <!-- Редактирование Blocks -->
              <div class="edit-section-header">
                <h3 class="section-title"><span nz-icon nzType="appstore"></span> Дополнительные блоки (Blocks)</h3>
                <p class="section-hint">Эти блоки скрыты по умолчанию и открываются по нажатию на «Глаз».</p>
              </div>

              <div class="edit-blocks-list">
                @for (block of blocks(); track block.id; let i = $index) {
                  <nz-card [nzTitle]="blockTitleTpl" [nzExtra]="blockExtraTpl" class="edit-block-card">
                    <ng-template #blockTitleTpl>
                      <div class="block-title-edit">
                        <span class="block-number">#{{ i + 1 }}</span>
                        <input nz-input [(ngModel)]="block.title" placeholder="Заголовок блока" class="title-input" />
                      </div>
                    </ng-template>
                    <ng-template #blockExtraTpl>
                      <button nz-button nzType="text" nzDanger (click)="removeBlock(i)">
                        <span nz-icon nzType="delete"></span>
                      </button>
                    </ng-template>

                    <av-tinymce-control
                      [(ngModel)]="block.content"
                      [height]="250"
                      label="Контент блока">
                    </av-tinymce-control>
                  </nz-card>
                }

                <button nz-button nzType="dashed" nzBlock (click)="addBlock()" class="add-block-btn">
                  <span nz-icon nzType="plus"></span> Добавить дополнительный блок
                </button>
              </div>
            </div>
          }
        </div>
      </div>

      <!-- Техническая информация в подвале -->
      <div class="help-footer">
        <av-help-path-header
          [title]="title"
          [subtitle]="subtitle"
          [icon]="icon"
          [componentPath]="componentPath"
          [docPath]="docPath"
          [hideHeader]="true"
        ></av-help-path-header>
      </div>

      <!-- Хендл для изменения размера -->
      <div class="resize-handle" (mousedown)="onResizeStart($event)">
        <span nz-icon nzType="drag" nzTheme="outline"></span>
      </div>
    </div>
  `,
  styles: [
    `
      .help-modal-container {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .help-header {
        padding: 16px 24px;
        background: rgba(230, 247, 255, 0.9); /* Очень слабый голубой фон */
        backdrop-filter: blur(10px);
        border-bottom: 1px solid rgba(24, 144, 255, 0.1);
        cursor: move;
        user-select: none;
        border-radius: 12px 12px 0 0;
        z-index: 10;
      }

      .header-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .title-group {
        display: flex;
        align-items: center;
        gap: 16px;
      }

      .header-icon-box {
        width: 44px;
        height: 44px;
        background: #f0f5ff;
        border-radius: 10px;
        display: flex;
        justify-content: center;
        align-items: center;
        flex-shrink: 0;
        box-shadow: inset 0 0 0 1px rgba(24, 144, 255, 0.1);
      }

      .header-ant-icon {
        font-size: 24px;
        color: #1890ff;
      }

      .header-icon-text {
        font-size: 24px;
      }

      .header-icon-img {
        max-width: 28px;
        max-height: 28px;
      }

      .text-group {
        display: flex;
        flex-direction: column;
        gap: 2px;

        &.vertical {
          align-items: flex-start;
        }
      }

      .main-title {
        margin: 0 !important;
        font-size: 18px !important;
        font-weight: 700 !important;
        color: #262626;
        line-height: 1.2;
      }

      .sub-title {
        margin: 0 !important;
        font-size: 12px !important;
        color: #8c8c8c;
        line-height: 1.2;
      }

      .header-path-tag {
        display: flex;
        align-items: center;
        gap: 6px;
        margin-top: 6px;
        padding: 2px 8px;
        background: rgba(24, 144, 255, 0.08);
        border: 1px solid rgba(24, 144, 255, 0.15);
        border-radius: 6px;
        font-size: 10px;
        color: #1890ff;
        cursor: pointer;
        transition: all 0.2s;

        &:hover {
          background: rgba(24, 144, 255, 0.15);
          border-color: rgba(24, 144, 255, 0.3);
        }

        code {
          background: transparent;
          color: inherit;
          padding: 0;
          font-family: 'Fira Code', monospace;
          border-radius: 0;
        }

        span {
          font-size: 12px;
        }
      }

      .header-actions {
        display: flex;
        align-items: center;
        gap: 16px;
      }

      .mode-actions {
        display: flex;
        gap: 8px;
      }

      .header-divider {
        width: 1px;
        height: 24px;
        background: #f0f0f0;
      }

      .size-control-group {
        display: flex;
        background: #f5f5f5;
        padding: 2px;
        border-radius: 8px;
        gap: 2px;

        button {
          border: none !important;
          background: transparent !important;
          width: 32px;
          height: 32px;
          padding: 0;
          display: flex;
          justify-content: center;
          align-items: center;
          border-radius: 6px;
          color: #595959;
          transition: all 0.2s;

          &:hover {
            color: #1890ff;
            background: rgba(24, 144, 255, 0.05) !important;
          }

          &.active {
            background: #fff !important;
            color: #1890ff;
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
          }

          span {
            font-size: 16px;
          }
        }
      }

      .action-btn {
        border-radius: 8px;
        font-weight: 500;
        height: 36px;
      }

      .close-btn-header {
        width: 32px;
        height: 32px;
        display: flex;
        justify-content: center;
        align-items: center;
        border-radius: 6px;
        color: #8c8c8c;
        transition: all 0.2s;

        &:hover {
          background: rgba(255, 77, 79, 0.1) !important;
          color: #ff4d4f;
        }

        span {
          font-size: 16px;
        }
      }

      .eye-btn {
        border-radius: 8px;
        width: 40px;
        height: 36px;
        display: flex;
        justify-content: center;
        align-items: center;
        background: #fff !important;
        border: 1px solid #d9d9d9 !important;
        color: #595959;
        transition: all 0.2s;

        &:hover {
          color: #1890ff;
          border-color: #1890ff !important;
        }

        &.active-toggle {
          background: #e6f7ff !important;
          border-color: #91d5ff !important;
          color: #1890ff;
          box-shadow: 0 2px 4px rgba(24, 144, 255, 0.1);
        }
      }

      .reference-section {
        margin-bottom: 8px;
      }

      .reference-block {
        border-left-width: 6px;
        background: #fff;
        margin-bottom: 16px;
      }

      .edit-mode-container {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .edit-section-header {
        margin-bottom: 8px;
        padding-bottom: 8px;
        border-bottom: 1px dashed #d9d9d9;

        .section-title {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
          color: #1890ff;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .section-hint {
          margin: 4px 0 0;
          font-size: 12px;
          color: #8c8c8c;
        }
      }

      .block-number.ref {
        background: #e6f7ff;
        color: #1890ff;
        border: 1px solid #91d5ff;
      }

      .reference-card {
        border-left: 4px solid #1890ff;
      }

      .help-content-scrollable {
        flex: 1;
        overflow-y: auto;
        padding: 16px;
        background: #fafafa;
        border-radius: 8px;
        min-height: 400px;
        max-height: 70vh;
        transition: all 0.3s ease;

        &.height-30 {
          min-height: 700px;
          max-height: 90vh;
        }
      }

      .help-content-container {
        display: flex;
        flex-direction: column;
        gap: 24px;
      }

      .help-block-view {
        background: #fff;
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        border-left: 4px solid #d9d9d9;
        transition: transform 0.2s;

        &:hover {
          transform: translateX(4px);
        }

        &.block-standard {
          border-left-color: #1890ff;
        }

        &.block-warning {
          border-left-color: #faad14;
          background: #fffbe6; /* Мягкий желтый фон */
        }

        &.block-info {
          border-left-color: #1890ff;
          background: #e6f7ff; /* Мягкий голубой фон */
        }

        &.block-danger {
          border-left-color: #ff4d4f;
          background: #fff1f0; /* Мягкий красный фон */
        }

        .block-title {
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 12px;
          color: #262626;
        }
      }

      .blocks-group-container {
        margin-top: 32px;
        display: flex;
        flex-direction: column;
        gap: 16px;

        &:first-child {
          margin-top: 0;
        }
      }

      .blocks-group-header {
        font-size: 22px;
        font-weight: 800;
        margin: 0 0 8px 0;
        padding: 8px 16px;
        display: flex;
        align-items: center;
        gap: 12px;
        border-radius: 8px;
        text-transform: uppercase;
        letter-spacing: 1px;

        &.main {
          background: #e6f7ff;
          color: #0050b3;
          border-left: 8px solid #1890ff;
        }

        &.front {
          background: #f6ffed;
          color: #237804;
          border-left: 8px solid #52c41a;
        }

        &.server {
          background: #fff7e6;
          color: #874d00;
          border-left: 8px solid #fa8c16;
        }
      }

      .edit-blocks-list {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .edit-block-card {
        border-radius: 8px;
        overflow: hidden;
      }

      .block-title-edit {
        display: flex;
        align-items: center;
        gap: 12px;
        width: 100%;

        .block-number {
          background: #f0f0f0;
          padding: 2px 8px;
          border-radius: 4px;
          font-weight: bold;
          font-size: 12px;
        }

        .title-input {
          border: none;
          background: transparent;
          font-weight: 600;
          font-size: 16px;
          
          &:focus {
            background: #fff;
            box-shadow: none;
          }
        }
      }

      .add-block-btn {
        height: 50px;
        border-style: dashed;
        border-width: 2px;
      }

      .content-placeholder {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 300px;
        color: #8c8c8c;
      }

      .help-footer {
        margin-top: 8px;
      }

      .resize-handle {
        position: absolute;
        right: 0;
        bottom: 0;
        width: 24px;
        height: 24px;
        cursor: nwse-resize;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #bfbfbf;
        z-index: 100;
        transition: color 0.3s;

        &:hover {
          color: #1890ff;
        }

        span {
          font-size: 14px;
          transform: rotate(45deg);
        }
      }
    `,
  ],
})
export class HelpUniversalModalComponent implements OnInit {
  @Input() title: string = 'Справка';
  @Input() subtitle: string = 'Универсальный справочный модуль';
  @Input() icon: string = '📘';
  @Input() initialMode: HelpModalMode = 'view';
  @Input() componentPath: string = '';
  @Input() docPath: string = '';
  @Input() content: string = '';
  @Input() blocksData: HelpBlock[] = [];
  @Input() width: string | number = 1000;

  mode = signal<HelpModalMode>('view');
  blocks = signal<HelpBlock[]>([]);
  blocksMain = signal<HelpBlock[]>([]);
  blocksFront = signal<HelpBlock[]>([]);
  blocksServer = signal<HelpBlock[]>([]);
  reference = signal<HelpBlock[]>([]);
  showBlocks = signal<boolean>(false);
  
  isFullscreen = signal<boolean>(false);
  isWidthLarge = signal<boolean>(false);
  isHeight30 = signal<boolean>(false);
  iconError = false;

  private iconLab = inject(IconLaboratoryService);
  private message = inject(NzMessageService);

  private isResizing = false;
  private startX = 0;
  private startWidth = 0;

  private isDragging = false;
  private dragStartX = 0;
  private dragStartY = 0;
  private modalOffsetX = 0;
  private modalOffsetY = 0;


  constructor(
    @Optional() private modalRef: NzModalRef,
    @Optional() @Inject(NZ_MODAL_DATA) private modalData: any,
    private http: HttpClient,
    private clipboard: Clipboard
  ) {}

  ngOnInit(): void {
    if (this.modalData) {
      // Если передан helpId, загружаем данные из JSON
      if (this.modalData.helpId && !this.modalData.title) {
        this.loadHelpById(this.modalData.helpId);
      } else {
        this.applyModalData(this.modalData);
      }
    }
    
    this.mode.set(this.initialMode);
  }

  private loadHelpById(helpId: string): void {
    const path = `assets/help-data/${helpId}.json`;
    this.http.get(path).subscribe({
      next: (data: any) => {
        this.applyModalData(data);
      },
      error: (err) => {
        console.error('Error loading help file by ID:', helpId, err);
        this.message.error(`Не удалось загрузить справку: ${helpId}`);
      }
    });
  }

  private applyModalData(data: any): void {
    if (!data) return;
    this.title = data.title || this.title;
    this.subtitle = data.subtitle || this.subtitle;
    this.icon = data.icon || this.icon;
    this.initialMode = data.initialMode || this.initialMode;
    this.componentPath = data.componentPath || this.componentPath;
    this.docPath = data.docPath || this.docPath;
    this.content = data.content || this.content;
    this.reference.set(data.reference || []);
    this.blocksData = data.blocks || data.blocksData || [];
    this.blocksMain.set(data['blocks-main'] || []);
    this.blocksFront.set(data['blocks-front'] || []);
    this.blocksServer.set(data['blocks-server'] || []);
    this.width = data.width || this.width;

    this.blocks.set(this.blocksData);

    // Если передана старая строка контента, превращаем её в первый блок reference
    if (this.content && this.reference().length === 0) {
      this.reference.set([{
        id: 'legacy-root',
        title: 'Основная информация',
        content: this.content,
        type: 'standard'
      }]);
    }
  }

  copyPath(path: string): void {
    if (this.clipboard.copy(path)) {
      this.message.success('Путь скопирован в буфер обмена');
    }
  }

  toggleFullscreen(): void {
    this.isFullscreen.update((v) => !v);

    if (this.modalRef) {
      if (this.isFullscreen()) {
        this.modalRef.updateConfig({
          nzWidth: '100vw',
          nzStyle: { top: '0', padding: '0', margin: '0' },
          nzCentered: false,
        });
      } else {
        this.modalRef.updateConfig({
          nzWidth: this.width,
          nzStyle: { top: '100px' },
          nzCentered: true,
        });
      }
    }
  }

  toggleWidthPlus50(): void {
    this.isWidthLarge.update((v) => !v);
    if (this.modalRef) {
      // Базовая ширина из инпута (число или парсим строку)
      const baseWidth = typeof this.width === 'number' ? this.width : parseInt(this.width as string) || 1000;
      
      // Если увеличиваем, ставим 1.5 от базы, иначе возвращаем базу
      const targetWidth = this.isWidthLarge() ? Math.floor(baseWidth * 1.5) : baseWidth;

      this.modalRef.updateConfig({
        nzWidth: targetWidth,
      });
    }
  }

  toggleHeight30(): void {
    this.isHeight30.update((v) => !v);
  }

  addBlock(): void {
    const newBlock: HelpBlock = {
      id: `block_${Date.now()}`,
      title: '',
      content: '',
      type: 'standard'
    };
    this.blocks.update(b => [...b, newBlock]);
  }

  removeBlock(index: number): void {
    this.blocks.update(b => b.filter((_, i) => i !== index));
  }

  addReferenceBlock(): void {
    const newBlock: HelpBlock = {
      id: `ref_${Date.now()}`,
      title: '',
      content: '',
      type: 'standard'
    };
    this.reference.update(r => [...r, newBlock]);
  }

  removeReferenceBlock(index: number): void {
    this.reference.update(r => r.filter((_, i) => i !== index));
  }

  toggleMode(): void {
    this.mode.update((m) => (m === 'view' ? 'edit' : 'view'));
  }

  isIconPath(icon: string | undefined): boolean {
    if (!icon) return false;
    return icon.includes('/') || icon.includes('.') || icon.startsWith('data:');
  }

  isAntIcon(icon: string | undefined): boolean {
    if (!icon) return false;
    // Если это не путь и не эмодзи (длина больше 2) - считаем что это название иконки Ant
    return !this.isIconPath(icon) && icon.length > 2;
  }

  onIconError(event: any): void {
    this.iconError = true;
  }

  // --- Ресайз ---
  onResizeStart(event: MouseEvent): void {
    event.preventDefault();
    this.isResizing = true;
    this.startX = event.clientX;

    // Получаем текущую ширину из конфига модалки или из инпута
    const currentWidth = this.modalRef.getConfig().nzWidth;
    this.startWidth =
      typeof currentWidth === 'number' ? currentWidth : parseInt(currentWidth as string) || 1000;

    document.addEventListener('mousemove', this.onResizing);
    document.addEventListener('mouseup', this.onResizeEnd);
    document.body.style.cursor = 'nwse-resize';
  }

  private onResizing = (event: MouseEvent): void => {
    if (!this.isResizing) return;

    const deltaX = event.clientX - this.startX;
    const newWidth = Math.max(400, this.startWidth + deltaX * 2); // Умножаем на 2, т.к. модалка центрирована

    this.width = newWidth;
    this.modalRef.updateConfig({
      nzWidth: newWidth,
    });
  };

  private onResizeEnd = (): void => {
    this.isResizing = false;
    document.removeEventListener('mousemove', this.onResizing);
    document.removeEventListener('mouseup', this.onResizeEnd);
    document.body.style.cursor = '';
  };

  // --- Драг (Перемещение) ---
  onDragStart(event: MouseEvent): void {
    // Не запускаем драг, если нажали на кнопки действий или если мы в полноэкранном режиме
    if ((event.target as HTMLElement).closest('.header-actions') || this.isFullscreen()) {
      return;
    }

    this.isDragging = true;
    this.dragStartX = event.clientX;
    this.dragStartY = event.clientY;

    // Получаем текущие смещения из стилей (если они есть)
    const currentStyle: any = this.modalRef.getConfig().nzStyle || {};
    this.modalOffsetX = parseInt(currentStyle?.left || '0');
    this.modalOffsetY = parseInt(currentStyle?.top || '100'); // 100 - дефолтный top

    document.addEventListener('mousemove', this.onDragging);
    document.addEventListener('mouseup', this.onDragEnd);
  }

  private onDragging = (event: MouseEvent): void => {
    if (!this.isDragging) return;

    const deltaX = event.clientX - this.dragStartX;
    const deltaY = event.clientY - this.dragStartY;

    this.modalRef.updateConfig({
      nzCentered: false, // Отключаем центрирование при перетаскивании
      nzStyle: {
        left: `${this.modalOffsetX + deltaX}px`,
        top: `${this.modalOffsetY + deltaY}px`,
        margin: '0', // Убираем авто-маржины
      },
    });
  };

  private onDragEnd = (): void => {
    this.isDragging = false;
    document.removeEventListener('mousemove', this.onDragging);
    document.removeEventListener('mouseup', this.onDragEnd);

    // Сохраняем финальные координаты для следующего драга
    const currentStyle: any = this.modalRef.getConfig().nzStyle || {};
    this.modalOffsetX = parseInt(currentStyle?.left || '0');
    this.modalOffsetY = parseInt(currentStyle?.top || '0');
  };

  save(): void {
    if (!this.docPath) {
      this.message.error('Путь к файлу не определен. Сохранение невозможно.');
      return;
    }

    const fileName = this.docPath.split('/').pop() || 'unknown.json';
    const folderPath = this.docPath.substring(0, this.docPath.lastIndexOf('/'));

    const updatedData = {
      ...this.modalData,
      title: this.title,
      subtitle: this.subtitle,
      icon: this.icon,
      reference: this.reference(),
      blocks: this.blocks(),
      'blocks-main': this.blocksMain(),
      'blocks-front': this.blocksFront(),
      'blocks-server': this.blocksServer()
    };

    this.iconLab.saveToDisk(fileName, folderPath, JSON.stringify(updatedData, null, 2)).subscribe({
      next: () => {
        this.message.success('Справка успешно сохранена');
        this.toggleMode();
        // Уведомляем вызывающий компонент о необходимости обновить список
        if (this.modalRef) {
          this.modalRef.close(true);
        }
      },
      error: (err) => {
        console.error('Save error', err);
        this.message.error('Ошибка при сохранении файла на диск');
      }
    });
  }

  close(): void {
    this.modalRef.destroy();
  }
}
