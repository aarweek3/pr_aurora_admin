import { Component, input } from '@angular/core';
import { IconComponent } from '@shared/components/ui/icon/icon.component';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSwitchModule } from 'ng-zorro-antd/switch';

@Component({
  selector: 'app-container-ui-help-base',
  standalone: true,
  imports: [
    NzCardModule,
    NzGridModule,
    NzInputModule,
    NzSelectModule,
    NzSwitchModule,
    IconComponent,
  ],
  templateUrl: './container-ui-help-base.component.html',
  styleUrl: './container-ui-help-base.component.scss',
})
export class ContainerUiHelpBaseComponent {
  pageTitle = input<string>('UI Help Base ⭐');
  pageDescription = input<string>(
    'Централизованная документация и руководства по UI контролам Aurora',
  );

  readonly controlGroups = [
    {
      title: 'General UI (Общие)',
      description: 'Базовые элементы интерфейса: кнопки, иконки, теги.',
      items: [
        {
          name: 'avButton',
          selector: 'button[avButton]',
          type: 'Directive',
          description: 'Кнопки с поддержкой стилей Aurora',
        },
        {
          name: 'av-icon',
          selector: '<av-icon>',
          type: 'Component',
          description: 'Система иконок (SVG)',
        },
        { name: 'av-tag', selector: '<av-tag>', type: 'Component', description: 'Метки и статусы' },
        {
          name: 'av-alert',
          selector: '<av-alert>',
          type: 'Component',
          description: 'Информационные уведомления',
        },
      ],
    },
    {
      title: 'Form UI (Формы)',
      description: 'Элементы ввода данных и управления состоянием.',
      items: [
        {
          name: 'avInput',
          selector: 'input[avInput]',
          type: 'Directive',
          description: 'Стилизованные поля ввода',
        },
        {
          name: 'av-toggle',
          selector: '<av-toggle>',
          type: 'Component',
          description: 'Переключатели и чекбоксы',
        },
        {
          name: 'av-search',
          selector: '<av-search>',
          type: 'Component',
          description: 'Поле поиска с очисткой',
        },
        {
          name: 'av-phone-input',
          selector: '<av-phone-input>',
          type: 'Component',
          description: 'Ввод номера телефона',
        },
        {
          name: 'av-tag-input',
          selector: '<av-tag-input>',
          type: 'Component',
          description: 'Ввод нескольких тегов',
        },
      ],
    },
    {
      title: 'Feedback (Обратная связь)',
      description: 'Индикаторы загрузки и прогресса.',
      items: [
        {
          name: 'av-progress',
          selector: '<av-progress>',
          type: 'Component',
          description: 'Прогресс-бары (Line/Circle)',
        },
        {
          name: 'av-spinner',
          selector: '<av-spinner>',
          type: 'Component',
          description: 'Индикаторы загрузки',
        },
      ],
    },
    {
      title: 'Utility (Утилиты)',
      description: 'Сложные UI блоки и системные сервисы.',
      items: [
        {
          name: 'av-modal',
          selector: '<av-modal>',
          type: 'Component',
          description: 'Модальные окна',
        },
        {
          name: 'av-pagination',
          selector: '<av-pagination>',
          type: 'Component',
          description: 'Навигация по страницам',
        },
        {
          name: 'av-help-copy-container',
          selector: '<av-help-copy-container>',
          type: 'Component',
          description: 'Блок кода с копированием',
        },
      ],
    },
  ];
}
