import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { ButtonDirective } from '../../../shared/components/ui/button/button.directive';
import { HelpCopyContainerComponent } from '../../../shared/components/ui/container-help-copy-ui/container-help-copy-ui.component';
import { ModalComponent } from '../../../shared/components/ui/modal';
import { TagComponent, TagInputComponent } from '../../../shared/components/ui/tag';

@Component({
  selector: 'app-tag-ui',
  standalone: true,
  imports: [
    CommonModule,
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
}
