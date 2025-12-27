import { CommonModule } from '@angular/common';
import { Component, input, output, signal } from '@angular/core';

/**
 * Help Copy Container Component
 *
 * Специализированный UI-блок для отображения кода или инструкций с кнопкой копирования.
 *
 * Дизайн:
 * - Внешнее "окружение" (wrapper) с настраиваемым цветом.
 * - Внутреннее белое "окно редактора" для контента.
 * - Темно-синий шрифт в светлой теме, адаптация под темную тему.
 */
@Component({
  selector: 'av-help-copy-container',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="av-copy-container"
      [class.av-copy-container--collapsed]="collapsed()"
      [style.width]="width()"
      [style.height]="collapsed() ? 'auto' : height()"
      [style.--av-copy-bg]="bgColor() || 'var(--color-bg-help-wrapper, #1e293b)'"
    >
      <div class="av-copy-container__header">
        <h4 class="av-copy-container__title">{{ title() }}</h4>
        <div class="av-copy-container__actions">
          <button
            class="av-copy-container__action-btn av-copy-container__action-btn--toggle"
            (click)="toggleCollapse()"
            [title]="collapsed() ? 'Развернуть' : 'Свернуть'"
          >
            {{ collapsed() ? '▲' : '▼' }}
          </button>

          @if (!collapsed()) { @if(showHelpButton()) {
          <button
            class="av-copy-container__action-btn av-copy-container__action-btn--help"
            (click)="toggleHelp()"
            title="Справка по компоненту"
          >
            {{ helpVisible() ? 'Закрыть' : '?' }}
          </button>
          } @if (showCopy() && !helpVisible()) {
          <button class="av-copy-container__action-btn" (click)="copyContent()">
            {{ copied() ? 'Скопировано!' : 'Копировать' }}
          </button>
          } }
        </div>
      </div>

      @if (!collapsed()) {
      <div class="av-copy-container__window">
        @if (helpVisible()) { @if (helpContent()) {
        <div class="av-copy-container__help-content">
          <pre class="av-copy-container__pre"><code>{{ helpContent() }}</code></pre>
        </div>
        } @else if (!disableInternalHelp()) {
        <div class="av-help-content">
          <h5 class="av-help-title">Dokumentation: Help Copy Container</h5>

          <div class="av-help-section">
            <span class="av-help-label">Inputs (Входящие данные):</span>
            <ul class="av-help-list">
              <li>
                <code>[title]</code>
                <span class="av-help-desc">Заголовок блока (default: 'Код использования')</span>
              </li>
              <li>
                <code>[content]</code>
                <span class="av-help-desc">Текст/код для отображения</span>
              </li>
              <li>
                <code>[width]</code>
                <span class="av-help-desc">Ширина (default: '100%')</span>
              </li>
              <li>
                <code>[height]</code>
                <span class="av-help-desc">Высота (default: 'auto')</span>
              </li>
              <li>
                <code>[bgColor]</code>
                <span class="av-help-desc">Цвет внешней обертки (default: slate-800)</span>
              </li>
              <li>
                <code>[showCopy]</code>
                <span class="av-help-desc">Показывать кнопку копирования (default: true)</span>
              </li>
              <li>
                <code>[showHelpButton]</code>
                <span class="av-help-desc">Показывать кнопку справки ? (default: false)</span>
              </li>
              <li>
                <code>[helpContent]</code>
                <span class="av-help-desc">Текст вашей справки (строка)</span>
              </li>
              <li>
                <code>[disableInternalHelp]</code>
                <span class="av-help-desc"
                  >Отключить эту справку для внешних триггеров (default: false)</span
                >
              </li>
            </ul>
          </div>

          <div class="av-help-section">
            <span class="av-help-label">Outputs (События):</span>
            <ul class="av-help-list">
              <li>
                <code>(helpToggled)</code>
                <span class="av-help-desc">Срабатывает при нажатии на ?. Возвращает boolean.</span>
              </li>
            </ul>
          </div>
        </div>
        } } @else {
        <pre class="av-copy-container__pre"><code [innerText]="content()"></code></pre>
        }
      </div>
      }
    </div>
  `,
  styles: [
    `
      @use 'styles/abstracts/variables' as *;
      @use 'styles/abstracts/mixins' as *;

      .av-copy-container {
        /* Переменные для управления цветом фона и текста */
        --av-copy-bg: #1e293b;
        --av-copy-text: #ffffff;
        --av-copy-btn-bg: rgba(255, 255, 255, 0.1);
        --av-copy-btn-border: rgba(255, 255, 255, 0.2);

        display: flex;
        flex-direction: column;
        background: var(--av-copy-bg);
        padding: 20px;
        border-radius: 12px;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        overflow: hidden;
        box-sizing: border-box;
        transition: width 0.3s ease-in-out, height 0.3s ease-in-out;
        border: 1px solid rgba(0, 0, 0, 0.05);

        &__header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        &__title {
          margin: 0;
          color: var(--av-copy-text);
          opacity: 0.6;
          font-size: 0.7rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }

        &__actions {
          display: flex;
          gap: 8px;
        }

        &__action-btn {
          background: var(--av-copy-btn-bg);
          border: 1px solid var(--av-copy-btn-border);
          color: var(--av-copy-text);
          padding: 4px 12px;
          border-radius: 6px;
          font-size: 0.7rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          text-transform: uppercase;
          letter-spacing: 0.05em;

          &:hover {
            background: rgba(255, 255, 255, 0.2);
            @if (light-background) {
              background: rgba(0, 0, 0, 0.05);
            }
          }

          &--toggle {
            font-size: 0.6rem;
            width: 24px;
            padding: 4px 0;
          }

          &--help {
            min-width: 24px;
            padding: 4px 8px;
            opacity: 0.8;

            &:hover {
              opacity: 1;
              background: var(--av-copy-btn-bg);
            }
          }
        }

        &__window {
          background: #ffffff;
          border-radius: 10px;
          padding: 16px;
          border: 1px solid rgba(0, 0, 0, 0.05);
          flex: 1;
          overflow: auto;
          min-height: 50px;
          position: relative;
          box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.02);

          @include dark-theme {
            background: rgba(15, 23, 42, 0.6);
            border-color: rgba(255, 255, 255, 0.05);
          }
        }

        &__pre {
          margin: 0;
          white-space: pre;
          background: #f8fafc;
          padding: 12px 16px;
          border-radius: 6px;
          border: 1px solid #f1f5f9;

          @include dark-theme {
            background: rgba(0, 0, 0, 0.2);
            border-color: rgba(255, 255, 255, 0.03);
          }
        }

        /* Help Styles */
        &__help-content {
          color: #334155;
          font-size: 0.85rem;

          @include dark-theme {
            color: #cbd5e1;
          }
        }

        code {
          color: #334155;
          font-family: 'Fira Code', 'Cascadia Code', 'Consolas', monospace;
          font-size: 13px;
          line-height: 1.6;

          @include dark-theme {
            color: #f8fafc;
          }
        }
      }
    `,
  ],
})
export class HelpCopyContainerComponent {
  /** Заголовок блока */
  title = input<string>('Код использования');

  /** Контент для отображения и копирования */
  content = input<string>('');

  /** Ширина контейнера (напр. '100%', '500px') */
  width = input<string>('100%');

  /** Высота контейнера (напр. 'auto', '300px') */
  height = input<string>('auto');

  /** Цвет фона внешнего окружения (напр. '#1e293b' или 'red')
   * Если не задан, используется цвет из глобальной переменной или дефолтный slate-800
   */
  bgColor = input<string | null>(null);

  /** Показывать ли кнопку копирования */
  showCopy = input<boolean>(true);

  /** Показывать ли кнопку справки по самому компоненту */
  showHelpButton = input<boolean>(false);

  /** Отключить отображение внутреннего контента справки (только эмит события) */
  disableInternalHelp = input<boolean>(false);

  /** Контент для справки (если не задан, показывается техническая справка компонента) */
  helpContent = input<string | null>(null);

  /** Начальное состояние: свернуто или нет */
  defaultCollapsed = input<boolean>(true);

  /** Сигнал текущего состояния сворачивания */
  collapsed = signal(false);

  copied = signal(false);

  /** Показывать ли справку */
  helpVisible = signal(false);

  constructor() {
    // Устанавливаем начальное состояние из input
    // Используем effect или ngOnInit, но в Angular 17+ удобно через constructor/field init
    // Однако input() возвращает Signal, поэтому лучше в constructor
  }

  ngOnInit() {
    this.collapsed.set(this.defaultCollapsed());
  }

  copyContent() {
    if (!this.content()) return;

    navigator.clipboard.writeText(this.content()).then(() => {
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 2000);
    });
  }

  toggleHelp() {
    this.helpVisible.update((v) => !v);
    this.helpToggled.emit(this.helpVisible());
  }

  toggleCollapse() {
    this.collapsed.update((v) => !v);
    this.collapsedChange.emit(this.collapsed());
  }

  helpToggled = output<boolean>();
  collapsedChange = output<boolean>();
}
