import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonDirective } from '../../../button/button.directive';
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
}

@Component({
  selector: 'av-modal-math-challenge',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonDirective, IconComponent, ModalComponent],
  templateUrl: './modal-math-challenge.component.html',
  styleUrls: ['./modal-math-challenge.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModalMathChallengeComponent {
  userAnswer = signal('');
  
  constructor(
    @Inject(MODAL_DATA) public config: MathChallengeConfig,
    private modalRef: ModalRef<boolean>,
  ) {}

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
