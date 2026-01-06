import {
  Component,
  ElementRef,
  forwardRef,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

declare let tinymce: any;

@Component({
  selector: 'av-tinymce-control',
  standalone: true,
  imports: [],
  template: `
    <div class="av-tinymce-wrapper">
      @if (label) {
      <label class="av-tinymce-label">{{ label }}</label>
      }
      <textarea #editorArea></textarea>
    </div>
  `,
  styles: [
    `
      .av-tinymce-wrapper {
        display: flex;
        flex-direction: column;
        gap: 8px;
        width: 100%;
      }
      .av-tinymce-label {
        font-weight: 600;
        font-size: 14px;
        color: #333;
      }
    `,
  ],
  encapsulation: ViewEncapsulation.None,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AvTinymceControlComponent),
      multi: true,
    },
  ],
})
export class AvTinymceControlComponent implements OnInit, OnDestroy, ControlValueAccessor {
  @ViewChild('editorArea', { static: true }) editorArea!: ElementRef;

  @Input() label?: string;
  @Input() height: number = 400;
  @Input() placeholder: string = '';
  @Input() plugins: string =
    'accordion advlist anchor autolink autoresize autosave charmap code codesample directionality emoticons fullscreen help image importcss insertdatetime letterspacing link lists media nonbreaking pagebreak preview quickbars save searchreplace table visualblocks visualchars wordcount';
  @Input() toolbar: string | string[] = [
    'letterspacing | undo redo code | accordion blocks fontfamily fontsize lineheight | bold italic underline strikethrough | forecolor backcolor',
    'alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image media table | charmap emoticons codesample | hr blockquote subscript superscript | removeformat',
    'searchreplace fullscreen preview | save restoredraft pagebreak anchor insertdatetime | visualblocks visualchars wordcount | ltr rtl | help',
  ];

  private editor: any;
  private value: string = '';
  private isDisabled: boolean = false;

  // ControlValueAccessor callbacks
  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  ngOnInit() {
    this.loadTinyMCE();
  }

  ngOnDestroy() {
    if (this.editor) {
      tinymce.remove(this.editor);
    }
  }

  // ControlValueAccessor methods
  writeValue(value: string): void {
    this.value = value || '';
    if (this.editor && this.editor.initialized) {
      this.editor.setContent(this.value);
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
    if (this.editor) {
      this.editor.mode.set(isDisabled ? 'readonly' : 'design');
    }
  }

  private loadTinyMCE() {
    if (typeof tinymce !== 'undefined') {
      this.initEditor();
      return;
    }

    const scriptId = 'tinymce-core-script';
    if (document.getElementById(scriptId)) {
      // Script is already loading, wait and retry or handle via observer (simple retry for demo)
      setTimeout(() => this.loadTinyMCE(), 100);
      return;
    }

    const script = document.createElement('script');
    script.id = scriptId;
    script.src = '/assets/tinymce/tinymce.min.js';
    script.onload = () => {
      this.initEditor();
    };
    script.onerror = () => {
      console.error('TinyMCE script failed to load');
    };
    document.head.appendChild(script);
  }

  private initEditor() {
    tinymce.init({
      target: this.editorArea.nativeElement,
      menubar: true,
      height: this.height,
      base_url: '/assets/tinymce',
      suffix: '.min',
      promotion: false,
      license_key: 'gpl',
      language: 'ru',
      language_url: '/assets/tinymce/langs/ru.js',
      placeholder: this.placeholder,
      plugins: this.plugins,
      external_plugins: {
        letterspacing: '/assets/tinymce/plugins/letterspacing/plugin.js',
      },
      toolbar: this.toolbar,
      content_style: 'body { font-family: Arial, sans-serif; font-size: 14px; }',
      setup: (editor: any) => {
        this.editor = editor;
        editor.on('Change KeyUp', () => {
          const content = editor.getContent();
          this.value = content;
          this.onChange(content);
        });
        editor.on('blur', () => {
          this.onTouched();
        });
        editor.on('init', () => {
          if (this.value) {
            editor.setContent(this.value);
          }
          if (this.isDisabled) {
            editor.mode.set('readonly');
          }
        });
      },
    });
  }
}
