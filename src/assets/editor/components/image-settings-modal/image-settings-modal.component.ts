import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

export interface ImageSettings {
  alignment: 'left' | 'center' | 'right';
  width: string;
}

@Component({
  selector: 'app-image-settings-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal-backdrop" *ngIf="isOpen" (click)="close()"></div>

    <div class="image-settings-modal" *ngIf="isOpen" (click)="$event.stopPropagation()">
      <!-- Header -->
      <div class="modal-header">
        <h3>Настройки изображения</h3>
        <button class="close-btn" (click)="close()" aria-label="Закрыть">×</button>
      </div>

      <!-- Body -->
      <div class="modal-body">
        <!-- Width -->
        <div class="form-group">
          <label>Ширина</label>
          <div class="width-controls">
            <button
              class="aurora-btn aurora-btn-ghost aurora-btn-xs"
              [class.aurora-btn-active]="settings.width === '100%'"
              (click)="settings.width = '100%'"
            >
              100%
            </button>
            <button
              class="aurora-btn aurora-btn-ghost aurora-btn-xs"
              [class.aurora-btn-active]="settings.width === '75%'"
              (click)="settings.width = '75%'"
            >
              75%
            </button>
            <button
              class="aurora-btn aurora-btn-ghost aurora-btn-xs"
              [class.aurora-btn-active]="settings.width === '50%'"
              (click)="settings.width = '50%'"
            >
              50%
            </button>
            <button
              class="aurora-btn aurora-btn-ghost aurora-btn-xs"
              [class.aurora-btn-active]="settings.width === 'auto'"
              (click)="settings.width = 'auto'"
            >
              Auto
            </button>
          </div>
        </div>

        <!-- Alignment -->
        <div class="form-group">
          <label>Выравнивание</label>
          <div class="aurora-btn-group alignment-buttons">
            <button
              class="aurora-btn aurora-btn-ghost aurora-btn-xs"
              [class.aurora-btn-active]="settings.alignment === 'left'"
              (click)="settings.alignment = 'left'"
              title="По левому краю"
            >
              ⬅️
            </button>
            <button
              class="aurora-btn aurora-btn-ghost aurora-btn-xs"
              [class.aurora-btn-active]="settings.alignment === 'center'"
              (click)="settings.alignment = 'center'"
              title="По центру"
            >
              ↔️
            </button>
            <button
              class="aurora-btn aurora-btn-ghost aurora-btn-xs"
              [class.aurora-btn-active]="settings.alignment === 'right'"
              (click)="settings.alignment = 'right'"
              title="По правому краю"
            >
              ➡️
            </button>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="modal-footer">
        <button class="aurora-btn aurora-btn-ghost" (click)="close()">Отмена</button>
        <button class="aurora-btn aurora-btn-primary" (click)="apply()">Применить</button>
      </div>
    </div>
  `,
  styles: [
    `
      .modal-backdrop {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        z-index: 9998;
      }

      .image-settings-modal {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        z-index: 9999;
        min-width: 400px;
        max-width: 500px;
      }

      .modal-header {
        padding: 16px 20px;
        border-bottom: 1px solid #e0e0e0;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .modal-header h3 {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
      }

      .close-btn {
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
        padding: 0;
        width: 30px;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 4px;
        transition: background-color 0.2s;
      }

      .close-btn:hover {
        background-color: #f5f5f5;
      }

      .modal-body {
        padding: 20px;
      }

      .form-group {
        margin-bottom: 20px;
      }

      .form-group:last-child {
        margin-bottom: 0;
      }

      .form-group label {
        display: block;
        margin-bottom: 8px;
        font-weight: 500;
        color: #333;
      }

      .width-controls {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
      }

      .alignment-buttons {
        display: flex;
        gap: 4px;
      }

      .aurora-btn {
        padding: 8px 16px;
        border: 1px solid #ddd;
        background: white;
        cursor: pointer;
        border-radius: 4px;
        transition: all 0.2s;
        font-size: 14px;
      }

      .aurora-btn-xs {
        padding: 6px 12px;
        font-size: 12px;
      }

      .aurora-btn-ghost {
        background: transparent;
      }

      .aurora-btn-ghost:hover {
        background: #f5f5f5;
      }

      .aurora-btn-active {
        background: #007bff;
        color: white;
        border-color: #007bff;
      }

      .aurora-btn-primary {
        background: #007bff;
        color: white;
        border-color: #007bff;
      }

      .aurora-btn-primary:hover {
        background: #0056b3;
        border-color: #0056b3;
      }

      .modal-footer {
        padding: 16px 20px;
        border-top: 1px solid #e0e0e0;
        display: flex;
        justify-content: flex-end;
        gap: 12px;
      }
    `,
  ],
})
export class ImageSettingsModalComponent {
  @Input() isOpen = false;
  @Input() settings: ImageSettings = {
    alignment: 'center',
    width: '100%',
  };

  @Output() closed = new EventEmitter<void>();
  @Output() applied = new EventEmitter<ImageSettings>();

  close(): void {
    this.closed.emit();
  }

  apply(): void {
    this.applied.emit({ ...this.settings });
    this.close();
  }
}
