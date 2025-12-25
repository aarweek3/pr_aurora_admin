// src/app/pages/ui-demo/button-ui/button-ui.component.ts
import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ThemeService } from '../../../../core/services/theme/theme.service';
import { ButtonDirective } from '../../../../shared/components/ui/button/button.directive';
import { IconComponent } from '../../../../shared/components/ui/icon/icon.component';

@Component({
  selector: 'app-button-ui',
  standalone: true,
  imports: [CommonModule, ButtonDirective, IconComponent],
  template: \
    <div class=\"ui-demo\">
      <div class=\"ui-demo__header\">
        <h1>Button Components Demo</h1>
        <p class=\"text-secondary\">Демонстрация всех типов кнопок</p>
      </div>

      @if (message()) {
        <div class=\"message-display\">
          {{ message() }}
        </div>
      }
    </div>
  \,
  styles: [\
    .ui-demo {
      padding: 32px;
      max-width: 1200px;
      margin: 0 auto;
    }
    .message-display {
      position: fixed;
      bottom: 24px;
      right: 24px;
      padding: 16px 24px;
      background: #1890ff;
      color: white;
      border-radius: 4px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
  \],
})
export class ButtonUiComponent {
  private themeService = inject(ThemeService);
  message = signal<string>('');
  isLoading = signal<boolean>(false);

  showMessage(msg: string): void {
    this.message.set(msg);
    setTimeout(() => this.message.set(''), 3000);
  }

  simulateLoading(): void {
    this.isLoading.set(true);
    setTimeout(() => {
      this.isLoading.set(false);
      this.showMessage('Loading completed!');
    }, 2000);
  }

  async copyCode(code: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(code);
      this.showMessage('Code copied to clipboard! ✅');
    } catch (err) {
      this.showMessage('Failed to copy code ❌');
    }
  }

  toggleHelp = signal(false);
  showCodePrimary = signal(false);
  showCodeDefault = signal(false);
  showCodeDashed = signal(false);
  showCodeText = signal(false);
  showCodeLink = signal(false);
  showCodeDanger = signal(false);
  showCodeSmall = signal(false);
  showCodeMedium = signal(false);
  showCodeLarge = signal(false);
  showCodeLoading = signal(false);
  showCodeDisabled = signal(false);
  showCodeBlock = signal(false);
  showCodeIconTextPrimary = signal(false);
  showCodeIconTextDefault = signal(false);
  showCodeIconTextDanger = signal(false);
  showCodeIconOnlyPrimary = signal(false);
  showCodeIconOnlySmall = signal(false);
  showCodeIconOnlyLarge = signal(false);
  showCodeIconOnlyDanger = signal(false);
  showButtonTypesCode = signal(false);

  toggleCodePrimary(): void { this.showCodePrimary.update(v => !v); }
  toggleCodeDefault(): void { this.showCodeDefault.update(v => !v); }
  toggleCodeDashed(): void { this.showCodeDashed.update(v => !v); }
  toggleCodeText(): void { this.showCodeText.update(v => !v); }
  toggleCodeLink(): void { this.showCodeLink.update(v => !v); }
  toggleCodeDanger(): void { this.showCodeDanger.update(v => !v); }
  toggleCodeSmall(): void { this.showCodeSmall.update(v => !v); }
  toggleCodeMedium(): void { this.showCodeMedium.update(v => !v); }
  toggleCodeLarge(): void { this.showCodeLarge.update(v => !v); }
  toggleCodeLoading(): void { this.showCodeLoading.update(v => !v); }
  toggleCodeDisabled(): void { this.showCodeDisabled.update(v => !v); }
  toggleCodeBlock(): void { this.showCodeBlock.update(v => !v); }
  toggleCodeIconTextPrimary(): void { this.showCodeIconTextPrimary.update(v => !v); }
  toggleCodeIconTextDefault(): void { this.showCodeIconTextDefault.update(v => !v); }
  toggleCodeIconTextDanger(): void { this.showCodeIconTextDanger.update(v => !v); }
  toggleCodeIconOnlyPrimary(): void { this.showCodeIconOnlyPrimary.update(v => !v); }
  toggleCodeIconOnlySmall(): void { this.showCodeIconOnlySmall.update(v => !v); }
  toggleCodeIconOnlyLarge(): void { this.showCodeIconOnlyLarge.update(v => !v); }
  toggleCodeIconOnlyDanger(): void { this.showCodeIconOnlyDanger.update(v => !v); }

  toggleCode(section: 'types' | 'sizes' | 'icons' | 'states'): void {
    if (section === 'types') this.showButtonTypesCode.update(v => !v);
  }

  readonly buttonPrimaryCode = \<button av-button avType=\"primary\" (clicked)=\"handleClick()\">Primary</button>\;
  readonly buttonDefaultCode = \<button av-button avType=\"default\" (clicked)=\"handleClick()\">Default</button>\;
  readonly buttonDashedCode = \<button av-button avType=\"dashed\" (clicked)=\"handleClick()\">Dashed</button>\;
  readonly buttonTextCode = \<button av-button avType=\"text\" (clicked)=\"handleClick()\">Text</button>\;
  readonly buttonLinkCode = \<button av-button avType=\"link\" (clicked)=\"handleClick()\">Link</button>\;
  readonly buttonDangerCode = \<button av-button avType=\"danger\" (clicked)=\"handleClick()\">Danger</button>\;
  readonly buttonSmallCode = \<button av-button avType=\"primary\" avSize=\"small\">Small</button>\;
  readonly buttonMediumCode = \<button av-button avType=\"primary\" avSize=\"default\">Default</button>\;
  readonly buttonLargeCode = \<button av-button avType=\"primary\" avSize=\"large\">Large</button>\;
  readonly buttonLoadingCode = \<button av-button avType=\"primary\" [avLoading]=\"isLoading()\">Click to Load</button>\;
  readonly buttonDisabledCode = \<button av-button avType=\"default\" disabled>Disabled</button>\;
  readonly buttonBlockCode = \<button av-button avType=\"primary\" [avBlock]=\"true\">Block Button</button>\;
  readonly buttonIconTextPrimaryCode = \<button av-button avType=\"primary\"><app-icon type=\"download\" [size]=\"16\"></app-icon><span style=\"margin-left: 8px;\">Download</span></button>\;
  readonly buttonIconTextDefaultCode = \<button av-button avType=\"default\"><app-icon type=\"upload\" [size]=\"16\"></app-icon><span style=\"margin-left: 8px;\">Upload</span></button>\;
  readonly buttonIconTextDangerCode = \<button av-button avType=\"danger\"><app-icon type=\"delete\" [size]=\"16\"></app-icon><span style=\"margin-left: 8px;\">Delete</span></button>\;
  readonly buttonIconOnlyPrimaryCode = \<button av-button avType=\"primary\" class=\"av-btn--icon-only\"><app-icon type=\"search\" [size]=\"16\"></app-icon></button>\;
  readonly buttonIconOnlySmallCode = \<button av-button avType=\"primary\" avSize=\"small\" class=\"av-btn--icon-only\"><app-icon type=\"plus\" [size]=\"14\"></app-icon></button>\;
  readonly buttonIconOnlyLargeCode = \<button av-button avType=\"primary\" avSize=\"large\" class=\"av-btn--icon-only\"><app-icon type=\"settings\" [size]=\"20\"></app-icon></button>\;
  readonly buttonIconOnlyDangerCode = \<button av-button avType=\"danger\" class=\"av-btn--icon-only\"><app-icon type=\"close\" [size]=\"16\"></app-icon></button>\;
  readonly buttonTypesCode = \<button av-button avType=\"primary\">Primary</button>\n<button av-button avType=\"default\">Default</button>\;
}
