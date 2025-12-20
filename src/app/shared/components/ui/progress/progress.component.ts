import { animate, style, transition, trigger } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { Component, computed, input, output } from '@angular/core';
import { NzIconModule } from 'ng-zorro-antd/icon';
import {
  ProgressA11y,
  ProgressAnimation,
  ProgressCustomStyles,
  ProgressGradient,
  ProgressSize,
  ProgressStatus,
  ProgressSteps,
  ProgressType,
} from './progress.types';
import { ProgressUtils } from './progress.utils';

@Component({
  selector: 'av-progress',
  standalone: true,
  imports: [CommonModule, NzIconModule],
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('0.3s ease-out', style({ opacity: 1 })),
      ]),
      transition(':leave', [animate('0.3s ease-in', style({ opacity: 0 }))]),
    ]),
  ],
  template: `
    <div
      *ngIf="visible()"
      [class]="containerClasses()"
      [style]="customStyles().containerStyle"
      [class.av-progress--indeterminate]="indeterminate()"
      [@fadeInOut]
      role="progressbar"
      [attr.aria-valuenow]="percent()"
      [attr.aria-valuemin]="0"
      [attr.aria-valuemax]="100"
      [attr.aria-label]="a11y().ariaLabel"
    >
      @if (type() === 'line') {
      <!-- LINE TYPE -->
      <div class="av-progress-outer" [class.av-progress-outer--with-info]="showInfo()">
        <div
          class="av-progress-inner"
          [style.height.px]="strokeWidthPx()"
          [style.background-color]="trailColor()"
        >
          <div
            class="av-progress-bg"
            [style.width.%]="percent()"
            [style.height.px]="strokeWidthPx()"
            [style.background]="strokeColorComputed()"
          ></div>
        </div>
      </div>
      @if (showInfo()) {
      <span class="av-progress-info">
        @if (status() === 'success') {
        <span nz-icon nzType="check-circle" nzTheme="fill"></span>
        } @else if (status() === 'error') {
        <span nz-icon nzType="close-circle" nzTheme="fill"></span>
        } @else {
        {{ formatComputed()(percent()) }}
        }
      </span>
      } } @else {
      <!-- CIRCLE / DASHBOARD TYPE -->
      <div class="av-progress-inner" [style.width.px]="pixelSize()" [style.height.px]="pixelSize()">
        <svg [attr.viewBox]="'0 0 ' + pixelSize() + ' ' + pixelSize()">
          <!-- Trail Path -->
          <path
            class="av-progress-circle-trail"
            [attr.d]="pathString()"
            [attr.stroke]="trailColor()"
            [attr.stroke-width]="strokeWidthPx()"
            [attr.stroke-linecap]="strokeLinecap()"
            fill-opacity="0"
          ></path>
          <!-- Progress Path -->
          <path
            class="av-progress-circle-path"
            [attr.d]="pathString()"
            [attr.stroke]="strokeColorComputed()"
            [attr.stroke-width]="strokeWidthPx()"
            [attr.stroke-linecap]="strokeLinecap()"
            fill-opacity="0"
            [style.stroke-dasharray]="strokeDashArray()"
            [style.stroke-dashoffset]="strokeDashOffset()"
            [style.transition]="'stroke-dashoffset 0.3s ease 0s, stroke 0.3s ease'"
          ></path>
        </svg>
        @if (showInfo()) {
        <span class="av-progress-info">
          @if (status() === 'success') {
          <span nz-icon nzType="check" [style.font-size.px]="pixelSize() * 0.2"></span>
          } @else if (status() === 'error') {
          <span nz-icon nzType="close" [style.font-size.px]="pixelSize() * 0.2"></span>
          } @else {
          {{ formatComputed()(percent()) }}
          }
        </span>
        }
      </div>
      } @if (label()) {
      <div class="av-progress-label">{{ label() }}</div>
      }
    </div>
  `,
  styleUrls: ['./progress.component.scss'],
})
export class AvProgressComponent {
  // === BASIC INPUTS ===
  percent = input<number, number>(0, {
    transform: (v: number | string) => ProgressUtils.clampPercent(Number(v)),
  });

