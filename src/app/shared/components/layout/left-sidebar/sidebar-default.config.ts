import { SidebarConfig } from './sidebar.model';

/**
 * Дефолтная конфигурация меню для AdminLayout
 *
 * Это конфигурация по умолчанию, которую можно переопределить
 * через input() в AdminLayoutComponent
 */
export const DEFAULT_SIDEBAR_CONFIG: SidebarConfig = {
  state: 'expanded',
  menuGroups: [
    {
      id: 'main',
      title: 'Основное',
      items: [
        {
          id: 'dashboard',
          icon: 'dashboard',
          label: 'Главная',
          type: 'link',
          route: '/dashboard',
        },
        {
          id: 'health',
          icon: 'heart',
          label: 'Health Monitoring',
          type: 'link',
          route: '/health',
        },
        {
          id: 'ui-demo',
          icon: 'appstore',
          label: 'UI Demo',
          type: 'submenu',
          submenu: [
            {
              id: 'button-control-aurora',
              label: 'Button Component Aurora',
              route: '/ui-demo/button-control-aurora',
              icon: 'appstore',
            },
            {
              id: 'color-component-aurora',
              label: 'Color Component Aurora',
              route: '/ui-demo/color-component-aurora',
              icon: 'bg-colors',
            },

            {
              id: 'dialog-control-aurora',
              label: 'Dialog Component Aurora',
              route: '/ui-demo/dialog-control-aurora',
              icon: 'message',
            },
            {
              id: 'field-group-component-aurora',
              label: 'Field Group UI Component Aurora',
              route: '/ui-demo/field-group-component-aurora',
              icon: 'group',
            },
            {
              id: 'help-copy-ui',
              label: 'Help Copy UI',
              route: '/ui-demo/help-copy-container-ui',
              icon: 'copy',
            },
            {
              id: 'icon-control-aurora',
              label: 'Icon Component Aurora',
              route: '/ui-demo/icon-control-aurora',
              icon: 'star',
            },
            {
              id: 'icon-ui',
              label: 'Icon Library',
              route: '/ui-demo/icon-ui',
              icon: 'picture',
            },
            {
              id: 'input-control-aurora',
              label: 'Input Component Aurora',
              route: '/ui-demo/input-control-aurora',
              icon: 'edit',
            },

            {
              id: 'modal-control-aurora',
              label: 'Modal Component Aurora',
              route: '/ui-demo/modal-control-aurora',
              icon: 'layout',
            },

            {
              id: 'pagination-control-aurora',
              label: 'Pagination Control Aurora',
              route: '/ui-demo/pagination-control-aurora',
              icon: 'ordered-list',
            },
            {
              id: 'phone-number-ui',
              label: 'Phone Number UI',
              route: '/ui-demo/phone-number-ui',
              icon: 'phone',
            },

            {
              id: 'progress-bar-control-aurora',
              label: 'Progress Bar Control Aurora',
              route: '/ui-demo/progress-bar-control-aurora',
              icon: 'line-chart',
            },
            {
              id: 'spinner-control-aurora',
              label: 'Spinner Control Aurora',
              route: '/ui-demo/spinner-control-aurora',
              icon: 'reload',
            },
            {
              id: 'search-control-aurora',
              label: 'Search Component Aurora',
              route: '/ui-demo/search-control-aurora',
              icon: 'search',
            },
            {
              id: 'tag-ui',
              label: 'Tag UI',
              route: '/ui-demo/tag-ui',
              icon: 'tags',
            },
            {
              id: 'tag-control-aurora',
              label: 'Tag Component Aurora',
              route: '/ui-demo/tag-control-aurora',
              icon: 'tags',
            },
            {
              id: 'toggle-ui',
              label: 'Toggle UI',
              route: '/ui-demo/toggle-ui',
              icon: 'swap',
            },
            {
              id: 'ui-help-base',
              label: 'UI Help Base',
              route: '/test/ui-help-base',
              icon: 'question-circle',
            },
            {
              id: 'wrapper-ui-test',
              label: 'Wrapper UI Test 🎁',
              route: '/ui-demo/wrapper-ui-test',
              icon: 'gift',
            },
          ],
        },
        {
          id: 'ui-demo-old',
          icon: 'history',
          label: 'OLD',
          type: 'submenu',
          submenu: [
            {
              id: 'spinner-ui',
              label: 'Spinner UI',
              route: '/ui-demo/spinner-ui',
              icon: 'reload',
            },
            {
              id: 'pagination-ui',
              label: 'Pagination UI',
              route: '/ui-demo/pagination-ui',
              icon: 'ordered-list',
            },
            {
              id: 'progress-ui',
              label: 'Progress UI',
              route: '/ui-demo/progress-ui',
              icon: 'line-chart',
            },
            {
              id: 'modal-ui-new',
              label: 'Modal UI Demo New',
              route: '/ui-demo/modal-ui-new',
              icon: 'layout',
            },
            {
              id: 'button-demo',
              label: 'Button Demo 🎮',
              route: '/ui-demo/button-demo',
              icon: 'play-circle',
            },
            {
              id: 'button-ui',
              label: 'Button UI',
              route: '/ui-demo/button-ui',
              icon: 'block',
            },
            {
              id: 'button-ui-new',
              label: 'Button UI New',
              route: '/ui-demo/button-ui-new',
              icon: 'appstore',
            },
            {
              id: 'color-picker-demo',
              label: 'Color Picker UI',
              route: '/ui-demo/color-picker-demo',
              icon: 'bg-colors',
            },
            {
              id: 'icon-control',
              label: 'Icon Control UI',
              route: '/ui-demo/icon-control',
              icon: 'control',
            },
            {
              id: 'modal-ui',
              label: 'Modal UI',
              route: '/ui-demo/modal-ui',
              icon: 'border',
            },
            {
              id: 'input-ui',
              label: 'Input UI',
              route: '/ui-demo/input-ui',
              icon: 'edit',
            },
            {
              id: 'search-ui',
              label: 'Search UI',
              route: '/ui-demo/search-ui',
              icon: 'search',
            },
            {
              id: 'dialog-icon-ui',
              label: 'Dialog Icon UI',
              route: '/ui-demo/dialog-icon-ui',
              icon: 'message',
            },
            {
              id: 'field-group-ui',
              label: 'Field Group UI',
              route: '/ui-demo/field-group-ui',
              icon: 'group',
            },
          ],
        },
        {
          id: 'analytics',
          icon: 'line-chart',
          label: 'Аналитика',
          type: 'link',
          route: '/analytics',
        },
        {
          id: 'users',
          icon: 'user',
          label: 'Пользователи',
          type: 'link',
          route: '/users',
        },
      ],
    },
    {
      id: 'content',
      title: 'Контент',
      items: [
        {
          id: 'content-menu',
          icon: 'file-text',
          label: 'Контент',
          type: 'submenu',
          submenu: [
            {
              id: 'articles',
              label: 'Статьи',
              route: '/content/articles',
              icon: 'read',
            },
            {
              id: 'categories',
              label: 'Категории',
              route: '/content/categories',
              icon: 'folder',
            },
            {
              id: 'tags',
              label: 'Теги',
              route: '/content/tags',
              icon: 'tags',
            },
            {
              id: 'media',
              label: 'Медиа',
              route: '/content/media',
              icon: 'picture',
            },
          ],
        },
        {
          id: 'pages',
          icon: 'file',
          label: 'Страницы',
          type: 'submenu',
          submenu: [
            {
              id: 'all-pages',
              label: 'Все страницы',
              route: '/pages/all',
              icon: 'folder-open',
            },
            {
              id: 'new-page',
              label: 'Создать страницу',
              route: '/pages/new',
              icon: 'plus',
            },
            {
              id: 'drafts',
              label: 'Черновики',
              route: '/pages/drafts',
              icon: 'edit',
            },
          ],
        },
      ],
    },
    {
      id: 'ecommerce',
      title: 'E-commerce',
      items: [
        {
          id: 'products-menu',
          icon: 'shopping',
          label: 'Товары',
          type: 'submenu',
          submenu: [
            {
              id: 'products-list',
              label: 'Список товаров',
              route: '/products/list',
              icon: 'unordered-list',
            },
            {
              id: 'products-add',
              label: 'Добавить товар',
              route: '/products/add',
              icon: 'plus-circle',
            },
            {
              id: 'products-categories',
              label: 'Категории товаров',
              route: '/products/categories',
              icon: 'appstore',
            },
            {
              id: 'products-inventory',
              label: 'Инвентарь',
              route: '/products/inventory',
              icon: 'inbox',
              badge: {
                value: 2,
                intent: 'error',
              },
            },
          ],
        },
        {
          id: 'orders',
          icon: 'shopping-cart',
          label: 'Заказы',
          type: 'link',
          route: '/orders',
          badge: {
            value: 8,
            intent: 'warning',
          },
        },
        {
          id: 'customers',
          icon: 'team',
          label: 'Клиенты',
          type: 'link',
          route: '/customers',
        },
      ],
    },
    {
      id: 'marketing',
      title: 'Маркетинг',
      items: [
        {
          id: 'campaigns',
          icon: 'thunderbolt',
          label: 'Кампании',
          type: 'submenu',
          submenu: [
            {
              id: 'all-campaigns',
              label: 'Все кампании',
              route: '/marketing/campaigns/all',
              icon: 'project',
            },
            {
              id: 'email-campaigns',
              label: 'Email кампании',
              route: '/marketing/campaigns/email',
              icon: 'mail',
              badge: {
                value: 4,
                intent: 'info',
              },
            },
            {
              id: 'sms-campaigns',
              label: 'SMS кампании',
              route: '/marketing/campaigns/sms',
              icon: 'message',
            },
            {
              id: 'push-campaigns',
              label: 'Push уведомления',
              route: '/marketing/campaigns/push',
              icon: 'notification',
            },
          ],
        },
        {
          id: 'promotions',
          icon: 'gift',
          label: 'Акции',
          type: 'submenu',
          submenu: [
            {
              id: 'active-promotions',
              label: 'Активные акции',
              route: '/marketing/promotions/active',
              icon: 'fire',
              badge: {
                value: 7,
                intent: 'success',
              },
            },
            {
              id: 'scheduled-promotions',
              label: 'Запланированные',
              route: '/marketing/promotions/scheduled',
              icon: 'schedule',
            },
            {
              id: 'promo-codes',
              label: 'Промокоды',
              route: '/marketing/promotions/codes',
              icon: 'barcode',
            },
          ],
        },
        {
          id: 'banners',
          icon: 'picture',
          label: 'Баннеры',
          type: 'link',
          route: '/marketing/banners',
        },
      ],
    },
    {
      id: 'communications',
      title: 'Коммуникации',
      items: [
        {
          id: 'notifications',
          icon: 'bell',
          label: 'Уведомления',
          type: 'submenu',
          submenu: [
            {
              id: 'system-notifications',
              label: 'Системные',
              route: '/communications/notifications/system',
              icon: 'alert',
            },
            {
              id: 'user-notifications',
              label: 'Пользовательские',
              route: '/communications/notifications/user',
              icon: 'user',
            },
            {
              id: 'notification-templates',
              label: 'Шаблоны',
              route: '/communications/notifications/templates',
              icon: 'file-protect',
            },
          ],
        },
        {
          id: 'messages',
          icon: 'message',
          label: 'Сообщения',
          type: 'submenu',
          submenu: [
            {
              id: 'inbox',
              label: 'Входящие',
              route: '/communications/messages/inbox',
              icon: 'inbox',
              badge: {
                value: 23,
                intent: 'info',
              },
            },
            {
              id: 'sent',
              label: 'Отправленные',
              route: '/communications/messages/sent',
              icon: 'export',
            },
            {
              id: 'drafts-messages',
              label: 'Черновики',
              route: '/communications/messages/drafts',
              icon: 'edit',
              badge: {
                value: 5,
                intent: 'warning',
              },
            },
          ],
        },
        {
          id: 'chat',
          icon: 'wechat',
          label: 'Чат поддержки',
          type: 'link',
          route: '/communications/chat',
          badge: {
            value: 'Live',
            intent: 'success',
          },
        },
      ],
    },
    {
      id: 'finance',
      title: 'Финансы',
      items: [
        {
          id: 'payments',
          icon: 'transaction',
          label: 'Платежи',
          type: 'submenu',
          submenu: [
            {
              id: 'transactions',
              label: 'Транзакции',
              route: '/finance/payments/transactions',
              icon: 'swap',
            },
            {
              id: 'refunds',
              label: 'Возвраты',
              route: '/finance/payments/refunds',
              icon: 'rollback',
              badge: {
                value: 3,
                intent: 'warning',
              },
            },
            {
              id: 'payment-methods',
              label: 'Методы оплаты',
              route: '/finance/payments/methods',
              icon: 'credit-card',
            },
          ],
        },
        {
          id: 'invoices',
          icon: 'file-text',
          label: 'Счета',
          type: 'submenu',
          submenu: [
            {
              id: 'all-invoices',
              label: 'Все счета',
              route: '/finance/invoices/all',
              icon: 'file-done',
            },
            {
              id: 'pending-invoices',
              label: 'Ожидают оплаты',
              route: '/finance/invoices/pending',
              icon: 'clock-circle',
              badge: {
                value: 12,
                intent: 'warning',
              },
            },
            {
              id: 'overdue-invoices',
              label: 'Просроченные',
              route: '/finance/invoices/overdue',
              icon: 'exclamation-circle',
              badge: {
                value: 4,
                intent: 'error',
              },
            },
          ],
        },
        {
          id: 'billing',
          icon: 'dollar',
          label: 'Биллинг',
          type: 'link',
          route: '/finance/billing',
        },
      ],
    },
    {
      id: 'tools',
      title: 'Инструменты',
      items: [
        {
          id: 'icon-manager',
          icon: 'picture',
          label: 'Менеджер иконок',
          type: 'link',
          route: '/tools/icon-manager',
          badge: {
            value: 'Pro',
            intent: 'info',
          },
        },
      ],
    },
    {
      id: 'system',
      title: 'Система',
      items: [
        {
          id: 'settings-menu',
          icon: 'setting',
          label: 'Настройки',
          type: 'submenu',
          submenu: [
            {
              id: 'general',
              label: 'Общие',
              route: '/settings/general',
              icon: 'tool',
            },
            {
              id: 'roles',
              label: 'Роли и права',
              route: '/settings/roles',
              icon: 'safety',
            },
            {
              id: 'api',
              label: 'API',
              route: '/settings/api',
              icon: 'api',
            },
            {
              id: 'integrations',
              label: 'Интеграции',
              route: '/settings/integrations',
              icon: 'link',
            },
            {
              id: 'security',
              label: 'Безопасность',
              route: '/settings/security',
              icon: 'lock',
            },
          ],
        },
        {
          id: 'monitoring',
          icon: 'radar-chart',
          label: 'Мониторинг',
          type: 'submenu',
          submenu: [
            {
              id: 'performance',
              label: 'Производительность',
              route: '/system/monitoring/performance',
              icon: 'dashboard',
            },
            {
              id: 'errors',
              label: 'Ошибки',
              route: '/system/monitoring/errors',
              icon: 'bug',
              badge: {
                value: 8,
                intent: 'error',
              },
            },
            {
              id: 'server-status',
              label: 'Статус серверов',
              route: '/system/monitoring/servers',
              icon: 'cloud-server',
            },
          ],
        },
        {
          id: 'reports',
          icon: 'bar-chart',
          label: 'Отчёты',
          type: 'link',
          route: '/reports',
        },
        {
          id: 'logs',
          icon: 'file-text',
          label: 'Логи',
          type: 'link',
          route: '/logs',
        },
        {
          id: 'backup',
          icon: 'cloud-download',
          label: 'Резервные копии',
          type: 'link',
          route: '/system/backup',
        },
      ],
    },
  ],
};
