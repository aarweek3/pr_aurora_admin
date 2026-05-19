import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ButtonDirective } from '../../../shared/components/ui/button/button.directive';
import { HelpCopyContainerComponent } from '../../../shared/components/ui/container-help-copy-ui/container-help-copy-ui.component';
import { ModalComponent, ModalService } from '../../../shared/components/ui/modal';
import { DemoModalContentComponent } from './components/demo-modal-content.component';

@Component({
  selector: 'app-modal-ui',
  standalone: true,
  imports: [CommonModule, ModalComponent, ButtonDirective, HelpCopyContainerComponent],
  templateUrl: './modal-ui.component.html',
  styleUrl: './modal-ui.component.scss',
})
export class ModalUiComponent {
  modalService = inject(ModalService);

  showBasicModal = false;
  showSizeModal = false;
  showPositionModal = false;
  showNoBackdropModal = false;
  showNoEscModal = false;
  showNoCloseButtonModal = false;
  showHelpModal = false;
  showPrincipleModal = false;

  currentSize: any = 'medium';
  currentPosition: any = 'center';

  showCode: Record<string, boolean> = {};

  helpCode = `// РУКОВОДСТВО ПО ИСПОЛЬЗОВАНИЮ MODAL SERVICE

// 1. ПОДКЛЮЧЕНИЕ (Два способа)
// Способ А: Через конструктор
// constructor(private modalService: ModalService) {}

// Способ Б: Через функцию inject (современный подход Angular)
// private modalService = inject(ModalService);

// 2. ПОЛНЫЙ ПРИМЕР КОМПОНЕНТА
@Component({
  selector: 'app-user-list',
  template: '<button (click)="onDelete()">Удалить</button>'
})
export class UserListComponent {
  private modalService = inject(ModalService);

  async onDelete() {
    // Шаг 1: Запрос подтверждения
    const confirmed = await this.modalService.delete(
      'Вы уверены, что хотите удалить этого пользователя?',
      'Удаление'
    );

    // Шаг 2: Если нажата "Отмена" - ничего не делаем
    if (!confirmed) return;

    try {
      // Шаг 3: Вызов API (имитация)
      // await this.api.deleteUser(id);

      // Шаг 4: Показ успеха (центрированный дизайн)
      await this.modalService.success('Пользователь удален', 'Успешно', true);
    } catch (e) {
      // Шаг 5: Показ ошибки
      await this.modalService.error('Не удалось удалить', 'Ошибка', true);
    }
  }
}

// 3. УДАЛЕНИЕ (Критическое действие)
// Метод .delete() возвращает Promise<boolean>.
// true - если нажата красная кнопка, false - если отмена.
async deleteUser(user: any) {
  const confirmed = await this.modalService.delete(
    'Вы уверены, что хотите удалить пользователя ' + user.name + '?',
    'Удаление'
  );

  if (confirmed) {
    // Выполняем удаление через API
    console.log('Пользователь удален');

    // Показываем успех
    await this.modalService.success('Данные успешно удалены', 'Готово', true);
  }
}

// 4. УСПЕХ / ОШИБКА (Уведомления)
// Параметр 'true' в конце включает центрированный дизайн (большая иконка).
async onSave() {
  try {
    // Логика сохранения...
    await this.modalService.success('Изменения сохранены!', 'Успех', true);
  } catch (e) {
    await this.modalService.error('Ошибка при сохранении', 'Ошибка', true);
  }
}

// 5. КАСТОМНЫЕ ФОРМЫ
// Открытие своего компонента и получение данных из него.
openUserForm() {
  const modalRef = this.modalService.open(UserFormComponent, {
    title: 'Новый пользователь',
    size: 'medium',
    data: { role: 'admin' }
  });

  modalRef.afterClosed().subscribe(result => {
    if (result) {
      console.log('Данные из формы:', result);
    }
  });
}`;

  basicCode = `<av-modal
  [(isOpen)]="showBasicModal"
  title="Базовый модал"
  subtitle="Это простой пример модального окна"
  size="medium"
>
  <div modal-body>
    <p>Содержимое модального окна</p>
    <p>Здесь может быть любой контент</p>
  </div>

  <div modal-footer>
    <button av-button avType="default" (clicked)="showBasicModal = false">Отмена</button>
    <button av-button avType="primary" (clicked)="showBasicModal = false">Сохранить</button>
  </div>
</av-modal>`;

