import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HealthLogEntry } from '../../interfaces/health.interfaces';
import { HealthCheckService } from '../../services/health-check.service';

@Component({
  selector: 'app-health-logs',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './health-logs.component.html',
  styleUrls: ['./health-logs.component.scss'],
})
export class HealthLogsComponent implements OnInit {
  private healthService = inject(HealthCheckService);

  readonly logs = this.healthService.logs;
  readonly searchQuery = signal<string>('');
  readonly filterSeverity = signal<string>('all');

  translateStatus(status: string): string {
    const map: Record<string, string> = {
      Healthy: 'Здоров',
      Degraded: 'Ограничен',
      Unhealthy: 'Критичен',
      Unknown: 'Неизвестно',
    };
    return map[status] || status;
  }

  // Отфильтрованные логи
  readonly filteredLogs = computed(() => {
    let list = this.logs();
    const query = this.searchQuery().toLowerCase();
    const severity = this.filterSeverity();

    if (query) {
      list = list.filter(
        (log) =>
          log.endpoint.toLowerCase().includes(query) || log.status.toLowerCase().includes(query),
      );
    }

    if (severity !== 'all') {
      list = list.filter((log) => {
        if (severity === 'error') return log.status === 'Unhealthy' || log.durationMs > 1000;
        if (severity === 'warning') return log.status === 'Degraded';
        return log.status === 'Healthy';
      });
    }

    return list;
  });

  ngOnInit() {
    this.loadLogs();
  }

  async loadLogs() {
    await this.healthService.getHealthLogs(100);
  }

  getStatusClass(log: HealthLogEntry): string {
    if (log.status === 'Unhealthy' || log.durationMs > 2000) return 'status-error';
    if (log.status === 'Degraded' || log.durationMs > 1000) return 'status-warning';
    return 'status-success';
  }
}
