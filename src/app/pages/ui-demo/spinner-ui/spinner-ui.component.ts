import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonDirective } from '../../../shared/components/ui/button/button.directive';
import { HelpCopyContainerComponent } from '../../../shared/components/ui/container-help-copy-ui';
import { ModalComponent } from '../../../shared/components/ui/modal';
import { AvSpinnerComponent } from '../../../shared/components/ui/spinner';

@Component({
  selector: 'app-spinner-ui',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AvSpinnerComponent,
    ButtonDirective,
    ModalComponent,
    HelpCopyContainerComponent,
  ],
  templateUrl: './spinner-ui.component.html',
  styleUrls: ['./spinner-ui.component.scss'],
})
export class SpinnerUiComponent {
  // Playground state
  playgroundSize = signal<any>('default');
  playgroundColor = signal<string>('primary');
  playgroundAnimation = signal<any>('spin');
  playgroundLabel = signal('Loading data...');
  playgroundTip = signal('Please wait a moment');
  playgroundLabelPos = signal<any>('bottom');
  playgroundDelay = signal(0);
  playgroundOverlay = signal(false);
  playgroundBlur = signal(2);
  playgroundOpacity = signal(0.6);
  playgroundVisible = signal(true);

  // Modal state
  showHelpModal = false;
  showCodeModal = false;
  generatedCode = signal('');

  // Examples
  showFullScreen = false;

  toggleFullScreen() {
    this.showFullScreen = true;
    setTimeout(() => (this.showFullScreen = false), 3000);
  }

  generateCode() {
    const props = [
      `size="${this.playgroundSize()}"`,
      `color="${this.playgroundColor()}"`,
      `animation="${this.playgroundAnimation()}"`,
    ];

    if (this.playgroundLabel()) props.push(`label="${this.playgroundLabel()}"`);
    if (this.playgroundTip()) props.push(`tip="${this.playgroundTip()}"`);
    props.push(`[visible]="${this.playgroundVisible()}"`);
    if (this.playgroundLabelPos() !== 'bottom')
      props.push(`labelPosition="${this.playgroundLabelPos()}"`);
    if (this.playgroundDelay() > 0) props.push(`[delay]="${this.playgroundDelay()}"`);
    if (this.playgroundOverlay()) {
      props.push(`[overlay]="true"`);
      props.push(`[backdropBlur]="${this.playgroundBlur()}"`);
      props.push(`[backdropOpacity]="${this.playgroundOpacity()}"`);
    }

    const code = `<av-spinner\n  ${props.join('\n  ')}\n></av-spinner>`;
    this.generatedCode.set(code);
    this.showCodeModal = true;
  }
}
