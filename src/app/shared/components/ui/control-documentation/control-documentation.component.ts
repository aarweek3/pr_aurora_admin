import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { ControlDocumentationConfig } from './control-documentation.models';

// Import AV Icon component
import { IconComponent } from '../icon/icon.component';

/**
 * Универсальный компонент для отображения документации UI Control компонентов.
 * Заменяет copy-paste подход единым конфигурируемым решением.
 */
@Component({
  selector: 'control-documentation',
  standalone: true,
  imports: [CommonModule, IconComponent],
  templateUrl: './control-documentation.component.html',
  styleUrl: './control-documentation.component.scss',
})
export class ControlDocumentationComponent {
  /** Конфигурация документации */
  @Input({ required: true }) config!: ControlDocumentationConfig;

  /** Активная вкладка примеров */
  activeExampleIndex = 0;

  /**
   * Переключить активный пример
   */
  setActiveExample(index: number): void {
    this.activeExampleIndex = index;
  }

  /**
   * Получить CSS класс для типа архитектурной заметки
   */
  getArchitectureNoteClass(type: string): string {
    return `architecture-note architecture-note--${type}`;
  }

  /**
   * Получить иконку для типа архитектурной заметки
   */
  getArchitectureNoteIcon(type: string): string {
    switch (type) {
      case 'info':
        return 'system/av_info';
      case 'warning':
        return 'system/av_warning';
      case 'tip':
        return 'system/av_star';
      case 'danger':
        return 'settings/av_exclamation-mark';
      default:
        return 'system/av_info';
    }
  }
}
