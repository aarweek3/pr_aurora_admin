import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
  ViewChild,
} from '@angular/core';

declare const tinymce: any;

@Component({
  selector: 'app-tinymce-editor',
  standalone: true,
  template: ` <textarea #editor></textarea> `,
})
export class TinymceEditorComponent implements AfterViewInit, OnDestroy {
  @ViewChild('editor', { static: true })
  editorRef!: ElementRef<HTMLTextAreaElement>;

  @Input() value = '';
  @Input() height = 400;
  @Input() disabled = false;

  @Output() valueChange = new EventEmitter<string>();

  private editorInstance: any;

  ngAfterViewInit(): void {
    this.loadScript().then(() => this.initEditor());
  }

  ngOnDestroy(): void {
    if (this.editorInstance) {
      tinymce.remove(this.editorInstance);
    }
  }

  private initEditor(): void {
    tinymce.init({
      target: this.editorRef.nativeElement,
      height: this.height,
      base_url: '/assets/tinymce', // Явно указываем корневую папку
      menubar: true,
      branding: false,
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
        'help',
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
      ],
      external_plugins: {
        letterspacing: '/assets/tinymce/plugins/letterspacing/plugin.js',
      },
      toolbar: [
        'letterspacing | undo redo code | accordion blocks fontfamily fontsize lineheight | bold italic underline strikethrough | forecolor backcolor',
        'alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image media table | charmap emoticons codesample | hr blockquote subscript superscript | removeformat',
        'searchreplace fullscreen preview | save restoredraft pagebreak anchor insertdatetime | visualblocks visualchars wordcount | ltr rtl | help',
      ],
      setup: (editor: any) => {
        this.editorInstance = editor;

        editor.on('init', () => {
          editor.setContent(this.value || '');
          editor.setMode(this.disabled ? 'readonly' : 'design');
        });

        editor.on('Change KeyUp', () => {
          this.valueChange.emit(editor.getContent());
        });
      },
    });
  }

  private loadScript(): Promise<void> {
    return new Promise((resolve) => {
      if ((window as any).tinymce) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = '/assets/tinymce/tinymce.min.js';
      script.onload = () => resolve();
      document.body.appendChild(script);
    });
  }
}
