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
}

@Component({
  selector: 'av-wrapper-ui',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './wrapper-ui.component.html',
  styleUrl: './wrapper-ui.component.scss',
})
export class WrapperUiComponent {
  // Конфигурация header
  /** Конфигурация для автоматической генерации header */
  headerConfig = input<WrapperUiConfigHeader | null>(null);
  // Настройки компонента
  /** Фиксированный header */
  headerFixed = input<boolean>(true);

  /** Скролл у body */
  bodyScroll = input<boolean>(true);

  /** Максимальная ширина контейнера */
  maxWidth = input<string>('1400px');

  /** Боковые отступы главного контейнера (px) */
  padding = input<number>(20);

  /** Граница между header и body */
  bordered = input<boolean>(true);
}
