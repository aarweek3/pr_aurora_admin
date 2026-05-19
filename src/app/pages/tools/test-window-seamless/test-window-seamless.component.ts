import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { WindowSeamlessExampleComponent } from '../../debug-tools/examples/window-seamless-example/window-seamless-example.component';
import { AvImagePickerComponent } from '@shared/components/av-image-uploader/av-image-picker.component';
import { ModalComponent } from '@shared/components/ui/modal';
import { VSModalService } from '@shared/components/ui/vs-modal';
import { VsModalAngularComponent } from '@shared/components/ui/vs-modal-angular/vs-modal-angular.component';
import { VSModalService as VSModalClaudeService } from '@shared/components/ui/vs-modal-claude/services/vs-modal.service';
import { VSModalService as VSModalCompromiseService } from '@shared/components/ui/vs-modal-compromise';
import { CompromiseTestContentComponent } from '@shared/components/ui/vs-modal-compromise/components/compromise-test-content.component';
import { VsModalPureContentComponent } from '@shared/components/ui/vs-modal/components/vs-modal-pure-content.component';
import { NzModalService } from 'ng-zorro-antd/modal';
import { TestModalContentComponent } from './components/test-modal-content/test-modal-content.component';

@Component({
  selector: 'app-test-window-seamless',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    WindowSeamlessExampleComponent,
    ModalComponent,
    AvImagePickerComponent,
  ],
  templateUrl: './test-window-seamless.component.html',
  styleUrl: './test-window-seamless.component.scss',
})
export class TestWindowSeamlessComponent {
  private readonly vsModal = inject(VSModalService);
  private readonly vsCompromise = inject(VSModalCompromiseService);
  private readonly vsModalClaude = inject(VSModalClaudeService);
  private readonly nzModal = inject(NzModalService);

  /** Управление видимостью старого модала */
  isWindowVisible = signal(false);

  /** Тестовое значение для image picker */
  testImageUrl = signal<string>('');

  /** Параметры размеров для нового окна */
  testWidth = signal<number>(850);
  testHeight = signal<number>(600);

  /**
   * ТЕСТ НОВОГО COMPROMISE ENGINE 💎
   */
  openCompromiseModal(): void {
    const ref = this.vsCompromise.open(CompromiseTestContentComponent, {
      title: 'VS Modal Compromise v2.0',
      width: this.testWidth(),
      height: this.testHeight(),
      data: {
        id: 'aurora-123',
        environment: 'Production-Ready',
        version: 2.0,
      },
      resizable: true,
      draggable: true,
    });

    ref.afterClosed().subscribe((result: any) => {
      if (result) {
        console.log('💎 Compromise Result:', result);
      }
    });
  }

  /**
   * Открыть окно (старый метод)
   */
  openWindow(): void {
    this.isWindowVisible.set(true);
  }

  /**
   * Закрыть окно
   */
  closeWindow(): void {
    this.isWindowVisible.set(false);
  }

  // ========================================================================
  // VS MODAL (СТАРАЯ ВЕРСИЯ)
  // ========================================================================

  /**
   * Открыть VS Modal (старая версия с Portal)
   */
  openVSModal(): void {
    const ref = this.vsModal.open(VsModalPureContentComponent, {
      title: 'VS Modal (Original)',
      width: 800,
      height: 550,
      draggable: true,
      resizable: true,
      statusText: 'Original Engine',
    });

    ref.afterClosed().subscribe((result) => {
      console.log('🟦 VS Modal (Original) Result:', result);
    });
  }

  // ========================================================================
  // VS MODAL CLAUDE (АЛЬТЕРНАТИВНАЯ ВЕРСИЯ)
  // ========================================================================

  /**
   * Открыть VS Modal Claude (альтернативная версия)
   */
  openVSModalClaude(): void {
    const ref = this.vsModalClaude.open(TestModalContentComponent, {
      title: 'VS Modal Claude (Alternative)',
      width: 800,
      height: 600,
      data: {
        message: 'Alternative implementation with ViewContainerRef',
        timestamp: new Date(),
      },
      statusText: 'Claude Engine',
      draggable: true,
      resizable: true,
    });

    ref.afterClosed().subscribe((result) => {
      console.log('🟪 VS Modal Claude Result:', result);
    });
  }

  /**
   * Открыть большое окно Claude
   */
  openLargeVSModalClaude(): void {
    const ref = this.vsModalClaude.open(TestModalContentComponent, {
      title: 'Large Claude Window',
      width: 1200,
      height: 800,
      data: {
        message: 'Large window test',
        editorMode: true,
      },
      statusText: 'Large Mode',
      draggable: true,
      resizable: true,
    });

    ref.afterClosed().subscribe((result) => {
      console.log('🟪 Large Claude Result:', result);
    });
  }

  /**
   * Открыть Claude без backdrop
   */
  openNoBackdropClaude(): void {
    this.vsModalClaude.open(TestModalContentComponent, {
      title: 'No Backdrop (Claude)',
      width: 600,
      height: 400,
      hasBackdrop: false,
      data: {
        message: 'No backdrop - can interact with background',
      },
      statusText: 'Non-modal',
    });
  }

  // ========================================================================
  // NG-ZORRO MODAL (STANDARD)
  // ========================================================================

  /**
   * Открыть стандартное модальное окно Ng-Zorro
   */
  openVsModalAngular(): void {
    this.nzModal.create({
      nzTitle: 'Standard Ng-Zorro Modal',
      nzContent: VsModalAngularComponent,
      nzWidth: 500,
      nzFooter: null,
      nzCentered: false, // Отключаем, чтобы не мешал ресайзу
      nzDraggable: true,
      nzBodyStyle: { padding: '0' },
      nzStyle: { top: '100px' }, // Задаем начальную позицию сверху
    });
  }

  // ========================================================================
  // AV IMAGE STUDIO (AURORA IMAGE PICKER)
  // ========================================================================

  /**
   * Обработка изменения изображения
   */
  onImageChange(newUrl: string | null): void {
    this.testImageUrl.set(newUrl || '');
    console.log('🖼️ Image changed:', newUrl);
  }
}
