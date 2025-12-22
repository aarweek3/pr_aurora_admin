import { CommonModule } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonDirective } from '@shared/components/ui/button/button.directive';
import { InputDirective } from '@shared/components/ui/input/input.directive';
import { ContainerUiHelpBaseComponent } from '@shared/containers/ui-help/container-ui-help-base/container-ui-help-base.component';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { HelpCopyContainerComponent } from '../../../shared/components/ui/container-help-copy-ui/container-help-copy-ui.component';
import { FieldGroupComponent } from '../../../shared/components/ui/field-group';
import { IconComponent } from '../../../shared/components/ui/icon/icon.component';
import { PickerComponent } from '../../../shared/components/ui/picker/picker.component';

@Component({
  selector: 'app-field-group-ui',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzCardModule,
    NzGridModule,
    NzInputModule,
    NzSelectModule,
    NzSwitchModule,
    FieldGroupComponent,
    IconComponent,
    HelpCopyContainerComponent,
    PickerComponent,
    ContainerUiHelpBaseComponent,
    ButtonDirective,
    InputDirective,
  ],
  templateUrl: './field-group-ui.component.html',
  styleUrl: './field-group-ui.component.scss',
})
export class FieldGroupUiComponent {
  isSection1Visible = signal(true);
  isSection2Visible = signal(true);
  isSection3Visible = signal(true);
  isSection4Visible = signal(true);

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

  // Section 1 - Technical Interface
  section1Title = 'Interface: FieldGroupComponent';
  section1BgColor = '#0a0e1a';
  section1Content = `// Свойства компонента FieldGroupComponent
export interface FieldGroupProps {
  label?: string;                    // Текст заголовка группы
  variant?: 'block' | 'default' | 'minimal' | 'filled' | 'highlighted';
  size?: 'small' | 'medium' | 'large';
  shape?: 'square' | 'default' | 'rounded' | 'rounded-big'; // Форма углов
  radius?: string | number;         // Произвольное скругление (px)
  collapsible?: boolean;            // Включить механизм сворачивания
  isCollapsed?: boolean;            // Состояние (model для двусторонней привязки)

  // Дополнительные настройки фона
  showBackground?: boolean;         // Отображать ли фон области по умолчанию
  hoverBackground?: 'none' | 'intensify'; // Поведение фона при наведении

  // Кастомные цвета (принимают любые CSS цвета)
  labelColor?: string;              // Цвет текста заголовка
  labelColorHover?: string;         // Цвет текста при наведении
  arrowColor?: string;              // Цвет стрелки сворачивания
  arrowColorHover?: string;         // Цвет стрелки при наведении
  borderColor?: string;             // Цвет рамки
  borderColorHover?: string;        // Цвет рамки при наведении
  headerBgColor?: string;           // Цвет фона подложки заголовка
  headerBgColorHover?: string;      // Цвет фона подложки заголовка при наведении
}

// Селектор: av-field-group
// Значения по умолчанию:
// variant: 'block' | size: 'medium' | shape: 'default' | collapsible: false`;

  // Section 4 mock state
  emailNotifications = signal(false);
  smsNotifications = signal(true);

  // Demo state
  userName = signal('');
  email = signal('');
  phone = signal('');
  city = signal('');
  country = signal('');
  acceptTerms = signal(false);
  newsletter = signal(true);
  selectedVariant = signal<'block' | 'default' | 'minimal' | 'filled' | 'highlighted'>('block');
  selectedSize = signal<'small' | 'medium' | 'large'>('medium');
  isCollapsible = signal(true);
  isCollapsed = signal(false);
  showLabel = signal(true);

  // Advanced Styles State
  showBg = signal(false);
  hoverBgMode = signal<'none' | 'intensify'>('intensify');
  selectedShape = signal<'square' | 'default' | 'rounded' | 'rounded-big'>('default');
  customRadius = signal<string | number | null>(null);

