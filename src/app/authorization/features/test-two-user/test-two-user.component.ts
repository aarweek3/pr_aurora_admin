// src/app/auth/components/test-two-user/test-two-user.component.ts
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzResultModule } from 'ng-zorro-antd/result';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzProgressModule } from 'ng-zorro-antd/progress';
import { NzStatisticModule } from 'ng-zorro-antd/statistic';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Observable, interval } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { AuthService } from '@auth/services/auth.service';
import { TokenService } from '@auth/services/token.service';

@Component({
  selector: 'app-test-two-user',
  standalone: true,
  imports: [
    CommonModule,
    NzCardModule,
    NzButtonModule,
    NzIconModule,
    NzResultModule,
    NzDescriptionsModule,
    NzTagModule,
    NzAlertModule,
    NzProgressModule,
    NzStatisticModule,
  ],
  template: `
    <div style="padding: 24px; background: #f0f2f5; min-height: 100vh;">
      <h1>Test 2 компонент</h1>
    </div>
  `,
  styles: [
    `
      .action-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 12px;
      }

      .diagnostics-output {
        background: #f6f8fa;
        padding: 16px;
        border-radius: 6px;
        max-height: 400px;
        overflow: auto;
        border: 1px solid #e1e4e8;
      }

      .diagnostics-output pre {
        margin: 0;
        font-family: 'Consolas', 'Monaco', monospace;
        font-size: 12px;
        line-height: 1.4;
        white-space: pre-wrap;
        word-break: break-word;
      }

      @media (max-width: 768px) {
        .action-grid {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class TestTwoUserComponent implements OnInit {
  ngOnInit(): void {
    console.log('=== TEST TWO USER COMPONENT ===');
  }
}
