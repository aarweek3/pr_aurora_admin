import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, Inject } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ButtonDirective } from '../../../button/button.directive';
import { IconComponent } from '../../../icon/icon.component';
import { ConfirmConfig } from '../../models/modal-config.model';
import { ModalRef } from '../../models/modal-ref.model';
import { MODAL_DATA } from '../../tokens/modal-tokens';
import { ModalComponent } from '../modal/modal.component';

@Component({
  selector: 'av-modal-confirm',
  standalone: true,
  imports: [CommonModule, ButtonDirective, IconComponent, ModalComponent],
  templateUrl: './modal-confirm.component.html',
  styleUrls: ['./modal-confirm.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModalConfirmComponent {
  private sanitizer = inject(DomSanitizer);
  public safeMessage: SafeHtml;

  constructor(
    @Inject(MODAL_DATA) public config: ConfirmConfig,
    private modalRef: ModalRef<boolean>,
  ) {
    this.safeMessage = this.sanitizer.bypassSecurityTrustHtml(this.config.message || 'Вы уверены, что хотите продолжить?');
  }

  onConfirm(): void {
    this.modalRef.close(true);
  }

  onCancel(): void {
    this.modalRef.close(false);
  }

  getDefaultIcon(): string {
    switch (this.config.confirmType) {
      case 'danger':
        return 'actions/av_trash';
      case 'warning':
        return 'system/av_warning';
      case 'success':
        return 'actions/av_check_mark';
      case 'info':
        return 'system/av_info';
      default:
        return 'system/av_info';
    }
  }
}
