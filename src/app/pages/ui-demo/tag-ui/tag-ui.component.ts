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

  onTagClick(label: string) {
    console.log('Clicked tag:', label);
  }

  onTagRemove(label: string) {
    console.log('Removed tag:', label);
  }
}
