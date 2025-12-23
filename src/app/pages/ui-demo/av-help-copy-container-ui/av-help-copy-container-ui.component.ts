import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonDirective } from '../../../shared/components/ui/button/button.directive';
import { HelpCopyContainerComponent } from '../../../shared/components/ui/container-help-copy-ui';
import { ModalComponent } from '../../../shared/components/ui/modal';
import { ContainerUiHelpBaseComponent } from '../../../shared/containers/ui-help/container-ui-help-base/container-ui-help-base.component';

@Component({
  selector: 'app-help-copy-container-ui',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HelpCopyContainerComponent,
    ButtonDirective,
    ModalComponent,
    ContainerUiHelpBaseComponent,
  ],
  templateUrl: './av-help-copy-container-ui.component.html',
  styleUrl: './av-help-copy-container-ui.component.scss',
})
export class HelpCopyContainerUiComponent {
  // Playground state
  playgroundTitle = signal('Usage Example');
  playgroundContent = signal(`// Your code or instructions here
export class MyComponent {
  title = 'Hello World';
}`);
  playgroundWidth = signal('100%');
  playgroundHeight = signal('200px');
  playgroundBgColor = signal('#1e293b');
  playgroundShowCopy = signal(true);
  playgroundShowHelpButton = signal(false);
  playgroundHelpContent = signal<string>('Здесь может быть ваш текст справки');

  setPresetWidth(val: string): void {
    this.playgroundWidth.set(val);
  }

  setPresetHeight(val: string): void {
    this.playgroundHeight.set(val);
  }

  // Modal state
  showGeneratedCodeModal = false;
  generatedCode = signal('');

  // Static examples
  basicCode = `<av-help-copy-container
  title="Код использования"
  [content]="myCode"
  bgColor="#1e293b"
></av-help-copy-container>`;

  longContent = `Это пример длинного текста
для проверки прокрутки (scroll)
внутри белого окна.
Строка 1
Строка 2
Строка 3
Строка 4
Строка 5
Конец примера.`;

  apiInterfaceCode = `/**
 * @interface HelpCopyContainerProps
 * Техническая спецификация компонента Help Copy Container
 */
export interface HelpCopyContainerProps {
  /** Заголовок блока (header title) */
  title: string; // default: 'Код использования'

  /** Контент для отображения и копирования (строка с кодом или текстом) */
  content: string;

  /** Ширина контейнера (CSS значение: '100%', '300px', 'auto') */
  width: string; // default: '100%'

  /** Высота контейнера (CSS значение: 'auto', '200px', '100%') */
  height: string; // default: 'auto'

  /** Цвет фона внешней обертки (HEX, RGB, CSS name) */
  bgColor: string | null; // default: null (использует slate-800)

  /** Показывать ли кнопку "Копировать" */
  showCopy: boolean; // default: true

  /** Показывать ли кнопку "?" (справка) */
  showHelpButton: boolean; // default: false

  /** Контент для справки (ваша строка текста/справки) */
  helpContent: string | null; // default: null

  /** Отключить встроенную справку (для использования кнопки ? как внешнего триггера) */
  disableInternalHelp: boolean; // default: false

  /** Событие при нажатии на кнопку "?" (возвращает текущее состояние видимости справки) */
  helpToggled: EventEmitter<boolean>;
}`;

  generatePlaygroundCode(): void {
    const attributes: string[] = [];

    attributes.push(`title="${this.playgroundTitle()}"`);
    attributes.push(`[content]="myContent"`);

    if (this.playgroundWidth() !== '100%') {
      attributes.push(`width="${this.playgroundWidth()}"`);
    }
    if (this.playgroundHeight() !== 'auto') {
      attributes.push(`height="${this.playgroundHeight()}"`);
    }
    if (this.playgroundBgColor()) {
      attributes.push(`bgColor="${this.playgroundBgColor()}"`);
    }
    if (!this.playgroundShowCopy()) {
      attributes.push(`[showCopy]="false"`);
    }
    if (this.playgroundShowHelpButton()) {
      attributes.push(`[showHelpButton]="true"`);
      if (this.playgroundHelpContent()) {
        attributes.push(`helpContent="${this.playgroundHelpContent()}"`);
      }
    }

    const htmlCode = `<av-help-copy-container\n  ${attributes.join(
      '\n  ',
    )}\n>\n</av-help-copy-container>`;

    const tsCode = `// В компоненте\nmyContent = \`${this.playgroundContent()}\`;`;

    this.generatedCode.set(`${htmlCode}\n\n${tsCode}`);
    this.showGeneratedCodeModal = true;
  }
}