  // Colors
  labelColor = signal('#8c8c8c');
  labelColorHover = signal('#1890ff');
  arrowColor = signal('#8c8c8c');
  arrowColorHover = signal('#1890ff');
  borderColor = signal('#dcdee0');
  borderColorHover = signal('#1890ff');
  headerBgColor = signal('#ffffff');
  headerBgColorHover = signal('#ffffff');
  contentBgColor = signal('rgba(24, 144, 255, 0.02)');
  contentBgColorHover = signal('rgba(24, 144, 255, 0.05)');

  // Preview Width State (Responsive Simulator)
  previewWidth = signal<string>('100%');

  // Control state for pickers
  activePicker = signal<string | null>(null);

  togglePicker(id: string) {
    if (this.activePicker() === id) {
      this.activePicker.set(null);
    } else {
      this.activePicker.set(id);
    }
  }

  readonly variants = [
    { value: 'block', label: 'Block (растягиваемый блок)' },
    { value: 'default', label: 'Default (обычная рамка)' },
    { value: 'minimal', label: 'Minimal (пунктир)' },
    { value: 'filled', label: 'Filled (заливка без рамки)' },
    { value: 'highlighted', label: 'Highlighted (выделенная)' },
  ];

  readonly sizes = [
    { value: 'small', label: 'Small' },
    { value: 'medium', label: 'Medium' },
    { value: 'large', label: 'Large' },
  ];

  readonly shapes = [
    { value: 'square', label: 'Прямоугольные (0px)' },
    { value: 'default', label: 'Обычные (4px)' },
    { value: 'rounded', label: 'Скругленные (8px)' },
    { value: 'rounded-big', label: 'Сильно скругленные (16px)' },
  ];

  readonly exampleBasic = `<!-- Базовый вариант (Block) - без рамки, фон появляется при наведении -->
<av-field-group label="Персональные данные">
  <input av-input placeholder="Введите имя..." />
</av-field-group>

<!-- Свернутый по умолчанию -->
<av-field-group label="Дополнительно" [collapsible]="true" [(isCollapsed)]="isCollapsed">
  <p>Скрытый контент...</p>
</av-field-group>`;

  readonly exampleButtons = `<!-- С кнопками и кастомным цветом -->
<av-field-group label="Действия" [labelColor]="'#ff4d4f'">
  <div style="display: flex; gap: 8px;">
    <button av-button avType="primary">Сохранить</button>
    <button av-button avType="default">Отмена</button>
  </div>
</av-field-group>`;

  readonly exampleVariants = `<!-- Варианты стилей -->
<av-field-group label="Default стиль">
  <input av-input placeholder="Обычная рамка с фоном" />
</av-field-group>

<av-field-group label="Minimal стиль" variant="minimal">
  <input av-input placeholder="Пунктирная рамка без фона" />
</av-field-group>

<av-field-group label="Filled стиль" variant="filled">
  <input av-input placeholder="Заливка без рамки" />
</av-field-group>

<av-field-group label="Highlighted стиль" variant="highlighted">
  <input av-input placeholder="Выделенная рамка" />
</av-field-group>`;

  readonly exampleSizes = `<!-- Размеры -->
<av-field-group label="Small размер" size="small">
  <input av-input placeholder="Маленький размер" />
</av-field-group>

<av-field-group label="Medium размер" size="medium">
  <input av-input placeholder="Средний размер (по умолчанию)" />
</av-field-group>

<av-field-group label="Large размер" size="large">
  <input av-input placeholder="Большой размер" />
</av-field-group>`;

  readonly exampleShapes = `<!-- 1. Прямоугольный (0px) -->
<av-field-group label="Square" shape="square">
  <input avInput placeholder="Прямоугольные углы" />
</av-field-group>

<!-- 2. Обычный (4px - Default) -->
<av-field-group label="Default (4px)">
  <input avInput placeholder="Стандартное скругление" />
</av-field-group>

<!-- 3. Скругленный (8px) -->
<av-field-group label="Rounded (8px)" shape="rounded">
  <input avInput placeholder="Заметное скругление" />
</av-field-group>

<!-- 4. Сильно скругленный (16px) -->
<av-field-group label="Rounded-Big (16px)" shape="rounded-big">
  <input avInput placeholder="Мягкое скругление" />
</av-field-group>

<!-- 5. Кастомный радиус -->
<av-field-group label="Custom Radius (24px)" [radius]="24">
  <input avInput placeholder="Произвольное значение" />
</av-field-group>`;

