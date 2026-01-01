import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';

interface ContextMenuAction {
  icon: string;
  label: string;
  action: () => void;
  danger?: boolean;
}

@Component({
  selector: 'app-image-context-menu',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="image-context-menu"
      *ngIf="isVisible"
      [style.left.px]="x"
      [style.top.px]="y"
      (click)="$event.stopPropagation()"
    >
      <button
        *ngFor="let item of menuItems"
        class="context-menu-item"
        [class.danger]="item.danger"
        (click)="executeAction(item)"
      >
        <span class="icon">{{ item.icon }}</span>
        <span class="label">{{ item.label }}</span>
      </button>
    </div>
    <div class="context-menu-backdrop" *ngIf="isVisible" (click)="hide()"></div>
  `,
  styles: [
    `
      .context-menu-backdrop {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 9997;
      }

      .image-context-menu {
        position: fixed;
        background: white;
        border-radius: 8px;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.1);
        padding: 6px;
        min-width: 200px;
        z-index: 9998;
        animation: contextMenuFadeIn 0.15s ease;

        .context-menu-item {
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
          padding: 10px 12px;
          border: none;
          background: transparent;
          border-radius: 6px;
          font-size: 13px;
          color: #333;
          cursor: pointer;
          transition: background-color 0.15s ease;
          text-align: left;

          .icon {
            font-size: 16px;
            width: 20px;
            text-align: center;
          }

          .label {
            flex: 1;
            font-weight: 500;
          }

          &:hover {
            background: #f5f5f5;
          }

          &.danger {
            color: #dc3545;

            &:hover {
              background: #fff5f5;
            }
          }
        }
      }

      @keyframes contextMenuFadeIn {
        from {
          opacity: 0;
          transform: scale(0.95);
        }
        to {
          opacity: 1;
          transform: scale(1);
        }
      }
    `,
  ],
})
export class ImageContextMenuComponent implements OnInit, OnDestroy {
  isVisible = false;
  x = 0;
  y = 0;
  currentFigure?: HTMLElement;
  menuItems: ContextMenuAction[] = [];

  ngOnInit(): void {
    // Слушаем событие открытия контекстного меню
    document.addEventListener('showImageContextMenu', this.handleShowMenu as EventListener);
  }

  ngOnDestroy(): void {
    document.removeEventListener('showImageContextMenu', this.handleShowMenu as EventListener);
  }

  /**
   * Обработчик показа меню
   */
  private handleShowMenu = (event: CustomEvent): void => {
    const { x, y, figure } = event.detail;
    this.currentFigure = figure;

    // Устанавливаем позицию
    this.x = x;
    this.y = y;

    // Создаём пункты меню
    this.menuItems = [
      {
        icon: '✏️',
        label: 'Редактировать',
        action: () => this.editImage(),
      },
      {
        icon: '🔄',
        label: 'Заменить',
        action: () => this.replaceImage(),
      },
      {
        icon: '📋',
        label: 'Копировать',
        action: () => this.copyImage(),
      },
      {
        icon: '💾',
        label: 'Скачать',
        action: () => this.downloadImage(),
      },
      {
        icon: '🗑️',
        label: 'Удалить',
        action: () => this.deleteImage(),
        danger: true,
      },
    ];

    this.isVisible = true;

    // Корректируем позицию если меню выходит за границы экрана
    setTimeout(() => {
      this.adjustPosition();
    }, 0);
  };

  /**
   * Корректирует позицию меню
   */
  private adjustPosition(): void {
    const menu = document.querySelector('.image-context-menu') as HTMLElement;
    if (!menu) return;

    const rect = menu.getBoundingClientRect();
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    // Проверяем выход за правую границу
    if (rect.right > windowWidth) {
      this.x = windowWidth - rect.width - 10;
    }

    // Проверяем выход за нижнюю границу
    if (rect.bottom > windowHeight) {
      this.y = windowHeight - rect.height - 10;
    }

    // Проверяем выход за верхнюю границу
    if (this.y < 10) {
      this.y = 10;
    }

    // Проверяем выход за левую границу
    if (this.x < 10) {
      this.x = 10;
    }
  }

  /**
   * Выполняет действие и скрывает меню
   */
  executeAction(item: ContextMenuAction): void {
    item.action();
    this.hide();
  }

  /**
   * Скрывает меню
   */
  hide(): void {
    this.isVisible = false;
    this.currentFigure = undefined;
  }

  // ════════════════════════════════════════════════════════════════════════════
  // ACTIONS
  // ════════════════════════════════════════════════════════════════════════════

  /**
   * Редактировать изображение
   */
  private editImage(): void {
    if (!this.currentFigure) return;

    const img = this.currentFigure.querySelector('img');
    if (!img) return;

    // Открываем модальное окно с редактором
    const event = new CustomEvent('openImageModalForEdit', {
      detail: {
        figure: this.currentFigure,
        imageUrl: img.src,
      },
    });
    document.dispatchEvent(event);
  }

  /**
   * Заменить изображение
   */
  private replaceImage(): void {
    if (!this.currentFigure) return;

    // Открываем модальное окно для замены
    const event = new CustomEvent('openImageModalForReplace', {
      detail: {
        figure: this.currentFigure,
      },
    });
    document.dispatchEvent(event);
  }

  /**
   * Копировать изображение
   */
  private async copyImage(): Promise<void> {
    if (!this.currentFigure) return;

    const img = this.currentFigure.querySelector('img');
    if (!img) return;

    try {
      // Копируем src в буфер обмена
      await navigator.clipboard.writeText(img.src);

      // Показываем уведомление
      const event = new CustomEvent('showToast', {
        detail: {
          type: 'success',
          message: 'URL изображения скопирован',
        },
      });
      document.dispatchEvent(event);
    } catch (error) {
      console.error('Error copying image:', error);
      const event = new CustomEvent('showToast', {
        detail: {
          type: 'error',
          message: 'Ошибка копирования',
        },
      });
      document.dispatchEvent(event);
    }
  }

  /**
   * Скачать изображение
   */
  private async downloadImage(): Promise<void> {
    if (!this.currentFigure) return;

    const img = this.currentFigure.querySelector('img');
    if (!img) return;

    try {
      // Создаём временную ссылку для скачивания
      const response = await fetch(img.src);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = img.alt || `image-${Date.now()}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      URL.revokeObjectURL(url);

      // Показываем уведомление
      const event = new CustomEvent('showToast', {
        detail: {
          type: 'success',
          message: 'Изображение скачано',
        },
      });
      document.dispatchEvent(event);
    } catch (error) {
      console.error('Error downloading image:', error);
      const event = new CustomEvent('showToast', {
        detail: {
          type: 'error',
          message: 'Ошибка скачивания',
        },
      });
      document.dispatchEvent(event);
    }
  }

  /**
   * Удалить изображение
   */
  private deleteImage(): void {
    if (!this.currentFigure) return;

    if (confirm('Удалить это изображение?')) {
      this.currentFigure.remove();

      // Показываем уведомление
      const event = new CustomEvent('showToast', {
        detail: {
          type: 'success',
          message: 'Изображение удалено',
        },
      });
      document.dispatchEvent(event);

      // Триггерим input event для сохранения изменений
      const editorContent = document.querySelector('[contenteditable="true"]');
      if (editorContent) {
        editorContent.dispatchEvent(new Event('input', { bubbles: true }));
      }
    }
  }
}
