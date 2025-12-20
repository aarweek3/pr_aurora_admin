import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Output,
  ViewChild,
  forwardRef,
  input,
  model,
  signal,
} from '@angular/core';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { TagComponent, TagVariant } from './tag.component';

@Component({
  selector: 'av-tag-input',
  standalone: true,
  imports: [CommonModule, FormsModule, TagComponent],
  templateUrl: './tag-input.component.html',
  styleUrl: './tag-input.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TagInputComponent),
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TagInputComponent implements ControlValueAccessor {
  @ViewChild('inputElement') inputElement!: ElementRef<HTMLInputElement>;

  tags = model<string[]>([]);
  placeholder = input<string>('Введите тег...');
  addOnKeys = input<string[]>(['Enter', ',']);
  allowDuplicates = input<boolean>(false);
  maxTags = input<number | undefined>(undefined);
  variant = input<TagVariant>('soft');
  disabled = signal<boolean>(false);

  @Output() inputBlur = new EventEmitter<FocusEvent>();

  inputValue = signal<string>('');
  isFocused = signal<boolean>(false);

  // ControlValueAccessor methods
  onChange: any = () => {};
  onTouched: any = () => {};

  writeValue(value: string[]): void {
    this.tags.set(value || []);
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }

  onInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.inputValue.set(value);
  }

  onKeyDown(event: KeyboardEvent): void {
    if (this.disabled()) return;

    const value = this.inputValue().trim();

    // Add tag on specified keys
    if (this.addOnKeys().includes(event.key)) {
      event.preventDefault();
      this.addTag(value);
    }

    // Remove last tag on Backspace if input is empty
    if (event.key === 'Backspace' && value === '' && this.tags().length > 0) {
      this.removeTag(this.tags().length - 1);
    }
  }

  onBlur(event: FocusEvent): void {
    this.isFocused.set(false);
    this.onTouched();
    this.inputBlur.emit(event);

    // Optionally add tag on blur
    const value = this.inputValue().trim();
    if (value) {
      this.addTag(value);
    }
  }

  onFocus(): void {
    this.isFocused.set(true);
  }

  addTag(value: string): void {
    if (!value) return;

    // Check max tags
    if (this.maxTags() !== undefined && this.tags().length >= this.maxTags()!) {
      return;
    }

    // Check duplicates
    if (!this.allowDuplicates() && this.tags().includes(value)) {
      this.inputValue.set('');
      return;
    }

    const newTags = [...this.tags(), value];
    this.tags.set(newTags);
    this.inputValue.set('');
    this.onChange(newTags);
  }

  removeTag(index: number): void {
    if (this.disabled()) return;

    const newTags = this.tags().filter((_, i) => i !== index);
    this.tags.set(newTags);
    this.onChange(newTags);
  }

  focusInput(): void {
    this.inputElement.nativeElement.focus();
  }
}
