import { CommonModule } from '@angular/common';
import { HttpResponse } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { IconGetService } from '@core/services/icon/icon-get.service';
import { IconComponent } from '@shared/components/ui/icon/icon.component';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzTagModule } from 'ng-zorro-antd/tag';

@Component({
  selector: 'app-test-language-app',
  standalone: true,
  imports: [
    CommonModule,
    NzButtonModule,
    NzCardModule,
    NzTagModule,
    NzDividerModule,
    NzInputModule,
    IconComponent,
  ],
  template: `
    <div style="padding: 24px; background: #f0f2f5; min-height: 100vh;">
      <nz-card
        nzTitle="🇲🇽 Mexico Flag Speed Test"
        [nzExtra]="extraTemplate"
        style="max-width: 600px; margin: 0 auto;"
      >
        <!-- Controls -->
        <div style="margin-bottom: 24px; display: flex; gap: 12px;">
          <button nz-button nzType="primary" (click)="loadIcon()" [nzLoading]="loading()">
            Start Test (Load)
          </button>
          <button nz-button nzDanger (click)="clearCache()">Clear Cache</button>
        </div>

        <nz-divider></nz-divider>

        <!-- Results -->
        <div *ngIf="result() as res">
          <div style="display: flex; align-items: center; margin-bottom: 20px;">
            <div style="margin-right: 20px;">
              <av-icon [type]="targetIcon" [size]="64"></av-icon>
            </div>
            <div>
              <h3>
                Status:
                <nz-tag [nzColor]="res.source === 'Cache' ? 'blue' : 'green'">{{
                  res.source
                }}</nz-tag>
              </h3>
            </div>
          </div>

          <div
            style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; text-align: center;"
          >
            <!-- DB Time -->
            <div
              style="background: #f6ffed; border: 1px solid #b7eb8f; padding: 12px; border-radius: 4px;"
            >
              <div style="color: #52c41a; font-weight: bold; font-size: 24px;">
                {{ res.dbTime }} ms
              </div>
              <div style="font-size: 12px; color: #888;">DB (Server)</div>
            </div>

            <!-- Network Time -->
            <div
              style="background: #e6f7ff; border: 1px solid #91d5ff; padding: 12px; border-radius: 4px;"
            >
              <div style="color: #1890ff; font-weight: bold; font-size: 24px;">
                {{ res.totalTime - res.dbTime }} ms
              </div>
              <div style="font-size: 12px; color: #888;">Network</div>
            </div>

            <!-- Total Time -->
            <div
              style="background: #fff0f6; border: 1px solid #ffadd2; padding: 12px; border-radius: 4px;"
            >
              <div style="color: #eb2f96; font-weight: bold; font-size: 24px;">
                {{ res.totalTime }} ms
              </div>
              <div style="font-size: 12px; color: #888;">Total (E2E)</div>
            </div>
          </div>

          <div style="margin-top: 20px; font-size: 12px; color: #999;">
            Render Check: <span [innerHTML]="res.safeHtml"></span>
          </div>
        </div>

        <nz-divider></nz-divider>

        <!-- Test Results Output - Always visible -->
        <div style="margin-top: 20px;">
          <div
            style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;"
          >
            <strong>Test Results:</strong>
            <button nz-button nzSize="small" (click)="copyResults()">Copy to Clipboard</button>
          </div>
          <textarea
            nz-input
            [nzAutosize]="{ minRows: 6, maxRows: 12 }"
            [value]="resultsText()"
            readonly
            style="font-family: 'Courier New', monospace; font-size: 12px;"
          ></textarea>
        </div>

        <div *ngIf="!result() && !loading()" style="text-align: center; color: #ccc;">
          Press "Start Test" to begin
        </div>
      </nz-card>

      <ng-template #extraTemplate>
        <nz-tag>{{ targetIcon }}</nz-tag>
      </ng-template>
    </div>
  `,
})
export class TestLanguageAppGetMassivIconFromDbComponent {
  private iconService = inject(IconGetService);
  private sanitizer = inject(DomSanitizer);
  private message = inject(NzMessageService);

  targetIcon = 'av_l_mexico-flag';
  loading = signal(false);

  result = signal<{
    source: 'Cache' | 'Database';
    dbTime: number;
    totalTime: number;
    safeHtml: SafeHtml;
  } | null>(null);

  // Computed signal for results text to avoid change detection issues
  resultsText = computed(() => {
    const res = this.result();
    if (!res) return 'No test results yet. Press "Start Test" to begin.';

    return `🇲🇽 Mexico Flag Speed Test Results
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Icon: ${this.targetIcon}
Source: ${res.source}

Performance Metrics:
  • DB (Server):    ${res.dbTime} ms
  • Network:        ${res.totalTime - res.dbTime} ms
  • Total (E2E):    ${res.totalTime} ms

Analysis:
${this.getAnalysis(res)}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Timestamp: ${new Date().toISOString()}`;
  });

  constructor() {}

  clearCache() {
    this.iconService.clearCache();
    this.result.set(null);
    console.clear();
    console.log('[SpeedTest] Cache cleared');
  }

  loadIcon() {
    this.loading.set(true);
    const start = performance.now();

    // Check local cache state BEFORE request
    const isCached = this.iconService.hasCached(this.targetIcon);

    if (isCached) {
      this.runCachePath(start);
    } else {
      this.runNetworkPath(start);
    }
  }

  private runCachePath(startTime: number) {
    this.iconService.loadIconsBatch([this.targetIcon]).subscribe((data) => {
      const total = Math.round(performance.now() - startTime);
      this.result.set({
        source: 'Cache',
        dbTime: 0,
        totalTime: total,
        safeHtml: this.sanitizer.bypassSecurityTrustHtml(data[this.targetIcon]),
      });
      this.loading.set(false);
    });
  }

  private runNetworkPath(startTime: number) {
    this.iconService.loadIconsBatchDebug([this.targetIcon]).subscribe({
      next: (resp: HttpResponse<Record<string, string>>) => {
        const total = Math.round(performance.now() - startTime);

        // Parse Server-Timing
        let dbTime = 0;
        const header = resp.headers.get('Server-Timing');
        if (header) {
          const match = header.match(/db;dur=([\d.]+)/);
          if (match) {
            dbTime = Math.round(parseFloat(match[1]));
          }
        }

        const body = resp.body || {};
        this.result.set({
          source: 'Database',
          dbTime: dbTime,
          totalTime: total,
          safeHtml: this.sanitizer.bypassSecurityTrustHtml(body[this.targetIcon]),
        });
        this.loading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.loading.set(false);
      },
    });
  }

  private getAnalysis(res: { source: string; dbTime: number; totalTime: number }): string {
    if (res.source === 'Cache') {
      return `  ✓ Cache hit - excellent performance
  ✓ No database query needed
  ✓ Network overhead: ${res.totalTime}ms`;
    } else {
      const networkTime = res.totalTime - res.dbTime;
      const dbPercent = Math.round((res.dbTime / res.totalTime) * 100);
      const netPercent = 100 - dbPercent;
      return `  • Database query: ${res.dbTime}ms (${dbPercent}%)
  • Network overhead: ${networkTime}ms (${netPercent}%)
  • Server-Timing header: ${res.dbTime > 0 ? 'Working ✓' : 'Missing ✗'}`;
    }
  }

  copyResults(): void {
    const text = this.resultsText();
    navigator.clipboard.writeText(text).then(
      () => this.message.success('Results copied to clipboard!'),
      () => this.message.error('Failed to copy results'),
    );
  }
}
