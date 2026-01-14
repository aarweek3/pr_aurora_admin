import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VSModalRef } from '@shared/components/ui/vs-modal-claude/models/vs-modal-ref.model';
import { VS_MODAL_DATA } from '@shared/components/ui/vs-modal-claude/models/vs-modal-data.token';

interface TestModalData {
  message: string;
  timestamp?: Date;
  editorMode?: boolean;
}

interface TestModalResult {
  action: 'save' | 'cancel';
  data?: any;
}

/**
 * Тестовый компонент контента для VS Modal Claude
 */
@Component({
  selector: 'app-test-modal-content',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './test-modal-content.component.html',
  styleUrls: ['./test-modal-content.component.scss'],
})
export class TestModalContentComponent {
  modalRef = inject<VSModalRef<TestModalData, TestModalResult>>(VSModalRef);
  data = inject<TestModalData>(VS_MODAL_DATA);

  // Тестовые данные для формы
  formData = {
    name: 'Test Image',
    width: 1920,
    height: 1080,
    format: 'PNG',
    quality: 90,
    description: 'This is a test modal window in VS Code style.',
  };

  /**
   * Сохранить и закрыть
   */
  save(): void {
    this.modalRef.close({
      action: 'save',
      data: this.formData,
    });
  }

  /**
   * Отменить и закрыть
   */
  cancel(): void {
    this.modalRef.close({
      action: 'cancel',
    });
  }
}
