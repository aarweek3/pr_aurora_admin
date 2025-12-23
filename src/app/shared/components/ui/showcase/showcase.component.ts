import { CommonModule } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { WrapperUiComponent, WrapperUiConfigHeader } from '../wrapper-ui/wrapper-ui.component';

/**
 * Конфигурация для av-showcase
 */
export interface ShowcaseConfig {
  /** Конфигурация header (делегируется в wrapper-ui) */
  headerConfig: WrapperUiConfigHeader;

  /** Заголовок блока "Результат" */
  resultTitle?: string; // default: '🎨 Результат'

  /** Показать секцию "Примеры" */
  showExamples?: boolean; // default: true

  /** Показать секцию "Документация" */
  showDocs?: boolean; // default: true

  /** Split колонок [left, right] из 24 (например [15, 9] = 60/40) */
  columnSplit?: [number, number]; // default: [15, 9]
}

@Component({
  selector: 'av-showcase',
  standalone: true,
  imports: [CommonModule, WrapperUiComponent, NzCardModule, NzGridModule],
  templateUrl: './showcase.component.html',
  styleUrl: './showcase.component.scss',
})
export class ShowcaseComponent {
  /** Конфигурация showcase */
  config = input.required<ShowcaseConfig>();

  /** Заголовок блока результата */
  resultTitle = computed(() => this.config().resultTitle ?? '🎨 Результат');

  /** Показать секцию примеров */
  showExamples = computed(() => this.config().showExamples ?? true);

  /** Показать секцию документации */
  showDocs = computed(() => this.config().showDocs ?? true);

  /** Split колонок [left, right] */
  columnSplit = computed(() => this.config().columnSplit ?? [15, 9]);
}
