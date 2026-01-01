/**
 * ════════════════════════════════════════════════════════════════════════════
 * EMOJI PICKER COMPONENT
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Компонент для выбора и вставки эмодзи.
 * Отображается как dropdown в toolbar.
 */

import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EmojiCategory } from '../../plugins/insert/emoji.plugin';

@Component({
  selector: 'app-emoji-picker',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './emoji-picker.component.html',
  styleUrls: ['./emoji-picker.component.scss'],
})
export class EmojiPickerComponent implements OnInit {
  /**
   * Категории эмодзи
   */
  @Input() categories: EmojiCategory[] = [];

  /**
   * Событие выбора эмодзи
   */
  @Output() emojiSelect = new EventEmitter<string>();

  /**
   * Текущая активная категория
   */
  activeCategory: string = 'smileys';

  ngOnInit(): void {
    console.log('[EmojiPicker] Инициализация компонента');
    console.log('[EmojiPicker] Количество категорий:', this.categories.length);
    console.log('[EmojiPicker] Категории:', this.categories);
  }

  /**
   * Поисковый запрос
   */
  searchQuery = '';

  /**
   * Результаты поиска
   */
  searchResults: string[] = [];

  /**
   * Переключить категорию
   */
  selectCategory(categoryId: string): void {
    this.activeCategory = categoryId;
    this.searchQuery = '';
    this.searchResults = [];
  }

  /**
   * Получить активную категорию
   */
  getActiveCategory(): EmojiCategory | undefined {
    return this.categories.find((c) => c.id === this.activeCategory);
  }

  /**
   * Обработчик поиска
   */
  onSearch(): void {
    const query = this.searchQuery.trim().toLowerCase();

    if (!query) {
      this.searchResults = [];
      return;
    }

    // Собираем все эмодзи из всех категорий (кроме недавних)
    const allEmojis: string[] = [];
    this.categories.forEach((category) => {
      if (category.id !== 'recent') {
        allEmojis.push(...category.emojis);
      }
    });

    // Для простоты возвращаем все эмодзи
    // В реальном приложении можно добавить поиск по keywords
    this.searchResults = allEmojis.slice(0, 50);
  }

  /**
   * Обработчик выбора эмодзи
   */
  onEmojiClick(emoji: string): void {
    this.emojiSelect.emit(emoji);
    this.searchQuery = '';
    this.searchResults = [];
  }

  /**
   * Получить эмодзи для отображения
   */
  getEmojisToDisplay(): string[] {
    if (this.searchQuery.trim() && this.searchResults.length > 0) {
      return this.searchResults;
    }

    const activeCategory = this.getActiveCategory();
    return activeCategory?.emojis || [];
  }
}
