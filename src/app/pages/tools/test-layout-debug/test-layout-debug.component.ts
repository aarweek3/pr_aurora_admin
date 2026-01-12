import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzModalService } from 'ng-zorro-antd/modal';
import { DebugModalComponent } from './debug-modal.component';

@Component({
  selector: 'app-test-layout-debug',
  standalone: true,
  imports: [CommonModule, NzButtonModule, NzCardModule],
  template: `
    <div style="padding: 24px;">
      <nz-card nzTitle="Отладка верстки модального окна (Layout Debugger) 🎨">
        <p>Нажмите кнопку ниже, чтобы открыть тестовое окно 1200x880 через NzModalService.</p>

        <button nz-button nzType="primary" nzSize="large" (click)="openDebugModal()">
          ОТКРЫТЬ МОДАЛ (NZ-ZORRO)
        </button>

        <div style="margin-top: 20px;">
          <ul>
            <li><span style="color:red">RED</span> - Header</li>
            <li><span style="color:green">GREEN</span> - Body (Preview + Settings)</li>
            <li><span style="color:blue">BLUE</span> - Statistic / SEO</li>
            <li><span style="color:#b5b500">YELLOW</span> - Footer</li>
          </ul>
        </div>
      </nz-card>
    </div>
  `,
})
export class TestLayoutDebugComponent {
  private modal = inject(NzModalService);

  openDebugModal() {
    this.modal.create({
      nzTitle: 'Сохранить для Web (Layout Debug)',
      nzContent: DebugModalComponent,
      nzWidth: 1200,
      nzFooter: null,
      nzDraggable: true,
      nzBodyStyle: { padding: '0px' },
    });
  }
}
