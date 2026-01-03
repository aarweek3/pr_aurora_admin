import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

import { ButtonDirective } from '@shared/components/ui/button/button.directive';
import { NzInputModule } from 'ng-zorro-antd/input';

@Component({
  selector: 'app-svg-validator',
  imports: [CommonModule, FormsModule, NzInputModule, ButtonDirective],
  templateUrl: './svg-validator.component.html',
  styleUrl: './svg-validator.component.scss',
})
export class SvgValidatorComponent {
  svgCode = signal<string>('');
  displayedSvg = signal<SafeHtml | null>(null);
  showPreview = signal<boolean>(false);

  constructor(private sanitizer: DomSanitizer) {
    console.log('SvgValidatorComponent initialized');
  }

  displaySvg() {
    const code = this.svgCode();
    if (code.trim()) {
      // Используем bypassSecurityTrustHtml напрямую для отображения SVG
      // Внимание: используйте только с доверенным контентом!
      this.displayedSvg.set(this.sanitizer.bypassSecurityTrustHtml(code));
      this.showPreview.set(true);
    }
  }

  clearSvg() {
    this.svgCode.set('');
    this.displayedSvg.set(null);
    this.showPreview.set(false);
  }
}
