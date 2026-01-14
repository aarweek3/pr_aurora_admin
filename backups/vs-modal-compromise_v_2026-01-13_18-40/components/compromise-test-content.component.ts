import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { VS_MODAL_DATA } from '../models/vs-modal-data.token';
import { VSModalRef } from '../models/vs-modal-ref.model';

interface MenuItem {
  id: string;
  title: string;
  icon: string;
}

@Component({
  selector: 'app-compromise-test-content',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="test-container">
      <div class="test-body">
        <!-- SIDEBAR -->
        <div class="test-sidebar">
          @for (item of menuItems; track item.id) {
          <div
            class="sidebar-item"
            [class.active]="activeTab() === item.id"
            (click)="activeTab.set(item.id)"
            [title]="item.title"
          >
            <div class="icon-wrap" [innerHTML]="item.icon"></div>
            <span class="sidebar-label">{{ item.title }}</span>
          </div>
          }
        </div>

        <!-- CONTROL PANEL (250px) -->
        <aside class="test-control-panel">
          <div class="panel-header">
            {{ getActiveItem()?.title || 'Control Panel' }}
          </div>

          <div class="panel-scroll">
            <!-- Генерируем контент для активного модуля -->
            @for (item of menuItems; track item.id; let i = $index) { @if
            (activeTab() === item.id) {
            <section class="control-block">
              <h4 class="block-title">{{ item.title }} Блок {{ i + 1 }}-1</h4>

              @if (item.id === 'item1') {
              <!-- МОДУЛЬ: НАСТРОЙКИ ФОРМАТА (ИЗ STUDIO) -->
              <div class="ui-container">
                <div class="ui-row gap-8">
                  <select class="ui-select flex-1">
                    <option value="image/jpeg">JPEG</option>
                    <option value="image/png">PNG-24</option>
                    <option value="image/webp">WebP</option>
                  </select>
                  <select class="ui-select" style="width: 100px;">
                    <option>Максимум</option>
                    <option>Высокое</option>
                  </select>
                </div>

                <div class="ui-row between" style="margin-top: 8px;">
                  <span class="ui-label">Качество:</span>
                  <input
                    type="text"
                    class="ui-input ui-input-mini"
                    [value]="item1Quality() + '%'"
                    readonly
                  />
                </div>

                <div class="ps-slider-container">
                  <div
                    class="ps-slider"
                    (click)="item1Quality.set(item1Quality() === 80 ? 95 : 80)"
                  >
                    <div
                      class="ps-slider-fill"
                      [style.width.%]="item1Quality()"
                    ></div>
                    <div
                      class="ps-slider-thumb"
                      [style.left.%]="item1Quality()"
                    ></div>
                  </div>
                </div>

                <div class="ui-row" style="margin-top: 10px;">
                  <label class="vs-checkbox">
                    <input type="checkbox" checked />
                    <span class="check-mark"></span>
                    <span class="ui-label" style="margin-left: 8px;"
                      >Прогрессивный</span
                    >
                  </label>
                </div>
              </div>
              } @else if (item.id === 'item6') {
              <!-- СПЕЦИАЛЬНЫЙ UI МОДУЛЬ -->
              <div class="ui-container">
                <!-- Ряд 1: 1 кнопка -->
                <div class="ui-row">
                  <button class="ui-btn primary">Действие 1</button>
                </div>

                <!-- Ряд 2: 2 кнопки -->
                <div class="ui-row gap-8">
                  <button class="ui-btn">Кнопка A</button>
                  <button class="ui-btn">Кнопка B</button>
                </div>

                <!-- Ряд 3: Подпись и чекбокс -->
                <div class="ui-row between">
                  <span class="ui-label">Активировать:</span>
                  <label class="vs-checkbox">
                    <input type="checkbox" />
                    <span class="check-mark"></span>
                  </label>
                </div>

                <!-- Ряд 4: чекбокс Подпись -->
                <div class="ui-row">
                  <label class="vs-checkbox">
                    <input type="checkbox" />
                    <span class="check-mark"></span>
                    <span class="ui-label" style="margin-left: 8px;"
                      >Согласие с условиями</span
                    >
                  </label>
                </div>

                <!-- Ряд 5: Подпись input -->
                <div class="ui-row between gap-12">
                  <span class="ui-label no-shrink">Название:</span>
                  <input
                    type="text"
                    class="ui-input"
                    placeholder="Введите текст..."
                  />
                </div>

                <!-- Ряд 6: Подпись input + подпись input -->
                <div class="ui-row gap-8">
                  <div class="ui-col flex-1">
                    <span class="ui-label">X:</span>
                    <input type="text" class="ui-input" value="100" />
                  </div>
                  <div class="ui-col flex-1">
                    <span class="ui-label">Y:</span>
                    <input type="text" class="ui-input" value="200" />
                  </div>
                </div>

                <!-- Ряд 7: Кастомный ползунок (Прозрачность) -->
                <div class="ui-row column gap-4">
                  <span class="ui-label"
                    >Прозрачность: {{ transparency() }}%</span
                  >
                  <div class="ps-slider-container">
                    <div class="ps-slider" (click)="transparency.set(50)">
                      <div
                        class="ps-slider-fill"
                        [style.width.%]="transparency()"
                      ></div>
                      <div
                        class="ps-slider-thumb"
                        [style.left.%]="transparency()"
                      ></div>
                    </div>
                  </div>
                </div>

                <!-- Ряд 8: Кастомный ползунок (Масштаб) -->
                <div class="ui-row column gap-4">
                  <span class="ui-label">Масштаб (Zoom):</span>
                  <div class="ui-row gap-8">
                    <div class="ps-slider-container flex-1">
                      <div class="ps-slider" (click)="zoom.set(75)">
                        <div
                          class="ps-slider-fill"
                          [style.width.%]="zoom()"
                        ></div>
                        <div
                          class="ps-slider-thumb"
                          [style.left.%]="zoom()"
                        ></div>
                      </div>
                    </div>
                    <input
                      type="text"
                      class="ui-input ui-input-mini"
                      [value]="zoom() + '%'"
                    />
                  </div>
                </div>

                <!-- Ряд 9: Подпись + Выпадающий список -->
                <div class="ui-row between gap-12">
                  <span class="ui-label">Формат:</span>
                  <select class="ui-select flex-1">
                    <option>JPEG High Quality</option>
                    <option>PNG Transparent</option>
                    <option>WebP Optimized</option>
                  </select>
                </div>

                <!-- Ряд 10: Выравнивание -->
                <div class="ui-row between">
                  <span class="ui-label">Выравнивание:</span>
                  <div class="ps-align-group">
                    <button class="ps-align-btn">←</button>
                    <button class="ps-align-btn active">■</button>
                    <button class="ps-align-btn">→</button>
                  </div>
                </div>

                <!-- Ряд 11: Кнопка синяя с иконкой -->
                <button class="ui-btn primary gap-8">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path
                      d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z"
                    />
                  </svg>
                  Обрезать и посмотреть
                </button>

                <!-- Ряд 12: Кнопка серая с иконкой -->
                <button class="ui-btn gap-8">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path
                      d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"
                    />
                    <path
                      d="M18.5 2.5a2.121 2.121 0 113 3L12 15l-4 1 1-4 9.5-9.5z"
                    />
                  </svg>
                  Изменить размер...
                </button>

                <!-- Ряд 13: Пресеты -->
                <div class="presets-container">
                  <span
                    class="ui-label"
                    style="display: block; margin-bottom: 8px;"
                    >Пресеты:</span
                  >
                  <div class="presets-grid">
                    <div class="preset-item">
                      <span class="p-icon">📷</span>
                      <span class="p-name">Insta</span>
                    </div>
                    <div class="preset-item">
                      <span class="p-icon">📱</span>
                      <span class="p-name">Story</span>
                    </div>
                    <div class="preset-item active">
                      <span class="p-icon">📺</span>
                      <span class="p-name">Full</span>
                    </div>
                    <div class="preset-item">
                      <span class="p-icon">▶️</span>
                      <span class="p-name">YT</span>
                    </div>
                  </div>
                </div>
              </div>
              } @else {
              <!-- Стандартный пустой блок -->
              <div class="placeholder-slot">
                <div class="empty-hint">Пустой блок для кастомизации...</div>
              </div>
              }
            </section>
            } }
          </div>
        </aside>

        <!-- MAIN CONTENT -->
        <div class="test-main">
          <div class="welcome-screen">
            <h1>VS Modal <span class="highlight">Compromise</span></h1>
            <p class="subtitle">
              Универсальная база: 7 модулей с пустыми блоками
            </p>

            <div class="canvas-mock">
              <div class="canvas-glow"></div>
              <div class="image-placeholder">
                <span>{{ getActiveItem()?.title }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- STATUS BAR (FROM STUDIO) -->
      <div class="ps-status-bar">
        <span
          >JPEG 90% | 0.00 KB | 2 сек &#64; 1Мбит/с | 100% масштаб | Исходник:
          1920×1080</span
        >
      </div>

      <!-- FOOTER (FROM STUDIO) -->
      <div class="ps-footer">
        <div class="ps-footer-left">
          Сохранить для Web - {{ getActiveItem()?.title || 'Выберите файл...' }}
        </div>
        <div class="ps-footer-right">
          <button class="ps-btn" (click)="closeWithResult()">Отмена</button>
          <button class="ps-btn ps-btn-ready" (click)="closeWithResult()">
            Готово
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        width: 100%;
        height: 100%;
        color: #cccccc;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      }

      .test-container {
        display: flex;
        flex-direction: column;
        height: 100%;
        background: #252525;
      }

      .test-body {
        flex: 1;
        display: flex;
        min-height: 0;
      }

      /* UI MODULE STYLES */
      .ui-container {
        display: flex;
        flex-direction: column;
        gap: 12px;
        margin-top: 10px;
      }
      .ui-row {
        display: flex;
        align-items: center;
        width: 100%;
      }
      .ui-row.between {
        justify-content: space-between;
      }
      .ui-row.column {
        flex-direction: column;
        align-items: flex-start;
      }
      .ui-row.gap-8 {
        gap: 8px;
      }
      .ui-row.gap-12 {
        gap: 12px;
      }
      .ui-col {
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .flex-1 {
        flex: 1;
      }
      .no-shrink {
        flex-shrink: 0;
      }

      .ui-label {
        font-size: 11px;
        color: #858585;
      }
      .ui-input {
        width: 100%;
        background: #111;
        border: 1px solid #333;
        color: #ccc;
        padding: 4px 8px;
        font-size: 11px;
        border-radius: 2px;
        outline: none;
        &:focus {
          border-color: #007acc;
        }
      }
      .ui-input-mini {
        width: 50px;
        text-align: center;
        padding: 4px 2px;
      }

      .ui-btn {
        flex: 1;
        background: #333;
        border: 1px solid #454545;
        color: #ccc;
        padding: 6px;
        font-size: 11px;
        cursor: pointer;
        border-radius: 2px;
        display: flex;
        align-items: center;
        justify-content: center;
        &:hover {
          background: #444;
          color: #fff;
        }
        &.primary {
          background: #264f78;
          border-color: #316296;
          color: #fff;
        }
        &.primary:hover {
          background: #316296;
        }
        &.gap-8 {
          gap: 8px;
        }
      }

      .ui-select {
        background: #111;
        border: 1px solid #333;
        color: #ccc;
        font-size: 11px;
        padding: 4px;
        border-radius: 2px;
        outline: none;
        &:focus {
          border-color: #007acc;
        }
      }

      .presets-container {
        margin-top: 10px;
      }

      .presets-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 6px;
      }

      .preset-item {
        background: #252526;
        border: 1px solid #333;
        padding: 4px;
        border-radius: 3px;
        display: flex;
        flex-direction: column;
        align-items: center;
        cursor: pointer;
        &:hover {
          border-color: #555;
        }
        &.active {
          border-color: #007acc;
          background: rgba(0, 122, 204, 0.1);
        }
        .p-icon {
          font-size: 14px;
        }
        .p-name {
          font-size: 9px;
          color: #858585;
        }
      }

      /* SIDEBAR */
      .test-sidebar {
        width: 65px;
        background: #333333;
        display: flex;
        flex-direction: column;
        align-items: center;
        padding-top: 10px;
        gap: 2px;
        border-right: 1px solid #454545;
        flex-shrink: 0;
      }

      .sidebar-item {
        width: 100%;
        padding: 12px 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        cursor: pointer;
        opacity: 0.4;
        transition: all 0.2s;
        border-left: 3px solid transparent;

        &:hover {
          opacity: 0.8;
          background: rgba(255, 255, 255, 0.05);
        }
        &.active {
          opacity: 1;
          border-left-color: #007acc;
          background: rgba(255, 255, 255, 0.1);
          .sidebar-label {
            color: #fff;
          }
        }

        .icon-wrap {
          font-size: 20px;
          margin-bottom: 4px;
          color: #007acc;
        }
        .sidebar-label {
          font-size: 8.5px;
          text-align: center;
          color: #858585;
          text-transform: uppercase;
          font-weight: 500;
        }
      }

      /* CONTROL PANEL (250px) */
      .test-control-panel {
        width: 250px;
        background: #252526;
        border-right: 1px solid #454545;
        display: flex;
        flex-direction: column;
        flex-shrink: 0;
      }

      .panel-header {
        height: 38px;
        display: flex;
        align-items: center;
        padding: 0 10px; /* Уменьшили отступы */
        font-size: 11px;
        font-weight: 700;
        color: #00bfff;
        text-transform: uppercase;
        background: #2d2d30;
        border-bottom: 1px solid #333;
      }

      .panel-scroll {
        flex: 1;
        overflow-y: auto;
        padding: 8px; /* Уменьшили общий отступ панели */
        &::-webkit-scrollbar {
          width: 4px;
        }
        &::-webkit-scrollbar-thumb {
          background: #3e3e42;
          border-radius: 10px;
        }
      }

      /* STUDIO STYLE BLOCKS */
      .control-block {
        background: #1e1e1e;
        border: 1px solid #333;
        border-radius: 4px;
        padding: 8px 10px; /* Уменьшили внутренние отступы блока */
        margin-bottom: 10px;
      }

      .block-title {
        color: #007acc; /* Поменяли на более темный */
        font-size: 10px;
        font-weight: normal; /* Убрали болд */
        margin: 0 0 8px 0;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .placeholder-slot {
        min-height: 100px;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 1px dashed #333;
        border-radius: 2px;
      }

      .empty-hint {
        font-size: 9px;
        color: #444;
        text-transform: uppercase;
        letter-spacing: 1px;
      }

      /* MAIN CONTENT */
      .test-main {
        flex: 1;
        background: #121212;
        display: flex;
        justify-content: center;
        align-items: center;
        position: relative;
        overflow: hidden;
      }

      .welcome-screen {
        text-align: center;
        z-index: 2;
        h1 {
          font-size: 32px;
          margin-bottom: 5px;
          color: #eee;
          .highlight {
            color: #007acc;
          }
        }
        .subtitle {
          color: #666;
          margin-bottom: 40px;
          font-size: 14px;
        }
      }

      .canvas-mock {
        width: 400px;
        height: 250px;
        background: #1e1e1e;
        border: 1px solid #333;
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 40px;
        box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
        .image-placeholder {
          color: #444;
          font-weight: bold;
          font-size: 18px;
          letter-spacing: 2px;
        }
        .canvas-glow {
          position: absolute;
          width: 110%;
          height: 110%;
          background: radial-gradient(
            circle,
            rgba(0, 122, 204, 0.05) 0%,
            transparent 70%
          );
        }
      }

      .ps-status-bar {
        background: #181818;
        border-top: 1px solid #000;
        padding: 4px 16px;
        color: #00d9ff;
        font-family: monospace;
        font-size: 11px;
        height: 24px;
        display: flex;
        align-items: center;
        flex-shrink: 0;
      }

      .ps-footer {
        background: #333;
        padding: 8px 16px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-top: 1px solid #444;
        height: 54px;
        flex-shrink: 0;
      }

      .ps-footer-left {
        color: #aaa;
        font-size: 11px;
        font-weight: 700;
      }

      .ps-footer-right {
        display: flex;
        gap: 8px;
      }

      .ps-btn {
        background: #4a4a4a;
        color: #fff;
        padding: 6px 20px;
        font-size: 13px;
        border-radius: 2px;
        cursor: pointer;
        border: none;
        transition: all 0.2s;
        &:hover {
          background: #5a5a5a;
        }
      }

      .ps-btn-ready {
        background: #0078d4;
        font-weight: 700;
        &:hover {
          background: #0086ed;
        }
      }

      /* ALIGN STUDIO STYLES */
      .ps-align-group {
        display: flex;
        gap: 1px;
        background: #111;
        padding: 1px;
        border-radius: 2px;
        border: 1px solid #333;
      }

      .ps-align-btn {
        background: #333;
        border: none;
        color: #666;
        width: 26px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        font-size: 14px;
        transition: all 0.2s;
        &:hover {
          color: #fff;
        }
        &.active {
          background: #007acc;
          color: #fff;
        }
      }

      /* CUSTOM PS-SLIDER STYLES (FROM STUDIO) */
      .ps-slider-container {
        display: flex;
        align-items: center;
        width: 100%;
        height: 18px;
      }

      .ps-slider {
        flex: 1;
        height: 4px;
        background: #111;
        border-radius: 2px;
        position: relative;
        cursor: pointer;
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
        box-shadow: 0 0 2px rgba(0, 0, 0, 0.5);
      }

      /* VS-SLIDER STUDIO STYLE */
      .vs-slider {
        -webkit-appearance: none;
        width: 100%;
        height: 18px;
        background: transparent;
        cursor: pointer;
        padding: 0;
        margin: 0;

        &::-webkit-slider-runnable-track {
          width: 100%;
          height: 4px;
          background: #111;
          border-radius: 2px;
        }

        &::-webkit-slider-thumb {
          -webkit-appearance: none;
          height: 14px;
          width: 14px;
          border-radius: 50%;
          background: #fff;
          margin-top: -5px;
          box-shadow: 0 0 4px rgba(0, 0, 0, 0.5);
          border: none;
          transition: background 0.2s;
        }

        &:active::-webkit-slider-thumb {
          background: #1890ff;
        }

        /* Firefox */
        &::-moz-range-track {
          width: 100%;
          height: 4px;
          background: #111;
          border-radius: 2px;
        }
        &::-moz-range-thumb {
          height: 14px;
          width: 14px;
          background: #fff;
          border-radius: 50%;
          border: none;
          box-shadow: 0 0 4px rgba(0, 0, 0, 0.5);
        }
      }
    `,
  ],
})
export class CompromiseTestContentComponent implements OnInit {
  public readonly data = inject(VS_MODAL_DATA);
  public readonly modalRef = inject(VSModalRef);

  activeTab = signal<string>('item1');
  item1Quality = signal<number>(80);
  transparency = signal<number>(85);
  zoom = signal<number>(100);

  menuItems: MenuItem[] = [
    { id: 'item1', title: 'Пункт 1', icon: '📁' },
    { id: 'item2', title: 'Пункт 2', icon: '🔍' },
    { id: 'item3', title: 'Пункт 3', icon: '🎨' },
    { id: 'item4', title: 'Пункт 4', icon: '📦' },
    { id: 'item5', title: 'Пункт 5', icon: '⚡' },
    { id: 'item6', title: 'UI', icon: '�️' },
    { id: 'item7', title: 'Пункт 7', icon: '⚙️' },
  ];

  getActiveItem() {
    return this.menuItems.find((m) => m.id === this.activeTab());
  }

  ngOnInit() {
    console.log('Test Content Initialized');
  }

  changeStatus() {
    this.modalRef.updateStatus(`Модуль: ${this.getActiveItem()?.title}`);
  }

  closeWithResult() {
    this.modalRef.close({ action: 'close', source: 'universal_base' });
  }
}
