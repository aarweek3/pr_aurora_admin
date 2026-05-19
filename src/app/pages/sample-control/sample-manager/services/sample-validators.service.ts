// sample-validators.service.ts
import { Injectable } from '@angular/core';
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

@Injectable({
  providedIn: 'root',
})
export class SampleValidatorsService {
  // Константы валидации (должны совпадать с серверными)
  static readonly SAMPLE_NAME_MAX_LENGTH = 100;
  static readonly SAMPLE_DESCRIPTION_MAX_LENGTH = 1000;
  static readonly SEARCH_TERM_MAX_LENGTH = 100;
  static readonly SAMPLE_MAX_PAGE_SIZE = 100;

  // Регулярные выражения
  private readonly namePattern = /^[A-Za-z0-9\s\u0400-\u04FF.,!?()-]+$/;

  /**
   * Валидатор для названия родителей
   */
  sampleNameValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null; // required validator handles this
      }

      const value = control.value.toString();

      // Проверка на пустые пробелы
      if (!value.trim()) {
        return { whitespaceOnly: true };
      }

      // Проверка на пробелы в начале/конце
      if (value !== value.trim()) {
        return { hasLeadingTrailingSpaces: true };
      }

      // Проверка длины
      if (value.length > SampleValidatorsService.SAMPLE_NAME_MAX_LENGTH) {
        return {
          maxlength: {
            requiredLength: SampleValidatorsService.SAMPLE_NAME_MAX_LENGTH,
            actualLength: value.length,
          },
        };
      }

      // Проверка на недопустимые символы
      if (!this.namePattern.test(value)) {
        return { invalidCharacter: true };
      }

      return null;
    };
  }

  /**
   * Валидатор для описания родителей
   */
  sampleDescriptionValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }

      const value = control.value.toString();

      // Проверка на пробелы в начале/конце
      if (value !== value.trim()) {
        return { hasLeadingTrailingSpaces: true };
      }

      // Проверка длины
      if (value.length > SampleValidatorsService.SAMPLE_DESCRIPTION_MAX_LENGTH) {
        return {
          maxlength: {
            requiredLength: SampleValidatorsService.SAMPLE_DESCRIPTION_MAX_LENGTH,
            actualLength: value.length,
          },
        };
      }

      return null;
    };
  }

  /**
   * Валидатор для ID родителей
   */
  sampleIdValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }

      const value = Number(control.value);

      if (isNaN(value) || value <= 0) {
        return { invalidId: true };
      }

      return null;
    };
  }

  /**
   * Валидатор для номера страницы
   */
  pageNumberValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }

      const value = Number(control.value);

      if (isNaN(value) || value < 1) {
        return { invalidPageNumber: true };
      }

      return null;
    };
  }

  /**
   * Валидатор для размера страницы
   */
  pageSizeValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }

      const value = Number(control.value);

      if (isNaN(value) || value < 1 || value > SampleValidatorsService.SAMPLE_MAX_PAGE_SIZE) {
        return { invalidPageSize: true };
      }

      return null;
    };
  }

  /**
   * Валидатор для поискового запроса
   */
  searchTermValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }

      const value = control.value.toString();

      // Проверка на пробелы в начале/конце
      if (value !== value.trim()) {
        return { hasLeadingTrailingSpaces: true };
      }

      // Проверка длины
      if (value.length > SampleValidatorsService.SEARCH_TERM_MAX_LENGTH) {
        return {
          maxlength: {
            requiredLength: SampleValidatorsService.SEARCH_TERM_MAX_LENGTH,
            actualLength: value.length,
          },
        };
      }

      return null;
    };
  }

  /**
   * Валидатор для поля сортировки
   */
  sortByValidator(): ValidatorFn {
    const validSortFields = ['name', 'description', 'id'];

    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }

      const value = control.value.toString().toLowerCase();

      if (!validSortFields.includes(value)) {
        return { invalidSortField: { validFields: validSortFields } };
      }

      return null;
    };
  }

  /**
   * Валидатор для направления сортировки
   */
  sortDirectionValidator(): ValidatorFn {
    const validDirections = ['asc', 'desc'];

    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }

      const value = control.value.toString().toLowerCase();

      if (!validDirections.includes(value)) {
        return { invalidSortDirection: { validDirections: validDirections } };
      }

      return null;
    };
  }

  /**
   * Получить сообщение об ошибке для названия родителей
   */
  getSampleNameErrorMessage(errors: ValidationErrors | null): string {
    if (!errors) return '';

    if (errors['required']) {
      return 'Название родителей обязательно.';
    }
    if (errors['whitespaceOnly']) {
      return 'Название родителей не может состоять только из пробелов.';
    }
    if (errors['minlength']) {
      return `Название родителей должно содержать от 1 до ${SampleValidatorsService.SAMPLE_NAME_MAX_LENGTH} символов.`;
    }
    if (errors['maxlength']) {
      return `Название родителей должно содержать от 1 до ${SampleValidatorsService.SAMPLE_NAME_MAX_LENGTH} символов.`;
    }
    if (errors['hasLeadingTrailingSpaces']) {
      return 'Название родителей не должно содержать пробелы в начале или в конце.';
    }
    if (errors['invalidCharacter']) {
      return 'Введен недопустимый символ.';
    }

    return 'Проверьте правильность заполнения поля.';
  }

  /**
   * Получить сообщение об ошибке для описания родителей
   */
  getSampleDescriptionErrorMessage(errors: ValidationErrors | null): string {
    if (!errors) return '';

    if (errors['maxlength']) {
      return `Описание родителей не должно превышать ${SampleValidatorsService.SAMPLE_DESCRIPTION_MAX_LENGTH} символов.`;
    }
    if (errors['hasLeadingTrailingSpaces']) {
      return 'Описание родителей не должно содержать пробелы в начале или в конце.';
    }

    return 'Проверьте правильность заполнения поля.';
  }

  /**
   * Получить сообщение об ошибке для поискового запроса
   */
  getSearchTermErrorMessage(errors: ValidationErrors | null): string {
    if (!errors) return '';

    if (errors['maxlength']) {
      return `Поисковый запрос не должен превышать ${SampleValidatorsService.SEARCH_TERM_MAX_LENGTH} символов.`;
    }
    if (errors['hasLeadingTrailingSpaces']) {
      return 'Поисковый запрос не должен содержать пробелы в начале или в конце.';
    }

    return 'Проверьте правильность заполнения поля.';
  }

  /**
   * Получить сообщение об ошибке для номера страницы
   */
  getPageNumberErrorMessage(errors: ValidationErrors | null): string {
    if (!errors) return '';

    if (errors['required'] || errors['invalidPageNumber']) {
      return 'Номер страницы должен быть положительным.';
    }

    return 'Проверьте правильность заполнения поля.';
  }

  /**
   * Получить сообщение об ошибке для размера страницы
   */
  getPageSizeErrorMessage(errors: ValidationErrors | null): string {
    if (!errors) return '';

    if (errors['required'] || errors['invalidPageSize']) {
      return `Размер страницы должен быть от 1 до ${SampleValidatorsService.SAMPLE_MAX_PAGE_SIZE}.`;
    }

    return 'Проверьте правильность заполнения поля.';
  }

  /**
   * Автоматически обрезать пробелы в значении контрола
   */
  trimControlValue(control: AbstractControl): void {
    if (control.value && typeof control.value === 'string') {
      const trimmedValue = control.value.trim();
      if (trimmedValue !== control.value) {
        control.setValue(trimmedValue);
      }
    }
  }

  /**
   * Проверить, содержит ли значение недопустимые символы для названия
   */
  hasInvalidCharacters(value: string): boolean {
    return !this.namePattern.test(value);
  }

  /**
   * Получить статус валидации поля для UI
   */
  getFieldValidateStatus(
    control: AbstractControl | null,
  ): 'success' | 'warning' | 'error' | 'validating' | '' {
    if (!control) return '';

    if (control.pending) return 'validating';
    if (control.invalid && control.touched) return 'error';
    if (control.valid && control.touched && control.value) return 'success';

    return '';
  }
}
