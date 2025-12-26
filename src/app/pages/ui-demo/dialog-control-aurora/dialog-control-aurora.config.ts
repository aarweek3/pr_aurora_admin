import { ControlDocumentationConfig } from '@shared/components/ui/control-documentation';

export const DOCUMENTATION: ControlDocumentationConfig = {
  demoComponent: {
    name: 'DialogControlAuroraComponent',
    path: 'src/app/pages/ui-demo/dialog-control-aurora/',
    description: 'Демонстрация возможностей системы диалоговых окон и модальных уведомлений',
    icon: 'general/av_page',
  },

  controlComponent: {
    name: 'ModalComponent (av-modal)',
    path: 'src/app/shared/components/ui/modal/modal.component.ts',
    description:
      'Универсальный компонент модального окна с поддержкой различных позиций и размеров',
    icon: 'general/av_component',
  },

  mainDescription: {
    componentTitle: 'Modal & Dialog System',
    shortDescription: 'Комплексное решение для создания модальных окон и диалогов подтверждения.',
    detailedDescription:
      'Система включает в себя как декларативный компонент <av-modal> для сложных форм, так и ModalService для быстрого вызова типовых диалогов (alert, confirm, success, error). Поддерживает анимации, перетаскивание, центрирование и адаптивность.',
    keyFeatures: [
      '🔌 Вызов через ModalService (Promise-based)',
      '🏗️ Декларативное использование через компонент',
      '🎯 Специализированные методы: success, error, info, delete',
      '📏 Гибкая настройка размеров и позиционирования',
      '🖱️ Поддержка перетаскивания (Draggable)',
      '⌨️ Управление через клавиатуру (Esc) и Backdrop',
    ],
  },

  apiDetails: {
    inputs: [
      {
        name: 'isOpen',
        type: 'boolean',
        defaultValue: 'false',
        description: 'Управление видимостью окна (двустороннее связывание)',
        required: true,
      },
      {
        name: 'title',
        type: 'string',
        description: 'Заголовок модального окна',
      },
      {
        name: 'size',
        type: "'small' | 'medium' | 'large' | 'fullscreen'",
        defaultValue: "'medium'",
        description: 'Размер окна',
      },
      {
        name: 'centered',
        type: 'boolean',
        defaultValue: 'false',
        description: 'Центрировать окно по вертикали и горизонтали',
      },
      {
        name: 'draggable',
        type: 'boolean',
        defaultValue: 'false',
        description: 'Разрешить перетаскивание окна за заголовок',
      },
    ],
    outputs: [
      {
        name: 'isOpenChange',
        type: 'EventEmitter<boolean>',
        description: 'Событие изменения состояния видимости',
      },
    ],
    methods: [
      {
        name: 'open',
        parameters: 'componentOrTemplate, config',
        returnType: 'ModalRef',
        description: 'Открыть произвольный компонент или шаблон',
      },
      {
        name: 'confirm',
        parameters: 'config',
        returnType: 'Promise<boolean>',
        description: 'Открыть диалог подтверждения',
      },
    ],
  },

  usageExamples: [
    {
      title: 'Простой Alert через ModalService',
      description: 'Быстрое создание уведомления пользователя',
      htmlCode: `<button av-button (click)="showAlert()">Показать уведомление</button>`,
      tsCode: `import { ModalService } from '@shared/services/modal.service';

constructor(private modalService: ModalService) {}

showAlert() {
  this.modalService.alert({
    title: 'Успешно',
    message: 'Данные сохранены',
    alertType: 'success'
  });
}`,
    },
    {
      title: 'Диалог подтверждения',
      description: 'Получение подтверждения от пользователя перед выполнением действия',
      htmlCode: `<button av-button avType="danger" (click)="deleteItem()">Удалить</button>`,
      tsCode: `async deleteItem() {
  const confirmed = await this.modalService.confirm({
    title: 'Удалить запись?',
    message: 'Это действие необратимо.',
    confirmText: 'Удалить',
    cancelText: 'Отмена',
    confirmType: 'danger'
  });

  if (confirmed) {
    // Выполнить удаление
    console.log('Элемент удален');
  }
}`,
    },
    {
      title: 'Декларативное модальное окно',
      description: 'Использование компонента <av-modal> для сложных форм',
      htmlCode: `<av-modal
  [(isOpen)]="isFormVisible"
  title="Редактирование профиля"
  [centered]="true"
  [avWidth]="'600px'">

  <div modal-body>
    <form [formGroup]="profileForm">
      <av-input label="Имя" formControlName="name"></av-input>
      <av-input label="Email" formControlName="email"></av-input>
    </form>
  </div>

  <div modal-footer>
    <button av-button avType="default" (click)="isFormVisible = false">
      Отмена
    </button>
    <button av-button avType="primary" (click)="saveProfile()">
      Сохранить
    </button>
  </div>
</av-modal>`,
      tsCode: `import { FormBuilder, FormGroup } from '@angular/forms';

export class ProfileComponent {
  isFormVisible = false;
  profileForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.profileForm = this.fb.group({
      name: [''],
      email: ['']
    });
  }

  saveProfile() {
    if (this.profileForm.valid) {
      // Логика сохранения
      this.isFormVisible = false;
    }
  }
}`,
    },
  ],

  codeExamples: [
    {
      title: 'Декларативный компонент',
      description: 'Использование модального окна в шаблоне',
      htmlCode: `<av-modal [(isOpen)]="isVisible" title="Редактирование">
  <div modal-body>
    <input av-input placeholder="Имя" />
  </div>
  <div modal-footer>
    <button av-button (click)="isVisible = false">Закрыть</button>
  </div>
</av-modal>`,
      tsCode: `isVisible = false;`,
    },
  ],

  interactiveExample: {
    title: 'Динамическая конфигурация',
    description: 'Код вызова диалога на основе выбранных в Playground настроек',
  },

  architectureNotes: [
    {
      type: 'info',
      title: 'ModalService vs Component',
      content:
        'Используйте ModalService для простых диалогов и уведомлений. Компонент <av-modal> лучше подходит для сложных форм с внутренним состоянием.',
    },
  ],
};
