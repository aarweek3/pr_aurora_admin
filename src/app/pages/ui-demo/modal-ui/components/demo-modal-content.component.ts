import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ButtonDirective } from '../../../../shared/components/ui/button/button.directive';
import { MODAL_DATA, ModalRef } from '../../../../shared/components/ui/modal';

@Component({
  selector: 'app-demo-modal-content',
  standalone: true,
  imports: [CommonModule, ButtonDirective],
  template: `
    <div class="demo-modal-content">
      <h3>{{ data.title || 'Динамический модал' }}</h3>
      <p>{{ data.message || 'Этот компонент был открыт через ModalService' }}</p>

      @if (data.items) {
        <div class="data-display">
          <ul>
            @for (item of data.items; track item) {
              <li>{{ item }}</li>
            }
          </ul>
        </div>
      }

      <div class="actions">
        <button av-button avType="primary" (clicked)="close('success')">Подтвердить</button>
        <button av-button avType="default" (clicked)="close()">Отмена</button>
      </div>
    </div>
  `,
  styles: [
    `
      .demo-modal-content {
        padding: 1rem;
      }
      h3 {
        margin-top: 0;
        margin-bottom: 1rem;
      }
      .data-display {
        margin: 1rem 0;
        padding: 1rem;
        background: #f5f5f5;
        border-radius: 4px;
      }
      .actions {
        display: flex;
        justify-content: flex-end;
        gap: 0.5rem;
        margin-top: 1.5rem;
      }
    `,
  ],
})
export class DemoModalContentComponent {
  data = inject(MODAL_DATA) as { title?: string; message?: string; items?: string[] };
  private modalRef = inject(ModalRef);


  close(result?: string) {
    this.modalRef.close(result);
  }
}