  type = input<ProgressType>('line');
  status = input<ProgressStatus>('normal');
  size = input<ProgressSize | number>('default');
  strokeWidth = input<number | undefined>(undefined);
  strokeColor = input<string | string[] | ProgressGradient | undefined>(undefined);
  trailColor = input<string>('#f5f5f5');
  strokeLinecap = input<'round' | 'square' | 'butt'>('round');
  showInfo = input<boolean>(true);
  format = input<(percent: number) => string>(ProgressUtils.defaultFormat);
  label = input<string>('');
  gapDegree = input<number>(75);
  indeterminate = input<boolean>(false);
  visible = input<boolean>(true);

  // === ADVANCED CONFIG ===
  steps = input<ProgressSteps | undefined>(undefined);
  animation = input<Partial<ProgressAnimation>>({});
  a11y = input<Partial<ProgressA11y>>({});
  customStyles = input<Partial<ProgressCustomStyles>>({});

  // === OUTPUTS ===
  percentChange = output<number>();
  complete = output<void>();

  // === COMPUTED PROPERTIES ===

  pixelSize = computed(() => {
    const s = this.size();
    if (typeof s === 'number') return s;
    const map: Record<ProgressSize, number> = {
      small: this.type() === 'line' ? 6 : 60,
      default: this.type() === 'line' ? 10 : 120,
      large: this.type() === 'line' ? 16 : 180,
    };
    return map[s] || 120;
  });

  strokeWidthPx = computed(() => {
    const custom = this.strokeWidth();
    if (custom !== undefined) return custom;

    const s = this.size();
    if (this.type() === 'line') {
      if (s === 'small') return 6;
      if (s === 'large') return 16;
      return 10;
    } else {
      if (s === 'small') return 4;
      if (s === 'large') return 12;
      return 8;
    }
  });

  containerClasses = computed(() => ({
    'av-progress': true,
    [`av-progress--${this.type()}`]: true,
    [`av-progress--status-${this.status()}`]: true,
    [`av-progress--size-${typeof this.size() === 'string' ? this.size() : 'custom'}`]: true,
  }));

  formatComputed = computed(() => this.format() || ProgressUtils.defaultFormat);

  strokeColorComputed = computed(() => {
    const color = this.strokeColor();
    if (!color) return null;

    if (typeof color === 'string') return color;
    if (Array.isArray(color)) {
      return ProgressUtils.createGradientCSS({ from: color[0], to: color[color.length - 1] });
    }
    return ProgressUtils.createGradientCSS(color);
  });

  // SVG PATH CALCULATIONS
  radius = computed(() => (this.pixelSize() - this.strokeWidthPx()) / 2);
  pathString = computed(() => {
    const r = this.radius();
    const center = this.pixelSize() / 2;
    const g = this.type() === 'dashboard' ? this.gapDegree() : 0;

    if (this.type() === 'circle') {
      return `M ${center},${center} m 0,-${r} a ${r},${r} 0 1 1 0,${2 * r} a ${r},${r} 0 1 1 0,-${
        2 * r
      }`;
    } else {
      // Dashboard (partial circle)
      const beginDeg = 90 + g / 2;
      const endDeg = 90 - g / 2 + 360;
      const startX = center + r * Math.cos((beginDeg * Math.PI) / 180);
      const startY = center + r * Math.sin((beginDeg * Math.PI) / 180);
      const endX = center + r * Math.cos((endDeg * Math.PI) / 180);
      const endY = center + r * Math.sin((endDeg * Math.PI) / 180);

      return `M ${startX},${startY} A ${r},${r} 0 1 1 ${endX},${endY}`;
    }
  });

  pathLength = computed(() => {
    const r = this.radius();
    if (this.type() === 'circle') {
      return 2 * Math.PI * r;
    } else {
      const g = this.gapDegree();
      return 2 * Math.PI * r * ((360 - g) / 360);
    }
  });

  strokeDashArray = computed(() => `${this.pathLength()}px, ${this.pathLength()}px`);
  strokeDashOffset = computed(() => `${this.pathLength() * (1 - this.percent() / 100)}px`);
}
