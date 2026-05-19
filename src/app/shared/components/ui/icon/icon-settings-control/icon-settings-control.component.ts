import { CommonModule } from '@angular/common';
import { Component, computed, input, model, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzColorPickerModule } from 'ng-zorro-antd/color-picker';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSliderModule } from 'ng-zorro-antd/slider';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { ButtonDirective } from '../../button/button.directive';
import { FieldGroupComponent } from '../../field-group/field-group.component';
import { IconComponent } from '../icon.component';
import { AvIconConfig, IconPreset } from '../index';

@Component({
  selector: 'av-icon-settings-control',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzGridModule,
    NzSelectModule,
    NzInputNumberModule,
    NzSwitchModule,
    NzSliderModule,
    NzColorPickerModule,
    NzToolTipModule,
    ButtonDirective,
    IconComponent,
    FieldGroupComponent,
  ],
  templateUrl: './icon-settings-control.component.html',
  styleUrl: './icon-settings-control.component.scss',
})
export class IconSettingsControlComponent {
  // API
  value = model<AvIconConfig>(this.getDefaultConfig());
  presets = input<IconPreset[]>([]);
  compact = input<boolean>(false);

  // UI State
  message = signal<string>('');

  // Color presets for quick selection
  readonly colorPresets = [
    '#1890ff',
    '#52c41a',
    '#faad14',
    '#ff4d4f',
    '#722ed1',
    '#13c2c2',
    '#eb2f96',
    '#f5222d',
    '#fa541c',
    '#a0d911',
    '#1677ff',
    '#2f54eb',
  ];

  // Neutral color presets (white → black)
  readonly neutralColorPresets = [
    '#ffffff', // Белый
    '#e5e7eb', // Светло-серый
    '#9ca3af', // Серый
    '#6b7280', // Средне-серый
    '#374151', // Темно-серый
    '#000000', // Черный
  ];

  // Size presets
  readonly sizePresets = [12, 16, 24, 32];

  // Computed: Icon style for preview
  iconStyle = computed(() => {
    const config = this.value();
    const style: Record<string, string | number> = {
      fontSize: `${config.size}px`,
      color: config.color,
      transform: `
        rotate(${config.rotation}deg)
        scale(${config.scale})
        scaleX(${config.flipX ? -1 : 1})
        scaleY(${config.flipY ? -1 : 1})
      `.trim(),
      opacity: config.opacity,
      padding: `${config.padding}px`,
      backgroundColor: config.background,
      borderRadius: `${config.borderRadius}px`,
      transition: 'all 0.3s ease',
    };

    if (config.borderShow) {
      style['border'] = `${config.borderWidth}px solid ${config.borderColor}`;
    }

    return style;
  });

  // Default configuration
  private getDefaultConfig(): AvIconConfig {
    return {
      type: 'actions/av_check_mark',
      size: 24,
      color: '#1890ff',
      rotation: 0,
      scale: 1,
      opacity: 1,
      flipX: false,
      flipY: false,
      padding: 8,
      background: 'transparent',
      borderShow: false,
      borderColor: '#d9d9d9',
      borderWidth: 1,
      borderRadius: 4,
    };
  }

  // Reset to default
  resetSettings(): void {
    this.value.set(this.getDefaultConfig());
    this.showMessage('Настройки сброшены! 🔄');
  }

  // Update specific property
  updateProperty<K extends keyof AvIconConfig>(key: K, value: AvIconConfig[K]): void {
    this.value.update((config) => ({ ...config, [key]: value }));
  }

  // Quick color selection
  selectColorPreset(color: string): void {
    this.updateProperty('color', color);
    this.showMessage(`Цвет: ${color}`);
  }

  // Reset color to default
  resetColor(): void {
    const defaultColor = this.getDefaultConfig().color;
    this.updateProperty('color', defaultColor);
    this.showMessage(`Цвет сброшен: ${defaultColor}`);
  }

  // Quick size selection
  selectSizePreset(size: number): void {
    this.updateProperty('size', size);
    this.showMessage(`Размер: ${size}px`);
  }

  // Show temporary message
  private showMessage(msg: string): void {
    this.message.set(msg);
    setTimeout(() => this.message.set(''), 2000);
  }
}
