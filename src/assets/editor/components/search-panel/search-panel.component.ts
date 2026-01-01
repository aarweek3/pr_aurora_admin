/**
 * ════════════════════════════════════════════════════════════════════════════
 * SEARCH PANEL COMPONENT
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Встроенная панель поиска и замены текста (отображается под toolbar).
 * Альтернатива модальному окну - более удобна для поиска.
 *
 * @module SearchPanelComponent
 */

import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SearchReplaceService } from '../../services/search-replace.service';

@Component({
  selector: 'aurora-search-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="aurora-search-panel" *ngIf="visible">
      <div class="search-panel-content">
        <!-- Поле поиска -->
        <div class="search-input-wrapper">
          <input
            type="text"
            class="search-input"
            [(ngModel)]="searchQuery"
            placeholder="Найти"
            (keydown.enter)="executeSearch()"
            (keydown.escape)="close()"
            #searchInput
          />
          <span class="match-counter" *ngIf="lastFoundCount !== null">
            {{ getCurrentMatchText() }}
          </span>
        </div>

        <!-- Кнопка "Найти" -->
        <button
          class="action-button search-button"
          (click)="executeSearch()"
          title="Найти (Enter)"
        >
          Найти
        </button>

        <!-- Навигация -->
        <div class="search-navigation">
          <button
            class="nav-button"
            (click)="findPrev()"
            [disabled]="!hasResults"
            title="Предыдущее (Shift+Enter)"
          >
            ▲
          </button>
          <button
            class="nav-button"
            (click)="findNext()"
            [disabled]="!hasResults"
            title="Следующее (Enter)"
          >
            ▼
          </button>
        </div>

        <!-- Поле замены (показывается только в режиме замены) -->
        <div class="replace-input-wrapper" *ngIf="showReplace">
          <input
            type="text"
            class="replace-input"
            [(ngModel)]="replaceQuery"
            placeholder="Заменить на"
            (keydown.enter)="executeReplace()"
            (keydown.escape)="close()"
          />
        </div>

        <!-- Кнопки замены -->
        <div class="replace-actions" *ngIf="showReplace">
          <button
            class="action-button"
            (click)="executeReplace()"
            [disabled]="!hasResults"
            title="Заменить текущее"
          >
            Заменить
          </button>
          <button
            class="action-button"
            (click)="executeReplaceAll()"
            [disabled]="!hasResults"
            title="Заменить все"
          >
            Заменить все
          </button>
        </div>

        <!-- Опции -->
        <div class="search-options">
          <label class="option-label" title="Учитывать регистр (Alt+C)">
            <input
              type="checkbox"
              [(ngModel)]="caseSensitive"
              (ngModelChange)="onCaseSensitiveChange()"
            />
            <span>Aa</span>
          </label>
        </div>

        <!-- Кнопка закрытия -->
        <button class="close-button" (click)="close()" title="Закрыть (Esc)">
          ✕
        </button>
      </div>
    </div>
  `,
  styles: [`
    .aurora-search-panel {
      position: relative;
      background: #f5f5f5;
      border-bottom: 1px solid #ddd;
      padding: 8px 16px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      z-index: 100;
    }

    .search-panel-content {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
      max-width: 1200px;
      margin: 0 auto;
    }

    .search-input-wrapper,
    .replace-input-wrapper {
      position: relative;
      flex: 0 0 auto;
    }

    .search-input,
    .replace-input {
      padding: 6px 12px;
      border: 1px solid #d9d9d9;
      border-radius: 4px;
      font-size: 14px;
      width: 200px;
      transition: border-color 0.3s;
    }

    .search-input:focus,
    .replace-input:focus {
      outline: none;
      border-color: #40a9ff;
      box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
    }

    .match-counter {
      position: absolute;
      right: 12px;
      top: 50%;
      transform: translateY(-50%);
      font-size: 12px;
      color: #999;
      pointer-events: none;
      background: #f5f5f5;
      padding: 0 4px;
    }

    .search-navigation {
      display: flex;
      gap: 2px;
    }

    .nav-button {
      width: 24px;
      height: 28px;
      border: 1px solid #d9d9d9;
      background: white;
      cursor: pointer;
      font-size: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 4px;
      transition: all 0.3s;
    }

    .nav-button:hover:not(:disabled) {
      background: #f0f0f0;
      border-color: #40a9ff;
    }

    .nav-button:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }

    .replace-actions {
      display: flex;
      gap: 8px;
    }

    .action-button {
      padding: 6px 12px;
      border: 1px solid #d9d9d9;
      background: white;
      border-radius: 4px;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.3s;
    }

    .action-button:hover:not(:disabled) {
      background: #40a9ff;
      color: white;
      border-color: #40a9ff;
    }

    .action-button:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }

    .search-button {
      background: #1890ff;
      color: white;
      border-color: #1890ff;
      font-weight: 500;
    }

    .search-button:hover {
      background: #40a9ff;
      border-color: #40a9ff;
    }

    .search-options {
      display: flex;
      gap: 8px;
      margin-left: auto;
    }

    .option-label {
      display: flex;
      align-items: center;
      gap: 4px;
      cursor: pointer;
      padding: 4px 8px;
      border: 1px solid #d9d9d9;
      border-radius: 4px;
      background: white;
      font-size: 14px;
      font-weight: bold;
      transition: all 0.3s;
      user-select: none;
    }

    .option-label:hover {
      background: #f0f0f0;
      border-color: #40a9ff;
    }

    .option-label input[type="checkbox"] {
      margin: 0;
      width: 14px;
      height: 14px;
      cursor: pointer;
    }

    .option-label span {
      font-size: 12px;
    }

    .close-button {
      width: 28px;
      height: 28px;
      border: 1px solid #d9d9d9;
      background: white;
      border-radius: 4px;
      cursor: pointer;
      font-size: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s;
      margin-left: 8px;
    }

    .close-button:hover {
      background: #ff4d4f;
      color: white;
      border-color: #ff4d4f;
    }

    @media (max-width: 768px) {
      .search-panel-content {
        gap: 6px;
      }

      .search-input,
      .replace-input {
        width: 150px;
      }

      .search-options {
        margin-left: 0;
      }
    }
  `]
})
export class SearchPanelComponent implements OnInit {
  @Input() visible = false;
  @Input() showReplace = false;
  @Output() visibleChange = new EventEmitter<boolean>();

  searchQuery = '';
  replaceQuery = '';
  caseSensitive = false;
  lastFoundCount: number | null = null;

  get hasResults(): boolean {
    return this.lastFoundCount !== null && this.lastFoundCount > 0;
  }

  constructor(private searchService: SearchReplaceService) {}

  ngOnInit(): void {
    this.caseSensitive = this.searchService.isCaseSensitive();
  }

  /**
   * Выполнить поиск
   */
  executeSearch(): void {
    if (!this.searchQuery.trim()) {
      this.lastFoundCount = 0;
      return;
    }

    this.lastFoundCount = this.searchService.find(this.searchQuery);
    console.log('[SearchPanelComponent] Search executed, found:', this.lastFoundCount);
  }

  /**
   * Перейти к следующему совпадению
   */
  findNext(): void {
    this.searchService.next();
  }

  /**
   * Перейти к предыдущему совпадению
   */
  findPrev(): void {
    this.searchService.prev();
  }

  /**
   * Заменить текущее совпадение
   */
  executeReplace(): void {
    if (!this.searchQuery.trim() || !this.hasResults) return;

    const success = this.searchService.replaceCurrent(this.searchQuery, this.replaceQuery);
    if (success) {
      this.lastFoundCount = this.searchService.getTotalMatches();
      console.log('[SearchPanelComponent] Current match replaced, remaining:', this.lastFoundCount);
    }
  }

  /**
   * Заменить все совпадения
   */
  executeReplaceAll(): void {
    if (!this.searchQuery.trim() || !this.hasResults) return;

    const replaced = this.searchService.replaceAll(this.searchQuery, this.replaceQuery);
    console.log('[SearchPanelComponent] Replaced all:', replaced);

    this.lastFoundCount = 0;
  }

  /**
   * Обработка изменения опции "Учитывать регистр"
   */
  onCaseSensitiveChange(): void {
    this.searchService.toggleCaseSensitive();
    if (this.searchQuery) {
      this.executeSearch();
    }
  }

  /**
   * Получить текст текущего совпадения
   */
  getCurrentMatchText(): string {
    if (!this.hasResults) {
      return 'Нет совпадений';
    }

    const current = this.searchService.getCurrentMatchIndex() + 1;
    const total = this.searchService.getTotalMatches();
    return `${current} из ${total}`;
  }

  /**
   * Закрыть панель
   */
  close(): void {
    this.visible = false;
    this.visibleChange.emit(false);
    this.searchService.clearHighlights();
  }
}
