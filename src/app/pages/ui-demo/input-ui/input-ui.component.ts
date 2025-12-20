import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonDirective } from '../../../shared/components/ui/button/button.directive';
import { HelpCopyContainerComponent } from '../../../shared/components/ui/container-help-copy-ui';
import { InputComponent } from '../../../shared/components/ui/input/input.component';
import { InputDirective } from '../../../shared/components/ui/input/input.directive';
import { ModalComponent } from '../../../shared/components/ui/modal';

@Component({
  selector: 'app-input-ui',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ButtonDirective,
    InputDirective,
    InputComponent,
    HelpCopyContainerComponent,
    ModalComponent,
  ],
  templateUrl: './input-ui.component.html',
  styleUrls: ['./input-ui.component.scss'],
})
export class InputUiComponent {
  // Playground state
  playgroundValue = signal('');
  playgroundLabel = signal('Username');
  playgroundPlaceholder = signal('Enter your username...');
  playgroundHint = signal('Use 3-20 characters');
  playgroundStatus = signal<'default' | 'error' | 'warning' | 'success'>('default');
  playgroundVariant = signal<'outlined' | 'filled' | 'borderless'>('outlined');
  playgroundSize = signal<'small' | 'default' | 'large' | 'x-large'>('default');
  playgroundType = signal<
    'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search' | 'date' | 'time'
  >('text');
  playgroundDisabled = signal(false);
  playgroundShowPasswordToggle = signal(true);
  playgroundErrorMessage = signal('This field is required');

  // Modal state
  showGeneratedCodeModal = false;
  generatedCode = signal('');

  // Help section
  showHelp = signal(false);

  // Code examples for help section
  directiveExample = `import { InputDirective } from '@shared/components/ui/input';

<input avInput type="text" placeholder="Basic input" />
<input avInput avSize="large" avStatus="error" type="email" />`;

  componentExample = `import { InputComponent } from '@shared/components/ui/input';

<av-input
  label="Email"
  type="email"
  placeholder="your@email.com"
  hint="Используется для входа"
  [status]="emailValid ? 'success' : 'error'"
  [errorMessage]="emailError"
/>`;

  formControlExample = `import { FormControl, Validators } from '@angular/forms';

emailControl = new FormControl('', [
  Validators.required,
  Validators.email
]);

<input
  avInput
  type="email"
  [formControl]="emailControl"
  [avStatus]="emailControl.invalid ? 'error' : 'success'"
/>`;

  // Basic examples values
  basicValue = '';
  emailValue = '';
  passwordValue = '';

  // Size examples
  smallInput = '';
  defaultInput = '';
  largeInput = '';
  xLargeInput = '';

  // Status examples
  defaultStatus = '';
  errorStatus = '';
  warningStatus = '';
  successStatus = '';

  // Variant examples
  outlinedVariant = '';
  filledVariant = '';
  borderlessVariant = '';

  // Type examples
  textInput = '';
  emailInput = '';
  passwordInput = '';
  passwordWithToggle = '';
  passwordWithoutToggle = '';
  numberInput = 0;
  telInput = '';
  urlInput = '';
  searchInput = '';

  // Textarea
  textareaValue = '';
  textareaLarge = '';

  // FormControl examples
  usernameControl = new FormControl('', [Validators.required, Validators.minLength(3)]);
  emailControl = new FormControl('', [Validators.required, Validators.email]);
  phoneControl = new FormControl('', [Validators.pattern(/^\+?[0-9]{10,}$/)]);

  toggleHelp() {
    this.showHelp.update((v) => !v);
  }

  generatePlaygroundCode(): void {
    const attributes: string[] = [];

    attributes.push(`[(ngModel)]="myValue"`);
    if (this.playgroundLabel()) attributes.push(`label="${this.playgroundLabel()}"`);
    if (this.playgroundPlaceholder())
      attributes.push(`placeholder="${this.playgroundPlaceholder()}"`);
    if (this.playgroundType() !== 'text') attributes.push(`type="${this.playgroundType()}"`);
    if (this.playgroundSize() !== 'default') attributes.push(`size="${this.playgroundSize()}"`);
    if (this.playgroundStatus() !== 'default')
      attributes.push(`status="${this.playgroundStatus()}"`);
    if (this.playgroundVariant() !== 'outlined')
      attributes.push(`variant="${this.playgroundVariant()}"`);
    if (this.playgroundHint()) attributes.push(`hint="${this.playgroundHint()}"`);
    if (this.playgroundStatus() === 'error' && this.playgroundErrorMessage()) {
      attributes.push(`errorMessage="${this.playgroundErrorMessage()}"`);
    }
    if (this.playgroundDisabled()) attributes.push(`[disabled]="true"`);
    if (this.playgroundType() === 'password' && !this.playgroundShowPasswordToggle()) {
      attributes.push(`[showPasswordToggle]="false"`);
    }

    const htmlCode = `<av-input\n  ${attributes.join('\n  ')}\n></av-input>`;
    const tsCode = `// В компоненте\nmyValue = signal('');`;

    this.generatedCode.set(`${htmlCode}\n\n${tsCode}`);
    this.showGeneratedCodeModal = true;
  }

  getErrorMessage(control: FormControl): string {
    if (control.hasError('required')) return 'Это поле обязательно';
    if (control.hasError('email')) return 'Неверный формат email';
    if (control.hasError('minlength')) {
      const minLength = control.getError('minlength').requiredLength;
      return `Минимум ${minLength} символов`;
    }
    if (control.hasError('pattern')) return 'Неверный формат телефона';
    return '';
  }

  getStatus(control: FormControl): 'default' | 'error' | 'warning' | 'success' {
    if (control.invalid && control.touched) return 'error';
    if (control.valid && control.touched && control.value) return 'success';
    return 'default';
  }
}
