import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  ButtonDirective,
  HelpCopyContainerComponent,
  ModalComponent,
  TagColor,
  TagComponent,
  TagInputComponent,
  TagShape,
  TagSize,
  TagVariant,
} from '@shared-ui';

@Component({
  selector: 'app-tag-ui',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TagComponent,
    TagInputComponent,
    ButtonDirective,
    HelpCopyContainerComponent,
    ModalComponent,
  ],
  templateUrl: './tag-ui.component.html',
  styleUrl: './tag-ui.component.scss',
})
export class TagUiComponent {
  showHelpModal = false;
  showPrincipleModal = false;
  showIntegrationModal = false;
  showGeneratedCodeModal = false;
  integrationCode = signal('');
  generatedCode = signal('');

  // Playground Configuration
  playgroundLabel = signal('Interactive Tag');
  playgroundSize = signal<TagSize>('medium');
  playgroundVariant = signal<TagVariant>('soft');
  playgroundColor = signal<TagColor>('primary');
  playgroundShape = signal<TagShape>('rounded');
  playgroundRemovable = signal(false);
  playgroundClickable = signal(false);
  playgroundIcon = signal<string | null>(null);

  // Tag Input Playground
  playgroundTags = signal(['Interactive', 'Playground']);
  playgroundPlaceholder = signal('Add more tags...');
  playgroundAllowDuplicates = signal(false);
  playgroundMaxTags = signal<number | undefined>(undefined);

  // Demo data
  basicTags = ['Angular', 'TypeScript', 'SCSS'];
  inputTags = signal(['Frontend', 'UI/UX']);

  colors = ['primary', 'success', 'warning', 'error', 'info', 'neutral'];
  variants = ['soft', 'filled', 'outlined'];
  sizes = ['small', 'medium', 'large'];

  helpCode = `// РУКОВОДСТВО ПО ИСПОЛЬЗОВАНИЮ TAG SYSTEM

// 1. БАЗОВЫЙ ТЕГ (ОТОБРАЖЕНИЕ)
<av-tag label="Angular" color="primary" variant="soft"></av-tag>

// 2. ТЕГ С ИКОНКОЙ И УДАЛЕНИЕМ
<av-tag
  label="Удалить"
  icon="actions/av_trash"
  [removable]="true"
  (removed)="onRemove()"
></av-tag>

// 3. ВВОД ТЕГОВ (TAG INPUT)
// Поддерживает [(ngModel)] и [formControl]
<av-tag-input
  [(tags)]="myTags"
  placeholder="Добавьте навыки..."
  [allowDuplicates]="false"
  variant="soft"
></av-tag-input>

// 4. КАСТОМНЫЕ ЦВЕТА
<av-tag label="Custom" color="#8b5cf6"></av-tag>`;

  principleCode = `ПРИНЦИП РАБОТЫ СИСТЕМЫ ТЕГОВ

1. РЕАКТИВНОСТЬ (Signals)
   Компоненты используют Angular Signals для эффективного отслеживания изменений
   и минимизации циклов проверки изменений.

2. ГИБКОСТЬ СТИЛИЗАЦИИ
   Поддержка трех основных вариантов (filled, outlined, soft) позволяет
   использовать теги как для акцентных статусов, так и для второстепенных меток.

3. УПРАВЛЕНИЕ ВВОДОМ (Tag Input)
   - Обработка клавиш Enter и Comma для быстрого добавления.
   - Backspace для быстрого удаления последнего элемента.
   - Интеграция с Angular Forms через ControlValueAccessor.

4. ДОСТУПНОСТЬ
   Теги имеют правильные размеры для клика (минимум 20px в высоту)
   и визуальную индикацию фокуса при вводе.`;

  // Code examples
  basicCode = `<av-tag label="Angular"></av-tag>
<av-tag label="TypeScript"></av-tag>
<av-tag label="SCSS"></av-tag>`;

  sizesCode = `<av-tag label="Small Tag" size="small" color="primary"></av-tag>
<av-tag label="Medium Tag" size="medium" color="primary"></av-tag>
<av-tag label="Large Tag" size="large" color="primary"></av-tag>`;

  colorsCode = `<av-tag label="primary" color="primary"></av-tag>
<av-tag label="success" color="success"></av-tag>
<av-tag label="warning" color="warning"></av-tag>
<av-tag label="error" color="error"></av-tag>
<av-tag label="info" color="info"></av-tag>
<av-tag label="neutral" color="neutral"></av-tag>`;

  variantsCode = `<av-tag label="Soft" variant="soft" color="primary"></av-tag>
<av-tag label="Filled" variant="filled" color="primary"></av-tag>
<av-tag label="Outlined" variant="outlined" color="primary"></av-tag>`;

  shapesCode = `<av-tag label="Rounded" shape="rounded" color="primary"></av-tag>
<av-tag label="Pill" shape="pill" color="success"></av-tag>`;

  iconsCode = `<av-tag label="Settings" icon="actions/av_settings" color="neutral"></av-tag>
<av-tag label="User" icon="actions/av_user" color="primary"></av-tag>
<av-tag label="Star" icon="actions/av_star" color="warning"></av-tag>`;

  removableCode = `<av-tag
  label="Angular"
  [removable]="true"
  color="primary"
  (removed)="onTagRemove()">
</av-tag>`;

  clickableCode = `<av-tag
  label="Click me"
  [clickable]="true"
  color="info"
  (clicked)="onTagClick()">
</av-tag>`;

  customColorsCode = `<av-tag label="Purple" color="#8b5cf6" variant="soft"></av-tag>
<av-tag label="Pink" color="#ec4899" variant="filled"></av-tag>
<av-tag label="Teal" color="#14b8a6" variant="outlined"></av-tag>`;

