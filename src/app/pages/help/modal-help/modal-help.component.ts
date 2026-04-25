import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { ModalService } from '@shared/components/ui/modal/services/modal.service';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzMessageService } from 'ng-zorro-antd/message';
import { HelpPathHeaderComponent } from '@shared/components/ui';

@Component({
  selector: 'app-modal-help',
  standalone: true,
  imports: [
    CommonModule,
    NzCardModule,
    NzButtonModule,
    NzTypographyModule,
    NzIconModule,
    NzDividerModule,
    ClipboardModule,
    NzToolTipModule,
    HelpPathHeaderComponent
  ],
  template: `
    <div class="help-page-container">
      <av-help-path-header
        title="Модальные окна (ModalService)"
        subtitle="Руководство по использованию универсального сервиса модальных окон в системе Aurora."
        icon="🪟"
        componentPath="src/app/pages/help/modal-help/modal-help.component.ts"
      ></av-help-path-header>

      <nz-card class="demo-card" nzTitle="Живая демонстрация">
        <div class="demo-actions">
          <button nz-button nzType="primary" (click)="showDemoAlert()">
            <span nz-icon nzType="info-circle"></span> Простой Alert
          </button>
          <button nz-button nzType="default" (click)="showDemoConfirm()">
            <span nz-icon nzType="question-circle"></span> Окно подтверждения
          </button>
          <button nz-button nzDanger (click)="showDemoDelete()">
            <span nz-icon nzType="delete"></span> Удаление (Centered)
          </button>
          <button nz-button style="background: #52c41a; border-color: #52c41a; color: white;" (click)="showDemoChallenge()">
            <span nz-icon nzType="safety-certificate"></span> Критическое удаление (Math)
          </button>
          <button nz-button nzType="dashed" (click)="showDemoMaintenanceConfirm()">
            <span nz-icon nzType="sync"></span> Обслуживание (Confirm)
          </button>
          
          <nz-divider nzType="vertical"></nz-divider>
          
          <button nz-button style="background: #52c41a; border-color: #52c41a; color: white;" (click)="showDemoSuccess()">
            <span nz-icon nzType="check-circle"></span> Success
          </button>
          <button nz-button nzDanger (click)="showDemoError()">
            <span nz-icon nzType="close-circle"></span> Error
          </button>
          <button nz-button style="background: #faad14; border-color: #faad14; color: white;" (click)="showDemoWarning()">
            <span nz-icon nzType="warning"></span> Warning
          </button>
          <button nz-button nzType="primary" (click)="showDemoInfo()">
            <span nz-icon nzType="info-circle"></span> Info
          </button>
        </div>
      </nz-card>

      <div class="doc-section">
        <h2 nz-typography>1. Подключение сервиса</h2>
        <p>Для использования модальных окон необходимо внедрить <code>ModalService</code> в ваш компонент или сервис.</p>
        
        <div class="code-block-container">
          <div class="code-actions">
            <button nz-button nzType="text" nzSize="small" [cdkCopyToClipboard]="injectCode" (click)="onCopied()">
              <span nz-icon nzType="copy"></span>
            </button>
          </div>
          <pre><code>{{ injectCode }}</code></pre>
        </div>
      </div>

      <nz-divider></nz-divider>

      <div class="doc-section">
        <h2 nz-typography>2. Основные методы</h2>
        
        <h3 nz-typography>Информационное окно (Alert)</h3>
        <p>Используется для вывода важных уведомлений, которые требуют подтверждения прочтения (кнопка "ОК").</p>
        <div class="code-block-container">
          <pre><code>{{ alertCode }}</code></pre>
        </div>

        <h3 nz-typography style="margin-top: 24px;">Окно подтверждения (Confirm)</h3>
        <p>Используется для действий, требующих выбора пользователя (Да/Нет). Возвращает <code>Promise&lt;boolean&gt;</code>.</p>
        <div class="code-block-container">
          <pre><code>{{ confirmCode }}</code></pre>
        </div>

        <h3 nz-typography style="margin-top: 24px;">Специализированные методы</h3>
        <p>Сервис предоставляет готовые пресеты для типичных задач:</p>
        <ul>
          <li><code>success(message, title?, centered?)</code> — Зеленая иконка успеха (<code>general/av_check-circle</code>).</li>
          <div class="code-block-container mini">
            <pre><code>{{ successCode }}</code></pre>
          </div>
          
          <li><code>error(message, title?, centered?)</code> — Красная иконка ошибки (<code>general/av_error-failure</code>).</li>
          <div class="code-block-container mini">
            <pre><code>{{ errorCode }}</code></pre>
          </div>
          
          <li><code>warning(message, title?)</code> — Желтая иконка предупреждения.</li>
          <div class="code-block-container mini">
            <pre><code>{{ warningCode }}</code></pre>
          </div>
          
          <li><code>info(message, title?)</code> — Синяя иконка информации.</li>
          <div class="code-block-container mini">
            <pre><code>{{ infoCode }}</code></pre>
          </div>
          
          <li><code>delete(message, title?, confirmText?)</code> — Центрированное окно удаления с красной кнопкой.</li>
          <div class="code-block-container mini">
            <pre><code>{{ deleteCode }}</code></pre>
          </div>
          
          <li><code>challenge(message, question, expectedAnswer, title?)</code> — Окно с математической проверкой перед выполнением действия.</li>
        </ul>

        <h3 nz-typography style="margin-top: 24px;">Пример вызова Challenge</h3>
        <p>Используется для защиты от случайного удаления особо важных данных.</p>
        <div class="code-block-container">
          <pre><code>{{ challengeCode }}</code></pre>
        </div>

        <h3 nz-typography style="margin-top: 24px;">Пример подтверждения ТО (Maintenance)</h3>
        <p>Паттерн подтверждения перед выполнением тяжелых операций чтения/записи в БД.</p>
        <div class="code-block-container">
          <pre><code>{{ maintenanceConfirmCode }}</code></pre>
        </div>
      </div>

      <nz-divider></nz-divider>

      <div class="doc-section footer-notice">
        <p nz-typography nzType="secondary">
          <span nz-icon nzType="bulb"></span>
          При разработке сложных окон с формами используйте метод <code>open(Component, config)</code>. 
          Данные в компонент передаются через токен <code>MODAL_DATA</code>.
        </p>
      </div>
    </div>
  `,
  styles: [`
    .help-page-container {
      padding: 24px;
      max-width: 1000px;
      margin: 0 auto;
    }
    .header-section { display: none; }
    .header-icon {
      color: #1890ff;
      margin-right: 12px;
    }
    .demo-card {
      margin-bottom: 32px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.05);
      border-radius: 8px;
    }
    .demo-actions {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }
    .doc-section {
      margin-bottom: 32px;
    }
    .code-block-container {
      position: relative;
      background: #272822;
      border-radius: 8px;
      padding: 16px;
      margin: 12px 0;
      overflow: hidden;
    }
    .code-block-container.mini {
      padding: 8px 12px;
      margin: 4px 0 16px 0;
    }
    .code-block-container.mini pre {
      font-size: 11px;
    }
    .code-actions {
      position: absolute;
      top: 8px;
      right: 8px;
      opacity: 0.6;
      transition: opacity 0.3s;
    }
    .code-block-container:hover .code-actions {
      opacity: 1;
    }
    .code-actions button {
      color: #fff;
    }
    pre {
      margin: 0;
      font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
      font-size: 13px;
      color: #f8f8f2;
      line-height: 1.5;
    }
    code {
      color: #e83e8c;
      background: #f8f9fa;
      padding: 2px 4px;
      border-radius: 4px;
    }
    .footer-notice {
      background: #e6f7ff;
      padding: 16px;
      border-radius: 8px;
      border-left: 4px solid #1890ff;
    }
  `]
})
export class ModalHelpComponent {
  private modalService = inject(ModalService);
  private message = inject(NzMessageService);

