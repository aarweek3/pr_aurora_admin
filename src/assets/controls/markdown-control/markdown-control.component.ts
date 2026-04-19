import {
  AfterViewInit,
  Component,
  ElementRef,
  forwardRef,
  Input,
  OnDestroy,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import EasyMDE from 'easymde';

@Component({
  selector: 'av-markdown-control',
  standalone: true,
  template: `
    <div class="av-markdown-wrapper">
      @if (label) {
        <label class="av-markdown-label">{{ label }}</label>
      }
      <textarea #editorArea></textarea>
    </div>
  `,
  styles: [
    `
      .av-markdown-wrapper {
        display: flex;
        flex-direction: column;
        gap: 8px;
        width: 100%;
      }
      .av-markdown-label {
        font-weight: 600;
        font-size: 14px;
        color: #333;
      }
      /* Базовая подстройка под стандартный вид */
      .editor-toolbar {
        border-color: #ddd;
        border-radius: 4px 4px 0 0;
      }
      .CodeMirror {
        border-color: #ddd;
        border-radius: 0 0 4px 4px;
        min-height: var(--editor-height, 300px);
      }
    `,
  ],
  encapsulation: ViewEncapsulation.None,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MarkdownControlComponent),
      multi: true,
    },
  ],
})
export class MarkdownControlComponent
  implements AfterViewInit, OnDestroy, ControlValueAccessor
{
  @ViewChild('editorArea', { static: false }) editorArea!: ElementRef;

  @Input() label?: string;
  @Input() height: string = '300px';
  @Input() placeholder: string = 'Введите текст в формате Markdown...';

  private easyMDE: EasyMDE | null = null;
  private value: string = '';
  private isDisabled: boolean = false;

  // ControlValueAccessor callbacks
  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  ngAfterViewInit() {
    this.initEditor();
  }

  ngOnDestroy() {
    if (this.easyMDE) {
      this.easyMDE.toTextArea();
      this.easyMDE = null;
    }
  }

  // ControlValueAccessor methods
  writeValue(value: string): void {
    this.value = value || '';
    if (this.easyMDE) {
      if (this.easyMDE.value() !== this.value) {
        this.easyMDE.value(this.value);
      }
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
    if (this.easyMDE) {
      // EasyMDE doesn't have a direct toggle for readonly easily available in simple init
      // but we can try to toggle the codemirror option
      const cm = (this.easyMDE as any).codemirror;
      if (cm) cm.setOption('readOnly', isDisabled);
    }
  }

  private initEditor() {
    if (!this.editorArea || !this.editorArea.nativeElement) return;

    this.easyMDE = new EasyMDE({
      element: this.editorArea.nativeElement,
      initialValue: this.value,
      placeholder: this.placeholder,
      spellChecker: false,
      autosave: {
        enabled: false,
        uniqueId: 'mde-doc-editor',
      },
      status: ['lines', 'words', 'cursor'],
      minHeight: this.height,
      renderingConfig: {
        singleLineBreaks: false,
        codeSyntaxHighlighting: true,
      },
    });

    this.easyMDE.codemirror.on('change', () => {
      const content = this.easyMDE?.value() || '';
      this.value = content;
      this.onChange(content);
    });

    this.easyMDE.codemirror.on('blur', () => {
      this.onTouched();
    });

    // Применяем высоту
    const cmElement = this.editorArea.nativeElement.nextSibling as HTMLElement;
    if (cmElement && cmElement.classList.contains('CodeMirror')) {
       cmElement.style.height = this.height;
    }
  }
}
