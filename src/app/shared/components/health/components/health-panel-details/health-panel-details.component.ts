import { CommonModule } from '@angular/common';
import { Component, computed, inject, Input, signal } from '@angular/core';
import { SystemStatus } from '../../models/health.model';
import { HealthCheckService } from '../../services/health.service';

type HealthTab = 'Обзор' | 'Инфраструктура' | 'Авторизация' | 'Сеть';

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

  /** Настройка начального таба (с маппингом из английского для обратной совместимости) */
  @Input() set initialTab(tab: string) {
    const map: Record<string, HealthTab> = {
      Overview: 'Обзор',
      Infra: 'Инфраструктура',
      Auth: 'Авторизация',
      Network: 'Сеть',
    };
    const translated = map[tab] || (tab as HealthTab);
    if (translated) this.activeTab.set(translated);
  }

  /** Активный таб */
  activeTab = signal<HealthTab>('Обзор');

  tabs: HealthTab[] = ['Обзор', 'Инфраструктура', 'Авторизация', 'Сеть'];

  setActiveTab(tab: HealthTab): void {
    this.activeTab.set(tab);
  }

  /** Отфильтрованные проверки для текущей вкладки */
  filteredChecks = computed(() => {
    const s = this.healthService.status();
    const tab = this.activeTab();

    if (tab === 'Инфраструктура') {
      return s.checks.filter(
        (c) =>
          c.tags?.includes('infra') ||
          c.tags?.includes('db') ||
          c.name.toLowerCase().includes('db') ||
          c.name.toLowerCase().includes('sql'),
      );
    }
    if (tab === 'Авторизация') {
      return s.checks.filter(
        (c) =>
          c.tags?.includes('auth') ||
          c.name.toLowerCase().includes('auth') ||
          c.name.toLowerCase().includes('identity'),
      );
    }

    return s.checks;
  });

  translateStatus(status: string): string {
    const map: Record<string, string> = {
      Healthy: 'Здоров',
      Degraded: 'Ограничен',
      Unhealthy: 'Критичен',
      Offline: 'Оффлайн',
      Online: 'Онлайн',
      'Checking...': 'Проверка...',
    };
    return map[status] || status;
  }

  /** Оценка здоровья задержки API (hardcoded) */
  getLatencyClass(ms: number): string {
    if (ms < 150) return 'latency-good';
    if (ms < 400) return 'latency-fair';
    return 'latency-poor';
  }

  getLatencyStatus(ms: number): string {
    if (ms < 150) return 'Стабильно';
    if (ms < 400) return 'Задержка';
    return 'Медленно';
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
