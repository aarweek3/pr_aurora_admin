import { Overlay, OverlayConfig, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal, ComponentType } from '@angular/cdk/portal';
import { inject, Injectable, Injector } from '@angular/core';
import { ModalAlertComponent } from '../components/modal-alert/modal-alert.component';
import { ModalConfirmComponent } from '../components/modal-confirm/modal-confirm.component';
import {
  MathChallengeConfig,
  ModalMathChallengeComponent,
} from '../components/modal-math-challenge/modal-math-challenge.component';
import { AlertConfig, ConfirmConfig, MODAL_SIZES, ModalConfig } from '../models/modal-config.model';
import { ModalRef } from '../models/modal-ref.model';
import { MODAL_DATA, MODAL_REF } from '../tokens/modal-tokens';

/**
 * Сервис для управления модальными окнами
 */
@Injectable({
  providedIn: 'root',
})
export class ModalService {
  private readonly overlay = inject(Overlay);
  private readonly injector = inject(Injector);

  /** Стек открытых модалов */
  private modalStack: ModalRef<unknown>[] = [];

  /** Максимальное количество открытых модалов */
  private readonly maxOpenModals = 5;

  /** Базовый z-index для модалов */
  private readonly baseZIndex = 1000;

  /**
   * Открыть компонент в модальном окне
   */
  open<TComponent, TData = unknown, TResult = unknown>(
    component: ComponentType<TComponent>,
    config?: ModalConfig<TData, TResult>,
  ): ModalRef<TResult> {
    // Проверка лимита модалов
    if (this.modalStack.length >= this.maxOpenModals) {
      console.warn(`Maximum ${this.maxOpenModals} modals reached`);
      return this.modalStack[this.modalStack.length - 1] as ModalRef<TResult>;
    }

    // Дефолтная конфигурация
    const defaultConfig: Partial<ModalConfig<TData, TResult>> = {
      size: 'medium',
      position: 'center',
      closeOnBackdrop: true,
      closeOnEsc: true,
      showCloseButton: true,
      showBackdrop: true,
      mobileFullscreen: true,
      mobileBreakpoint: 768,
      disableFooterWhileLoading: true,
    };

    const modalConfig = { ...defaultConfig, ...config };

    // Создаем overlay
    const overlayRef = this.createOverlay(modalConfig);
    const modalRef = new ModalRef<TResult, TData>(overlayRef, modalConfig);

    // Создаем injector с данными
    const injector = this.createInjector(modalRef, modalConfig);

    // Создаем компонент
    const portal = new ComponentPortal(component, null, injector);
    overlayRef.attach(portal);

    // Добавляем в стек
    this.modalStack.push(modalRef as unknown as ModalRef<unknown, unknown>);

    // Обработка закрытия
    modalRef.afterClosed().subscribe(() => {
      this.removeFromStack(modalRef as unknown as ModalRef<unknown, unknown>);
    });

    // Закрытие по клику на backdrop
    if (modalConfig.closeOnBackdrop) {
      overlayRef.backdropClick().subscribe(() => {
        modalRef.close();
      });
    }

    // Закрытие по ESC
    if (modalConfig.closeOnEsc) {
      overlayRef.keydownEvents().subscribe((event: KeyboardEvent) => {
        if (
          event.key === 'Escape' &&
          this.isTopModal(modalRef as unknown as ModalRef<unknown, unknown>)
        ) {
          modalRef.close();
        }
      });
    }

    return modalRef;
  }

  /**
   * Открыть модал подтверждения
   */
  async confirm<TResult = boolean>(config: ConfirmConfig): Promise<TResult | undefined> {
    const modalRef = this.open<ModalConfirmComponent, ConfirmConfig, TResult>(
      ModalConfirmComponent,
      {
        ...config,
        size: config.size || 'small',
        data: config as unknown as ConfirmConfig,
      },
    );

    return new Promise((resolve) => {
      modalRef.afterClosed().subscribe((result) => {
        resolve(result);
      });
    });
  }

  /**
   * Открыть информационный модал
   */
  async alert(config: AlertConfig): Promise<void> {
    const modalRef = this.open<ModalAlertComponent, AlertConfig, void>(ModalAlertComponent, {
      ...config,
      size: config.size || 'small',
      data: config as unknown as AlertConfig,
    });

    return new Promise((resolve) => {
      modalRef.afterClosed().subscribe(() => {
        resolve();
      });
    });
  }

  /**
   * Специализированный модал для подтверждения удаления
   */
  async delete(message: string, title = 'Удалить?', confirmText = 'Удалить'): Promise<boolean> {
    const result = await this.confirm({
      title,
      message,
      confirmText,
      cancelText: 'Отменить',
      confirmType: 'danger',
      icon: 'actions/av_trash',
      centered: true,
      size: 'small',
    });
    return !!result;
  }

  /**
   * Модал успешного завершения операции
   */
  async success(message: string, title = 'Успешно', centered = false): Promise<void> {
    return this.alert({
      title,
      message,
      alertType: 'success',
      centered,
      icon: 'actions/av_check_mark',
      okType: 'primary',
    });
  }

