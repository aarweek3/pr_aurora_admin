import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AV_UI_COMPONENTS } from '@shared/components/ui';
import { AvIconConfig, IconSettingsControlComponent } from '@shared/components/ui/icon';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSliderModule } from 'ng-zorro-antd/slider';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';

@Component({
  selector: 'app-button-ui-new',
  standalone: true,
  imports: [
    FormsModule,
    NzCardModule,
    NzGridModule,
    NzInputModule,
    NzSelectModule,
    NzSwitchModule,
    NzSliderModule,
    NzInputNumberModule,
    NzToolTipModule,
    AV_UI_COMPONENTS,
    IconSettingsControlComponent,
  ],
  templateUrl: './button-ui-new.component.html',
  styleUrl: './button-ui-new.component.scss',
})
export class ButtonUiNewComponent {
  // Page info
  pageTitle = signal('Buttons Directive Playground ⭐');
  pageDescription = signal(
    'Интерактивная площадка для тестирования новой директивы av-button с поддержкой всех современных возможностей Aurora Admin.',
  );

  // Visibility state
  isSection1Visible = signal(true);
  isSection2Visible = signal(true);
  isSection3Visible = signal(true);
  isSection4Visible = signal(true);
  isSection5Visible = signal(true);

  // Technical Interface
  section1Title = signal('Interface: AvButtonProps');
  section1BgColor = signal('#0a0e1a');
  section1Content = signal(`/**
 * @directive av-button
 * Накладывается на нативные элементы <button> или <a>
 */
export interface AvButtonProps {
  avType: 'primary' | 'default' | 'dashed' | 'text' | 'link' | 'danger';
  avSize: 'small' | 'default' | 'large' | 'square';
  avLoading: boolean;
  avBlock: boolean;
  avVisible: boolean;
  avShape: 'default' | 'circle' | 'square' | 'round' | 'rounded' | 'rounded-big';
  avWidth: string | number | null;
  avHeight: string | number | null;
  avRadius: string | number | null;
  avIconSize: string | number | null;
  avColor: string | null;
  avIconColor: string | null;
  avTextColor: string | null;
  clicked: EventEmitter<MouseEvent>;
}`);
  section1HelpContent = signal(`Директива av-button расширяет возможности стандартных кнопок.
Она позволяет управлять формой, цветами, состоянием загрузки и анимациями без создания лишних оберток в DOM.`);

  // Placeholder for content sections
  placeholderText1 = signal('Здесь будут примеры различных типов кнопок...');
  placeholderText2 = signal('Рекомендации по использованию кнопок в интерфейсе...');
  placeholderText3 = signal('Решение типичных проблем при подключении директивы...');

  // Playground - State
  pgType = signal<'primary' | 'default' | 'dashed' | 'text' | 'link' | 'danger'>('primary');
  pgSize = signal<'small' | 'default' | 'large' | 'square' | 'custom'>('default');
  pgShape = signal<'default' | 'circle' | 'square' | 'round' | 'rounded' | 'rounded-big'>(
    'default',
  );
  pgLoading = signal(false);
  pgVisible = signal(true);
  pgBlock = signal(false);
  pgLabel = signal('Custom Button');

  // Playground - Colors
  pgColor = signal<string>('');
  pgTextColor = signal<string>('');

  // Playground - Geometry
  pgWidth = signal<string | number | null>(null);
  pgHeight = signal<string | number | null>(null);
  pgRadius = signal<string | number | null>(null);

  // Playground - Advanced Icon Controls
  pgIconConfig = signal<AvIconConfig>({
    type: null,
    size: 16,
    color: '',
    rotation: 0,
    scale: 1,
    opacity: 1,
    flipX: false,
    flipY: false,
    padding: 0,
    background: '',
    borderShow: false,
    borderColor: '#d9d9d9',
    borderWidth: 1,
    borderRadius: 0,
  });

  // Computeds for safety
  safePgSize = computed(() => (this.pgSize() === 'custom' ? 'default' : this.pgSize()) as any);

  // Section titles
  section2Title = signal('🎮 Интерактивная площадка');
  section3Title = signal('📖 Примеры использования');
  section4Title = signal('💡 Рекомендации');
  section5Title = signal('🛠️ Траблшутинг');

