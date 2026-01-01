import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  ApplicationRef,
  Component,
  ComponentRef,
  createComponent,
  ElementRef,
  EnvironmentInjector,
  EventEmitter,
  inject,
  OnDestroy,
  OnInit,
  Output,
  PLATFORM_ID,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

import { BlockquoteGenerator } from '../../services/blockquote-generator.service';
import { BlockquoteStylesService } from '../../services/blockquote-styles.service';
import { BlockquoteData, BlockquoteStyle, ImportResult } from '../../types/blockquote-styles.types';
import { BlockquoteStyleEditorComponent } from '../blockquote-style-editor/blockquote-style-editor.component';

/**
 * Модальное окно для вставки и редактирования цитат
 *
 * Функции:
 * - Ввод текста цитаты, автора и источника
 * - Выбор стиля из пресетов и кастомных стилей
 * - Предварительный просмотр цитаты с выбранным стилем
 * - Создание, редактирование, дублирование и удаление кастомных стилей
 * - Импорт и экспорт стилей
 * - Интеграция с редактором через события
 */
@Component({
  selector: 'aurora-blockquote-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './blockquote-modal.component.html',
  styleUrls: ['./blockquote-modal.component.scss'],
})
export class BlockquoteModalComponent implements OnInit, OnDestroy {
  // Сервисы
  private stylesService = inject(BlockquoteStylesService);
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);
  private appRef = inject(ApplicationRef);
  private injector = inject(EnvironmentInjector);

  // Ссылка на редактор стилей
  private styleEditorRef: ComponentRef<BlockquoteStyleEditorComponent> | null = null;

  // ViewChild ссылки
  @ViewChild('dialog', { static: false }) dialogRef?: ElementRef<HTMLDialogElement>;
  @ViewChild('quoteTextarea', { static: false }) quoteTextareaRef?: ElementRef<HTMLTextAreaElement>;
  @ViewChild('fileInput', { static: false }) fileInputRef?: ElementRef<HTMLInputElement>;

  // Выходные события (новый API для QuotePlugin)
  @Output() onInsert = new EventEmitter<string>();
  @Output() onCancel = new EventEmitter<void>();
  @Output() onEditStyle = new EventEmitter<BlockquoteStyle>();

  // Событие для обратной совместимости со старым InsertQuotePlugin
  @Output() save = new EventEmitter<{
    text: string;
    author: string;
    source: string;
    style: string;
  }>();

  // Состояние модального окна
  isOpen = false;
  activeTab: 'content' | 'style' = 'content';

  // Данные формы
  quoteText = '';
  author = '';
  source = '';
  selectedStyleId = 'classic'; // ID выбранного стиля

  // Список всех стилей (пресеты + кастомные)
  allStyles: BlockquoteStyle[] = [];
  presetStyles: BlockquoteStyle[] = [];
  customStyles: BlockquoteStyle[] = [];

  // Выбранный стиль для превью
  selectedStyle: BlockquoteStyle | null = null;

  // Сохраненная позиция курсора в редакторе
  private savedSelection: Range | null = null;

  // Управление подписками
  private destroy$ = new Subject<void>();

  // Флаги состояния
  isLoading = false;
  isImporting = false;
  isExporting = false;
  errorMessage = '';
  successMessage = '';

  constructor() {}

  ngOnInit(): void {
    // Подписываемся на изменения стилей
    this.stylesService
      .getAllStyles()
      .pipe(takeUntil(this.destroy$))
      .subscribe((styles) => {
        this.allStyles = styles;
        this.presetStyles = styles.filter((s) => !s.isCustom);
        this.customStyles = styles.filter((s) => s.isCustom);

        // Обновляем выбранный стиль, если он изменился
        this.updateSelectedStyle();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();

    // Закрываем редактор стилей, если он открыт
    this.closeStyleEditor();
  }

  /**
   * Открывает модальное окно
   * @param prefilledText - Предзаполненный текст (например, выделенный в редакторе)
   * @param selection - Сохраненная позиция курсора в редакторе
   */
  open(prefilledText?: string, selection?: Range): void {
    if (!this.isBrowser) return;

    // Сохраняем позицию курсора
    if (selection) {
      this.savedSelection = selection;
    }

    // Предзаполняем текст, если передан
    if (prefilledText) {
      this.quoteText = prefilledText;
    }

    // Загружаем стили, если еще не загружены
    if (this.allStyles.length === 0) {
      this.loadStyles();
    }

    // Обновляем выбранный стиль
    this.updateSelectedStyle();

    // Показываем диалог
    this.isOpen = true;
    this.activeTab = 'content';
    this.errorMessage = '';
    this.successMessage = '';

    // Используем setTimeout для корректного открытия dialog
    setTimeout(() => {
      this.dialogRef?.nativeElement.showModal();
      // Фокусируемся на поле ввода текста
      this.quoteTextareaRef?.nativeElement.focus();
    }, 0);
  }

  /**
   * Закрывает модальное окно
   */
  close(): void {
    if (!this.isBrowser) return;

    this.isOpen = false;
    this.dialogRef?.nativeElement.close();

    // Очищаем форму
    this.resetForm();
  }

  /**
   * Обрабатывает отмену (закрытие без вставки)
   */
  cancel(): void {
    this.close();
    this.onCancel.emit();
  }

  /**
   * Обрабатывает вставку цитаты
   */
  submit(): void {
    if (!this.canInsert()) {
      this.errorMessage = 'Пожалуйста, введите текст цитаты';
      return;
    }

    // Создаем данные для генератора
    const data: BlockquoteData = {
      text: this.quoteText.trim(),
      author: this.author.trim() || undefined,
      source: this.source.trim() || undefined,
      styleId: this.selectedStyleId,
    };

    // Генерируем HTML с помощью BlockquoteGenerator
    const html = BlockquoteGenerator.createBlockquoteHTML(data, this.selectedStyle!);

    // Отправляем HTML редактору (новый API)
    this.onInsert.emit(html);

    // Отправляем данные для старого плагина (обратная совместимость)
    this.save.emit({
      text: this.quoteText.trim(),
      author: this.author.trim(),
      source: this.source.trim(),
      style: this.selectedStyleId,
    });

    // Закрываем модальное окно
    this.close();
  }

  /**
   * Переключает вкладку
   */
  switchTab(tab: 'content' | 'style'): void {
    this.activeTab = tab;
  }

  /**
   * Выбирает стиль
   */
  selectStyle(styleId: string): void {
    this.selectedStyleId = styleId;
    this.updateSelectedStyle();
  }

  /**
   * Открывает редактор стилей для создания нового стиля
   */
  createNewStyle(): void {
    if (!this.isBrowser) return;

    this.openStyleEditor();
  }

  /**
   * Открывает редактор для редактирования кастомного стиля
   */
  editCustomStyle(style: BlockquoteStyle): void {
    if (!this.isBrowser) return;

    if (!style.isCustom) {
      this.errorMessage = 'Можно редактировать только кастомные стили';
      setTimeout(() => (this.errorMessage = ''), 3000);
      return;
    }

    this.openStyleEditor(style.id);
  }

  /**
   * Открывает редактор стилей
   */
  private openStyleEditor(styleId?: string): void {
    if (this.styleEditorRef) {
      // Редактор уже открыт
      return;
    }

    // Создаем компонент редактора динамически
    this.styleEditorRef = createComponent(BlockquoteStyleEditorComponent, {
      environmentInjector: this.injector,
    });

    const editorInstance = this.styleEditorRef.instance;

    // Подписываемся на события редактора
    editorInstance.onSave.subscribe(() => {
      this.closeStyleEditor();
      // Перезагружаем список стилей (они обновятся через Observable)
    });

    editorInstance.onCancel.subscribe(() => {
      this.closeStyleEditor();
    });

    // Добавляем компонент в DOM
    document.body.appendChild(this.styleEditorRef.location.nativeElement);
    this.appRef.attachView(this.styleEditorRef.hostView);

    // Открываем редактор в нужном режиме
    if (styleId) {
      editorInstance.openEdit(styleId);
    } else {
      editorInstance.openNew();
    }
  }

  /**
   * Закрывает редактор стилей
   */
  private closeStyleEditor(): void {
    if (!this.styleEditorRef) return;

    this.appRef.detachView(this.styleEditorRef.hostView);
    this.styleEditorRef.destroy();
    this.styleEditorRef = null;
  }

  /**
   * Дублирует стиль (создает копию)
   */
  async duplicateStyle(style: BlockquoteStyle): Promise<void> {
    try {
      this.isLoading = true;
      this.errorMessage = '';

      const newName = `${style.name} (копия)`;
      const duplicated = await this.stylesService.duplicateStyle(style.id, newName);

      if (duplicated) {
        this.successMessage = `Стиль "${newName}" создан`;
        this.selectedStyleId = duplicated.id;
        this.updateSelectedStyle();
        setTimeout(() => (this.successMessage = ''), 3000);
      } else {
        this.errorMessage = 'Не удалось дублировать стиль';
      }
    } catch (error) {
      console.error('Error duplicating style:', error);
      this.errorMessage = error instanceof Error ? error.message : 'Ошибка дублирования стиля';
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Удаляет кастомный стиль
   */
  async deleteCustomStyle(style: BlockquoteStyle): Promise<void> {
    if (!style.isCustom) {
      this.errorMessage = 'Можно удалять только кастомные стили';
      return;
    }

    if (!confirm(`Удалить стиль "${style.name}"?`)) {
      return;
    }

    try {
      this.isLoading = true;
      this.errorMessage = '';

      const deleted = await this.stylesService.deleteCustomStyle(style.id);

      if (deleted) {
        this.successMessage = `Стиль "${style.name}" удален`;

        // Если удален выбранный стиль, выбираем классический
        if (this.selectedStyleId === style.id) {
          this.selectedStyleId = 'classic';
          this.updateSelectedStyle();
        }

        setTimeout(() => (this.successMessage = ''), 3000);
      } else {
        this.errorMessage = 'Не удалось удалить стиль';
      }
    } catch (error) {
      console.error('Error deleting style:', error);
      this.errorMessage = error instanceof Error ? error.message : 'Ошибка удаления стиля';
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Экспортирует все стили в JSON файл
   */
  async exportStyles(): Promise<void> {
    try {
      this.isExporting = true;
      this.errorMessage = '';

      await this.stylesService.downloadStylesAsFile();
      this.successMessage = 'Стили экспортированы';
      setTimeout(() => (this.successMessage = ''), 3000);
    } catch (error) {
      console.error('Error exporting styles:', error);
      this.errorMessage = error instanceof Error ? error.message : 'Ошибка экспорта стилей';
    } finally {
      this.isExporting = false;
    }
  }

  /**
   * Открывает диалог выбора файла для импорта
   */
  openImportDialog(): void {
    this.fileInputRef?.nativeElement.click();
  }

  /**
   * Импортирует стили из выбранного файла
   */
  async onImportStyles(event: any): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    try {
      this.isImporting = true;
      this.errorMessage = '';

      const result: ImportResult = await this.stylesService.importStylesFromFile(file);

      if (result.success) {
        this.successMessage = `Импортировано: ${result.count} стилей`;
        if (result.errors.length > 0) {
          this.successMessage += ` (с ошибками: ${result.errors.length})`;
        }
        setTimeout(() => (this.successMessage = ''), 5000);
      } else {
        this.errorMessage = result.errors.join(', ');
      }

      // Очищаем input для возможности повторного импорта того же файла
      input.value = '';
    } catch (error) {
      console.error('Error importing styles:', error);
      this.errorMessage = error instanceof Error ? error.message : 'Ошибка импорта стилей';
    } finally {
      this.isImporting = false;
    }
  }

  /**
   * Триггерит клик на input файла
   */
  triggerImport(): void {
    const input = this.fileInputRef?.nativeElement;
    if (!input) return;

    // Подписываемся на событие change
    const handleChange = async () => {
      await this.handleFileChange();
      input.removeEventListener('change', handleChange);
    };

    input.addEventListener('change', handleChange);
    input.click();
  }

  /**
   * Обрабатывает изменение файла
   */
  async handleFileChange(): Promise<void> {
    const input = this.fileInputRef?.nativeElement;
    if (!input) return;

    const file = input.files?.[0];
    if (!file) return;

    try {
      this.isImporting = true;
      this.errorMessage = '';

      const result: ImportResult = await this.stylesService.importStylesFromFile(file);

      if (result.success) {
        this.successMessage = `Импортировано: ${result.count} стилей`;
        if (result.errors.length > 0) {
          this.successMessage += ` (с ошибками: ${result.errors.length})`;
        }
        setTimeout(() => (this.successMessage = ''), 5000);
      } else {
        this.errorMessage = result.errors.join(', ');
      }

      // Очищаем input для возможности повторного импорта того же файла
      input.value = '';
    } catch (error) {
      console.error('Error importing styles:', error);
      this.errorMessage = error instanceof Error ? error.message : 'Ошибка импорта стилей';
    } finally {
      this.isImporting = false;
    }
  }

  /**
   * Получает CSS объект для превью цитаты
   */
  getPreviewStyles(): Record<string, string> {
    if (!this.selectedStyle) return {};
    return BlockquoteGenerator.getBlockquoteCSSObject(this.selectedStyle.quote);
  }

  /**
   * Получает CSS объект для превью футера
   */
  getPreviewFooterStyles(): Record<string, string> {
    if (!this.selectedStyle) return {};
    return BlockquoteGenerator.getFooterCSSObject(this.selectedStyle.footer);
  }

  /**
   * Получает CSS объект для blockquote из стиля (для использования в HTML)
   */
  getBlockquoteCSSObject(quoteStyles: any): Record<string, string> {
    return BlockquoteGenerator.getBlockquoteCSSObject(quoteStyles);
  }

  /**
   * Проверяет, можно ли вставить цитату (валидна ли форма)
   */
  canInsert(): boolean {
    return this.quoteText.trim().length > 0 && this.selectedStyle !== null;
  }

  /**
   * Загружает стили из сервиса
   */
  private async loadStyles(): Promise<void> {
    try {
      this.isLoading = true;
      // Стили уже приходят через Observable подписку в ngOnInit
    } catch (error) {
      console.error('Error loading styles:', error);
      this.errorMessage = 'Не удалось загрузить стили';
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Обновляет выбранный стиль на основе selectedStyleId
   */
  private updateSelectedStyle(): void {
    const style = this.allStyles.find((s) => s.id === this.selectedStyleId);
    this.selectedStyle = style || this.allStyles[0] || null;

    // Если стиль не найден, выбираем первый доступный
    if (!style && this.allStyles.length > 0) {
      this.selectedStyleId = this.allStyles[0].id;
      this.selectedStyle = this.allStyles[0];
    }
  }

  /**
   * Сбрасывает форму к начальному состоянию
   */
  private resetForm(): void {
    this.quoteText = '';
    this.author = '';
    this.source = '';
    this.selectedStyleId = 'classic';
    this.activeTab = 'content';
    this.errorMessage = '';
    this.successMessage = '';
    this.savedSelection = null;
    this.updateSelectedStyle();
  }

  /**
   * Получает текст для превью (или placeholder)
   */
  getPreviewText(): string {
    return this.quoteText.trim() || 'Введите текст цитаты для превью...';
  }

  /**
   * Получает автора для превью
   */
  getPreviewAuthor(): string | undefined {
    return this.author.trim() || undefined;
  }

  /**
   * Получает источник для превью
   */
  getPreviewSource(): string | undefined {
    return this.source.trim() || undefined;
  }

  /**
   * Проверяет, является ли стиль выбранным
   */
  isStyleSelected(styleId: string): boolean {
    return this.selectedStyleId === styleId;
  }

  /**
   * Получает CSS класс для стиля в списке
   */
  getStyleItemClass(style: BlockquoteStyle): string {
    const classes = ['style-item'];
    if (this.isStyleSelected(style.id)) {
      classes.push('selected');
    }
    if (!style.isCustom) {
      classes.push('preset');
    }
    return classes.join(' ');
  }
}
