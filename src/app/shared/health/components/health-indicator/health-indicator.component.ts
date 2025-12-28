import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { HealthCheckService } from '../../services/health.service';

@Component({
  selector: 'app-health-indicator',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './health-indicator.component.html',
  styleUrls: ['./health-indicator.component.scss'],
})
export class HealthIndicatorComponent {
  public healthService = inject(HealthCheckService);

  /** Получение CSS класса для кружка на основе статуса */
  getStatusClass(status: string): string {
    return `status-circle ${status.toLowerCase()}`;
  }

  /** Получение иконки тренда */
  getTrendIcon(): string {
    const trend = this.healthService.circles().latencyTrend;
    if (trend === 'up') return '↗️';
    if (trend === 'down') return '↘️';
    return '→';
  }

  /** Клик по индуктору - можно открыть панель деталей */
  toggleDetails(): void {
    // Логика открытия расширенной панели (будет реализована позже)
    console.debug('Open health details panel');
  }
}