  // Icons List for Playground (Same as Icon Control UI)
  readonly iconPresets = [
    { category: 'actions', value: 'actions/av_add', label: 'Add' },
    { category: 'actions', value: 'actions/av_check_mark', label: 'Check Mark' },
    { category: 'actions', value: 'actions/av_close', label: 'Close' },
    { category: 'actions', value: 'actions/av_copy', label: 'Copy' },
    { category: 'actions', value: 'actions/av_eye', label: 'Eye' },
    { category: 'actions', value: 'actions/av_plus', label: 'Plus' },
    { category: 'actions', value: 'actions/av_search', label: 'Search' },
    { category: 'actions', value: 'actions/av_trash', label: 'Trash' },
    { category: 'actions', value: 'actions/av_upload', label: 'Upload' },
    { category: 'arrows', value: 'arrows/av_arrow-down', label: 'Arrow Down' },
    { category: 'arrows', value: 'arrows/av_arrow-left', label: 'Arrow Left' },
    { category: 'arrows', value: 'arrows/av_arrow-right', label: 'Arrow Right' },
    { category: 'arrows', value: 'arrows/av_arrow-up', label: 'Arrow Up' },
    { category: 'arrows', value: 'arrows/av_chevron-down', label: 'Chevron Down' },
    { category: 'arrows', value: 'arrows/av_chevron-left', label: 'Chevron Left' },
    { category: 'arrows', value: 'arrows/av_chevron-right', label: 'Chevron Right' },
    { category: 'arrows', value: 'arrows/av_chevron-up', label: 'Chevron Up' },
    { category: 'arrows', value: 'arrows/av_expand', label: 'Expand' },
    { category: 'general', value: 'general/av_home', label: 'Home' },
    { category: 'general', value: 'general/av_tag', label: 'Tag' },
    { category: 'settings', value: 'settings/av_bell', label: 'Bell' },
    { category: 'settings', value: 'settings/av_camera', label: 'Camera' },
    { category: 'settings', value: 'settings/av_cog', label: 'Cog' },
    { category: 'settings', value: 'settings/av_info', label: 'Info' },
    { category: 'user', value: 'user/av_profile', label: 'Profile' },
  ];

  pgGeneratedCode = computed(() => {
    const iconConfig = this.pgIconConfig();
    let code = `<button av-button\n  avType="${this.pgType()}"`;

    if (this.pgSize() !== 'default' && this.pgSize() !== 'custom') {
      code += `\n  avSize="${this.pgSize()}"`;
    }
    if (this.pgShape() !== 'default') {
      code += `\n  avShape="${this.pgShape()}"`;
    }
    if (this.pgLoading()) code += `\n  [avLoading]="true"`;
    if (this.pgBlock()) code += `\n  [avBlock]="true"`;
    if (!this.pgVisible()) code += `\n  [avVisible]="false"`;

    if (this.pgColor()) code += `\n  avColor="${this.pgColor()}"`;
    if (this.pgTextColor()) code += `\n  avTextColor="${this.pgTextColor()}"`;
    if (iconConfig.color) code += `\n  avIconColor="${iconConfig.color}"`;

    if (this.pgWidth()) code += `\n  avWidth="${this.pgWidth()}"`;
    if (this.pgHeight()) code += `\n  avHeight="${this.pgHeight()}"`;
    if (this.pgRadius()) code += `\n  avRadius="${this.pgRadius()}"`;

    if (iconConfig.size !== 16) code += `\n  avIconSize="${iconConfig.size}"`;

    code += `\n>`;

    if (iconConfig.type) {
      let iconCode = `\n  <av-icon\n    type="${iconConfig.type}"\n    [size]="${iconConfig.size}"`;
      if (iconConfig.color) iconCode += `\n    color="${iconConfig.color}"`;
      if (iconConfig.rotation !== 0) iconCode += `\n    [rotation]="${iconConfig.rotation}"`;
      if (iconConfig.scale !== 1) iconCode += `\n    [scale]="${iconConfig.scale}"`;
      if (iconConfig.opacity !== 1) iconCode += `\n    [opacity]="${iconConfig.opacity}"`;
      if (iconConfig.flipX) iconCode += `\n    [flipX]="true"`;
      if (iconConfig.flipY) iconCode += `\n    [flipY]="true"`;
      if (iconConfig.padding > 0) iconCode += `\n    [padding]="${iconConfig.padding}"`;
      if (iconConfig.background) iconCode += `\n    background="${iconConfig.background}"`;
      if (iconConfig.borderShow) {
        const border = `${iconConfig.borderWidth}px solid ${iconConfig.borderColor}`;
        iconCode += `\n    border="${border}"`;
        if (iconConfig.borderRadius > 0) iconCode += `\n    [radius]="${iconConfig.borderRadius}"`;
      }
      iconCode += `\n  ></av-icon>`;
      code += iconCode;

      if (this.pgLabel()) {
        code += `\n  <span style="margin-left: 8px;">${this.pgLabel()}</span>`;
      }
    } else {
      code += `\n  ${this.pgLabel()}`;
    }

    code += `\n</button>`;
    return code;
  });

  // Toggles
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

  resetAllSettings() {
    this.pgType.set('primary');
    this.pgSize.set('default');
    this.pgShape.set('default');
    this.pgLoading.set(false);
    this.pgVisible.set(true);
    this.pgBlock.set(false);
    this.pgLabel.set('Custom Button');

    // Reset Colors
    this.pgColor.set('');
    this.pgTextColor.set('');

    // Reset Geometry
    this.pgWidth.set(null);
    this.pgHeight.set(null);
    this.pgRadius.set(null);

    // Reset Icon
    this.pgIconConfig.set({
      type: null,
      size: 16,
      color: '',
      rotation: 0,
      scale: 1,
      opacity: 1,
      flipX: false,
      flipY: false,
      padding: 0,
      background: '',
      borderShow: false,
      borderColor: '#d9d9d9',
      borderWidth: 1,
      borderRadius: 0,
    });
  }
}
