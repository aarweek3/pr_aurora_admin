import { DemoConfig } from '../../../shared/components/ui/component-demo/models';

/**
 * Конфигурация демо для компонента Button (ЗАГЛУШКА)
 */
export const BUTTON_DEMO_CONFIG: DemoConfig = {
  title: '🔘 Button Component',
  componentName: 'ButtonComponent',
  componentPath: 'src/app/shared/components/ui/button',

  // Контролы для настройки
  controls: [
    {
      name: 'size',
      label: 'Размер кнопки',
      type: 'select',
      defaultValue: 'medium',
      options: [
        { label: 'Маленькая', value: 'small' },
        { label: 'Средняя', value: 'medium' },
        { label: 'Большая', value: 'large' },
      ],
      description: 'Размер кнопки влияет на её высоту и padding',
    },
    {
      name: 'type',
      label: 'Тип кнопки',
      type: 'select',
      defaultValue: 'primary',
      options: [
        { label: 'Primary', value: 'primary' },
        { label: 'Default', value: 'default' },
        { label: 'Dashed', value: 'dashed' },
        { label: 'Link', value: 'link' },
      ],
    },
    {
      name: 'disabled',
      label: 'Отключена',
      type: 'boolean',
      defaultValue: false,
      description: 'Делает кнопку неактивной',
    },
    {
      name: 'loading',
      label: 'Загрузка',
      type: 'boolean',
      defaultValue: false,
      description: 'Показывает индикатор загрузки',
    },
    {
      name: 'text',
      label: 'Текст кнопки',
      type: 'text',
      defaultValue: 'Нажми меня',
      description: 'Текстовое содержимое кнопки',
    },
  ],

  // Примеры использования
  examples: [
    {
      title: 'Базовый пример',
      description: 'Простая кнопка с текстом',
      code: `<av-button>Нажми меня</av-button>`,
      highlight: true,
    },
    {
      title: 'Primary кнопка',
      description: 'Основная кнопка для главных действий',
      code: `<av-button type="primary">
  Сохранить
</av-button>`,
    },
    {
      title: 'Большая кнопка',
      description: 'Увеличенный размер для важных действий',
      code: `<av-button size="large" type="primary">
  Зарегистрироваться
</av-button>`,
    },
    {
      title: 'Отключенная кнопка',
      description: 'Неактивная кнопка',
      code: `<av-button [disabled]="true">
  Недоступно
</av-button>`,
    },
    {
      title: 'С индикатором загрузки',
      description: 'Показывает процесс выполнения',
      code: `<av-button [loading]="true" type="primary">
  Загрузка...
</av-button>`,
    },
    {
      title: 'Link кнопка',
      description: 'Выглядит как ссылка',
      code: `<av-button type="link">
  Узнать больше
</av-button>`,
    },
  ],

  // Документация
  documentation: {
    usage: `
      <h3>Как использовать</h3>
      <p>Компонент Button предоставляет стандартизированные кнопки для всего приложения.</p>
      <ol>
        <li>Импортируйте компонент в ваш модуль или standalone компонент</li>
        <li>Используйте селектор <code>&lt;av-button&gt;</code> в шаблоне</li>
        <li>Настройте внешний вид через props: size, type, disabled, loading</li>
      </ol>
    `,
    installation: `
      <p>Компонент уже доступен в проекте. Просто импортируйте его:</p>
      <pre><code>import { ButtonComponent } from '@shared/components/ui/button';</code></pre>
    `,
    tips: [
      'Используйте type="primary" для главных действий на странице',
      'Большие кнопки (size="large") лучше работают на мобильных устройствах',
      'Всегда показывайте loading состояние при асинхронных операциях',
      'Избегайте более 2-3 primary кнопок на одном экране',
    ],
    links: [
      {
        title: 'Ant Design Button',
        url: 'https://ng.ant.design/components/button/en',
      },
      {
        title: 'Material Design: Buttons',
        url: 'https://m3.material.io/components/buttons/overview',
      },
    ],
  },

  // API интерфейс
  apiInterface: `interface ButtonProps {
  /** Размер кнопки */
  size?: 'small' | 'medium' | 'large';

  /** Тип оформления */
  type?: 'primary' | 'default' | 'dashed' | 'link';

  /** Отключить кнопку */
  disabled?: boolean;

  /** Показать индикатор загрузки */
  loading?: boolean;

  /** Событие клика */
  onClick?: () => void;
}`,

  // Импорт
  importCode: `import { ButtonComponent } from '@shared/components/ui/button';

// В standalone компоненте:
@Component({
  imports: [ButtonComponent],
  // ...
})

// Или в NgModule:
@NgModule({
  imports: [ButtonComponent],
  // ...
})`,
};
