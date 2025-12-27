import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { EventBusService } from '../../../../core/services/event-bus/event-bus.service';

/**
 * Console Panel Component
 *
 * Независимая панель консоли.
 * Занимает 1/3 экрана (33vw).
 */
@Component({
  selector: 'app-console-panel',
  standalone: true,
  imports: [CommonModule, NzIconModule],
  template: `
    <aside class="console-panel" [class.is-open]="isOpen()">
      <div class="console-panel__header">
        <h3 class="title">Console</h3>
        <button class="close-btn" (click)="close()">
          <span nz-icon nzType="close"></span>
        </button>
      </div>

      <div class="console-panel__content">
        <div class="verification-text">Проверка....</div>
      </div>
    </aside>
  `,
  styles: [
    `
      .console-panel {
        position: fixed;
        top: 64px; // Высота хедера
        right: 0;
        bottom: 32px; // Высота статус-бара
        width: 0;
        background: #fff;
        box-shadow: -4px 0 15px rgba(0, 0, 0, 0.05);
        z-index: 1000;
        overflow: hidden;
        transition: width 0.3s cubic-bezier(0.7, 0, 0.3, 1);
        border-left: 2px solid #1890ff;
        display: flex;
        flex-direction: column;
      }

      .console-panel.is-open {
        width: 33vw;
      }

      .console-panel__header {
        padding: 16px 24px;
        border-bottom: 1px solid #f0f0f0;
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: #fafafa;

        .title {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
          color: #1a1a1a;
        }

        .close-btn {
          background: transparent;
          border: none;
          cursor: pointer;
          font-size: 18px;
          color: #8c8c8c;
          transition: color 0.2s;

          &:hover {
            color: #ff4d4f;
          }
        }
      }

      .console-panel__content {
        flex: 1;
        padding: 24px;
        overflow-y: auto;
      }

      .verification-text {
        padding: 24px;
        background: #f8fafc;
        border: 1px dashed #cbd5e1;
        border-radius: 8px;
        color: #1890ff;
        font-weight: 600;
        font-size: 16px;
        text-align: center;
        font-family: 'Fira Code', monospace;
      }
    `,
  ],
})
export class ConsolePanelComponent implements OnInit {
  private readonly eventBus = inject(EventBusService);
  isOpen = signal(false);

  ngOnInit() {
    this.eventBus.subscribe('toggleConsole', () => {
      this.isOpen.update((v) => !v);
    });

    this.eventBus.subscribe('openConsole', () => {
      this.isOpen.set(true);
    });
  }

  close() {
    this.isOpen.set(false);
  }
}
