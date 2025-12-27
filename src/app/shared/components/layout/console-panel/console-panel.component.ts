import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { EventBusService } from '../../../../core/services/event-bus/event-bus.service';
import { LoggerConsoleComponent } from '../../../logger-console/components/logger-console/logger-console.component';

/**
 * Console Panel Component
 *
 * Независимая панель консоли.
 * Занимает 1/3 экрана (33vw).
 */
@Component({
  selector: 'app-console-panel',
  standalone: true,
  imports: [CommonModule, NzIconModule, LoggerConsoleComponent],
  template: `
    <aside class="console-panel" [class.is-open]="isOpen()">
      <div class="console-panel__header">
        <h3 class="title">System Console</h3>
        <button class="close-btn" (click)="close()">
          <span nz-icon nzType="close"></span>
        </button>
      </div>

      <div class="console-panel__content">
        <app-logger-console></app-logger-console>
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
        background: #1e1e1e; // Темный фон для консоли
        box-shadow: -4px 0 15px rgba(0, 0, 0, 0.3);
        z-index: 1000;
        overflow: hidden;
        transition: width 0.3s cubic-bezier(0.7, 0, 0.3, 1);
        border-left: 1px solid #333;
        display: flex;
        flex-direction: column;
      }

      .console-panel.is-open {
        width: 35vw; // Немного увеличим для удобства
      }

      .console-panel__header {
        padding: 8px 16px;
        border-bottom: 1px solid #333;
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: #252526;

        .title {
          margin: 0;
          font-size: 14px;
          font-weight: 500;
          color: #858585;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .close-btn {
          background: transparent;
          border: none;
          cursor: pointer;
          font-size: 16px;
          color: #8c8c8c;
          transition: color 0.2s;

          &:hover {
            color: #ff4d4f;
          }
        }
      }

      .console-panel__content {
        flex: 1;
        padding: 0; // Консоль сама имеет падинги
        overflow: hidden;
        display: flex;
        flex-direction: column;
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
