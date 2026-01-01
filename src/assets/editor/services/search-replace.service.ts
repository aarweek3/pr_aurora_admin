/**
 * ════════════════════════════════════════════════════════════════════════════
 * SEARCH AND REPLACE SERVICE
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Сервис для поиска и замены текста в редакторе.
 * Управляет подсветкой совпадений и навигацией между ними.
 *
 * @module SearchReplaceService
 */

import { Injectable } from '@angular/core';

export interface SearchOptions {
  caseSensitive?: boolean;
  wholeWord?: boolean;
  useRegex?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class SearchReplaceService {
  private contentElement?: HTMLElement;
  private caseSensitive = false;
  private highlightEnabled = true;
  private lastQuery = '';
  private currentMatchIndex = -1;
  private totalMatches = 0;
  private matchElements: HTMLElement[] = [];

  /**
   * Установить элемент контента редактора
   */
  setContentElement(element: HTMLElement): void {
    this.contentElement = element;
    console.log('[SearchReplaceService] Content element set');
  }

  /**
   * Найти текст и подсветить совпадения
   */
  find(query: string, options?: SearchOptions): number {
    if (!this.contentElement || !query.trim()) {
      return 0;
    }

    this.lastQuery = query;
    if (options?.caseSensitive !== undefined) {
      this.caseSensitive = options.caseSensitive;
    }

    // Очищаем старую подсветку
    this.clearHighlights();

    const flags = this.caseSensitive ? 'g' : 'gi';
    const regex = new RegExp(this.escapeRegExp(query), flags);

    let matches = 0;
    const walker = document.createTreeWalker(
      this.contentElement,
      NodeFilter.SHOW_TEXT,
      null
    );

    const textNodes: Text[] = [];
    let node: Node | null;

    while ((node = walker.nextNode())) {
      const textNode = node as Text;
      if (textNode.nodeValue && regex.test(textNode.nodeValue)) {
        textNodes.push(textNode);
      }
    }

    // Подсвечиваем найденные совпадения
    this.matchElements = [];
    textNodes.forEach(textNode => {
      const parent = textNode.parentElement;
      if (!parent) return;

      const fragment = document.createDocumentFragment();
      let lastIndex = 0;
      const text = textNode.nodeValue || '';

      regex.lastIndex = 0;
      let match: RegExpExecArray | null;

      while ((match = regex.exec(text)) !== null) {
        const start = match.index;
        const end = start + match[0].length;

        // Добавляем текст до совпадения
        if (start > lastIndex) {
          fragment.appendChild(document.createTextNode(text.slice(lastIndex, start)));
        }

        // Создаем подсветку
        const mark = document.createElement('mark');
        mark.className = 'aurora-search-highlight';
        mark.style.backgroundColor = '#ffeb3b';
        mark.style.color = '#000';
        mark.textContent = text.slice(start, end);
        mark.dataset['matchIndex'] = matches.toString();
        fragment.appendChild(mark);

        this.matchElements.push(mark);
        lastIndex = end;
        matches++;
      }

      // Добавляем оставшийся текст
      if (lastIndex < text.length) {
        fragment.appendChild(document.createTextNode(text.slice(lastIndex)));
      }

      parent.replaceChild(fragment, textNode);
    });

    this.totalMatches = matches;
    this.currentMatchIndex = matches > 0 ? 0 : -1;

    // Выделяем первое совпадение
    if (this.currentMatchIndex >= 0) {
      this.highlightCurrentMatch();
    }

    console.log(`[SearchReplaceService] Found ${matches} matches for "${query}"`);
    return matches;
  }

  /**
   * Перейти к следующему совпадению
   */
  next(): void {
    if (this.totalMatches === 0) return;

    this.currentMatchIndex = (this.currentMatchIndex + 1) % this.totalMatches;
    this.highlightCurrentMatch();
  }

  /**
   * Перейти к предыдущему совпадению
   */
  prev(): void {
    if (this.totalMatches === 0) return;

    this.currentMatchIndex = this.currentMatchIndex - 1;
    if (this.currentMatchIndex < 0) {
      this.currentMatchIndex = this.totalMatches - 1;
    }
    this.highlightCurrentMatch();
  }

  /**
   * Заменить текущее совпадение
   */
  replaceCurrent(query: string, replacement: string): boolean {
    if (this.currentMatchIndex < 0 || this.currentMatchIndex >= this.matchElements.length) {
      return false;
    }

    const currentMatch = this.matchElements[this.currentMatchIndex];
    if (!currentMatch) return false;

    // Заменяем текст
    const textNode = document.createTextNode(replacement);
    currentMatch.parentNode?.replaceChild(textNode, currentMatch);

    // Удаляем из массива совпадений
    this.matchElements.splice(this.currentMatchIndex, 1);
    this.totalMatches--;

    // Корректируем индекс
    if (this.totalMatches === 0) {
      this.currentMatchIndex = -1;
    } else if (this.currentMatchIndex >= this.totalMatches) {
      this.currentMatchIndex = 0;
    }

    // Подсвечиваем следующее совпадение
    if (this.currentMatchIndex >= 0) {
      this.highlightCurrentMatch();
    }

    console.log(`[SearchReplaceService] Replaced current match with "${replacement}"`);
    return true;
  }

  /**
   * Заменить все совпадения
   */
  replaceAll(query: string, replacement: string, options?: SearchOptions): number {
    if (!this.contentElement || !query.trim()) {
      return 0;
    }

    // Сначала очищаем подсветку
    this.clearHighlights();

    if (options?.caseSensitive !== undefined) {
      this.caseSensitive = options.caseSensitive;
    }

    const flags = this.caseSensitive ? 'g' : 'gi';
    const regex = new RegExp(this.escapeRegExp(query), flags);

    let replacements = 0;
    const walker = document.createTreeWalker(
      this.contentElement,
      NodeFilter.SHOW_TEXT,
      null
    );

    const textNodes: Text[] = [];
    let node: Node | null;

    while ((node = walker.nextNode())) {
      const textNode = node as Text;
      if (textNode.nodeValue && regex.test(textNode.nodeValue)) {
        textNodes.push(textNode);
      }
    }

    textNodes.forEach(textNode => {
      const text = textNode.nodeValue || '';
      const newText = text.replace(regex, replacement);
      if (newText !== text) {
        textNode.nodeValue = newText;
        const matches = text.match(regex);
        replacements += matches ? matches.length : 0;
      }
    });

    this.totalMatches = 0;
    this.currentMatchIndex = -1;
    this.matchElements = [];

    console.log(`[SearchReplaceService] Replaced ${replacements} instances of "${query}" with "${replacement}"`);
    return replacements;
  }

  /**
   * Очистить подсветку поиска
   */
  clearHighlights(): void {
    if (!this.contentElement) return;

    const highlights = this.contentElement.querySelectorAll('.aurora-search-highlight, .aurora-search-current');
    highlights.forEach(mark => {
      const parent = mark.parentNode;
      if (parent) {
        parent.replaceChild(document.createTextNode(mark.textContent || ''), mark);
        parent.normalize(); // Объединяем соседние текстовые узлы
      }
    });

    this.matchElements = [];
    this.totalMatches = 0;
    this.currentMatchIndex = -1;
  }

  /**
   * Подсветить текущее совпадение
   */
  private highlightCurrentMatch(): void {
    // Убираем подсветку со всех элементов
    this.matchElements.forEach((el, index) => {
      el.className = 'aurora-search-highlight';
      el.style.backgroundColor = '#ffeb3b';
    });

    // Подсвечиваем текущий элемент
    if (this.currentMatchIndex >= 0 && this.currentMatchIndex < this.matchElements.length) {
      const current = this.matchElements[this.currentMatchIndex];
      current.className = 'aurora-search-current';
      current.style.backgroundColor = '#ff9800';

      // Прокручиваем к элементу
      current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  /**
   * Экранировать спецсимволы регулярного выражения
   */
  private escapeRegExp(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /**
   * Переключить учет регистра
   */
  toggleCaseSensitive(): boolean {
    this.caseSensitive = !this.caseSensitive;

    // Если есть активный поиск, переделываем его с новыми настройками
    if (this.lastQuery) {
      this.find(this.lastQuery);
    }

    console.log(`[SearchReplaceService] Case sensitive: ${this.caseSensitive ? 'ON' : 'OFF'}`);
    return this.caseSensitive;
  }

  /**
   * Переключить подсветку
   */
  toggleHighlight(): boolean {
    this.highlightEnabled = !this.highlightEnabled;

    if (!this.highlightEnabled) {
      this.clearHighlights();
    } else if (this.lastQuery) {
      this.find(this.lastQuery);
    }

    console.log(`[SearchReplaceService] Highlight: ${this.highlightEnabled ? 'ON' : 'OFF'}`);
    return this.highlightEnabled;
  }

  /**
   * Проверить, включен ли учет регистра
   */
  isCaseSensitive(): boolean {
    return this.caseSensitive;
  }

  /**
   * Проверить, включена ли подсветка
   */
  isHighlightEnabled(): boolean {
    return this.highlightEnabled;
  }

  /**
   * Получить последний поисковый запрос
   */
  getLastQuery(): string {
    return this.lastQuery;
  }

  /**
   * Получить текущий индекс совпадения
   */
  getCurrentMatchIndex(): number {
    return this.currentMatchIndex;
  }

  /**
   * Получить общее количество совпадений
   */
  getTotalMatches(): number {
    return this.totalMatches;
  }
}
