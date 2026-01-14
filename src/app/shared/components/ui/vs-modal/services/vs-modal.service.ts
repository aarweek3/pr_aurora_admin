import { Overlay, OverlayConfig } from '@angular/cdk/overlay';
import { ComponentPortal, ComponentType } from '@angular/cdk/portal';
import { ComponentRef, inject, Injectable, Injector } from '@angular/core';
import { VSModalContainerComponent } from '../components/vs-modal-container/vs-modal-container.component';
import { VSModalRef } from '../models/vs-modal-ref.model';
import { VSModalConfig } from '../models/vs-modal.config';
import { VS_MODAL_CONFIG, VS_MODAL_DATA } from '../tokens/vs-modal.tokens';

@Injectable({
  providedIn: 'root',
})
export class VSModalService {
  private readonly overlay = inject(Overlay);
  private readonly injector = inject(Injector);

  /**
   * Открыть компонент в VS модальном окне
   * @template T - тип компонента
   * @template D - тип входных данных
   * @template R - тип результата
   */
  open<T, D = any, R = any>(
    component: ComponentType<T>,
    config: VSModalConfig<D>,
  ): VSModalRef<D, R> {
    // 1. Создаем Overlay
    const overlayConfig = this.createOverlayConfig(config);
    const overlayRef = this.overlay.create(overlayConfig);

    // 2. Создаем Контроллер (Ref)
    const modalRef = new VSModalRef<D, R>(overlayRef, config);

    // 3. Создаем Инжектор для контейнера
    const containerInjector = this.createInjector(modalRef, config);

    // 4. Оборачиваем ваш компонент в наш Контейнер (Shell)
    const containerPortal = new ComponentPortal(VSModalContainerComponent, null, containerInjector);
    const containerRef: ComponentRef<VSModalContainerComponent> =
      overlayRef.attach(containerPortal);

    // 5. Передаем ваш компонент "внутрь" контейнера
    const childInjector = this.createChildInjector(modalRef, config);
    containerRef.instance.portal = new ComponentPortal(component, null, childInjector);

    // 6. Настраиваем закрытие
    if (config.hasBackdrop && config.closeOnBackdropClick) {
      overlayRef.backdropClick().subscribe(() => modalRef.close());
    }

    if (config.closeOnEscape !== false) {
      overlayRef.keydownEvents().subscribe((event) => {
        if (event.key === 'Escape') modalRef.close();
      });
    }

    return modalRef;
  }

  private createOverlayConfig(config: VSModalConfig): OverlayConfig {
    return new OverlayConfig({
      hasBackdrop: config.hasBackdrop ?? true,
      backdropClass: config.backdropClass || 'vs-modal-backdrop',
      panelClass: config.panelClass || 'vs-modal-panel',
      positionStrategy: this.overlay.position().global().centerHorizontally().centerVertically(),
      scrollStrategy: this.overlay.scrollStrategies.block(),
    });
  }

  /** Инжектор для самой оболочки окна */
  private createInjector(modalRef: VSModalRef, config: VSModalConfig): Injector {
    return Injector.create({
      parent: this.injector,
      providers: [
        { provide: VSModalRef, useValue: modalRef },
        { provide: VS_MODAL_CONFIG, useValue: config },
      ],
    });
  }

  /** Инжектор для пользовательского компонента внутри окна */
  private createChildInjector(modalRef: VSModalRef, config: VSModalConfig): Injector {
    return Injector.create({
      parent: this.injector,
      providers: [
        { provide: VSModalRef, useValue: modalRef },
        { provide: VS_MODAL_DATA, useValue: config.data },
      ],
    });
  }
}
