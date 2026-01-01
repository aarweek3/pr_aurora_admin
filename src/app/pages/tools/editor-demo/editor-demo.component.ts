import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuroraEditorComponent } from '@editor/components/aurora-editor.component';
import { NzCardModule } from 'ng-zorro-antd/card';

@Component({
  selector: 'av-editor-demo',
  standalone: true,
  imports: [CommonModule, FormsModule, AuroraEditorComponent, NzCardModule],
  template: `
    <div class="page-container" style="padding: 24px; background: #f0f2f5; min-height: 100vh;">
      <div style="margin-bottom: 24px;">
        <h1 style="font-size: 24px; font-weight: 700; color: #1e293b; margin-bottom: 8px;">
          Aurora Editor ✍️
        </h1>
        <p style="color: #64748b;">Полнофункциональный WYSIWYG редактор для создания контента</p>
      </div>

      <div
        class="editor-card shadow-sm"
        style="background: white; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0;"
      >
        <aurora-editor [(ngModel)]="content" [config]="editorConfig"> </aurora-editor>
      </div>

      <div style="margin-top: 32px;">
        <nz-card nzTitle="Предпросмотр HTML" class="shadow-sm" style="border-radius: 16px;">
          <pre
            style="background: #f8fafc; padding: 16px; border-radius: 8px; font-family: 'Fira Code', monospace; font-size: 13px; overflow-x: auto;"
            >{{ content() }}</pre
          >
        </nz-card>
      </div>
    </div>
  `,
  styles: [
    `
      .editor-card {
        min-height: 500px;
      }
    `,
  ],
})
export class EditorDemoComponent {
  content = signal<string>(`
    <h2>Добро пожаловать в Aurora Editor!</h2>
    <p>Это мощный визуальный редактор, поддерживающий:</p>
    <ul>
      <li>Форматирование текста (жирный, курсив, заголовки)</li>
      <li>Списки и таблицы</li>
      <li>Вставку изображений и видео</li>
      <li>Работу с исходным кодом</li>
    </ul>
    <p>Попробуйте изменить этот текст!</p>
  `);

  editorConfig = {
    placeholder: 'Введите ваш текст здесь...',
    minHeight: 400,
  };
}
