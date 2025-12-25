import { Component, signal } from '@angular/core';
import { NzButtonModule } from 'ng-zorro-antd/button';

import { ComponentDemoComponent } from '@shared/components/ui/component-demo/component-demo.component';
import { BUTTON_DEMO_CONFIG } from './button-demo.config';

/**
 * Демо-страница для компонента Button
 * Показывает интерактивный playground с настройками и примерами
 */
@Component({
  selector: 'app-button-demo',
  standalone: true,
  imports: [ComponentDemoComponent, NzButtonModule],
  templateUrl: './button-demo.component.html',
  styleUrl: './button-demo.component.scss',
})
export class ButtonDemoComponent {
  // Конфигурация демо
  readonly config = BUTTON_DEMO_CONFIG;

  // Signal для хранения props preview кнопки
  readonly previewProps = signal<any>({
    size: 'medium',
    type: 'primary',
    disabled: false,
    loading: false,
    text: 'Нажми меня',
  });

  /**
   * Обработчик изменения значений контролов
   */
  onControlValuesChange(values: Record<string, any>): void {
    this.previewProps.set(values);
  }
}
