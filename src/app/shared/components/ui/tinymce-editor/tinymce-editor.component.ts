import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  forwardRef,
  inject,
  Input,
  NgZone,
  OnDestroy,
  Output,
  ViewChild,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

declare const tinymce: any;

@Component({
  selector: 'app-tinymce-editor',
  standalone: true,
  template: ` <textarea #editor></textarea> `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TinymceEditorComponent),
      multi: true,
    },
  ],
})
export class TinymceEditorComponent implements AfterViewInit, OnDestroy, ControlValueAccessor {
  @ViewChild('editor', { static: false })
  editorRef!: ElementRef<HTMLTextAreaElement>;

  @Input() value = '';
  @Input() height = 400;
  @Input() disabled = false;

  @Output() valueChange = new EventEmitter<string>();

  private editorInstance: any;
  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};
  private ngZone = inject(NgZone);

  ngAfterViewInit(): void {
    // Добавляем небольшую задержку для гарантии, что DOM готов
    setTimeout(() => {
      this.loadScript()
        .then(() => this.initEditor())
        .catch((error) => {
          console.error('TinyMCE: Failed to initialize', error);
        });
    }, 100);
  }

  ngOnDestroy(): void {
    if (this.editorInstance) {
      try {
        tinymce.remove(this.editorInstance);
      } catch (e) {
        console.warn('TinyMCE: Error removing editor instance', e);
      }
    }
  }

  // === ControlValueAccessor implementation ===
  writeValue(value: string): void {
    this.value = value || '';
    if (this.editorInstance) {
      this.editorInstance.setContent(this.value);
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    if (this.editorInstance) {
      if (this.editorInstance.mode) {
        this.editorInstance.mode.set(isDisabled ? 'readonly' : 'design');
      } else {
        this.editorInstance.setMode(isDisabled ? 'readonly' : 'design');
      }
    }
  }
  // ===========================================

  private initEditor(): void {
    if (!this.editorRef || !this.editorRef.nativeElement) {
      console.error('TinyMCE: Editor element not found');
      return;
    }

    this.ngZone.runOutsideAngular(() => {
      tinymce.init({
        target: this.editorRef.nativeElement,
        height: this.height,
        base_url: '/assets/tinymce',
        license_key: 'gpl',
        promotion: false,
        branding: false,
        menubar: true,
        language: 'ru',
        language_url: '/assets/tinymce/langs/ru.js',
        plugins: [
          'accordion',
          'advlist',
          'anchor',
          'autolink',
          'autoresize',
          'autosave',
          'charmap',
          'code',
          'codesample',
          'directionality',
          'emoticons',
          'fullscreen',
          'image',
          'importcss',
          'insertdatetime',
          'letterspacing',
          'link',
          'lists',
          'media',
          'nonbreaking',
          'pagebreak',
          'preview',
          'quickbars',
          'save',
          'searchreplace',
          'table',
          'visualblocks',
          'visualchars',
          'wordcount',
          'footnotes',
          'av-youtube',
          'av-align-image',
        ],
        external_plugins: {
          letterspacing: '/assets/tinymce/plugins/letterspacing/plugin.js',
          footnotes: '/assets/tinymce/plugins/footnotes/plugin.js',
          'av-youtube': '/assets/tinymce/plugins/av-youtube/plugin.js',
          'av-align-image': '/assets/tinymce/plugins/av-align-image/plugin.js',
        },
        toolbar: [
          'letterspacing | undo redo code | accordion blocks fontfamily fontsize lineheight | bold italic underline strikethrough | forecolor backcolor',
          'alignleft aligncenter alignright alignjustify | image-align-left image-align-center image-align-right | bullist numlist outdent indent | link image media table | av-youtube charmap emoticons codesample nonbreaking footnotes | hr blockquote subscript superscript | removeformat',
          'searchreplace fullscreen preview | save restoredraft pagebreak anchor insertdatetime | visualblocks visualchars wordcount | ltr rtl',
        ],
        help_tabs: [],
        help_accessibility: false,
        setup: (editor: any) => {
          this.editorInstance = editor;

          editor.on('init', () => {
            this.ngZone.run(() => {
              editor.setContent(this.value || '');
              if (editor.mode) {
                editor.mode.set(this.disabled ? 'readonly' : 'design');
              } else if (editor.setMode) {
                editor.setMode(this.disabled ? 'readonly' : 'design');
              }
            });
          });

          editor.on('Change KeyUp Undo Redo', () => {
            const content = editor.getContent();
            this.ngZone.run(() => {
              this.value = content;
              this.onChange(content);
              this.valueChange.emit(content);
            });
          });

          editor.on('Blur', () => {
            this.ngZone.run(() => {
              this.onTouched();
            });
          });
        },
      });
    });
  }

  private loadScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if ((window as any).tinymce) {
        resolve();
        return;
      }

      // Проверяем, не загружается ли уже скрипт
      const existingScript = document.querySelector('script[src="/assets/tinymce/tinymce.min.js"]');
      if (existingScript) {
        // Скрипт уже добавлен, ждем его загрузки
        existingScript.addEventListener('load', () => resolve());
        existingScript.addEventListener('error', (error) => reject(error));
        return;
      }

      const script = document.createElement('script');
      script.src = '/assets/tinymce/tinymce.min.js';
      script.async = true;
      script.onload = () => {
        console.log('TinyMCE: Script loaded successfully');
        resolve();
      };
      script.onerror = (error) => {
        console.error('TinyMCE: Failed to load script', error);
        reject(error);
      };
      document.body.appendChild(script);
    });
  }
}