  sizesCode = `<!-- Small (400px) -->
<av-modal [(isOpen)]="showSmall" size="small"></av-modal>

<!-- Medium (600px) - по умолчанию -->
<av-modal [(isOpen)]="showMedium" size="medium"></av-modal>

<!-- Large (800px) -->
<av-modal [(isOpen)]="showLarge" size="large"></av-modal>

<!-- XLarge (1000px) -->
<av-modal [(isOpen)]="showXLarge" size="xlarge"></av-modal>

<!-- Fullscreen (100vw/100vh) -->
<av-modal [(isOpen)]="showFull" size="fullscreen"></av-modal>`;

  positionCode = `<!-- По центру (по умолчанию) -->
<av-modal [(isOpen)]="showCenter" position="center"></av-modal>

<!-- Сверху -->
<av-modal [(isOpen)]="showTop" position="top"></av-modal>

<!-- Снизу (Bottom Sheet) -->
<av-modal [(isOpen)]="showBottom" position="bottom"></av-modal>`;

  configCode = `<!-- Без затемнения фона -->
<av-modal [(isOpen)]="show" [showBackdrop]="false"></av-modal>

<!-- Отключить закрытие по ESC -->
<av-modal [(isOpen)]="show" [closeOnEsc]="false"></av-modal>

<!-- Отключить закрытие по клику на фон -->
<av-modal [(isOpen)]="show" [closeOnBackdrop]="false"></av-modal>

<!-- Скрыть кнопку закрытия (X) -->
<av-modal [(isOpen)]="show" [showCloseButton]="false"></av-modal>`;

  centeredCode = `// РУКОВОДСТВО: ЦЕНТРИРОВАННЫЕ МОДАЛЬНЫЕ ОКНА (DESIGN)
// Используются для важных действий: Удаление, Успех, Ошибка.

// 1. УДАЛЕНИЕ (Критическое действие)
// Метод .delete() возвращает Promise<boolean>.
// true - если нажата красная кнопка, false - если нажата отмена или окно закрыто.
async deleteReport(reportId: string) {
  const confirmed = await this.modalService.delete(
    'Все данные отчета будут безвозвратно удалены. Вы уверены?',
    'Удалить отчет?'
  );

  if (confirmed) {
    // Выполняем удаление только если пользователь подтвердил
    console.log('Удаляем отчет:', reportId);
  }
}

// 2. УСПЕХ (Уведомление о завершении)
// Параметр 'true' в конце включает центрированный дизайн (большая иконка).
async onProjectCreated() {
  await this.modalService.success(
    'Проект успешно создан и готов к работе!',
    'Готово',
    true // centered: true
  );
  // Этот код выполнится только ПОСЛЕ того, как пользователь нажмет "ОК"
}

// 3. ОШИБКА (Критический сбой)
async onSaveError() {
  await this.modalService.error(
    'Не удалось сохранить изменения из-за ошибки сервера.',
    'Ошибка сохранения',
    true // centered: true
  );
}`;

  serviceCode = `// РУКОВОДСТВО: РАБОТА С MODAL SERVICE (API)

// 1. ПОДКЛЮЧЕНИЕ СЕРВИСА
// В конструкторе вашего компонента:
// constructor(private modalService: ModalService) {}

// 2. ОТКРЫТИЕ СВОЕГО КОМПОНЕНТА (ФОРМЫ)
// Метод .open() возвращает ModalRef для управления окном.
const modalRef = this.modalService.open(UserEditComponent, {
  title: 'Редактирование',
  data: { id: 123 }, // Данные передаются в компонент
  size: 'medium'
});

// ПОЛУЧЕНИЕ ДАННЫХ ПРИ ЗАКРЫТИИ:
modalRef.afterClosed().subscribe(result => {
  if (result) {
    console.log('Данные из формы:', result);
  }
});

// 3. ДИАЛОГ ПОДТВЕРЖДЕНИЯ (CONFIRM)
// Возвращает Promise<boolean>. Удобно использовать с await.
const isOk = await this.modalService.confirm({
  title: 'Выйти?',
  message: 'Данные не сохранены.',
  confirmText: 'Выйти',
  confirmType: 'danger' // Делает кнопку красной
});

// 4. БЫСТРЫЕ УВЕДОМЛЕНИЯ (ALERTS)
this.modalService.info('Система обновлена');
this.modalService.warning('Низкий заряд батареи');
`;

