import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

/**
 * Пример бесшовного окна в стиле Visual Studio (VS Code).
 * Демонстрирует использование темной темы, фиксированных плашек (header/footer)
 * и "бесшовного" контента без внутренних рамок.
 */
@Component({
  selector: 'app-window-seamless-example',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './window-seamless-example.component.html',
  styleUrl: './window-seamless-example.component.scss',
})
export class WindowSeamlessExampleComponent {
  /** Активная вкладка в редакторе */
  activeTab: 'index' | 'styles' = 'index';

  /** Состояние активности сайдбара */
  activeSidebar: string = 'explorer';

  /**
   * Переключение табов
   */
  selectTab(tab: 'index' | 'styles'): void {
    this.activeTab = tab;
  }
}
