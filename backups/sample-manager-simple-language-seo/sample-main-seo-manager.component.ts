import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { SampleMainSeoInlineComponent } from './components/sample-main-seo-inline/sample-main-seo-inline.component';
import { SampleMainSeoListComponent } from './components/sample-main-seo-list/sample-main-seo-list.component';
import { SampleMainSeoModalComponent } from './components/sample-main-seo-modal/sample-main-seo-modal.component';

@Component({
  selector: 'app-sample-main-seo-manager',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    NzRadioModule,
    NzButtonModule,
    NzIconModule,
    SampleMainSeoListComponent,
    SampleMainSeoModalComponent,
    SampleMainSeoInlineComponent,
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div class="header-main">
          <h1>Sample Образцовая модель: Многоязычность + SEO</h1>
          <nz-radio-group [(ngModel)]="viewMode" nzButtonStyle="solid">
            <label nz-radio-button nzValue="modal">Модалка</label>
            <label nz-radio-button nzValue="inline">Встроенная</label>
            <label nz-radio-button nzValue="page">Отдельная страница</label>
          </nz-radio-group>
        </div>
        <p class="subtitle">
          Универсальный компонент в 3-х вариантах хостинга (одна форма — разные
          задачи)
        </p>
      </div>

      <!-- Кнопка "Создать" для полноэкранного режима -->
      <div class="page-actions" *ngIf="viewMode === 'page'">
        <button nz-button nzType="primary" routerLink="new">
          <i nz-icon nzType="plus"></i> Создать на новой странице
        </button>
      </div>

      <!-- Список (с передачей режима навигации) -->
      <app-sample-main-seo-list
        [usePageNavigation]="viewMode === 'page'"
      ></app-sample-main-seo-list>

      <!-- Варианты хостинга формы -->
      <app-sample-main-seo-modal
        *ngIf="viewMode === 'modal'"
      ></app-sample-main-seo-modal>

      <div class="inline-container" *ngIf="viewMode === 'inline'">
        <app-sample-main-seo-inline></app-sample-main-seo-inline>
      </div>
    </div>
  `,
  styles: [
    `
      .page-container {
        padding: 0px;
      }
      .page-header {
        margin-bottom: 24px;
      }
      .header-main {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      h1 {
        font-size: 24px;
        font-weight: 600;
        margin-bottom: 4px;
        color: #001529;
      }
      .subtitle {
        color: #8c8c8c;
        font-size: 14px;
      }
      .page-actions {
        margin-bottom: 16px;
        display: flex;
        justify-content: flex-end;
      }
      .inline-container {
        margin-top: 24px;
      }
    `,
  ],
})
export class SampleMainSeoManagerComponent {
  viewMode: 'modal' | 'inline' | 'page' = 'modal';
}
