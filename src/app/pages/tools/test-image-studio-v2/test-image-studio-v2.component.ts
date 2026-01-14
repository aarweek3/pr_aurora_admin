import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { AvImageStudioV2Component } from '@shared/components/av-image-studio-v2/av-image-studio-v2.component';
import { ButtonDirective } from '@shared/components/ui/button/button.directive';
import { ModalService } from '@shared/components/ui/modal/services/modal.service';
import { NzCardModule } from 'ng-zorro-antd/card';

@Component({
  selector: 'app-test-image-studio-v2',
  standalone: true,
  imports: [CommonModule, NzCardModule, ButtonDirective],
  template: `
    <div style="padding: 24px;">
      <nz-card nzTitle="Aurora Image Studio V2 (Alpha) 🎨">
        <p>Этот стенд тестирует Студию на базе внутреннего <b>av-modal</b>.</p>

        <div style="display: flex; gap: 12px; margin-top: 20px;">
          <button av-button avType="primary" (click)="openStudio()">ОТКРЫТЬ СТУДИЮ V2</button>
        </div>

        <div style="margin-top: 30px; padding: 12px; background: #f0f0f0; border-radius: 4px;">
          <h4>Нативная поддержка:</h4>
          <ul>
            <li>✅ Draggable (за хедер модала)</li>
            <li>✅ Resizable (через штатный уголок av-modal)</li>
            <li>✅ Адаптивная высота</li>
          </ul>
        </div>

        <div *ngIf="lastResult" style="margin-top: 20px;">
          <h4>Результат:</h4>
          <pre>{{ lastResult | json }}</pre>
          <img [src]="lastResult.dataUrl" style="max-width: 300px; border: 1px solid #ccc;" />
        </div>
      </nz-card>
    </div>
  `,
})
export class TestImageStudioV2Component {
  private modalService = inject(ModalService);
  lastResult: any = null;

  openStudio() {
    console.log('[Test] Opening Studio V2...');
    const modalRef = this.modalService.open(AvImageStudioV2Component, {
      title: undefined,
      showCloseButton: false, // We use our own header
      closeOnBackdrop: false,
      width: '1250px',
      height: '800px',
      draggable: true,
      resizable: true,
      panelClass: 'av-studio-modal-panel', // Custom transparent panel
      data: {
        // imageUrl: 'https://images.unsplash.com/photo-1542831371-29b0f74f9713',
      },
    });

    // Включаем draggable/resizable для av-modal (если они поддерживаются в ModalConfig)
    // Примечание: В текущей реализации ModalConfig может не иметь этих полей напрямую,
    // но мы проверим ModalComponent позже.

    modalRef.afterClosed().subscribe((result) => {
      console.log('[Test] Studio V2 closed with result:', result);
      if (result) {
        this.lastResult = result;
      }
    });
  }
}
