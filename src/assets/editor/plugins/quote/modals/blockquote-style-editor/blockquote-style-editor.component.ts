/**
 * Редактор стилей для blockquote
 *
 * Позволяет создавать и редактировать пользовательские стили цитат
 * с live preview в реальном времени
 */

import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  EventEmitter,
  inject,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';

import { BlockquoteStylesService } from '../../services/blockquote-styles.service';
import { BlockquoteStyle, QuoteStyles, FooterStyles } from '../../types/blockquote-styles.types';
import { BLOCKQUOTE_PRESETS } from '../../config/quote-presets';

@Component({
  selector: 'aurora-blockquote-style-editor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './blockquote-style-editor.component.html',
  styleUrls: ['./blockquote-style-editor.component.scss'],
})
export class BlockquoteStyleEditorComponent implements OnInit {
  @ViewChild('dialog', { static: false }) dialogRef?: ElementRef<HTMLDialogElement>;

  // События
  @Output() onSave = new EventEmitter<BlockquoteStyle>();
  @Output() onCancel = new EventEmitter<void>();

  // Сервисы
  private stylesService = inject(BlockquoteStylesService);

  // Режим работы
  isEditMode = false;
  editingStyleId: string | null = null;

  // Вкладки
  activeTab: 'quote' | 'footer' = 'quote';

  // Данные формы
  styleName = '';

  // Стили для blockquote
  quoteStyles: QuoteStyles = {
    backgroundColor: '#f9f9f9',
    borderColor: '#ccc',
    borderWidth: '0 0 0 4px',
    borderStyle: 'solid',
    padding: '1em 1.5em',
    margin: '1.5em 0',
    fontStyle: 'italic',
    fontSize: '1em',
    color: '#555',
    lineHeight: '1.6',
    borderRadius: '0',
    boxShadow: 'none',
    beforeContent: '"',
    beforeFontSize: '3em',
    beforeColor: '#ccc',
    beforeOpacity: '0.3',
    beforePosition: {
      left: '-0.4em',
      top: '-0.2em',
    },
  };

  // Стили для footer
  footerStyles: FooterStyles = {
    fontSize: '0.9em',
    color: '#666',
    fontStyle: 'normal',
    fontWeight: '500',
    textAlign: 'right',
    marginTop: '1em',
  };

  // Флаги состояния
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  // Превью текст
  previewText = 'Это пример текста цитаты для предварительного просмотра. Здесь вы можете увидеть, как будет выглядеть ваш стиль в реальном времени.';
  previewAuthor = 'Автор Цитаты';
  previewSource = 'Источник';

  constructor() {}

  ngOnInit(): void {}

  /**
   * Открыть редактор в режиме создания нового стиля
   */
  openNew(): void {
    this.isEditMode = false;
    this.editingStyleId = null;
    this.styleName = 'Новый стиль';
    this.resetToDefaults();
    this.showDialog();
  }

  /**
   * Открыть редактор в режиме редактирования существующего стиля
   */
  async openEdit(styleId: string): Promise<void> {
    this.isEditMode = true;
    this.editingStyleId = styleId;

    const style = await this.stylesService.getStyleById(styleId);
    if (!style) {
      this.errorMessage = 'Стиль не найден';
      return;
    }

    // Загружаем данные стиля
    this.styleName = style.name;
    this.quoteStyles = { ...style.quote };
    this.footerStyles = { ...style.footer };

    this.showDialog();
  }

  /**
   * Показать диалог
   */
  private showDialog(): void {
    this.activeTab = 'quote';
    this.errorMessage = '';
    this.successMessage = '';
    this.dialogRef?.nativeElement.showModal();
  }

  /**
   * Закрыть диалог
   */
  close(): void {
    this.dialogRef?.nativeElement.close();
  }