  /**
   * Модал ошибки
   */
  async error(message: string, title = 'Ошибка', centered = false): Promise<void> {
    return this.alert({
      title,
      message,
      alertType: 'error',
      centered,
      icon: 'actions/av_close',
      okType: 'danger',
    });
  }

  /**
   * Модал предупреждения
   */
  async warning(message: string, title = 'Внимание'): Promise<void> {
    return this.alert({
      title,
      message,
      alertType: 'warning',
    });
  }

  /**
   * Модал информации
   */
  async info(message: string, title = 'Информация'): Promise<void> {
    return this.alert({
      title,
      message,
      alertType: 'info',
      icon: 'system/av_info',
    });
  }

  /**
   * Удобный хелпер для математической проверки (для обратной совместимости)
   */
  async challenge(
    message: string,
    question: string,
    expectedAnswer: string,
    title = 'Подтверждение',
    panelClass?: string | string[],
  ): Promise<boolean> {
    return this.mathChallenge({
      message,
      question,
      expectedAnswer,
      title,
      panelClass,
      type: 'danger',
    });
  }

  /**
   * Предупреждающая проверка (желтая)
   */
  async challengeWarning(
    message: string,
    question: string,
    expectedAnswer: string,
    title = 'Предупреждение',
    panelClass?: string | string[],
  ): Promise<boolean> {
    return this.mathChallenge({
      message,
      question,
      expectedAnswer,
      title,
      panelClass,
      type: 'warning',
      confirmText: 'ДА, В КОРЗИНУ',
    });
  }

  /**
   * Модал с математической проверкой
   */
  async mathChallenge(config: MathChallengeConfig): Promise<boolean> {
    const modalRef = this.open<ModalMathChallengeComponent, MathChallengeConfig, boolean>(
      ModalMathChallengeComponent,
      {
        ...config,
        centered: true,
        panelClass: config.panelClass,
        data: {
          ...config,
          type: config.type || 'danger',
        } as unknown as MathChallengeConfig,
      },
    );

    return new Promise((resolve) => {
      modalRef.afterClosed().subscribe((result) => {
        resolve(!!result);
      });
    });
  }

  /**
   * Закрыть все модалы
   */
  closeAll(): void {
    [...this.modalStack].reverse().forEach((ref) => ref.close());
    this.modalStack = [];
  }

  /**
   * Получить количество открытых модалов
   */
  getOpenModalsCount(): number {
    return this.modalStack.length;
  }

  /**
   * Создать overlay конфигурацию
   */
  private createOverlay<TData, TResult>(config: ModalConfig<TData, TResult>): OverlayRef {
    const positionStrategy = this.overlay.position().global().centerHorizontally();

    switch (config.position) {
      case 'top':
        positionStrategy.top('0');
        break;
      case 'bottom':
        positionStrategy.bottom('0');
        break;
      default:
        positionStrategy.centerVertically();
    }

    const overlayConfig = new OverlayConfig({
      hasBackdrop: config.showBackdrop,
      backdropClass: [
        'modal-backdrop',
        ...(Array.isArray(config.backdropClass)
          ? config.backdropClass
          : config.backdropClass
            ? [config.backdropClass]
            : []),
      ],
      panelClass: [
        'modal-panel',
        ...(Array.isArray(config.panelClass)
          ? config.panelClass
          : config.panelClass
            ? [config.panelClass]
            : []),
      ],
      scrollStrategy: this.overlay.scrollStrategies.block(),
      positionStrategy,
      width: config.width || this.getWidth(config),
      height: config.height,
      maxWidth: config.maxWidth || '95vw',
      maxHeight: config.maxHeight || '90vh',
    });

    return this.overlay.create(overlayConfig);
  }

  private getWidth<TData, TResult>(config: ModalConfig<TData, TResult>): string {
    if (
      config.mobileFullscreen &&
      typeof window !== 'undefined' &&
      window.innerWidth != null &&
      window.innerWidth < (config.mobileBreakpoint || 768)
    ) {
      return '100vw';
    }

    return MODAL_SIZES[config.size || 'medium'];
  }

  private createInjector<TData, TResult>(
    modalRef: ModalRef<TResult>,
    config: ModalConfig<TData, TResult>,
  ): Injector {
    const modalData = config.data !== undefined ? config.data : config;

    return Injector.create({
      parent: this.injector,
      providers: [
        { provide: ModalRef, useValue: modalRef },
        { provide: MODAL_REF, useValue: modalRef },
        { provide: MODAL_DATA, useValue: modalData },
      ],
    });
  }

  private removeFromStack(ref: ModalRef<unknown>): void {
    const index = this.modalStack.indexOf(ref);
    if (index > -1) {
      this.modalStack.splice(index, 1);
    }
  }

  private isTopModal(ref: ModalRef<unknown>): boolean {
    return this.modalStack.length > 0 && this.modalStack[this.modalStack.length - 1] === ref;
  }
}
