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
      id: 'administration',
      title: 'Администрирование',
      items: [
        {
          id: 'admin-menu',
          icon: 'setting',
          label: 'АДМИНИSTRИРОВАНИЕ',
          type: 'submenu',
          submenu: [
            {
              id: 'admin-login',
              icon: 'login',
              label: 'Вход в систему',
              route: '/auth/login',
            },
            {
              id: 'admin-users',
              icon: 'team',
              label: 'Пользователи',
              route: '/admin/users',
            },
            {
              id: 'admin-roles',
              icon: 'safety-certificate',
              label: 'Роли и права',
              route: '/admin/roles',
            },
            {
              id: 'auth-control',
              icon: 'security-scan',
              label: 'Auth Control',
              route: '/auth-control',
              badge: {
                value: 'v2',
                intent: 'success',
              },
            },
            {
              id: 'server-health',
              label: 'Здоровье сервера',
              route: '/health/server',
              icon: 'cloud-server',
            },
            {
              id: 'db-health',
              label: 'Здоровье БД',
              route: '/health/database',
              icon: 'database',
            },
          ],
        },
      ],
    },
    {
      id: 'tools',
      title: 'Инструменты',
      items: [
        {
          id: 'tools-menu',
          icon: 'tool',
          label: 'ИНСТРУМЕНТЫ',
          type: 'submenu',
          submenu: [
            {
              id: 'icon-manager',
              icon: 'picture',
              label: 'Менеджер иконок',
              route: '/tools/icon-manager',
              badge: {
                value: 'Pro',
                intent: 'info',
              },
            },
            {
              id: 'icon-categories',
              icon: 'folder-open',
              label: 'Папки иконок',
              route: '/icon-categories',
            },
            {
              id: 'rename-all',
              icon: 'file-text',
              label: 'Файловый менеджер (мой)',
              route: '/tools/rename-all',
            },
            {
              id: 'svg-validator',
              icon: 'check-circle',
              label: 'Проверка SVG',
              route: '/tools/svg-validator',
              badge: {
                value: 'New',
                intent: 'success',
              },
            },
            {
              id: 'icon-sync',
              icon: 'sync',
              label: 'Синхронизация иконок',
              route: '/tools/icon-sync',
              badge: {
                value: 'System',
                intent: 'warning',
              },
            },
            {
              id: 'sample-seo-manager',
              icon: 'google',
              label: 'Sample SEO Manager',
              route: '/sample-seo',
              badge: {
                value: 'Standard',
                intent: 'success',
              },
            },
            {
              id: 'ui-demo',
              icon: 'appstore',
              label: 'UI Demo',
              type: 'submenu',
              submenu: [
                {
                  id: 'button-control-aurora',
                  label: 'Button Control Aurora',
                  route: '/ui-demo/button-control-aurora',
                  icon: 'appstore',
                },
                {
                  id: 'color-component-aurora',
                  label: 'Color Control Aurora',
                  route: '/ui-demo/color-component-aurora',
                  icon: 'bg-colors',
                },
                {
                  id: 'dialog-control-aurora',
                  label: 'Dialog Control Aurora',
                  route: '/ui-demo/dialog-control-aurora',
                  icon: 'message',
                },
                {
                  id: 'field-group-component-aurora',
                  label: 'Field Group UI Control Aurora',
                  route: '/ui-demo/field-group-component-aurora',
                  icon: 'group',
                },
                {
                  id: 'help-container-control-aurora',
                  label: 'Help Container Control Aurora',
                  route: '/ui-demo/help-container-control-aurora',
                  icon: 'copy',
                },
                {
                  id: 'icon-control-aurora',
                  label: 'Icon Control Aurora',
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
                  label: 'Input Control Aurora',
                  route: '/ui-demo/input-control-aurora',
                  icon: 'edit',
                },
                {
                  id: 'modal-control-aurora',
                  label: 'Modal Control Aurora',
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
                  label: 'Search Control Aurora',
                  route: '/ui-demo/search-control-aurora',
                  icon: 'search',
                },
                {
                  id: 'tag-control-aurora',
                  label: 'Tag Control Aurora',
                  route: '/ui-demo/tag-control-aurora',
                  icon: 'tags',
                },
                {
                  id: 'toggle-control-aurora',
                  label: 'Toggle Control Aurora',
                  route: '/ui-demo/toggle-control-aurora',
                  icon: 'swap',
                },
                {
                  id: 'ui-help-base',
                  label: 'UI Help Base',
                  route: '/test/ui-help-base',
                  icon: 'question-circle',
                },
                {
                  id: 'logger-console',
                  label: 'Logger Console 🛠️',
                  route: '/ui-demo/logger-console',
                  icon: 'code',
                },
              ],
            },
            {
              id: 'ui-demo-old',
              icon: 'history',
              label: 'OLD UI Demo',
              type: 'submenu',
              submenu: [
                {
                  id: 'tag-ui',
                  label: 'Tag UI',
                  route: '/ui-demo/tag-ui',
                  icon: 'tags',
                },
                {
                  id: 'help-copy-ui',
                  label: 'Help Copy UI',
                  route: '/ui-demo/help-copy-container-ui',
                  icon: 'copy',
                },
                {
                  id: 'toggle-ui',
                  label: 'Toggle UI',
                  route: '/ui-demo/toggle-ui',
                  icon: 'swap',
                },
                {
                  id: 'wrapper-ui-test',
                  label: 'Wrapper UI Test 🎁',
                  route: '/ui-demo/wrapper-ui-test',
                  icon: 'gift',
                },
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
          ],
        },
      ],
    },
    {
      id: 'tests',
      title: 'ТЕСТЫ',
      items: [
        {
          id: 'tests-main',
          icon: 'experiment',
          label: 'ТЕСТЫ',
          type: 'submenu',
          submenu: [
            {
              id: 'reference-data',
              icon: 'book',
              label: 'СПРАВОЧНИКИ',
              type: 'submenu',
              submenu: [
                {
                  id: 'ref-platforms',
                  label: 'Операционные системы (платформы)',
                  route: '/platforms',
                  icon: 'windows',
                },
                {
                  id: 'ref-categories',
                  label: 'Категории',
                  route: '/catalogs/categories',
                  icon: 'folder',
                },
                {
                  id: 'ref-subcategories',
                  label: 'Подкатегории',
                  route: '/catalogs/subcategories',
                  icon: 'folder-open',
                },
                {
                  id: 'ref-developers',
                  label: 'Разработчики',
                  route: '/developer',
                  icon: 'code',
                },
                {
                  id: 'ref-languages',
                  label: 'Языки',
                  route: '/tools/language-manager',
                  icon: 'global',
                },
              ],
            },
            {
              id: 'test-language-app',
              label: 'Test languageApp',
              route: '/tools/test-language-app',
              icon: 'global',
            },
            {
              id: 'test-mexico-flag',
              label: 'Test Mexico Flag 🇲🇽',
              route: '/tools/test-mexico-flag',
              icon: 'flag',
            },
            {
              id: 'test-file-browser',
              label: 'Test File Browser 📂',
              route: '/tools/test-file-browser',
              icon: 'folder-open',
            },
            {
              id: 'test-sample-manager',
              label: 'Test Sample Manager 📋',
              route: '/test/sample-manager',
              icon: 'table',
            },
            {
              id: 'test-sample-manager-simple',
              label: 'Test Sample Simple ⚡',
              route: '/test/sample-manager-simple',
              icon: 'thunderbolt',
            },
            {
              id: 'test-sample-manager-simple-language',
              label: 'Sample Языки',
              route: '/test/sample-manager-simple-language',
              icon: 'global',
            },
            {
              id: 'test-sample-control',
              label: 'Test Sample Control 🛠️',
              route: '/test/sample-control-test',
              icon: 'tool',
            },
            {
              id: 'test-tinymce',
              label: 'Test TinyMCE ✏️',
              route: '/tools/test-tinymce',
              icon: 'edit',
            },
            {
              id: 'test-av-image',
              label: 'Test AvImage Upload 🖼️',
              route: '/tools/test-av-image',
              icon: 'picture',
            },
            {
              id: 'test-layout-debug',
              label: 'Test Layout Debug 🎨',
              route: '/tools/test-layout',
              icon: 'layout',
            },
            {
              id: 'test-image-studio',
              label: 'Test Image Studio 📸',
              route: '/tools/test-image-studio',
              icon: 'camera',
            },
            {
              id: 'test-image-studio-v2',
              label: 'Test Image Studio V2 ✨',
              route: '/tools/test-image-studio-v2',
              icon: 'highlight',
            },
            {
              id: 'test-window-seamless',
              label: 'Test VS Window Seamless 🪟',
              route: '/tools/test-window-seamless',
              icon: 'border',
            },
            {
              id: 'test-image-editor-vs',
              label: 'Test Image Editor VS 🎨',
              route: '/tools/test-image-editor-vs',
              icon: 'picture',
            },
          ],
        },
      ],
    },
    {
      id: 'agregator',
      title: 'АГРЕГАТОР',
      items: [
        {
          id: 'agregator-menu',
          icon: 'api',
          label: 'АГРЕГАТОР',
          type: 'submenu',
          submenu: [
            {
              id: 'agregator-references',
              label: 'Справочники',
              icon: 'book',
              type: 'submenu',
              intent: 'orange',
              submenu: [
                {
                  id: 'agregator-ref-license',
                  label: 'Лицензии',
                  route: '/agregator/references/license',
                  icon: 'audit',
                },
                {
                  id: 'agregator-ref-os',
                  label: 'Операционные системы',
                  route: '/agregator/references/os',
                  icon: 'windows',
                },
                {
                  id: 'agregator-ref-platform',
                  label: 'Платформы',
                  route: '/agregator/references/platform',
                  icon: 'deployment-unit',
                },
                {
                  id: 'agregator-ref-developer',
                  label: 'Разработчики',
                  route: '/agregator/references/developer',
                  icon: 'team',
                },
                {
                  id: 'agregator-ref-tag',
                  label: 'Теги',
                  route: '/agregator/references/tag',
                  icon: 'tags',
                },
                {
                  id: 'agregator-ref-language',
                  label: 'Языки',
                  route: '/agregator/references/language',
                  icon: 'global',
                },
                {
                  id: 'agregator-ref-seo',
                  label: 'SEO',
                  route: '/agregator/references/seo',
                  icon: 'google',
                },
              ],
            },
            {
              id: 'agregator-pages',
              label: 'Страницы',
              icon: 'file-text',
              intent: 'orange',
              type: 'submenu',
              submenu: [
                {
                  id: 'agregator-pages-programs',
                  label: 'Программы',
                  route: '/agregator/pages/program',
                  icon: 'appstore',
                },
              ],
            },
          ],
        },
      ],
    },

    {
      id: 'help-group',
      title: 'СПРАВКА',
      items: [
        {
          id: 'help-menu',
          icon: 'question-circle',
          label: 'СПРАВКА',
          type: 'submenu',
          submenu: [
            {
              id: 'help-base-group',
              label: 'База и Стандарты',
              icon: 'book',
              type: 'submenu',
              submenu: [
                {
                  id: 'sidebar-documentation-standard',
                  label: 'Справка о справке 📚',
                  route: '/help/documentation-standard',
                  icon: 'read',
                },
                {
                  id: 'sidebar-help',
                  label: 'Меню боковое',
                  route: '/help/sidebar',
                  icon: 'layout',
                },
              ],
            },
            {
              id: 'help-references-group',
              label: 'Справочники',
              icon: 'book',
              type: 'submenu',
              submenu: [
                {
                  id: 'sidebar-platform-aggregator',
                  label: 'Платформы Агрегатора 🌐',
                  route: '/help/platform-aggregator',
                  icon: 'windows',
                },
              ],
            },
            {
              id: 'help-controls-group',
              label: 'UI Контролы',
              icon: 'appstore',
              type: 'submenu',
              submenu: [
                {
                  id: 'sidebar-search-guide',
                  label: 'Компонент Поиск',
                  route: '/help/search-control',
                  icon: 'search',
                },
                {
                  id: 'sidebar-pagination-guide',
                  label: 'Пагинация',
                  route: '/help/pagination',
                  icon: 'number',
                },
                {
                  id: 'sidebar-modal-guide',
                  label: 'Модальное окно',
                  route: '/help/modal-window',
                  icon: 'layout',
                },
                {
                  id: 'sidebar-buttons-guide',
                  label: 'Кнопки (Скопировать путь) 🚀',
                  route: '/help/buttons-guide',
                  icon: 'rocket',
                },
                {
                  id: 'sidebar-logger-console-help',
                  label: 'Logger Console 🛠️',
                  route: '/help/logger-console',
                  icon: 'code',
                },
              ],
            },
            {
              id: 'help-samples-group',
              label: 'Образцы (Samples)',
              icon: 'code',
              type: 'submenu',
              submenu: [
                {
                  id: 'sidebar-sample-simple-guide',
                  label: 'Sample Simple',
                  route: '/help/sample-simple-guide',
                  icon: 'thunderbolt',
                },
                {
                  id: 'sidebar-test-sample-multi-lang',
                  label: 'Sample Языки',
                  route: '/help/test-sample-multi-lang',
                  icon: 'global',
                },
                {
                  id: 'sidebar-sample-seo-guide',
                  label: 'Sample Языки + SEO',
                  route: '/help/sample-seo-guide',
                  icon: 'google',
                },
                {
                  id: 'sidebar-models-comparison',
                  label: 'Сравнение моделей: Basic vs SEO',
                  route: '/help/models-comparison',
                  icon: 'reconciliation',
                },
              ],
            },
            {
              id: 'help-editors-group',
              label: 'Редакторы (TinyMCE)',
              icon: 'edit',
              type: 'submenu',
              submenu: [
                {
                  id: 'sidebar-tiny-test',
                  label: 'Подключение Tiny',
                  route: '/help/tiny-test',
                  icon: 'api',
                },
                {
                  id: 'sidebar-tiny-save',
                  label: 'Архитектура сохранение файлов',
                  route: '/help/tiny-save',
                  icon: 'save',
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};
