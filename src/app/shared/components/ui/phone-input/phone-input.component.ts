// src/app/shared/components/ui/phone-input/phone-input.component.ts
import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  forwardRef,
  inject,
  Injector,
  Input,
  OnInit,
  signal,
} from '@angular/core';
import {
  AbstractControl,
  ControlValueAccessor,
  NgControl,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  ValidationErrors,
  Validator,
} from '@angular/forms';
import { Country, getSortedCountries } from './phone-input.models';

@Component({
  selector: 'av-phone-input',
  standalone: true,
  imports: [CommonModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PhoneInputComponent),
      multi: true,
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => PhoneInputComponent),
      multi: true,
    },
  ],
  templateUrl: './phone-input.component.html',
  styleUrl: './phone-input.component.scss',
})
export class PhoneInputComponent implements ControlValueAccessor, Validator, OnInit {
  private injector = inject(Injector);

  @Input() disabled = false;
  @Input() defaultCountry = 'UA'; // Код страны по умолчанию

  // Signals
  selectedCountry = signal<Country>(
    getSortedCountries().find((c) => c.code === this.defaultCountry) || getSortedCountries()[0],
  );
  phoneNumber = signal('');
  dropdownOpen = signal(false);
  searchQuery = signal('');
  filteredCountries = signal<Country[]>(getSortedCountries());

  @Input() id = '';
  private el = inject(ElementRef);

  get inputId(): string {
    return this.id || this.el.nativeElement.id;
  }

  // Form control reference
  public ngControl: NgControl | null = null;

  // ControlValueAccessor
  private onChange: (value: string) => void = () => {
    /* no-op */
  };
  onTouched: () => void = () => {
    /* no-op */
  };

  constructor() {
    // Close dropdown when clicking outside
    if (typeof document !== 'undefined') {
      document.addEventListener('click', (event: MouseEvent) => {
        const target = event.target as HTMLElement;
        if (!target.closest('.av-phone-input')) {
          this.dropdownOpen.set(false);
        }
      });
    }
  }

  ngOnInit(): void {
    // Get reference to NgControl
    this.ngControl = this.injector.get(NgControl, null);
  }

  // Check if control is invalid and touched
  isInvalid(): boolean {
    return !!(
      this.ngControl?.control &&
      this.ngControl.control.invalid &&
      this.ngControl.control.touched
    );
  }

  // Check if control is valid and has value
  isValid(): boolean {
    return !!(
      this.ngControl?.control &&
      this.ngControl.control.valid &&
      this.ngControl.control.value
    );
  }

  onComponentClick(event: Event): void {
    event.stopPropagation();
  }

  toggleDropdown(event: Event): void {
    event.stopPropagation();
    if (!this.disabled) {
      this.dropdownOpen.update((v) => !v);
      if (this.dropdownOpen()) {
        this.searchQuery.set('');
        this.filteredCountries.set(getSortedCountries());
      }
    }
  }

  selectCountry(country: Country): void {
    this.selectedCountry.set(country);
    this.dropdownOpen.set(false);
    this.phoneNumber.set(''); // Reset phone number when country changes
    this.emitValue();
  }

  onSearchInput(event: Event): void {
    const query = (event.target as HTMLInputElement).value.toLowerCase();
    this.searchQuery.set(query);

    const filtered = getSortedCountries().filter(
      (country) =>
        country.name.toLowerCase().includes(query) ||
        country.nameEn.toLowerCase().includes(query) ||
        country.dialCode.includes(query) ||
        country.code.toLowerCase().includes(query),
    );

    this.filteredCountries.set(filtered);
  }

  onPhoneInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value;

    // Format phone number according to country format
    const formatted = this.formatPhoneNumber(value);
    this.phoneNumber.set(formatted);

    // Update input value
    input.value = formatted;

    this.emitValue();
  }

  formatPhoneNumber(value: string): string {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');

    const country = this.selectedCountry();
    const format = country.format;

    // Limit to maxLength
    const limitedDigits = digits.substring(0, country.maxLength);

    // Apply format mask
    let formatted = '';
    let digitIndex = 0;

    for (let i = 0; i < format.length && digitIndex < limitedDigits.length; i++) {
      const char = format[i];
      if (char === '#') {
        formatted += limitedDigits[digitIndex];
        digitIndex++;
      } else {
        formatted += char;
      }
    }

    return formatted;
  }

  emitValue(): void {
    const fullNumber = this.phoneNumber()
      ? `${this.selectedCountry().dialCode}${this.phoneNumber().replace(/\D/g, '')}`
      : '';
    this.onChange(fullNumber);
  }

  // ControlValueAccessor Implementation
  writeValue(value: string): void {
    if (value) {
      // Parse the value to extract country code and phone number
      // For now, just set the value
      // TODO: Implement proper parsing
      this.phoneNumber.set(value);
    } else {
      this.phoneNumber.set('');
    }
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  // Validator Implementation
  validate(control: AbstractControl): ValidationErrors | null {
    const value = control.value;

    if (!value) {
      return null; // Пустое значение - не валидируем (используйте Validators.required отдельно)
    }

    // Убираем код страны и получаем только номер
    const dialCode = this.selectedCountry().dialCode;
    const phoneOnly = value.replace(dialCode, '').replace(/\D/g, '');

    const country = this.selectedCountry();

    // Проверяем минимальную длину
    if (phoneOnly.length < country.minLength) {
      return {
        phoneIncomplete: {
          message: `Номер слишком короткий. Минимум ${country.minLength} цифр`,
          requiredLength: country.minLength,
          actualLength: phoneOnly.length,
        },
      };
    }

    // Проверяем максимальную длину
    if (phoneOnly.length > country.maxLength) {
      return {
        phoneTooLong: {
          message: `Номер слишком длинный. Максимум ${country.maxLength} цифр`,
          requiredLength: country.maxLength,
          actualLength: phoneOnly.length,
        },
      };
    }

    return null; // Валидация прошла успешно
  }
}
