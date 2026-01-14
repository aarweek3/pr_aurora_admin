import {
  AfterViewInit,
  Component,
  ElementRef,
  forwardRef,
  inject,
  Input,
  NgZone,
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
export class AvTinymceControlComponent
  implements OnInit, AfterViewInit, OnDestroy, ControlValueAccessor
{
  @ViewChild('editorArea', { static: false }) editorArea!: ElementRef;

  @Input() label?: string;
  @Input() height: number = 400;
  @Input() placeholder: string = '';
  @Input() plugins: string =
    'accordion advlist anchor autolink autoresize autosave charmap code codesample directionality emoticons fullscreen image importcss insertdatetime letterspacing footnotes av-youtube av-image av-align-image av-image-wrapping av-image-toolbar av-image-seo av-image-link av-image-shadow link lists media nonbreaking pagebreak preview quickbars save searchreplace table visualblocks visualchars wordcount';
  @Input() toolbar: string | string[] = [
    'letterspacing | undo redo code | accordion blocks fontfamily fontsize lineheight | bold italic underline strikethrough | forecolor backcolor',
    'alignleft aligncenter alignright alignjustify | image-align-left image-align-center image-align-right | bullist numlist outdent indent | link av-image-text av-image av-image-wrapping av-image-shadow image media table | av-youtube charmap emoticons codesample nonbreaking footnotes | hr blockquote subscript superscript | removeformat',
    'searchreplace fullscreen preview | save restoredraft pagebreak anchor insertdatetime | visualblocks visualchars wordcount | ltr rtl',
  ];

  private editor: any;
  private value: string = '';
  private isDisabled: boolean = false;
  private ngZone = inject(NgZone);

  // ControlValueAccessor callbacks
  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  ngOnInit() {
    // Предзагрузка скрипта, если еще нет
    this.ensureScriptLoaded();
  }

  ngAfterViewInit() {
    // Инициализация редактора только после готовности View
    setTimeout(() => {
      this.initEditor();
    }, 200);
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

  private ensureScriptLoaded() {
    if (typeof tinymce !== 'undefined') {
      return;
    }

    const scriptId = 'tinymce-core-script';
    if (document.getElementById(scriptId)) {
      return;
    }

    const script = document.createElement('script');
    script.id = scriptId;
    script.src = '/assets/tinymce/tinymce.min.js';
    script.onerror = () => {
      console.error('TinyMCE script failed to load');
    };
    document.head.appendChild(script);
  }

  private initEditor() {
    if (typeof tinymce === 'undefined') {
      // Скрипт еще не загрузился, подождем и попробуем снова
      setTimeout(() => this.initEditor(), 100);
      return;
    }

    if (!this.editorArea || !this.editorArea.nativeElement) {
      return;
    }

    this.ngZone.runOutsideAngular(() => {
      tinymce.init({
        target: this.editorArea.nativeElement,
        menubar: true,
        height: this.height,
        base_url: '/assets/tinymce',
        suffix: '.min',
        promotion: false,
        branding: false,
        help_tabs: [],
        help_accessibility: false,
        license_key: 'gpl',
        language: 'ru',
        language_url: '/assets/tinymce/langs/ru.js',
        placeholder: this.placeholder,
        plugins: this.plugins,
        external_plugins: {
          letterspacing: '/assets/tinymce/plugins/letterspacing/plugin.js',
          footnotes: '/assets/tinymce/plugins/footnotes/plugin.js',
          'av-youtube': '/assets/tinymce/plugins/av-youtube/plugin.js',
          'av-image': '/assets/tinymce/plugins/av-image/plugin.js',
          'av-align-image': '/assets/tinymce/plugins/av-align-image/plugin.js',
          'av-image-wrapping': '/assets/tinymce/plugins/av-image-wrapping/plugin.js',
          'av-image-toolbar': '/assets/tinymce/plugins/av-image-toolbar/plugin.js',
          'av-image-seo': '/assets/tinymce/plugins/av-image-seo/plugin.js',
          'av-image-link': '/assets/tinymce/plugins/av-image-link/plugin.js',
          'av-image-shadow': '/assets/tinymce/plugins/av-image-shadow/plugin.js',
        },
        toolbar: this.toolbar,
        image_context_toolbar: false,
        quickbars_image_toolbar: false,
        content_style: 'body { font-family: Arial, sans-serif; font-size: 14px; }',
        setup: (editor: any) => {
          this.editor = editor;
          editor.on('Change KeyUp Undo Redo', () => {
            const content = editor.getContent();
            this.ngZone.run(() => {
              this.value = content;
              this.onChange(content);
            });
          });
          editor.on('blur', () => {
            this.ngZone.run(() => {
              this.onTouched();
            });
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
    });
  }
}
