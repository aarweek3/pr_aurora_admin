import { ControlDocumentationConfig } from '@shared/components/ui/control-documentation';

/**
 * Конфигурация документации для ModalControlAurora
 * Используется унифицированное имя DOCUMENTATION для всех компонентов
 */
export const DOCUMENTATION: ControlDocumentationConfig = {
  // ========================================
  // 1. ИНФОРМАЦИЯ О ДЕМОНСТРАЦИОННОМ КОМПОНЕНТЕ
  // ========================================
  demoComponent: {
    name: 'ModalControlAuroraComponent',
    path: 'src/app/pages/ui-demo/modal-control-aurora/',
    description: 'Демонстрационная страница с полным управлением модальными окнами',
    icon: 'general/av_page',
  },

  // ========================================
  // 2. ИНФОРМАЦИЯ О ЦЕЛЕВОМ КОМПОНЕНТЕ/ДИРЕКТИВЕ
  // ========================================
  controlComponent: {
    name: 'ModalComponent (av-modal)',
    path: 'src/app/shared/components/ui/modal/components/modal/modal.component.ts',
    description:
      'Универсальный компонент модальных окон с поддержкой backdrop, ESC, кастомных размеров и позиционирования',
    icon: 'general/av_component',
  },

  // ========================================
  // 3. ОСНОВНОЕ ОПИСАНИЕ КОМПОНЕНТА
  // ========================================
  mainDescription: {
    componentTitle: 'ModalComponent (av-modal)',
    shortDescription:
      'Мощный и гибкий компонент модальных окон для создания диалогов, форм и уведомлений',
    detailedDescription:
      'ModalComponent предоставляет полнофункциональное решение для отображения модальных окон в приложении. ' +
      'Компонент построен на Angular CDK Overlay, что гарантирует правильное наложение (Z-index), управление фокусом ' +
      'и обработку событий. Поддерживает как декларативное использование через шаблон, так и программное открытие ' +
      'через ModalService с передачей данных и получением результата.',
    keyFeatures: [
      '🎨 5 предустановленных размеров (small, medium, large, xlarge, fullscreen)',
      '📐 Гибкая кастомизация размеров через avWidth/avHeight',
      '🔄 Двустороннее связывание состояния открытия [(isOpen)]',
      '🎯 3 варианта позиционирования (center, top, bottom)',
      '🌈 Поддержка backdrop с настройкой закрытия по клику',
      '📱 Автоматический fullscreen на мобильных устройствах',
      '⚡ Анимации открытия/закрытия с настраиваемой скоростью',
      '🛡️ TypeScript типизация и Promise-based API для ModalService',
      '🖱️ Поддержка перетаскивания (draggable) и изменения размера (resizable)',
      '⌨️ Закрытие по ESC, управление с клавиатуры, ARIA атрибуты',
    ],
  },

  // ========================================
  // 4. ДЕТАЛЬНОЕ API (САМАЯ ВАЖНАЯ СЕКЦИЯ)
  // ========================================
  apiDetails: {
    // --- ВХОДНЫЕ ПАРАМЕТРЫ (@Input) ---
    inputs: [
      {
        name: 'isOpen',
        type: 'boolean',
        defaultValue: 'false',
        description:
          'Состояние открытия модала. Поддерживает двустороннее связывание [(isOpen)]="showModal"',
        required: true,
      },
      {
        name: 'size',
        type: "'small' | 'medium' | 'large' | 'xlarge' | 'fullscreen'",
        defaultValue: "'medium'",
        description:
          'Размер модального окна: small (400px), medium (600px), large (800px), xlarge (1000px), fullscreen (100vw/100vh)',
        required: false,
      },
      {
        name: 'position',
        type: "'center' | 'top' | 'bottom'",
        defaultValue: "'center'",
        description: 'Позиция модала на экране: по центру, сверху или снизу (bottom sheet)',
        required: false,
      },
      {
        name: 'title',
        type: 'string',
        defaultValue: 'undefined',
        description: 'Заголовок модального окна, отображается в header',
        required: false,
      },
      {
        name: 'subtitle',
        type: 'string',
        defaultValue: 'undefined',
        description: 'Подзаголовок модального окна, отображается под title',
        required: false,
      },
      {
        name: 'showCloseButton',
        type: 'boolean',
        defaultValue: 'true',
        description: 'Показывать кнопку закрытия (X) в правом верхнем углу',
        required: false,
      },
      {
        name: 'showBackdrop',
        type: 'boolean',
        defaultValue: 'true',
        description: 'Показывать затемненный фон (backdrop) за модальным окном',
        required: false,
      },
      {
        name: 'closeOnBackdrop',
        type: 'boolean',
        defaultValue: 'true',
        description: 'Закрывать модал при клике на backdrop (затемненный фон)',
        required: false,
      },
      {
        name: 'closeOnEsc',
        type: 'boolean',
        defaultValue: 'true',
        description: 'Закрывать модал при нажатии клавиши ESC',
        required: false,
      },
      {
        name: 'mobileFullscreen',
        type: 'boolean',
        defaultValue: 'true',
        description: 'Автоматически переключаться в fullscreen режим на мобильных устройствах',
        required: false,
      },
      {
        name: 'mobileBreakpoint',
        type: 'number',
        defaultValue: '768',
        description: 'Брейкпоинт в пикселях для переключения в мобильный режим',
        required: false,
      },
      {
        name: 'loading',
        type: 'boolean',
        defaultValue: 'false',
        description: 'Состояние загрузки, отображает индикатор и блокирует footer',
        required: false,
      },
      {
        name: 'disableFooterWhileLoading',
        type: 'boolean',
        defaultValue: 'true',
        description: 'Блокировать кнопки в footer при состоянии loading',
        required: false,
      },
      {
        name: 'centered',
        type: 'boolean',
        defaultValue: 'false',
        description: 'Центрировать содержимое модала (для диалогов с крупными иконками)',
        required: false,
      },
      {
        name: 'avWidth',
        type: 'string | number',
        defaultValue: 'undefined',
        description: 'Кастомная ширина модала (px, %, vw). Переопределяет предустановленный size',
        required: false,
      },
      {
        name: 'avHeight',
        type: 'string | number',
        defaultValue: 'undefined',
        description: 'Кастомная высота модала (px, %, vh). Переопределяет предустановленный size',
        required: false,
      },
      {
        name: 'avMaxWidth',
        type: 'string | number',
        defaultValue: 'undefined',
        description: 'Максимальная ширина модала (px, %, vw)',
        required: false,
      },
      {
        name: 'avMaxHeight',
        type: 'string | number',
        defaultValue: 'undefined',
        description: 'Максимальная высота модала (px, %, vh)',
        required: false,
      },
      {
        name: 'draggable',
        type: 'boolean',
        defaultValue: 'false',
        description: 'Разрешить перетаскивание модального окна мышью за header',
        required: false,
      },
      {
        name: 'resizable',
        type: 'boolean',
        defaultValue: 'false',
        description: 'Разрешить изменение размера модала через ручку resize в углу',
        required: false,
      },
      {
        name: 'showMaximizeButton',
        type: 'boolean',
        defaultValue: 'false',
        description: 'Показывать кнопку развертывания модала на весь экран',
        required: false,
      },
      {
        name: 'beforeClose',
        type: '(result?: any) => boolean | Promise<boolean>',
        defaultValue: 'undefined',
        description:
          'Функция-хук, вызываемая перед закрытием. Возврат false отменяет закрытие. Поддерживает async',
        required: false,
      },
    ],

    // --- ВЫХОДНЫЕ СОБЫТИЯ (@Output) ---
    outputs: [
      {
        name: 'isOpenChange',
        type: 'EventEmitter<boolean>',
        description:
          'Событие изменения состояния открытия. Используется для двустороннего связывания [(isOpen)]',
      },
      {
        name: 'closed',
        type: 'EventEmitter<any>',
        description:
          'Событие закрытия модала с результатом. Результат передается из метода close(result)',
      },
      {
        name: 'opened',
        type: 'EventEmitter<void>',
        description: 'Событие открытия модала. Вызывается после анимации открытия',
      },
    ],

    // --- ПУБЛИЧНЫЕ МЕТОДЫ ---
    methods: [
      {
        name: 'close',
        parameters: 'result?: any',
        returnType: 'Promise<void>',
        description:
          'Закрывает модальное окно. Опциональный параметр result передается в событие closed и в Promise при использовании ModalService',
      },
      {
        name: 'toggleFullscreen',
        parameters: 'event?: MouseEvent',
        returnType: 'void',
        description: 'Переключает режим полного экрана для модального окна',
      },
    ],
  },

  // ========================================
  // 5. ПРИМЕРЫ ИСПОЛЬЗОВАНИЯ (для вкладки "Примеры")
  // ========================================
  usageExamples: [
    {
      title: 'Базовое использование',
      description: 'Простейший вариант модального окна с минимальной конфигурацией',
      htmlCode: `<av-modal
  [(isOpen)]="showModal"
  title="Заголовок модала"
  size="medium">

  <div modal-body>
    <p>Содержимое модального окна</p>
  </div>

  <div modal-footer>
    <button av-button avType="default" (clicked)="showModal = false">
      Отмена
    </button>
    <button av-button avType="primary" (clicked)="showModal = false">
      Сохранить
    </button>
  </div>
</av-modal>`,
      tsCode: `export class MyComponent {
  showModal = signal(false);

  openModal() {
    this.showModal.set(true);
  }
}`,
    },
    {
      title: 'Программное открытие через ModalService',
      description: 'Открытие модала с помощью сервиса и получение результата',
      htmlCode: `<!-- Не требуется, модал создается программно -->`,
      tsCode: `export class MyComponent {
  private modalService = inject(ModalService);

  openUserForm() {
    const modalRef = this.modalService.open(UserFormComponent, {
      title: 'Редактирование пользователя',
      size: 'medium',
      data: { userId: 123 }
    });

    modalRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('Данные из формы:', result);
        // Сохраняем данные
      }
    });
  }
}`,
    },
    {
      title: 'Диалог подтверждения (Confirm)',
      description: 'Использование встроенных методов для подтверждения действий',
      htmlCode: `<!-- Не требуется, создается через сервис -->`,
      tsCode: `export class MyComponent {
  private modalService = inject(ModalService);

  async deleteUser(user: User) {
    const confirmed = await this.modalService.delete(
      'Вы уверены, что хотите удалить пользователя ' + user.name + '?',
      'Удаление пользователя'
    );

    if (confirmed) {
      await this.api.deleteUser(user.id);
      await this.modalService.success('Пользователь удален', 'Готово', true);
    }
  }
}`,
    },
    {
      title: 'Кастомные размеры и позиционирование',
      description: 'Модал с точной настройкой размеров и позиции',
      htmlCode: `<av-modal
  [(isOpen)]="showModal"
  title="Кастомный модал"
  position="top"
  [avWidth]="'700px'"
  [avHeight]="'400px'"
  [draggable]="true"
  [resizable]="true">

  <div modal-body>
    <p>Этот модал можно перетаскивать и изменять размер</p>
  </div>
</av-modal>`,
      tsCode: `export class MyComponent {
  showModal = signal(false);
}`,
    },
  ],

  // ========================================
  // 6. ПРИМЕРЫ КОДА (для вкладки "Код")
  // ========================================
  codeExamples: [
    {
      title: 'Все размеры модалов',
      description: 'Демонстрация всех предустановленных размеров',
      htmlCode: `<!-- Small (400px) -->
<av-modal [(isOpen)]="showSmall" size="small" title="Small Modal">
  <div modal-body>Маленький модал</div>
</av-modal>

<!-- Medium (600px) - по умолчанию -->
<av-modal [(isOpen)]="showMedium" size="medium" title="Medium Modal">
  <div modal-body>Средний модал</div>
</av-modal>

<!-- Large (800px) -->
<av-modal [(isOpen)]="showLarge" size="large" title="Large Modal">
  <div modal-body>Большой модал</div>
</av-modal>

<!-- XLarge (1000px) -->
<av-modal [(isOpen)]="showXLarge" size="xlarge" title="XLarge Modal">
  <div modal-body>Очень большой модал</div>
</av-modal>

<!-- Fullscreen (100vw/100vh) -->
<av-modal [(isOpen)]="showFull" size="fullscreen" title="Fullscreen Modal">
  <div modal-body>Полноэкранный модал</div>
</av-modal>`,
      tsCode: `export class MyComponent {
  showSmall = signal(false);
  showMedium = signal(false);
  showLarge = signal(false);
  showXLarge = signal(false);
  showFull = signal(false);
}`,
    },
    {
      title: 'Позиционирование модалов',
      description: 'Различные варианты расположения на экране',
      htmlCode: `<!-- По центру (по умолчанию) -->
<av-modal [(isOpen)]="showCenter" position="center" title="Center">
  <div modal-body>Центрированный модал</div>
</av-modal>

<!-- Сверху -->
<av-modal [(isOpen)]="showTop" position="top" title="Top">
  <div modal-body>Модал сверху</div>
</av-modal>

<!-- Снизу (Bottom Sheet) -->
<av-modal [(isOpen)]="showBottom" position="bottom" title="Bottom">
  <div modal-body>Модал снизу (Bottom Sheet)</div>
</av-modal>`,
      tsCode: `export class MyComponent {
  showCenter = signal(false);
  showTop = signal(false);
  showBottom = signal(false);
}`,
    },
    {
      title: 'Настройка поведения',
      description: 'Управление закрытием модала и отображением элементов',
      htmlCode: `<!-- Без затемнения фона -->
<av-modal [(isOpen)]="show1" [showBackdrop]="false" title="Без backdrop">
  <div modal-body>Модал без затемненного фона</div>
</av-modal>

<!-- Отключить закрытие по ESC -->
<av-modal [(isOpen)]="show2" [closeOnEsc]="false" title="Без ESC">
  <div modal-body>Не закроется по нажатию ESC</div>
</av-modal>

<!-- Отключить закрытие по клику на фон -->
<av-modal [(isOpen)]="show3" [closeOnBackdrop]="false" title="Без клика на фон">
  <div modal-body>Не закроется по клику на backdrop</div>
</av-modal>

<!-- Скрыть кнопку закрытия (X) -->
<av-modal [(isOpen)]="show4" [showCloseButton]="false" title="Без кнопки X">
  <div modal-body>У этого модала нет кнопки закрытия</div>
  <div modal-footer>
    <button av-button (clicked)="show4 = false">Закрыть</button>
  </div>
</av-modal>`,
      tsCode: `export class MyComponent {
  show1 = signal(false);
  show2 = signal(false);
  show3 = signal(false);
  show4 = signal(false);
}`,
    },
    {
      title: 'ModalService - Confirm, Delete, Alerts',
      description: 'Использование встроенных методов сервиса для стандартных диалогов',
      htmlCode: `<!-- Все создается программно через ModalService -->`,
      tsCode: `export class MyComponent {
  private modalService = inject(ModalService);

  // CONFIRM - базовый диалог подтверждения
  async showConfirm() {
    const confirmed = await this.modalService.confirm({
      title: 'Выйти?',
      message: 'Несохраненные данные будут потеряны.',
      confirmText: 'Выйти',
      cancelText: 'Отмена',
      confirmType: 'danger'
    });

    if (confirmed) {
      // Пользователь подтвердил
    }
  }

  // DELETE - специальный диалог удаления
  async deleteItem(id: string) {
    const confirmed = await this.modalService.delete(
      'Все данные будут безвозвратно удалены. Вы уверены?',
      'Удалить отчет?'
    );

    if (confirmed) {
      await this.api.delete(id);
    }
  }

  // SUCCESS - уведомление об успехе
  async onSaveSuccess() {
    await this.modalService.success(
      'Изменения успешно сохранены!',
      'Готово',
      true // centered: true (большая иконка)
    );
  }

  // ERROR - уведомление об ошибке
  async onSaveError() {
    await this.modalService.error(
      'Не удалось сохранить изменения. Попробуйте еще раз.',
      'Ошибка',
      true
    );
  }

  // INFO, WARNING - простые уведомления
  showInfo() {
    this.modalService.info('Система обновлена до версии 2.0');
    this.modalService.warning('Низкий заряд батареи');
  }
}`,
    },
    {
      title: 'Центрированные диалоги с иконками',
      description: 'Модалы с крупными иконками для важных действий',
      htmlCode: `<av-modal
  [(isOpen)]="showCentered"
  title="Подтвердите действие"
  size="small"
  [centered]="true">

  <div modal-body style="text-align: center; padding: 32px;">
    <av-icon
      name="actions/av_trash"
      [size]="64"
      color="#ff4d4f"
      style="margin-bottom: 16px;">
    </av-icon>
    <p style="font-size: 16px; color: #333;">
      Вы действительно хотите удалить этот элемент?
    </p>
  </div>

  <div modal-footer style="justify-content: center;">
    <button av-button avType="default" (clicked)="showCentered = false">
      Отмена
    </button>
    <button av-button avType="danger" (clicked)="confirmDelete()">
      Удалить
    </button>
  </div>
</av-modal>`,
      tsCode: `export class MyComponent {
  showCentered = signal(false);

  confirmDelete() {
    // Логика удаления
    this.showCentered.set(false);
  }
}`,
    },
  ],

  // ========================================
  // 7. ИНТЕРАКТИВНЫЙ ПРИМЕР
  // ========================================
  interactiveExample: {
    title: 'Интерактивный Playground',
    description:
      'Настройте все параметры модального окна в режиме реального времени и получите готовый код для использования',
  },

  // ========================================
  // 8. АРХИТЕКТУРНЫЕ ЗАМЕТКИ
  // ========================================
  architectureNotes: [
    {
      type: 'info',
      title: 'Архитектура на базе Angular CDK Overlay',
      content:
        'Компонент построен на мощной библиотеке Angular CDK Overlay, которая обеспечивает: ' +
        '(1) Правильное наложение (Z-index) вне иерархии DOM приложения, ' +
        '(2) Автоматическое управление фокусом (Focus Trapping) для доступности, ' +
        '(3) Обработку кликов по backdrop и клавиши ESC на уровне документа, ' +
        '(4) Динамический рендеринг компонентов через ComponentPortal с сохранением Dependency Injection.',
    },
    {
      type: 'tip',
      title: 'Promise-based API для чистого async кода',
      content:
        'В отличие от стандартных подходов с Observables, ModalService использует Promises для методов confirm, delete, success, error. ' +
        'Это позволяет писать чистый асинхронный код с async/await: ' +
        '`if (await modal.confirm(...)) { /* действие */ }`. ' +
        'Для сложных сценариев с потоками данных используйте afterClosed() Observable.',
    },
    {
      type: 'info',
      title: 'Стилизация через CSS Variables',
      content:
        'Все размеры, отступы и цвета модальных окон контролируются через CSS-переменные, ' +
        'что позволяет легко менять тему оформления без правки JavaScript-кода. ' +
        'Компонент автоматически адаптируется к светлой/темной теме приложения.',
    },
    {
      type: 'warning',
      title: 'Управление Z-Index при вложенных модалах',
      content:
        'Система автоматически управляет Z-index для вложенных модалов (модал открывает другой модал). ' +
        'Однако рекомендуется избегать глубокой вложенности (более 3 уровней) для лучшего UX. ' +
        'При необходимости используйте метод modalService.closeAll() для закрытия всех открытых модалов.',
    },
    {
      type: 'info',
      title: 'Доступность (WCAG 2.1)',
      content:
        'Компонент следует стандартам WCAG 2.1: ' +
        '(1) Автоматическая установка фокуса при открытии, ' +
        '(2) Focus Trap - фокус не выходит за пределы модала, ' +
        '(3) Закрытие по ESC, ' +
        '(4) ARIA атрибуты для скринридеров (role="dialog", aria-modal="true", aria-labelledby), ' +
        '(5) Навигация с клавиатуры (Tab, Shift+Tab, Enter, ESC).',
    },
    {
      type: 'tip',
      title: 'Оптимизация производительности',
      content:
        'Для больших форм внутри модала рекомендуется использовать lazy loading компонентов. ' +
        'ModalService поддерживает динамическую загрузку через ComponentPortal. ' +
        'При множественных модалах используйте ChangeDetectionStrategy.OnPush для оптимизации.',
    },
  ],
};