  principleModalCode = `ПРИНЦИП РАБОТЫ МОДАЛЬНОЙ СИСТЕМЫ

1. АРХИТЕКТУРА (Angular CDK Overlay)
   Система построена на базе Angular CDK Overlay. Это гарантирует:
   - Правильное наложение (Z-index) вне иерархии DOM приложения.
   - Управление фокусом (Focus Trapping).
   - Обработку кликов по бэкдропу и клавиши ESC.

2. PROMISE-BASED API
   В отличие от стандартных подходов с Observables, ModalService использует Promises.
   Это позволяет писать чистый асинхронный код:

   if (await modal.confirm(...)) {
     // действие
   }

3. ДИНАМИЧЕСКИЙ КОНТЕНТ
   Используется ComponentPortal для рендеринга любого Angular-компонента
   внутри модального окна с сохранением Dependency Injection.

4. СТИЛИЗАЦИЯ (BEM + CSS Variables)
   Все размеры и отступы контролируются через CSS-переменные,
   что позволяет легко менять тему оформления без правки JS-кода.`;

  openModal(size: any): void {
    this.currentSize = size;
    this.showSizeModal = true;
  }

  openPositionModal(position: any): void {
    this.currentPosition = position;
    this.showPositionModal = true;
  }

  toggleCode(section: string): void {
    this.showCode[section] = !this.showCode[section];
  }

  openWithService(): void {
    const modalRef = this.modalService.open(DemoModalContentComponent, {
      title: 'Динамическое открытие',
      data: {
        title: 'Данные из сервиса',
        message: 'Этот модал открыт программно с передачей данных.',
        items: ['Пункт 1', 'Пункт 2', 'Пункт 3'],
      },
      size: 'medium',
    });

    modalRef.afterClosed().subscribe((result) => {
      if (result) {
        console.log('Модал закрыт с результатом:', result);
      }
    });
  }

  openNestedModals(): void {
    const openModal = (level: number) => {
      const modalRef = this.modalService.open(DemoModalContentComponent, {
        title: `Уровень ${level}`,
        data: {
          title: `Модал уровня ${level}`,
          message:
            level < 3
              ? 'Нажмите "Подтвердить", чтобы открыть следующий уровень.'
              : 'Это последний уровень.',
        },
        size: level === 1 ? 'large' : level === 2 ? 'medium' : 'small',
      });

      modalRef.afterClosed().subscribe((result) => {
        if (result === 'success' && level < 3) {
          openModal(level + 1);
        }
      });
    };

    openModal(1);
  }

  openConfirm() {
    this.modalService
      .confirm({
        title: 'Удалить пользователя?',
        message:
          'Вы уверены, что хотите удалить этого пользователя? Это действие нельзя будет отменить.',
        confirmText: 'Удалить',
        cancelText: 'Отмена',
        confirmType: 'danger',
        icon: 'actions/av_trash',
      })
      .then((result) => {
        console.log('Confirm result:', result);
      });
  }

  openCenteredDelete() {
    this.modalService
      .confirm({
        title: 'Удалить проект?',
        message: 'Все данные проекта будут безвозвратно удалены. Вы уверены?',
        confirmText: 'Удалить',
        cancelText: 'Отмена',
        confirmType: 'danger',
        icon: 'actions/av_trash',
        centered: true,
        size: 'small',
      })
      .then((result) => {
        console.log('Centered Delete result:', result);
      });
  }

  openSpecialDelete() {
    this.modalService
      .delete(
        'Текст сообщения в лайтбоксе, достаточно длинный, чтобы занять несколько строк',
        'Удалить отчет?',
      )
      .then((confirmed) => {
        if (confirmed) {
          console.log('Отчет удален');
        }
      });
  }

  openAlerts() {
    this.modalService.success('Операция успешно завершена!');
    setTimeout(() => this.modalService.error('Произошла ошибка при сохранении.'), 500);
    setTimeout(
      () =>
        this.modalService.alert({
          title: 'Внимание',
          message: 'Срок действия подписки истекает через 3 дня.',
          alertType: 'warning',
        }),
      1000,
    );
  }
}
