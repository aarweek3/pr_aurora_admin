import { CommonModule } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { SystemStatus } from '../../models/health.model';
import { HealthCheckService } from '../../services/health.service';

@Component({
  selector: 'app-health-indicator',
  standalone: true,
  imports: [CommonModule, NzIconModule],
  templateUrl: './health-indicator.component.html',
  styleUrls: ['./health-indicator.component.scss'],
})
export class HealthIndicatorComponent {
  public healthService = inject(HealthCheckService);

  @Input() status = 'Unknown';
  @Input() pulse = false;

  getStatusClass(status: SystemStatus | string): string {
    const base = 'status-circle';
    if (!status) return base;
    const state = status.toLowerCase();
    return `${base} ${state}`;
  }

  getTrendIcon(): string {
    const trend = this.healthService.circles().latencyTrend;
    switch (trend) {
      case 'up':
        return '↗';
      case 'down':
        return '↘';
      default:
        return '→';
    }
  }

  toggleDetails(): void {
    // Поповер управляется внешним компонентом (GlobalStatusBar)
  }
}
