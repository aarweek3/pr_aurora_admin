import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AvRatingComponent } from '@shared/components/ui/rating/rating.component';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzSliderModule } from 'ng-zorro-antd/slider';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzTagModule } from 'ng-zorro-antd/tag';

@Component({
  selector: 'app-test-rating',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AvRatingComponent,
    NzCardModule,
    NzSliderModule,
    NzInputNumberModule,
    NzDividerModule,
    NzTagModule,
  ],
  template: `
    <div style="padding: 24px; background: #f0f2f5; min-height: 100vh;">
      <nz-card
        nzTitle="🧪 Test Rating Control (AvRatingComponent)"
        style="max-width: 800px; margin: 0 auto;"
      >
        <div style="margin-bottom: 32px; text-align: center;">
          <div style="font-size: 14px; color: #8c8c8c; margin-bottom: 8px;">Interactive Demo</div>
          <av-rating
            [value]="ratingValue()"
            [size]="48"
            [showValue]="true"
            [color]="currentColor"
          ></av-rating>

          <div style="margin-top: 24px; max-width: 400px; margin-left: auto; margin-right: auto;">
            <nz-slider
              [nzMin]="0"
              [nzMax]="5"
              [nzStep]="0.1"
              [(ngModel)]="currentRating"
            ></nz-slider>
            <nz-input-number
              [(ngModel)]="currentRating"
              [nzMin]="0"
              [nzMax]="5"
              [nzStep]="0.1"
            ></nz-input-number>
          </div>

          <div style="margin-top: 16px; display: flex; justify-content: center; gap: 12px;">
            <div
              *ngFor="let c of ['#fadb14', '#ff4d4f', '#52c41a', '#1890ff', '#722ed1', '#eb2f96']"
              [style.background]="c"
              style="width: 28px; height: 28px; border-radius: 50%; cursor: pointer; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.1); transition: all 0.2s;"
              [style.transform]="currentColor === c ? 'scale(1.2)' : 'scale(1)'"
              [style.outline]="currentColor === c ? '2px solid #1890ff' : 'none'"
              (click)="currentColor = c"
            ></div>
          </div>
        </div>

        <nz-divider nzText="Presets"></nz-divider>

        <div class="presets-grid">
          <div class="preset-item">
            <nz-tag nzColor="default">0.0</nz-tag>
            <av-rating [value]="0"></av-rating>
          </div>

          <div class="preset-item">
            <nz-tag nzColor="warning">1.2</nz-tag>
            <av-rating [value]="1.2"></av-rating>
          </div>

          <div class="preset-item">
            <nz-tag nzColor="blue">2.5 (Half)</nz-tag>
            <av-rating [value]="2.5"></av-rating>
          </div>

          <div class="preset-item">
            <nz-tag nzColor="cyan">3.8 (Most)</nz-tag>
            <av-rating [value]="3.8"></av-rating>
          </div>

          <div class="preset-item">
            <nz-tag nzColor="green">4.99 (Almost full)</nz-tag>
            <av-rating [value]="4.99"></av-rating>
          </div>

          <div class="preset-item">
            <nz-tag nzColor="gold">5.0</nz-tag>
            <av-rating [value]="5"></av-rating>
          </div>
        </div>

        <nz-divider nzText="Different Sizes"></nz-divider>

        <div style="display: flex; flex-direction: column; gap: 16px;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <span style="width: 100px;">12px:</span>
            <av-rating [value]="4.2" [size]="12"></av-rating>
          </div>
          <div style="display: flex; align-items: center; gap: 12px;">
            <span style="width: 100px;">24px:</span>
            <av-rating [value]="4.2" [size]="24" [showValue]="true"></av-rating>
          </div>
          <div style="display: flex; align-items: center; gap: 12px;">
            <span style="width: 100px;">32px:</span>
            <av-rating [value]="4.2" [size]="32" [showValue]="true"></av-rating>
          </div>
          <div style="display: flex; align-items: center; gap: 12px;">
            <span style="width: 100px;">64px:</span>
            <av-rating [value]="4.2" [size]="64" [showValue]="true"></av-rating>
          </div>
        </div>
      </nz-card>
    </div>
  `,
  styles: [
    `
      .presets-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 24px;
        margin-bottom: 24px;
      }
      .preset-item {
        display: flex;
        flex-direction: column;
        gap: 8px;
        align-items: flex-start;
        padding: 12px;
        background: #fafafa;
        border: 1px solid #f0f0f0;
        border-radius: 8px;
      }
    `,
  ],
})
export class TestRatingComponent {
  currentRating = 3.8;
  currentColor = '#fadb14';

  ratingValue() {
    return this.currentRating;
  }
}
