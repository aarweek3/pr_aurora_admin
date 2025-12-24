import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';

/**
 * Конфигурация header для wrapper-ui
 */
export interface WrapperUiConfigHeader {
  /** Заголовок страницы */
  title: string;
  /** Описание страницы */
  description?: string;
  /** Название компонента (например: "WrapperUiComponent") */
  componentName?: string;
  /** Путь к файлу компонента */
  componentPath?: string;
  /** Дополнительная заметка или предупреждение */
  note?: string;
  /** Компонент контрол: название и путь */
  controlComponent?: {
    name: string;
    path: string;
  };
  /** Путь к файлу документации */
  docsPath?: string;
}

@Component({
  selector: 'av-wrapper-ui',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './wrapper-ui.component.html',
  styleUrl: './wrapper-ui.component.scss',
})
export class WrapperUiComponent {
  /** Конфигурация для автоматической генерации header */
  headerConfig = input<WrapperUiConfigHeader | null>(null);

  /** Закрепить header сверху (sticky) */
  headerFixed = input<boolean>(true);

  /** Максимальная ширина контейнера (например: "1400px", "100%") */
  maxWidth = input<string>('1400px');

  /** Показать разделительную границу под хедером */
  bordered = input<boolean>(true);
}
