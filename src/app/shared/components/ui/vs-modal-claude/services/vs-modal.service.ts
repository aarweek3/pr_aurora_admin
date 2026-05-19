import { Injectable, Injector, ComponentRef, inject, Type } from '@angular/core';
import { Overlay, OverlayConfig, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { VSModalContainerComponent } from '../components/vs-modal-container/vs-modal-container.component';
import { VSModalConfig } from '../models/vs-modal-config.model';
import { VSModalRef } from '../models/vs-modal-ref.model';
import { VS_MODAL_CONFIG, VS_MODAL_DATA } from '../models/vs-modal-data.token';

/**
 * Сервис для создания и управления модальными окнами в стиле VS Code
 */
@Injectable({
  providedIn: 'root',
})
export class VSModalService {
  private overlay = inject(Overlay);
  private injector = inject(Injector);

  /**
   * Открывает модальное окно
   * @param component - Компонент для отображения внутри модального окна
   * @param config - Конфигурация модального окна
   * @returns VSModalRef для управления окном
   */
  open<TComponent, TData = any, TResult = any>(
    component: Type<TComponent>,
    config: VSModalConfig<TData>,
  ): VSModalRef<TData, TResult> {
    // Применяем дефолтные значения
    const finalConfig: VSModalConfig<TData> = {
      width: 800,
      height: 600,
      hasBackdrop: true,
      draggable: true,
      resizable: true,
      closeOnEscape: true,
      statusText: 'Ready',
      ...config,
    };

    // Создаем OverlayRef
    const overlayRef = this.createOverlay(finalConfig);

    // Создаем VSModalRef
    const modalRef = new VSModalRef<TData, TResult>(overlayRef, finalConfig.data);

    // Создаем injector с данными
    const injector = Injector.create({
      parent: this.injector,
      providers: [
        { provide: VSModalRef, useValue: modalRef },
        { provide: VS_MODAL_CONFIG, useValue: finalConfig },
        { provide: VS_MODAL_DATA, useValue: finalConfig.data },
      ],
    });

    // Создаем portal для VSModalContainer
    const containerPortal = new ComponentPortal(VSModalContainerComponent, null, injector);
    const containerRef: ComponentRef<VSModalContainerComponent> =
      overlayRef.attach(containerPortal);

    // Вставляем пользовательский компонент в VSModalContainer
    const contentInjector = Injector.create({
      parent: injector,
      providers: [
        { provide: VSModalRef, useValue: modalRef },
        { provide: VS_MODAL_DATA, useValue: finalConfig.data },
      ],
    });

    // Используем ViewContainerRef.createComponent напрямую с типом компонента
    containerRef.instance.contentHost.createComponent(component, {
      injector: contentInjector,
    });

    return modalRef;
  }

  /**
   * Создает OverlayRef с нужной конфигурацией
   */
  private createOverlay(config: VSModalConfig): OverlayRef {
    const overlayConfig = new OverlayConfig({
      hasBackdrop: config.hasBackdrop,
      backdropClass: 'vs-modal-backdrop',
      panelClass: 'vs-modal-panel',
      scrollStrategy: this.overlay.scrollStrategies.block(),
      positionStrategy: this.overlay.position().global().centerHorizontally().centerVertically(),
    });

    return this.overlay.create(overlayConfig);
  }
}