  readonly exampleComplex = `<!-- Сложная форма -->
<av-field-group label="Адрес доставки">
  <div nz-row [nzGutter]="16">
    <div nz-col [nzSpan]="12">
      <input av-input placeholder="Город" />
    </div>
    <div nz-col [nzSpan]="12">
      <input av-input placeholder="Страна" />
    </div>
  </div>
</av-field-group>

<av-field-group label="Настройки уведомлений" variant="filled">
  <div style="display: flex; flex-direction: column; gap: 12px;">
    <label style="display: flex; justify-content: space-between;">
      <span>Email уведомления</span>
      <nz-switch [(ngModel)]="emailNotifications"></nz-switch>
    </label>
    <label style="display: flex; justify-content: space-between;">
      <span>SMS уведомления</span>
      <nz-switch [(ngModel)]="smsNotifications"></nz-switch>
    </label>
  </div>
</av-field-group>`;

  readonly exampleIcons = `<!-- С иконками и настроенным фоном -->
<av-field-group
  label="Статус системы"
  [showBackground]="true"
  [contentBackground]="'rgba(82, 196, 26, 0.05)'"
>
  <div style="display: flex; align-items: center; gap: 12px;">
    <av-icon type="actions/av_check_mark" [size]="24" color="#52c41a"></av-icon>
    <span style="color: #52c41a; font-weight: 500;">Все системы работают штатно</span>
  </div>
</av-field-group>`;

  // Documentation Section
  sectionDocumentation = `
    <h3>Описание компонента FieldGroup</h3>
    <p>Компонент предназначен для логической группировки элементов управления в формы. Он создает визуальную границу (коробку или линию) и предоставляет удобный интерфейс для управления состоянием группы.</p>

    <h4>1. Основные режимы (Variants)</h4>
    <ul>
      <li><strong>Block (Default):</strong> Легкий режим без постоянной рамки. Идеален для разделения страницы на секции.</li>
      <li><strong>Default:</strong> Классическая группа с тонкой рамкой и легким фоном.</li>
      <li><strong>Minimal:</strong> Использует пунктирную линию. Подходит для второстепенных настроек.</li>
      <li><strong>Filled:</strong> Без рамки, сплошная заливка цветом.</li>
      <li><strong>Highlighted:</strong> Акцентная синяя рамка для важных блоков.</li>
    </ul>

    <h4>2. Углы и скругления (Corners)</h4>
    <p>Компонент предоставляет гибкие средства для управления формой углов:</p>
    <ul>
      <li><strong>Square:</strong> Строгие прямоугольные углы (0px).</li>
      <li><strong>Default:</strong> Тонкое скругление (4px), подходящее для большинства интерфейсов.</li>
      <li><strong>Rounded:</strong> Выраженное скругление (8px).</li>
      <li><strong>Rounded-big:</strong> Мягкие, сильно скругленные углы (16px).</li>
      <li><strong>Custom Radius:</strong> Через вход <code>[radius]</code> можно задать любое значение (число или строку с единицами измерения).</li>
    </ul>

    <h4>3. Механизм сворачивания (Collapsing)</h4>
    <p>Компонент поддерживает интеллектуальное сворачивание:</p>
    <ul>
      <li>При включенном <code>[collapsible]="true"</code> в заголовке появляется интерактивная стрелка.</li>
      <li>В <strong>свернутом состоянии</strong> дизайн автоматически меняется: рамка исчезает, а заголовок превращается в стильный разделитель с горизонтальной линией (<code>Надпись ---</code>). Это позволяет экономить вертикальное пространство.</li>
      <li>Состояние можно контролировать через <code>[(isCollapsed)]</code> (двусторонняя привязка кода).</li>
    </ul>

    <h4>3. Система кастомизации</h4>
    <p>Вы можете переопределить любой цвет компонента через Inputs. Это особенно полезно для статусных групп (ошибки, уведомления, успех). Компонент автоматически обрабатывает состояния наведения (Hover), плавно анимируя переходы цветов.</p>

    <h4>4. Адаптивность</h4>
    <p>Компонент занимает 100% ширины родителя и корректно работает внутри любых Grid или Flex контейнеров. Внутреннее содержимое (<code>ng-content</code>) автоматически получает полную ширину и отступы согласно выбранному размеру (<code>size</code>).</p>
  `;

