// контрол tinymce
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
import { TinymceBridgeService } from '@shared/services/tinymce-bridge.service';

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
    'bold italic underline strikethrough removeformat | fontfamily fontsize  blocks | forecolor backcolor | alignleft aligncenter alignright alignjustify letterspacing table save code',
    'searchreplace | undo redo | fullscreen preview |  link anchor | accordion lineheight | bullist numlist outdent indent | visualblocks visualchars | ltr rtl charmap emoticons codesample subscript superscript',
    'av-image-studio | image-align-left image-align-center image-align-right | image media av-youtube | nonbreaking footnotes | hr blockquote | restoredraft pagebreak  insertdatetime | wordcount',
    '',
  ];

  private editor: any;
  private value: string = '';
  private isDisabled: boolean = false;
  private ngZone = inject(NgZone);
  private bridgeService = inject(TinymceBridgeService);

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
        extended_valid_elements: 'figure[*],figcaption[*],img[*],a[*]',
        valid_children: '+figure[figcaption|img|a],+a[figure|img]',
        image_context_toolbar: false,
        quickbars_image_toolbar: false,
        contextmenu: false,
        content_style: `
          body { font-family: Arial, sans-serif; font-size: 14px; }
          figure.av-image { display: table; margin: 15px auto; }
          figure.av-image img { display: block; max-width: 100%; height: auto; }
          figure.av-image--align-left { float: left; margin: 0 15px 15px 0; }
          figure.av-image--align-right { float: right; margin: 0 0 15px 15px; }
          figure.av-image--align-center { float: none; margin-left: auto; margin-right: auto; }
          figure.av-image--align-full { float: none; width: 100%; margin-left: 0; margin-right: 0; }
          figure.av-image--align-full img { width: 100%; }
          .aurora-image__caption { font-size: 0.9em; color: #666; text-align: center; margin-top: 8px; font-style: italic; }
        `,
        setup: (editor: any) => {
          this.editor = editor;

          // Регистрация брендированной иконки Aurora Image Studio
          editor.ui.registry.addIcon(
            'av_image_aurora',
            '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21 19V5C21 3.9 20.1 3 19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19ZM8.5 13.5L11 16.51L14.5 12L19 18H5L8.5 13.5Z" fill="#ff4d4f"/></svg>',
          );

          // КРАСНАЯ ИКОНКА YOUTUBE (теперь с уникальным именем для плагина av-youtube)
          editor.ui.registry.addIcon(
            'av-youtube-red',
            '<svg width="24" height="24" viewBox="0 0 24 24"><path d="M21.58 7.19c-.23-.86-.91-1.54-1.77-1.77C18.25 5 12 5 12 5s-6.25 0-7.81.42c-.86.23-1.54.91-1.77 1.77C2 8.75 2 12 2 12s0 3.25.42 4.81c.23.86.91 1.54 1.77 1.77C5.75 19 12 19 12 19s6.25 0 7.81-.42c.86-.23 1.54-.91 1.77-1.77.42-1.56.42-4.81.42-4.81s0-3.25-.42-4.81zM10 15V9l5.2 3-5.2 3z" fill="#FF0000"/></svg>',
          );

          // НОВАЯ ИКОНКА ДЛЯ МУЛЬТИМЕДИА (Compact Disc)
          // Переопределяем и 'embed', и 'media'
          const cdSvg =
            '<svg width="24" height="24" viewBox="0 0 100 100"><path d="M50,10C27.909,10,10,27.909,10,50C10,72.091,27.909,90,50,90S90,72.091,90,50C90,27.909,72.091,10,50,10ZM50,65C41.716,65,35,58.284,35,50C35,41.716,41.716,35,50,35S65,41.716,65,50C65,58.284,58.284,65,50,65Z" fill="#28a745"/><path d="M50,40C44.486,40,40,44.486,40,50S44.486,60,50,60C55.514,60,60,55.514,60,50S55.514,40,50,40ZM50,55C47.243,55,45,52.757,45,50S47.243,45,50,45C52.757,45,55,47.243,55,50S52.757,55,50,55Z" fill="#28a745"/></svg>';

          editor.ui.registry.addIcon('embed', cdSvg);
          editor.ui.registry.addIcon('media', cdSvg);

          editor.ui.registry.addButton('av-image-studio', {
            icon: 'av_image_aurora',
            tooltip: 'Aurora Image Studio (VS)',
            onAction: () => {
              this.bridgeService.openImageStudio(editor);
            },
          });

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
