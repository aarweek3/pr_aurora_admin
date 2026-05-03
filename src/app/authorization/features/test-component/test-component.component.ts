// src/app/auth/components/test-component/test-component.component.ts
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzMessageService } from 'ng-zorro-antd/message';

import { environment } from '@environments/environment';
import { AuthService } from '@auth/services/auth.service';
import { TokenService } from '@auth/services/token.service';

@Component({
  selector: 'app-test-component',
  standalone: true,
  imports: [
    CommonModule,
    NzCardModule,
    NzButtonModule,
    NzIconModule,
    NzAlertModule,
    NzGridModule,
    NzDescriptionsModule,
    NzTagModule,
    NzDividerModule,
  ],
  template: `
    <div class="test-container">
      <h1>Test Component</h1>
    </div>
  `,
  styles: [
    `
      .test-container {
        padding: 24px;
        background: #f0f2f5;
        min-height: 100vh;
      }

      .test-features {
        margin: 24px 0;
      }

      .feature-card {
        text-align: center;
        padding: 20px;
        border: 1px solid #f0f0f0;
        border-radius: 8px;
        background: white;
        height: 200px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        transition: all 0.3s ease;
      }

      .feature-card:hover {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        transform: translateY(-2px);
      }

      .feature-icon {
        font-size: 32px;
        color: #1890ff;
        margin-bottom: 12px;
      }

      .feature-card h3 {
        margin: 8px 0;
        font-size: 16px;
        color: #262626;
      }

      .feature-card p {
        color: #666;
        margin: 8px 0;
        flex-grow: 1;
        font-size: 14px;
      }

      .restricted-features ul {
        margin: 8px 0;
        padding-left: 20px;
      }

      .restricted-features li {
        margin: 4px 0;
        color: #666;
        font-size: 14px;
      }

      .action-buttons {
        display: flex;
        gap: 12px;
        flex-wrap: wrap;
      }

      .debug-info pre {
        background: #f6f8fa;
        padding: 16px;
        border-radius: 6px;
        max-height: 400px;
        overflow: auto;
        font-family: 'Consolas', 'Monaco', monospace;
        font-size: 12px;
        line-height: 1.4;
        border: 1px solid #e1e4e8;
      }

      @media (max-width: 768px) {
        .test-container {
          padding: 16px;
        }

        .feature-card {
          height: auto;
          min-height: 180px;
        }

        .action-buttons {
          flex-direction: column;
        }

        .action-buttons button {
          width: 100%;
        }
      }
    `,
  ],
})
export class TestComponent implements OnInit {
  public authService = inject(AuthService);
  public tokenService = inject(TokenService);
  private message = inject(NzMessageService);

  showDebugInfo = false;
  loading = false;

  ngOnInit(): void {
    console.log('=== TEST COMPONENT ===');
    console.log('TestComponent loaded for user with User role');
    console.log('=====================');
  }
}
