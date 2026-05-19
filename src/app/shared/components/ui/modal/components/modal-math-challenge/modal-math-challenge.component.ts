import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IconComponent } from '../../../icon/icon.component';
import { ModalRef } from '../../models/modal-ref.model';
import { MODAL_DATA } from '../../tokens/modal-tokens';
import { ModalComponent } from '../modal/modal.component';

export interface MathChallengeConfig {
  title?: string;
  message?: string;
  question: string;
  expectedAnswer: string;
  confirmText?: string;
  cancelText?: string;
  panelClass?: string | string[];
  type?: 'danger' | 'warning';
}

@Component({
  selector: 'av-modal-math-challenge',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent, ModalComponent],
  templateUrl: './modal-math-challenge.component.html',
  styleUrls: ['./modal-math-challenge.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModalMathChallengeComponent {
  userAnswer = signal('');
  public config = inject<MathChallengeConfig>(MODAL_DATA);
  private modalRef = inject<ModalRef<boolean>>(ModalRef);

  get isAnswerCorrect(): boolean {
    return this.userAnswer().trim() === this.config.expectedAnswer;
  }

  onConfirm(): void {
    if (this.isAnswerCorrect) {
      this.modalRef.close(true);
    }
  }

  onCancel(): void {
    this.modalRef.close(false);
  }
}