  /**
   * Сохранить стиль
   */
  async save(): Promise<void> {
    if (!this.validateForm()) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    try {
      const style: BlockquoteStyle = {
        id: this.editingStyleId || `custom-${Date.now()}`,
        name: this.styleName.trim(),
        isCustom: true,
        quote: { ...this.quoteStyles },
        footer: { ...this.footerStyles },
      };

      if (this.isEditMode && this.editingStyleId) {
        await this.stylesService.updateCustomStyle(this.editingStyleId, style);
      } else {
        await this.stylesService.createCustomStyle(style);
      }

      this.onSave.emit(style);
      this.close();
    } catch (error) {
      console.error('Error saving style:', error);
      this.errorMessage = error instanceof Error ? error.message : 'Ошибка сохранения стиля';
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Отменить
   */
  cancel(): void {
    this.onCancel.emit();
    this.close();
  }

  /**
   * Переключить вкладку
   */
  switchTab(tab: 'quote' | 'footer'): void {
    this.activeTab = tab;
  }

  /**
   * Сбросить к значениям по умолчанию
   */
  resetToDefaults(): void {
    const defaultStyle = BLOCKQUOTE_PRESETS[0]; // Classic style
    this.quoteStyles = { ...defaultStyle.quote };
    this.footerStyles = { ...defaultStyle.footer };
  }

  /**
   * Валидация формы
   */
  private validateForm(): boolean {
    if (!this.styleName.trim()) {
      this.errorMessage = 'Введите название стиля';
      return false;
    }
    return true;
  }

  /**
   * Получить CSS для превью blockquote
   */
  getPreviewQuoteStyles(): Record<string, string> {
    const css: Record<string, string> = {
      position: 'relative',
    };

    if (this.quoteStyles.backgroundColor) css['background-color'] = this.quoteStyles.backgroundColor;
    if (this.quoteStyles.color) css['color'] = this.quoteStyles.color;

    if (this.quoteStyles.borderColor && this.quoteStyles.borderWidth && this.quoteStyles.borderStyle) {
      css['border'] = `${this.quoteStyles.borderWidth} ${this.quoteStyles.borderStyle} ${this.quoteStyles.borderColor}`;
    }

    if (this.quoteStyles.padding) css['padding'] = this.quoteStyles.padding;
    if (this.quoteStyles.margin) css['margin'] = this.quoteStyles.margin;
    if (this.quoteStyles.borderRadius) css['border-radius'] = this.quoteStyles.borderRadius;
    if (this.quoteStyles.fontStyle) css['font-style'] = this.quoteStyles.fontStyle;
    if (this.quoteStyles.fontSize) css['font-size'] = this.quoteStyles.fontSize;
    if (this.quoteStyles.lineHeight) css['line-height'] = this.quoteStyles.lineHeight;
    if (this.quoteStyles.boxShadow) css['box-shadow'] = this.quoteStyles.boxShadow;

    return css;
  }

  /**
   * Получить CSS для превью before элемента
   */
  getPreviewBeforeStyles(): Record<string, string> {
    const css: Record<string, string> = {
      position: 'absolute',
      'pointer-events': 'none',
      'user-select': 'none',
    };

    if (this.quoteStyles.beforePosition?.left) css['left'] = this.quoteStyles.beforePosition.left;
    if (this.quoteStyles.beforePosition?.right) css['right'] = this.quoteStyles.beforePosition.right;
    if (this.quoteStyles.beforePosition?.top) css['top'] = this.quoteStyles.beforePosition.top;
    if (this.quoteStyles.beforePosition?.bottom) css['bottom'] = this.quoteStyles.beforePosition.bottom;
    if (this.quoteStyles.beforeFontSize) css['font-size'] = this.quoteStyles.beforeFontSize;
    if (this.quoteStyles.beforeColor) css['color'] = this.quoteStyles.beforeColor;
    if (this.quoteStyles.beforeOpacity) css['opacity'] = this.quoteStyles.beforeOpacity;

    return css;
  }

  /**
   * Получить CSS для превью footer
   */
  getPreviewFooterStyles(): Record<string, string> {
    const css: Record<string, string> = {};

    if (this.footerStyles.fontSize) css['font-size'] = this.footerStyles.fontSize;
    if (this.footerStyles.color) css['color'] = this.footerStyles.color;
    if (this.footerStyles.fontStyle) css['font-style'] = this.footerStyles.fontStyle;
    if (this.footerStyles.fontWeight) css['font-weight'] = this.footerStyles.fontWeight;
    if (this.footerStyles.textAlign) css['text-align'] = this.footerStyles.textAlign;
    if (this.footerStyles.marginTop) css['margin-top'] = this.footerStyles.marginTop;

    return css;
  }

  /**
   * Показать/скрыть before элемент
   */
  get showBeforeElement(): boolean {
    return !!this.quoteStyles.beforeContent && this.quoteStyles.beforeContent.trim() !== '';
  }
}
