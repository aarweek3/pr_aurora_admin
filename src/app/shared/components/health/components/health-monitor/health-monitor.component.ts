import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { HealthCheckService } from '../../services/health-check.service';
import { HealthIndicatorComponent } from '../health-indicator/health-indicator.component';
import { HealthLogsComponent } from '../health-logs/health-logs.component';
// Импортируем остальные компоненты, когда они будут созданы

@Component({
  selector: 'app-health-monitor',
  standalone: true,
  imports: [CommonModule, HealthIndicatorComponent, HealthLogsComponent],
  templateUrl: './health-monitor.component.html',
  styleUrls: ['./health-monitor.component.scss'],
})
export class HealthMonitorComponent implements OnInit {
  private healthService = inject(HealthCheckService);

  readonly status = this.healthService.status;
  readonly metrics = this.healthService.metrics;
  readonly alerts = this.healthService.currentAlerts;
  readonly isLoading = this.healthService.loading;

  translateStatus(status: string): string {
    const map: Record<string, string> = {
      Healthy: 'Здоров',
      Degraded: 'Ограничен',
      Unhealthy: 'Критичен',
      Unknown: 'Неизвестно',
    };
    return map[status] || status;
  }

  readonly activeTab = signal<'overview' | 'logs' | 'metrics'>('overview');

  ngOnInit() {
    this.healthService.forceRefresh();
  }

  setTab(tab: 'overview' | 'logs' | 'metrics') {
    this.activeTab.set(tab);
  }

  async refresh() {
    await this.healthService.forceRefresh();
  }
}