  tagInputCode = `<av-tag-input
  [(tags)]="myTags"
  placeholder="Добавьте навыки..."
  [allowDuplicates]="false"
  variant="soft"
></av-tag-input>

// В компоненте:
myTags = signal(['Frontend', 'UI/UX']);`;

  onTagClick(label: string) {
    console.log('Clicked tag:', label);
  }

  onTagRemove(label: string) {
    console.log('Removed tag:', label);
  }

  // Генерация полного примера интеграции
  generateIntegrationCode(): void {
    const fullCode = `// ============================================
// ПОЛНЫЙ ПРИМЕР ИНТЕГРАЦИИ СИСТЕМЫ ТЕГОВ
// ============================================

// 1. ИМПОРТЫ В КОМПОНЕНТЕ (TypeScript)
import { Component, signal } from '@angular/core';
import { TagComponent, TagInputComponent } from '@shared/components/ui/tag';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [TagComponent, TagInputComponent],
  templateUrl: './user-profile.component.html',
})
export class UserProfileComponent {
  // Состояние тегов
  skills = signal(['Angular', 'TypeScript', 'RxJS']);
  interests = signal(['UI/UX', 'Design Systems']);

  // Статические теги для отображения
  userRoles = ['Admin', 'Developer', 'Designer'];

  // Обработчики событий
  onSkillRemove(skill: string) {
    this.skills.update(current => current.filter(s => s !== skill));
    console.log('Removed skill:', skill);
  }

  onInterestAdd(interest: string) {
    console.log('Added interest:', interest);
  }

  onTagClick(tag: string) {
    console.log('Clicked tag:', tag);
  }
}

// ============================================
// 2. ШАБЛОН (HTML)
// ============================================

<div class="user-profile">
  <!-- Статические теги (только отображение) -->
  <section class="profile-section">
    <h3>Роли пользователя</h3>
    <div class="tags-container">
      @for (role of userRoles; track role) {
        <av-tag
          [label]="role"
          color="primary"
          variant="filled"
          size="medium"
        ></av-tag>
      }
    </div>
  </section>

  <!-- Интерактивные теги с удалением -->
  <section class="profile-section">
    <h3>Навыки</h3>
    <div class="tags-container">
      @for (skill of skills(); track skill) {
        <av-tag
          [label]="skill"
          color="success"
          variant="soft"
          [removable]="true"
          (removed)="onSkillRemove(skill)"
        ></av-tag>
      }
    </div>
  </section>

  <!-- Tag Input для добавления новых тегов -->
  <section class="profile-section">
    <h3>Интересы</h3>
    <av-tag-input
      [(tags)]="interests"
      placeholder="Добавьте интересы..."
      [allowDuplicates]="false"
      variant="soft"
      color="info"
      (tagAdded)="onInterestAdd($event)"
    ></av-tag-input>
  </section>

  <!-- Кликабельные теги -->
  <section class="profile-section">
    <h3>Категории (кликабельные)</h3>
    <div class="tags-container">
      <av-tag
        label="Frontend"
        color="primary"
        [clickable]="true"
        (clicked)="onTagClick('Frontend')"
      ></av-tag>
      <av-tag
        label="Backend"
        color="warning"
        [clickable]="true"
        (clicked)="onTagClick('Backend')"
      ></av-tag>
    </div>
  </section>
</div>

// ============================================
// 3. СТИЛИ (SCSS) - опционально
// ============================================

.user-profile {
  .profile-section {
    margin-bottom: 2rem;

    h3 {
      margin-bottom: 1rem;
      font-size: 1.125rem;
      font-weight: 600;
    }
  }

  .tags-container {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }
}

// ============================================
// 4. ДОПОЛНИТЕЛЬНЫЕ ПРИМЕРЫ
// ============================================

// Работа с FormControl (Reactive Forms)
import { FormControl } from '@angular/forms';

skillsControl = new FormControl(['Angular', 'TypeScript']);

// В шаблоне:
<av-tag-input [formControl]="skillsControl"></av-tag-input>

// Кастомные цвета
<av-tag label="Premium" color="#8b5cf6" variant="filled"></av-tag>

// Теги с иконками
<av-tag
  label="Settings"
  icon="actions/av_settings"
  color="neutral"
></av-tag>`;

    this.integrationCode.set(fullCode);
    this.showIntegrationModal = true;
  }

  // Генерация кода для Playground
  generatePlaygroundCode(): void {
    const isTagInput = this.playgroundTags().length > 0; // Simplified check or separate buttons

    const tagHtml = `<av-tag
  label="${this.playgroundLabel()}"
  size="${this.playgroundSize()}"
  variant="${this.playgroundVariant()}"
  color="${this.playgroundColor()}"
  shape="${this.playgroundShape()}"
  [removable]="${this.playgroundRemovable()}"
  [clickable]="${this.playgroundClickable()}"
  ${this.playgroundIcon() ? `icon="${this.playgroundIcon()}"` : ''}
></av-tag>`;

    const tagInputHtml = `<av-tag-input
  [(tags)]="myTags"
  placeholder="${this.playgroundPlaceholder()}"
  [allowDuplicates]="${this.playgroundAllowDuplicates()}"
  ${this.playgroundMaxTags() ? `[maxTags]="${this.playgroundMaxTags()}"` : ''}
  variant="${this.playgroundVariant()}"
  color="${this.playgroundColor()}"
></av-tag-input>`;

    const tsCode = `// Состояние в коппоненте
myTags = signal(${JSON.stringify(this.playgroundTags())});`;

    const fullCode = `// HTML (Tag)\n${tagHtml}\n\n// HTML (Tag Input)\n${tagInputHtml}\n\n// TypeScript\n${tsCode}`;

    this.generatedCode.set(fullCode);
    this.showGeneratedCodeModal = true;
  }
}
