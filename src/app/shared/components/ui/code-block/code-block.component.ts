import { CommonModule } from '@angular/common';
import { Component, input, signal } from '@angular/core';

/**
 * Reusable Code Block Component
 *
 * Features:
 * - Professional dark wrapper with colored header
 * - Clean white "editor window" for the content
 * - Built-in copy to clipboard functionality
 * - Responsive and theme-aware (supports dark mode)
 * - Configurable dimensions and background colors
 */
@Component({
  selector: 'av-code-block',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="av-code-block"
      [style.width]="width()"
      [style.height]="height()"
      [style.--av-code-bg]="bgColor()"
    >
      <div class="av-code-block__header">
        <h4 class="av-code-block__title">{{ title() }}</h4>
        @if (showCopy()) {
          <button class="av-code-block__copy-btn" (click)="copyCode()">
            {{ copied() ? 'Скопировано!' : 'Копировать' }}
          </button>
        }
      </div>
      <div class="av-code-block__window">
        <pre class="av-code-block__pre"><code [innerText]="code()"></code></pre>
      </div>
    </div>
  `,
  styles: [
    `
      @use 'styles/abstracts/variables' as *;
      @use 'styles/abstracts/mixins' as *;

      .av-code-block {
        --av-code-bg: #1e293b; /* Default slate-800 */

        display: flex;
        flex-direction: column;
        background: var(--av-code-bg);
        padding: 20px;
        border-radius: 12px;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        overflow: hidden;

        &__header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        &__title {
          margin: 0;
          color: rgba(255, 255, 255, 0.6);
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        &__copy-btn {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: #f8fafc;
          padding: 4px 12px;
          border-radius: 4px;
          font-size: 0.75rem;
          cursor: pointer;
          transition: all 0.2s;

          &:hover {
            background: rgba(255, 255, 255, 0.2);
          }
        }

        &__window {
          background: #ffffff;
          border-radius: 8px;
          padding: 20px;
          border: 1px solid #cbd5e1;
          flex: 1;
          overflow: auto;
        }

        &__pre {
          margin: 0;
        }

        &__code {
          color: #1e293b; /* Dark blue slate-800 */
          font-family: 'Fira Code', 'Cascadia Code', 'Consolas', monospace;
          font-size: 13px;
          line-height: 1.6;
        }
      }
    `,
  ],
})
export class CodeBlockComponent {
  title = input<string>('Code Example');
  code = input<string>('');
  width = input<string>('100%');
  height = input<string>('auto');
  bgColor = input<string>('#1e293b');
  showCopy = input<boolean>(true);

  copied = signal(false);

  copyCode() {
    if (!this.code()) return;

    navigator.clipboard.writeText(this.code()).then(() => {
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 2000);
    });
  }
}
