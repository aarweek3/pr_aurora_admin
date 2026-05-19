import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, Inject } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { IconComponent } from '../../../icon/icon.component';
import { AlertConfig } from '../../models/modal-config.model';
import { ModalRef } from '../../models/modal-ref.model';
import { MODAL_DATA } from '../../tokens/modal-tokens';
import { ModalComponent } from '../modal/modal.component';

@Component({
  selector: 'av-modal-alert',
  standalone: true,
  imports: [CommonModule, IconComponent, ModalComponent],
  templateUrl: './modal-alert.component.html',
  styleUrls: ['./modal-alert.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModalAlertComponent {
  private sanitizer = inject(DomSanitizer);
  public config = inject<AlertConfig>(MODAL_DATA);
  private modalRef = inject<ModalRef<void>>(ModalRef);
  public safeMessage: SafeHtml;

  constructor() {
    this.safeMessage = this.sanitizer.bypassSecurityTrustHtml(this.config.message);
  }

  onOk(): void {
    this.modalRef.close();
  }

  getDefaultIcon(): string {
    switch (this.config.alertType) {
      case 'success':
        return 'actions/av_check_mark';
      case 'error':
        return 'actions/av_close';
      case 'warning':
        return 'system/av_warning';
      default:
        return 'system/av_info';
    }
  }
}
