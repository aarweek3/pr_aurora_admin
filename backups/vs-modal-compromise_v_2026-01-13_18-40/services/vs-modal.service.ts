import { Overlay, OverlayConfig, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { inject, Injectable, Injector, Type } from '@angular/core';
import { VSModalContainerComponent } from '../components/vs-modal-container/vs-modal-container.component';
import { VSModalConfig } from '../models/vs-modal-config.model';
import { VS_MODAL_CONFIG, VS_MODAL_DATA } from '../models/vs-modal-data.token';
import { VSModalRef } from '../models/vs-modal-ref.model';

@Injectable({
  providedIn: 'root',
})
export class VSModalService {
  private readonly overlay = inject(Overlay);
  private readonly injector = inject(Injector);

  /**
   * Открывает компонент в VS-окне с 3-уровневой иерархией инжекторов
   */
  open<TComponent, TData = any, TResult = any>(
    component: Type<TComponent>,
    config: VSModalConfig<TData>,
  ): VSModalRef<TData, TResult> {
    // 0. Заполняем дефолтные значения
    const finalConfig: VSModalConfig<TData> = {
      width: 800,
      height: 600,
      minWidth: 400,
      minHeight: 300,
      draggable: true,
      resizable: true,
      hasBackdrop: true,
      closeOnEscape: true,
      closeOnBackdropClick: true,
      statusText: 'Ready',
      ...config,
    };

    // 1. Создаем Overlay
    const overlayRef = this.createOverlay(finalConfig);

    // 2. Создаем Контроллер (Ref)
    const modalRef = new VSModalRef<TData, TResult>(overlayRef, finalConfig, finalConfig.data);

    // 3. Создаем Container Injector (Level 1)
    const containerInjector = Injector.create({
      parent: this.injector,
      providers: [
        { provide: VSModalRef, useValue: modalRef },
        { provide: VS_MODAL_CONFIG, useValue: finalConfig },
      ],
    });

    // 4. Прикрепляем Контейнер (Shell)
    const containerPortal = new ComponentPortal(VSModalContainerComponent, null, containerInjector);
    const containerRef = overlayRef.attach(containerPortal);

    // 5. Создаем Content Injector (Level 2)
    const contentInjector = Injector.create({
      parent: containerInjector, // Наследуем от контейнера для доступа к Ref и Config
      providers: [
        { provide: VS_MODAL_DATA, useValue: finalConfig.data },
        // ModalRef уже доступен через родителя, но можно переопределить для типизации если нужно
      ],
    });

    // 6. Устанавливаем портал контента в контейнер
    containerRef.instance.portal = new ComponentPortal(component, null, contentInjector);

    return modalRef;
  }

  private createOverlay(config: VSModalConfig): OverlayRef {
    const overlayConfig = new OverlayConfig({
      hasBackdrop: config.hasBackdrop,
      backdropClass: config.backdropClass || 'vs-modal-backdrop',
      panelClass: config.panelClass || 'vs-modal-panel',
      scrollStrategy: this.overlay.scrollStrategies.block(),
      positionStrategy: this.overlay.position().global().centerHorizontally().centerVertically(),
    });

    return this.overlay.create(overlayConfig);
  }
}
