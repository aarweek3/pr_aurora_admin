import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonDirective } from '@shared/components/ui/button/button.directive';
import { HelpCopyContainerComponent } from '@shared/components/ui/container-help-copy-ui/container-help-copy-ui.component';
import { IconComponent } from '@shared/components/ui/icon/icon.component';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSwitchModule } from 'ng-zorro-antd/switch';

@Component({
  selector: 'app-container-ui-help-base',
  standalone: true,
  imports: [
    FormsModule,
    NzCardModule,
    NzGridModule,
    NzInputModule,
    NzSelectModule,
    NzSwitchModule,
    ButtonDirective,
    HelpCopyContainerComponent,
    IconComponent,
  ],
  templateUrl: './container-ui-help-base.component.html',
  styleUrl: './container-ui-help-base.component.scss',
})
export class ContainerUiHelpBaseComponent {
  isSection1Visible = signal(true);
  isSection2Visible = signal(true);
  isSection3Visible = signal(true);
  isSection4Visible = signal(true);
  isSection5Visible = signal(true);

  // Playground - Button properties
  pgButtonType = signal<'primary' | 'default' | 'dashed' | 'text' | 'link' | 'danger'>('primary');
  pgButtonSize = signal<'small' | 'default' | 'large'>('default');
  pgButtonShape = signal<'default' | 'circle' | 'square' | 'round' | 'rounded'>('default');

  toggleSection1() {
    this.isSection1Visible.set(!this.isSection1Visible());
  }

  toggleSection2() {
    this.isSection2Visible.set(!this.isSection2Visible());
  }

  toggleSection3() {
    this.isSection3Visible.set(!this.isSection3Visible());
  }

  toggleSection4() {
    this.isSection4Visible.set(!this.isSection4Visible());
  }

  toggleSection5() {
    this.isSection5Visible.set(!this.isSection5Visible());
  }

  // Section 1 - Technical Interface
  section1Title = 'Interface: ComponentProps';
  section1BgColor = '#0a0e1a';
  section1Content = `/**
 * Технический интерфейс компонента
 */
export interface ComponentProps {
  // Основные параметры
  title?: string;           // Заголовок компонента
  subtitle?: string;        // Подзаголовок
  size?: 'small' | 'medium' | 'large';  // Размер

  // Состояние
  disabled?: boolean;       // Отключен ли компонент
  loading?: boolean;        // Состояние загрузки
  visible?: boolean;        // Видимость

  // Стилизация
  className?: string;       // CSS класс
  style?: React.CSSProperties; // Inline стили
}`;

  section1HelpContent = `/**
 * Технический интерфейс компонента
 */

Основные возможности:
1. Гибкая настройка размеров через size
2. Управление состоянием (disabled, loading, visible)
3. Кастомизация внешнего вида через className и style
4. Поддержка заголовков и подзаголовков

Используйте TypeScript для автодополнения и проверки типов.`;

  pgGeneratedCode = computed(() => {
    let code = `<button av-button`;

    code += `\n  avType="${this.pgButtonType()}"`;
    code += `\n  avSize="${this.pgButtonSize()}"`;

    if (this.pgButtonShape() !== 'default') {
      code += `\n  avShape="${this.pgButtonShape()}"`;
    }

    code += `\n>\n  Кнопка ${this.pgButtonType()}\n</button>`;

    return code;
  });

  resetAllSettings() {
    this.pgButtonType.set('primary');
    this.pgButtonSize.set('default');
    this.pgButtonShape.set('default');
  }
}