  injectCode = `private modalService = inject(ModalService);`;

  alertCode = `await this.modalService.alert({
  title: 'Уведомление',
  message: 'Операция выполнена успешно!',
  alertType: 'success',
  centered: true
});`;

  confirmCode = `const confirmed = await this.modalService.confirm({
  title: 'Вы уверены?',
  message: 'Это действие нельзя будет отменить.',
  confirmText: 'Да, продолжить',
  cancelText: 'Отмена'
});

if (confirmed) {
  // Выполняем действие
}`;

  challengeCode = `const confirmed = await this.modalService.challenge(
  'Вы действительно хотите СТЕРЕТЬ запись?',
  '2 + 2 * 2 = ?',
  '6',
  'Подтверждение удаления'
);

if (confirmed) {
  // Выполняем жесткое удаление
}`;

  maintenanceConfirmCode = `const confirmed = await this.modalService.confirm({
  title: 'Подтверждение',
  message: 'Вы действительно хотите перечиттать данные из БД и обновить таблицу?',
  confirmText: 'Да',
  cancelText: 'Нет',
  centered: true,
  icon: 'system/av_info'
});

if (confirmed) {
  this.state.loadItems(true); // Загрузка с флагом уведомления
}`;

  successCode = `await this.modalService.success('Операция выполнена успешно!');`;
  errorCode = `await this.modalService.error('Произошла системная ошибка.');`;
  warningCode = `await this.modalService.warning('Внимание: лицензия истекает.');`;
  infoCode = `await this.modalService.info('Доступно обновление v3.5.');`;
  deleteCode = `const confirmed = await this.modalService.delete('Удалить этот объект?');`;

