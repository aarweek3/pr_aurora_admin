import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { HealthPanelDetailsComponent } from '../../../../shared/health/components/health-panel-details/health-panel-details.component';

@Component({
  selector: 'app-health-dashboard',
  standalone: true,
  imports: [CommonModule, HealthPanelDetailsComponent],
  template: `
    <div class="health-page">
      <header class="page-header">
        <h2>Мониторинг здоровья системы</h2>
        <p>Детальный отчет о состоянии сервера и базы данных</p>
      </header>

      <div class="dashboard-wrapper">
        <app-health-panel-details [initialTab]="tab()" />
      </div>
    </div>
  `,
  styles: [
    `
      .health-page {
        padding: 48px 24px;
        max-width: 1200px;
        margin: 0 auto;
        min-height: 100%;
        box-sizing: border-box;

        .page-header {
          margin-bottom: 40px;
          animation: pageFadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1);

          h2 {
            margin: 0;
            font-size: 36px;
            font-weight: 850;
            color: #1a1a1a;
            letter-spacing: -1.5px;
            line-height: 1.1;
          }

          p {
            margin: 12px 0 0;
            color: #666;
            font-size: 18px;
            font-weight: 450;
            letter-spacing: -0.2px;
          }
        }

        .dashboard-wrapper {
          display: flex;
          width: 100%;
          animation: pageFadeIn 1s cubic-bezier(0.16, 1, 0.3, 1) 0.1s both;
        }
      }

      @keyframes pageFadeIn {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    `,
  ],
})
export class HealthDashboardComponent {
  /** Получаем таб из роута через Component Input Binding */
  tab = input<any>('Overview');
}
