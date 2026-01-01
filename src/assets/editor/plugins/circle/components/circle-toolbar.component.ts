/**
 * Компонент кнопки Circle в toolbar
 * Активация и управление плагином круговой обрезки
 */

import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';

import { CircleService } from '../circle.service';
import { CircleConfig, CircleState } from '../circle.types';

@Component({
  selector: 'app-circle-toolbar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      type="button"
      class="toolbar-btn circle-btn"
      [class.active]="isActive"
      [class.processing]="isProcessing"
      [disabled]="isDisabled"
      [title]="tooltipText"
      (click)="toggleCircle()"
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        class="circle-icon"
      >
        <!-- Основной круг -->
        <circle
          cx="12"
          cy="12"
          r="8"
          stroke="currentColor"
          stroke-width="2"
          fill="none"
          [class.animate-pulse]="isProcessing"
        />
        <!-- Пунктирная линия обрезки -->
        <circle
          cx="12"
          cy="12"
          r="5"
          stroke="currentColor"
          stroke-width="1"
          stroke-dasharray="2,2"
          fill="none"
          opacity="0.6"
        />
        <!-- Центральная точка -->
        <circle cx="12" cy="12" r="1.5" fill="currentColor" />
      </svg>

      <span class="btn-text" *ngIf="showText">
        {{ buttonText }}
      </span>
    </button>

    <!-- Мини-панель настроек (появляется при активном состоянии) -->
    <div class="circle-mini-panel" *ngIf="isActive && showMiniPanel" [class.show]="isActive">
      <div class="mini-panel-content">
        <!-- Информация о текущем круге -->
        <div class="circle-info" *ngIf="currentConfig">
          <span class="info-item"> R: {{ currentConfig.radius }}px </span>
          <span class="info-separator">•</span>
          <span class="info-item"> ⌀ {{ currentConfig.radius * 2 }}px </span>
        </div>

        <!-- Быстрые действия -->
        <div class="quick-actions">
          <button
            type="button"
            class="mini-btn center-btn"
            title="Центрировать круг (Ctrl+C)"
            (click)="centerCircle()"
          >
            ⊙
          </button>

          <button
            type="button"
            class="mini-btn reset-btn"
            title="Оптимальный размер (Ctrl+R)"
            (click)="resetToOptimal()"
          >
            ↻
          </button>

          <button
            type="button"
            class="mini-btn apply-btn"
            title="Применить обрезку (Enter)"
            (click)="applyCircle()"
            [disabled]="!canApply"
          >
            ✓
          </button>

          <button
            type="button"
            class="mini-btn cancel-btn"
            title="Отменить (Esc)"
            (click)="cancelCircle()"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./circle-toolbar.component.scss'],
})
export class CircleToolbarComponent implements OnInit, OnDestroy {
  @Input() showText = false;
  @Input() showMiniPanel = true;
  @Input() canvasElement: HTMLCanvasElement | null = null;
  @Input() imageElement: HTMLImageElement | null = null;
  @Input() overlayCanvas: HTMLCanvasElement | null = null;

  @Output() circleActivated = new EventEmitter<void>();
  @Output() circleDeactivated = new EventEmitter<void>();
  @Output() circleApplied = new EventEmitter<any>();
  @Output() circleCanceled = new EventEmitter<void>();

  // Состояние компонента
  isActive = false;
  isProcessing = false;
  currentState: CircleState = 'idle';
  currentConfig: CircleConfig | null = null;

  private destroy$ = new Subject<void>();

  constructor(private circleService: CircleService) {}

  ngOnInit(): void {
    this.subscribeToCircleService();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Переключить состояние плагина Circle
   */
  toggleCircle(): void {
    if (this.isDisabled) return;

    if (this.isActive) {
      this.deactivateCircle();
    } else {
      this.activateCircle();
    }
  }

  /**
   * Активировать плагин Circle
   */
  activateCircle(): void {
    if (!this.canvasElement || !this.imageElement) {
      console.error('[CircleToolbar] Нет canvas или изображения для активации');
      return;
    }

    this.circleService.activate(
      this.canvasElement,
      this.imageElement,
      this.overlayCanvas || undefined,
    );

    this.circleActivated.emit();
    console.log('[CircleToolbar] Плагин Circle активирован');
  }

  /**
   * Деактивировать плагин Circle
   */
  deactivateCircle(): void {
    this.circleService.deactivate();
    this.circleDeactivated.emit();
    console.log('[CircleToolbar] Плагин Circle деактивирован');
  }

  /**
   * Применить круговую обрезку
   */
  applyCircle(): void {
    if (!this.canApply) return;

    this.circleService.apply();
  }

  /**
   * Отменить операцию
   */
  cancelCircle(): void {
    this.circleService.cancel();
    this.circleCanceled.emit();
  }

  /**
   * Центрировать круг
   */
  centerCircle(): void {
    if (this.isActive) {
      this.circleService.centerCircle();
    }
  }

  /**
   * Сбросить к оптимальному размеру
   */
  resetToOptimal(): void {
    if (this.isActive) {
      this.circleService.resetToOptimal();
    }
  }

  /**
   * Подписка на события сервиса Circle
   */
  private subscribeToCircleService(): void {
    // Отслеживаем состояние активации
    this.circleService.isActive$.pipe(takeUntil(this.destroy$)).subscribe((isActive) => {
      this.isActive = isActive;
    });

    // Отслеживаем текущее состояние
    this.circleService.currentState$.pipe(takeUntil(this.destroy$)).subscribe((state) => {
      this.currentState = state;
      this.isProcessing = state === 'processing';
    });

    // Отслеживаем текущую конфигурацию
    this.circleService.currentConfig$.pipe(takeUntil(this.destroy$)).subscribe((config) => {
      this.currentConfig = config;
    });

    // Обрабатываем событие применения
    this.circleService.onApply$.pipe(takeUntil(this.destroy$)).subscribe((result) => {
      this.circleApplied.emit(result);
      console.log('[CircleToolbar] Обрезка применена:', result);
    });

    // Обрабатываем событие отмены
    this.circleService.onCancel$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.circleCanceled.emit();
      console.log('[CircleToolbar] Операция отменена');
    });
  }

  /**
   * Текст кнопки в зависимости от состояния
   */
  get buttonText(): string {
    switch (this.currentState) {
      case 'configuring':
        return 'Настройка';
      case 'moving':
        return 'Перемещение';
      case 'resizing':
        return 'Изменение';
      case 'processing':
        return 'Обработка...';
      case 'error':
        return 'Ошибка';
      default:
        return 'Круг';
    }
  }

  /**
   * Текст подсказки
   */
  get tooltipText(): string {
    if (this.isDisabled) {
      return 'Загрузите изображение для использования круговой обрезки';
    }

    if (this.isActive) {
      return 'Завершить круговую обрезку или нажать Esc для отмены';
    }

    return 'Обрезка изображения в форме круга с прозрачностью';
  }

  /**
   * Можно ли использовать кнопку
   */
  get isDisabled(): boolean {
    return !this.canvasElement || !this.imageElement || this.isProcessing;
  }

  /**
   * Можно ли применить обрезку
   */
  get canApply(): boolean {
    return (
      this.isActive &&
      this.currentConfig !== null &&
      (this.currentState === 'configuring' || this.currentState === 'idle')
    );
  }
}
