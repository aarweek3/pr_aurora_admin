import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AvTinymceControlComponent } from '../../controls/tinymce-control/tinymce-control.component';

@Component({
  selector: 'app-test-tinymce',
  standalone: true,
  imports: [FormsModule, AvTinymceControlComponent, CommonModule],
  template: `
    <div class="tinymce-container">
      <h2>TinyMCE Reusable Control Test & Documentation</h2>

      <div class="instruction-box">
        <h3>1. Как использовать (Подключение)</h3>
        <p>Для подключения редактора в любой standalone компонент:</p>
        <pre><code>{{ usageCode }}</code></pre>
      </div>

      <div class="instruction-box">
        <h3>2. Настройка Toolbar и Plugins</h3>
        <p>
          Вы можете передать кастомные строки <code>toolbar</code> и <code>plugins</code> через
          Input-параметры.
        </p>
        <pre><code>{{ configCode }}</code></pre>
        <p><small>Список всех плагинов доступен в документации TinyMCE (версия 7+). </small></p>
      </div>

      <div class="instruction-box highlight">
        <h3>Демонстрация</h3>
        <av-tinymce-control
          [(ngModel)]="editorValue"
          label="Рабочая область"
          placeholder="Введите текст здесь..."
          [height]="400"
        >
        </av-tinymce-control>
      </div>

      <div style="margin-top: 20px;">
        <button (click)="logContent()">Лог в консоль</button>
        <button (click)="resetContent()">Сбросить</button>
        <button (click)="addExample()">Добавить пример</button>
      </div>

      @if (editorValue()) {
      <div
        style="margin-top: 20px; padding: 10px; border: 1px solid #ccc; background: #fff; border-radius: 8px;"
      >
        <div class="tabs">
          <button (click)="activeTab = 'preview'" [class.active]="activeTab === 'preview'">
            Превью
          </button>
          <button (click)="activeTab = 'code'" [class.active]="activeTab === 'code'">
            HTML Код
          </button>
        </div>

        <div class="tab-content" style="margin-top: 15px;">
          @if (activeTab === 'preview') {
          <div [innerHTML]="editorValue()"></div>
          } @else {
          <pre class="code-output"><code>{{ editorValue() }}</code></pre>
          }
        </div>
      </div>
      }
    </div>
  `,
  styles: [
    `
      .tinymce-container {
        padding: 20px;
        max-width: 1000px;
        margin: 0 auto;
        background: #f4f6f8;
        min-height: 100vh;
      }
      .instruction-box {
        background: #fff;
        padding: 15px;
        margin-bottom: 20px;
        border-radius: 8px;
        border-left: 4px solid #1890ff;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
      }
      .instruction-box.highlight {
        border-left-color: #52c41a;
      }
      .instruction-box h3 {
        margin-top: 0;
        color: #001529;
      }
      button {
        margin-right: 10px;
        padding: 10px 20px;
        cursor: pointer;
        border: none;
        border-radius: 4px;
        background: #1890ff;
        color: white;
        transition: 0.3s;
      }
      button:hover {
        background: #40a9ff;
      }
      pre {
        background: #272c34;
        color: #abb2bf;
        padding: 12px;
        border-radius: 6px;
        overflow-x: auto;
        font-size: 13px;
        white-space: pre-wrap;
      }
      .code-output {
        border: 1px solid #ddd;
        background: #f9f9f9;
        color: #333;
      }
      .tabs {
        border-bottom: 1px solid #eee;
        padding-bottom: 10px;
      }
      .tabs button {
        background: transparent;
        color: #666;
        font-weight: 500;
        border-radius: 0;
      }
      .tabs button.active {
        color: #1890ff;
        border-bottom: 2px solid #1890ff;
      }
    `,
  ],
})
export class TestTinymceComponent {
  editorValue = signal<string>('<h1>Привет!</h1><p>Это тест переиспользуемого контрола.</p>');
  activeTab: 'preview' | 'code' = 'preview';

  usageCode = `import { AvTinymceControlComponent } from '../../controls/tinymce-control/tinymce-control.component';
import { FormsModule } from '@angular/forms'; // Обязательно для ngModel

@Component({
  imports: [AvTinymceControlComponent, FormsModule],
  template: \`<av-tinymce-control [(ngModel)]="content"></av-tinymce-control>\`
})`;

  configCode = `<av-tinymce-control
  [toolbar]="'undo redo | bold italic | alignleft aligncenter'"
  [plugins]="'lists link image'"
  [height]="300">
</av-tinymce-control>`;

  logContent() {
    console.log('Current content:', this.editorValue());
  }

  resetContent() {
    this.editorValue.set('');
  }

  addExample() {
    const example = `
      <h2 style="color: #1890ff;">Пример оформления</h2>
      <p>Редактор поддерживает <strong>жирный</strong>, <em>курсив</em> и даже <span style="background-color: #ffff00;">подсветку текста</span>.</p>
      <ul>
        <li>Автоматическая загрузка из ассетов</li>
        <li>Поддержка Angular Reactive Forms</li>
        <li>Легкая кастомизация тулбара</li>
      </ul>
      <div class="mce-accordion">
        <details class="mce-accordion-item">
          <summary class="mce-accordion-summary">Нажми, чтобы развернуть (Accordion Plugin)</summary>
          <p>Внутри может быть любой контент!</p>
        </details>
      </div>
    `;
    this.editorValue.set(example);
  }
}
