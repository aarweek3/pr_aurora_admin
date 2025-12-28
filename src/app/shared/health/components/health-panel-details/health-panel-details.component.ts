import { CommonModule } from '@angular/common';
import { Component, inject, Input, signal } from '@angular/core';
import { SystemStatus } from '../../models/health.model';
import { HealthCheckService } from '../../services/health.service';

type HealthTab = 'Overview' | 'Infra' | 'Auth' | 'Network';

import { NzIconModule } from 'ng-zorro-antd/icon';

@Component({
  selector: 'app-health-panel-details',
  standalone: true,
  imports: [CommonModule, NzIconModule],
  templateUrl: './health-panel-details.component.html',
  styleUrls: ['./health-panel-details.component.scss'],
})
export class HealthPanelDetailsComponent {
  public healthService = inject(HealthCheckService);

  /** Настройка начального таба */
  @Input() set initialTab(tab: HealthTab) {
    if (tab) this.activeTab.set(tab);
  }

  /** Активный таб */
  activeTab = signal<HealthTab>('Overview');

  tabs: HealthTab[] = ['Overview', 'Infra', 'Auth', 'Network'];

  setActiveTab(tab: HealthTab): void {
    this.activeTab.set(tab);
  }

  /** Хелпер для определения цвета статуса в таблице */
  getStatusColor(status: SystemStatus): string {
    switch (status) {
      case 'Healthy':
        return '#2ecc71';
      case 'Degraded':
        return '#f1c40f';
      case 'Unhealthy':
        return '#e74c3c';
      default:
        return '#95a5a6';
    }
  }

  refresh(): void {
    this.healthService.refresh();
  }
}
