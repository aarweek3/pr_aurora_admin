import { CommonModule } from '@angular/common';
import { Component, Input, computed } from '@angular/core';
import { HEALTH_STATUS_COLORS } from '../../constants/health.constants';

@Component({
  selector: 'app-health-indicator',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="indicator" [style.background-color]="color()" [class.pulse]="pulse"></span>
    <style>
      .indicator {
        display: inline-block;
        width: 12px;
        height: 12px;
        border-radius: 50%;
        border: 2px solid rgba(255, 255, 255, 0.2);
      }
      .pulse {
        animation: pulse-animation 2s infinite;
      }
      @keyframes pulse-animation {
        0% {
          transform: scale(0.95);
          box-shadow: 0 0 0 0 rgba(0, 0, 0, 0.7);
        }
        70% {
          transform: scale(1);
          box-shadow: 0 0 0 6px rgba(0, 0, 0, 0);
        }
        100% {
          transform: scale(0.95);
          box-shadow: 0 0 0 0 rgba(0, 0, 0, 0);
        }
      }
    </style>
  `,
})
export class HealthIndicatorComponent {
  @Input() status: string = 'Unknown';
  @Input() pulse: boolean = false;

  color = computed(() => {
    return HEALTH_STATUS_COLORS[this.status as keyof typeof HEALTH_STATUS_COLORS] || '#6c757d';
  });
}
