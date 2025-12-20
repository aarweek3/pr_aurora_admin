import { CommonModule } from '@angular/common';
import { Component, computed, effect, input, OnInit, signal } from '@angular/core';

export type SpinnerSize = 'tiny' | 'small' | 'default' | 'large' | 'huge';
export type SpinnerColor =
  | 'primary'
  | 'success'
  | 'warning'
  | 'error'
  | 'neutral'
  | 'white'
  | 'inherit';
export type SpinnerAnimation = 'spin' | 'pulse' | 'bounce' | 'drift' | 'none';
export type SpinnerLabelPosition = 'bottom' | 'right';

@Component({
  selector: 'av-spinner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      [class]="overlayClasses()"
      [style.background-color]="overlayBg()"
      [style.backdrop-filter]="overlayBlur()"
      [style.z-index]="zIndex()"
      [class.av-spinner--hidden]="!isVisible()"
    >
      <div [class]="wrapperClasses()">
        <div class="av-spinner-container">
          <svg
            [class]="spinnerClasses()"
            [style.width.px]="pixelSize()"
            [style.height.px]="pixelSize()"
            [style.color]="isCustomColor() ? color() : null"
            viewBox="25 25 50 50"
          >
            <circle
              cx="50"
              cy="50"
              r="20"
              fill="none"
              [attr.stroke-width]="effectiveStrokeWidth()"
              stroke="currentColor"
            ></circle>
          </svg>
        </div>

        @if (label() || tip()) {
        <div class="av-spinner-text">
          @if (label()) {
          <span class="av-spinner-label">{{ label() }}</span>
          } @if (tip()) {
          <span class="av-spinner-tip">{{ tip() }}</span>
          }
        </div>
        }
      </div>
    </div>
  `,
  styleUrls: ['./spinner.component.scss'],
})
export class AvSpinnerComponent implements OnInit {
  // Inputs
  visible = input<boolean>(true);
  size = input<SpinnerSize | number>('default');
  color = input<SpinnerColor | string>('primary');
  animation = input<SpinnerAnimation>('spin');
  label = input<string>('');
  tip = input<string>('');
  labelPosition = input<SpinnerLabelPosition>('bottom');
  overlay = input<boolean>(false);
  fullScreen = input<boolean>(false);
  backdropOpacity = input<number>(0.6);
  backdropBlur = input<number>(2);
  delay = input<number>(0);
  strokeWidth = input<number | undefined>(undefined);
  zIndex = input<number>(1000);

  // Internal state
  private isDelayedVisibility = signal(true);
  isVisible = computed(() => this.visible() && this.isDelayedVisibility());

  constructor() {
    effect(() => {
      const ms = this.delay();
      const isActuallyVisible = this.visible();

      if (isActuallyVisible && ms > 0) {
        this.isDelayedVisibility.set(false);
        setTimeout(() => this.isDelayedVisibility.set(true), ms);
      } else {
        this.isDelayedVisibility.set(true);
      }
    });
  }

  ngOnInit(): void {}

  // Computed properties
  pixelSize = computed(() => {
    const s = this.size();
    if (typeof s === 'number') return s;
    const map: Record<SpinnerSize, number> = {
      tiny: 14,
      small: 20,
      default: 32,
      large: 48,
      huge: 80,
    };
    return map[s as SpinnerSize] || 32;
  });

  effectiveStrokeWidth = computed(() => {
    const customWidth = this.strokeWidth();
    if (customWidth !== undefined) return customWidth;

    const s = this.pixelSize();
    if (s <= 16) return 2;
    if (s <= 24) return 3;
    if (s <= 40) return 4;
    return 5;
  });

  isCustomColor = computed(() => {
    const c = this.color();
    const presets = ['primary', 'success', 'warning', 'error', 'neutral', 'white', 'inherit'];
    return !presets.includes(c);
  });

  overlayClasses = computed(() => ({
    'av-spinner-overlay': this.overlay() || this.fullScreen(),
    'av-spinner-overlay--fullscreen': this.fullScreen(),
  }));

  wrapperClasses = computed(() => ({
    'av-spinner-wrapper': true,
    'av-spinner-wrapper--right': this.labelPosition() === 'right',
  }));

  spinnerClasses = computed(() => {
    const color = this.color();
    const isPreset = !this.isCustomColor();

    return {
      'av-spinner-svg': true,
      [`av-spinner-svg--${this.animation()}`]: true,
      [`av-spinner-svg--${color}`]: isPreset,
    };
  });

  overlayBg = computed(() => {
    if (!this.overlay() && !this.fullScreen()) return 'transparent';
    return `rgba(0, 0, 0, ${this.backdropOpacity()})`;
  });

  overlayBlur = computed(() => {
    if (!this.overlay() && !this.fullScreen()) return 'none';
    return `blur(${this.backdropBlur()}px)`;
  });
}
