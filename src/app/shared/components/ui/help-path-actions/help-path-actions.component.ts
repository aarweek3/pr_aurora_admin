import { CommonModule } from '@angular/common';
import { Component, inject, input } from '@angular/core';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzMessageService } from 'ng-zorro-antd/message';
import { IconLaboratoryService } from '@shared/services/icon-laboratory.service';

/**
 * AvHelpPathActionsComponent
 * 
 * Пара кнопок «Копировать путь» и «Открыть в редакторе».
 * Используется в хедере документации или как самостоятельный элемент.
 */
@Component({
  selector: 'av-help-path-actions',
  standalone: true,
  imports: [
    CommonModule,
    NzButtonModule,
    NzIconModule,
    NzToolTipModule,
    ClipboardModule
  ],
  template: `
    <div class="path-actions">
      <button nz-button nzType="text" nzSize="small" 
              [cdkCopyToClipboard]="path()!"
              (click)="notifyClipboard()"
              nz-tooltip nzTooltipTitle="Копировать путь">
        <span nz-icon nzType="copy"></span>
      </button>
      <button nz-button nzType="text" nzSize="small" 
              (click)="openInEditor(path()!)"
              nz-tooltip nzTooltipTitle="Открыть в редакторе">
        <span nz-icon nzType="folder-open"></span>
      </button>
    </div>
  `,
  styles: [`
    .path-actions {
      display: flex;
      gap: 4px;
      
      button {
        color: #94a3b8;
        transition: all 0.2s;
        
        &:hover {
          color: #2563eb;
          background: #dbeafe;
        }
        
        &[nzTooltipTitle="Открыть в редакторе"]:hover {
          color: #059669;
          background: #d1fae5;
        }
      }
    }
  `]
})
export class HelpPathActionsComponent {
  private iconLabService = inject(IconLaboratoryService);
  private message = inject(NzMessageService);

  path = input.required<string>();

  notifyClipboard(): void {
    this.message.success('Путь скопирован в буфер обмена');
  }

  openInEditor(path: string): void {
    if (!path) return;
    
    this.iconLabService.openFile(path).subscribe({
      next: () => this.message.success('Запрос на открытие файла отправлен'),
      error: (err) => this.message.error('Не удалось открыть файл: ' + (err.error?.message || err.message))
    });
  }
}
