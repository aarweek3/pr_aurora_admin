import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ToastOptions } from '../../interfaces/image.interfaces';

@Component({
  selector: 'app-toast-notification',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast-notification.component.html',
  styleUrls: ['./toast-notification.component.scss'],
})
export class ToastNotificationComponent implements OnInit, OnDestroy {
  message: string = '';
  type: 'success' | 'error' | 'warning' | 'info' = 'info';
  isVisible: boolean = false;
  private timeoutId?: number;

  ngOnInit(): void {
    // Слушаем события для показа toast
    document.addEventListener('showToast', this.handleShowToast as EventListener);
  }

  ngOnDestroy(): void {
    document.removeEventListener('showToast', this.handleShowToast as EventListener);
    if (this.timeoutId) {
      window.clearTimeout(this.timeoutId);
    }
  }

  private handleShowToast = (event: CustomEvent<ToastOptions>): void => {
    this.show(event.detail);
  };

  /**
   * Показывает toast уведомление
   */
  show(options: ToastOptions): void {
    this.message = options.message;
    this.type = options.type;
    this.isVisible = true;

    // Автоматически скрываем через заданное время
    const duration = options.duration || 3000;

    if (this.timeoutId) {
      window.clearTimeout(this.timeoutId);
    }

    this.timeoutId = window.setTimeout(() => {
      this.close();
    }, duration);
  }

  /**
   * Закрывает toast
   */
  close(): void {
    this.isVisible = false;
    if (this.timeoutId) {
      window.clearTimeout(this.timeoutId);
      this.timeoutId = undefined;
    }
  }

  /**
   * Возвращает иконку для типа уведомления
   */
  getIcon(): string {
    switch (this.type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      case 'info':
        return 'ℹ';
      default:
        return 'ℹ';
    }
  }

  /**
   * Статический метод для показа toast из любого места
   */
  static show(options: ToastOptions): void {
    const event = new CustomEvent('showToast', {
      detail: options,
    });
    document.dispatchEvent(event);
  }
}
