/**
 * Color Picker Types
 */

export type PickerMode = 'custom-only' | 'picker-only' | 'custom-and-picker';

export interface CustomColor {
  name: string;
  value: string;
  category?: string;
}

export interface PickerConfig {
  mode: PickerMode;
  customColors?: CustomColor[];
  allowTransparent?: boolean;
  defaultColor?: string;
  showInput?: boolean;
  showAlpha?: boolean;
}

export const DEFAULT_CUSTOM_COLORS: CustomColor[] = [
  // 6 базовых цветов Ant Design
  { name: 'Primary', value: '#1890ff', category: 'primary' },
  { name: 'Success', value: '#52c41a', category: 'primary' },
  { name: 'Warning', value: '#faad14', category: 'primary' },
  { name: 'Error', value: '#ff4d4f', category: 'primary' },
  { name: 'Purple', value: '#722ed1', category: 'secondary' },
  { name: 'Cyan', value: '#13c2c2', category: 'secondary' },
];