  onCopied() {
    this.message.success('Код скопирован в буфер обмена');
  }

  async showDemoAlert() {
    await this.modalService.alert({
      title: 'Демонстрация Alert',
      message: 'Это стандартное информационное окно. Оно используется для уведомлений.',
      alertType: 'info',
      centered: true,
      icon: 'system/av_info'
    });
  }

  async showDemoConfirm() {
    const res = await this.modalService.confirm({
      title: 'Демонстрация Confirm',
      message: 'Вы хотите продолжить изучение документации?',
      confirmText: 'Конечно!',
      cancelText: 'Позже',
      centered: true
    });

    if (res) {
      this.message.success('Отлично! Продолжаем.');
    }
  }

  async showDemoDelete() {
    const res = await this.modalService.delete(
      'Вы действительно хотите удалить этот демонстрационный объект? Это действие необратимо.',
      'Удаление объекта'
    );

    if (res) {
      this.message.error('Объект "удален" (это просто демо)');
    }
  }

  async showDemoChallenge() {
    const res = await this.modalService.challenge(
      'Вы действительно хотите СТЕРЕТЬ запись без возможности восстановления?',
      '2 + 2 * 2 = ?',
      '6',
      'Критическое удаление'
    );

    if (res) {
      this.message.success('Проверка пройдена! Объект окончательно удален.');
    } else {
      this.message.warning('Удаление отменено (проверка не пройдена или окно закрыто)');
    }
  }

  async showDemoMaintenanceConfirm() {
    const res = await this.modalService.confirm({
      title: 'Подтверждение ТО',
      message: 'Вы действительно хотите перечиттать данные из БД и обновить таблицу?',
      confirmText: 'Да',
      cancelText: 'Нет',
      centered: true,
      icon: 'system/av_info'
    });

    if (res) {
      this.modalService.success('Данные из БД считаны, таблица обновлена. Всего загружено записей: 42');
    }
  }

  async showDemoSuccess() {
    await this.modalService.success('Операция выполнена успешно!', 'Завершено', true);
  }

  async showDemoError() {
    await this.modalService.error('Произошла непредвиденная ошибка на сервере.', 'Системная ошибка', true);
  }

  async showDemoWarning() {
    await this.modalService.warning('Срок действия лицензии истекает через 3 дня.', 'Предупреждение');
  }

  async showDemoInfo() {
    await this.modalService.info('Доступно новое обновление системы (v3.5.1).', 'Информация');
  }
}
