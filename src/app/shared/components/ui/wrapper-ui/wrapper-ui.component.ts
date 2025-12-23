import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';

@Component({
  selector: 'av-wrapper-ui',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './wrapper-ui.component.html',
  styleUrl: './wrapper-ui.component.scss',
})
export class WrapperUiComponent {
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
