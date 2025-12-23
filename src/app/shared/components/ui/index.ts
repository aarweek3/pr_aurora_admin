// src/app/shared/components/ui/index.ts
// ==========================================================
// 1. Прямые экспорты компонентов и директив
// ==========================================================

export * from './alert/alert.component';
export * from './button/button.directive';
export * from './code-block/code-block.component';
export * from './container-help-copy-ui';
export * from './field-group';
export * from './form-field/form-field.component';
export * from './icon';
export * from './input';
export * from './modal';
export * from './pagination';
export * from './password-input/password-input.component';
export * from './phone-input';
export * from './picker/picker.component';
export * from './progress';
export * from './search';
export * from './showcase/showcase.component';
export * from './spinner/spinner.component';
export * from './tag';
export * from './toggle';
export * from './wrapper-ui/wrapper-ui.component';

// ==========================================================
// 2. Коллекции компонентов (Группировка)
// ==========================================================

import { AlertComponent } from './alert/alert.component';
import { ButtonDirective } from './button/button.directive';
import { IconComponent } from './icon';
import { AvProgressComponent } from './progress';
import { AvSpinnerComponent } from './spinner/spinner.component';
import { TagComponent } from './tag';

import { InputComponent, InputDirective } from './input';
import { PasswordInputComponent } from './password-input/password-input.component';
import { PhoneInputComponent } from './phone-input';
import { PickerComponent } from './picker/picker.component';
import { SearchInputComponent } from './search';
import { TagInputComponent } from './tag';
import { ToggleComponent, ToggleDirective, ToggleLabeledComponent } from './toggle';

import { FieldGroupComponent } from './field-group';
import { FormFieldComponent } from './form-field/form-field.component';

import { CodeBlockComponent } from './code-block/code-block.component';
import { HelpCopyContainerComponent } from './container-help-copy-ui';
import { ModalCloseDirective, ModalComponent } from './modal';
import { PaginationComponent } from './pagination';
import { WrapperUiComponent } from './wrapper-ui/wrapper-ui.component';

/** Общий UI: Кнопки, иконки, теги, алерты */
export const AV_GENERAL_UI = [
  ButtonDirective,
  IconComponent,
  TagComponent,
  AlertComponent,
] as const;

/** Формы: Инпуты, тогглы, селекторы, поиск */
export const AV_FORM_UI = [
  InputComponent,
  InputDirective,
  ToggleComponent,
  ToggleDirective,
  ToggleLabeledComponent,
  PhoneInputComponent,
  PasswordInputComponent,
  PickerComponent,
  SearchInputComponent,
  TagInputComponent,
] as const;

/** Структура форм: Группировка и поля */
export const AV_FIELD_UI = [FormFieldComponent, FieldGroupComponent] as const;

/** Обратная связь: Прогресс, спиннеры */
export const AV_FEEDBACK_UI = [AvProgressComponent, AvSpinnerComponent] as const;

/** Утилиты и сложные компоненты: Модалки, пагинация, код */
export const AV_UTILITY_UI = [
  ModalComponent,
  ModalCloseDirective,
  PaginationComponent,
  HelpCopyContainerComponent,
  CodeBlockComponent,
  WrapperUiComponent,
] as const;

/**
 * ПОЛНЫЙ СПИСОК ВСЕХ UI КОМПОНЕНТОВ AURORA ADMIN
 * Рекомендуется использовать для быстрых прототипов
 */
export const AV_UI_COMPONENTS = [
  ...AV_GENERAL_UI,
  ...AV_FORM_UI,
  ...AV_FIELD_UI,
  ...AV_FEEDBACK_UI,
  ...AV_UTILITY_UI,
] as const;
