import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Output, input } from '@angular/core';
import { IconComponent } from '../icon/icon.component';

export type TagSize = 'small' | 'medium' | 'large';
export type TagVariant = 'filled' | 'outlined' | 'soft';
export type TagShape = 'rounded' | 'pill';
export type TagColor = 'primary' | 'success' | 'warning' | 'error' | 'info' | 'neutral' | string;

@Component({
  selector: 'av-tag',
  standalone: true,
  imports: [CommonModule, IconComponent],
  templateUrl: './tag.component.html',
  styleUrl: './tag.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TagComponent {
  label = input<string>('');
  size = input<TagSize>('medium');
  variant = input<TagVariant>('soft');
  color = input<TagColor>('neutral');
  shape = input<TagShape>('rounded');
  removable = input<boolean>(false);
  clickable = input<boolean>(false);
  icon = input<string | null>(null);

  @Output() clicked = new EventEmitter<MouseEvent>();
  @Output() removed = new EventEmitter<MouseEvent>();

  onTagClick(event: MouseEvent): void {
    if (this.clickable()) {
      this.clicked.emit(event);
    }
  }

  onRemoveClick(event: MouseEvent): void {
    event.stopPropagation();
    this.removed.emit(event);
  }

  get isCustomColor(): boolean {
    const standardColors = ['primary', 'success', 'warning', 'error', 'info', 'neutral'];
    return !standardColors.includes(this.color());
  }

  get tagStyles(): Record<string, string> {
    if (!this.isCustomColor) return {};

    const color = this.color();
    const variant = this.variant();

    if (variant === 'filled') {
      return {
        'background-color': color,
        'border-color': color,
        color: '#fff',
      };
    }

    if (variant === 'outlined') {
      return {
        'background-color': 'transparent',
        'border-color': color,
        color: color,
      };
    }

    // soft
    return {
      'background-color': `${color}1a`, // 10% opacity
      'border-color': 'transparent',
      color: color,
    };
  }
}