  generatedCode = computed(() => {
    const variant = this.selectedVariant();
    const size = this.selectedSize();
    const collapsible = this.isCollapsible();
    const isCollapsed = this.isCollapsed();
    const showLabel = this.showLabel();
    const showBg = this.showBg();
    const hoverBgMode = this.hoverBgMode();
    const shape = this.selectedShape();
    const radius = this.customRadius();

    let attrs = '';
    if (showLabel) attrs += ' label="Демо поле"';
    if (variant !== 'block') attrs += ` variant="${variant}"`;
    if (size !== 'medium' && variant !== 'block') attrs += ` size="${size}"`;
    if (shape !== 'default') attrs += ` shape="${shape}"`;
    if (radius !== null && radius !== '')
      attrs += ` [radius]="${typeof radius === 'number' ? radius : "'" + radius + "'"}"`;
    if (collapsible) attrs += ' [collapsible]="true"';
    if (isCollapsed) attrs += ' [(isCollapsed)]="isCollapsed"';

    // Style attrs
    if (showBg) attrs += ' [showBackground]="true"';
    if (hoverBgMode !== 'none') attrs += ` hoverBackground="${hoverBgMode}"`;

    // Colors (only if changed from default - simplified for demo)
    if (this.labelColor() !== '#8c8c8c') attrs += `\n    [labelColor]="'${this.labelColor()}'"`;
    if (this.labelColorHover() !== '#1890ff')
      attrs += `\n    [labelColorHover]="'${this.labelColorHover()}'"`;
    if (this.borderColor() !== '#dcdee0') attrs += `\n    [borderColor]="'${this.borderColor()}'"`;
    if (this.borderColorHover() !== '#1890ff')
      attrs += `\n    [borderColorHover]="'${this.borderColorHover()}'"`;

    return `<av-field-group${attrs}\n  >\n  <input av-input placeholder="Введите текст..." />\n</av-field-group>`;
  });

  submitForm(): void {
    console.log('Form submitted:', {
      userName: this.userName(),
      email: this.email(),
      phone: this.phone(),
      city: this.city(),
      country: this.country(),
      acceptTerms: this.acceptTerms(),
      newsletter: this.newsletter(),
    });
    alert('Форма отправлена! Проверьте консоль для деталей.');
  }

  resetForm(): void {
    this.userName.set('');
    this.email.set('');
    this.phone.set('');
    this.city.set('');
    this.country.set('');
    this.acceptTerms.set(false);
    this.newsletter.set(true);
    this.isCollapsible.set(true);
    this.isCollapsed.set(false);
    this.showBg.set(false);
    this.hoverBgMode.set('intensify');
    this.labelColor.set('#8c8c8c');
    this.labelColorHover.set('#1890ff');
    this.arrowColor.set('#8c8c8c');
    this.arrowColorHover.set('#1890ff');
    this.borderColor.set('#dcdee0');
    this.borderColorHover.set('#1890ff');
    this.headerBgColor.set('#ffffff');
    this.headerBgColorHover.set('#ffffff');
    this.contentBgColor.set('rgba(24, 144, 255, 0.02)');
    this.contentBgColorHover.set('rgba(24, 144, 255, 0.05)');
    this.selectedShape.set('default');
    this.customRadius.set(null);
    this.activePicker.set(null);
  }
}
