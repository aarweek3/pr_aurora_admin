// src/app/auth/components/test-one-user/test-one-user.component.ts
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzResultModule } from 'ng-zorro-antd/result';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzMessageService } from 'ng-zorro-antd/message';
import { AuthService } from '@auth/services/auth.service';
import { TokenService } from '@auth/services/token.service';

@Component({
  selector: 'app-test-one-user',
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
    NzDividerModule,
  ],
  template: `
    <div style="padding: 24px; background: #f0f2f5; min-height: 100vh;">
      <h1>Test 2 component</h1>
    </div>
  `,
  styles: [
    `
      .action-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 12px;
      }

      .test-results {
        background: #f6f8fa;
        padding: 16px;
        border-radius: 6px;
        max-height: 300px;
        overflow: auto;
        border: 1px solid #e1e4e8;
      }

      .test-results pre {
        margin: 0;
        font-family: 'Consolas', 'Monaco', monospace;
        font-size: 12px;
        line-height: 1.4;
        white-space: pre-wrap;
        word-break: break-word;
      }

      .features-list ul {
        padding-left: 20px;
        line-height: 1.6;
      }

      .features-list li {
        margin-bottom: 8px;
      }

      @media (max-width: 768px) {
        .action-grid {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class TestOneUserComponent implements OnInit {
  ngOnInit(): void {
    console.log('=== TEST ONE USER COMPONENT ===');
  }
}
