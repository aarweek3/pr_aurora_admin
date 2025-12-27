Создание нового компонента Ctrl + P

- переходим в папку
  cd src\app\pages\ui-demo

- cоздаем новый компонент
  ng g c name-control-aurora

- создаем дополнительный файл конфигурации
  имя-control-aurora.config.ts

  spinner

- создаем rout к нему
- [Открыть rout](/src\app\pages\ui-demo\ui-demo.routes.ts)

  создаем новый
  {
  path: 'spinner-control-aurora',
  loadComponent: () =>
  import('./spinner-control-aurora/spinner-control-aurora.component').then(
  (m) => m.SpinnerControlAuroraComponent,
  ),
  },

- добавляем новый пункт в меню для нового компонента
  идем в
  [Открыть конфигурацию сидбара](/src/app/shared/components/layout/left-sidebar/sidebar-default.config.ts)
  sidebar-default.config.
  и создаем новый
  {
  id: 'tag-ui',
  label: 'Tag UI',
  route: '/ui-demo/tag-ui',
  icon: 'tags',
  },
