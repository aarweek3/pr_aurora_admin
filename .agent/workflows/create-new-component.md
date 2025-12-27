Создание нового компонента Ctrl + P

- переходим в папку
  cd src\app\pages\ui-demo

- cоздаем новый компонент
  ng g c name-control-aurora
  ng g c progress-bar-control-aurora

- создаем дополнительный файл конфигурации
  имя-control-aurora.config.ts

- создаем rout к нему
  Нажмите Ctrl + P (Windows/Linux)
  Начните вводить название файла: ui-demo.routes
  создаем новый
  {
  path: 'icon-control-aurora',
  loadComponent: () =>
  import('./icon-control-aurora/icon-control-aurora.component').then(
  (m) => m.IconControlAuroraComponent,
  ),
  },

- добавляем новый пункт в меню для нового компонента
  идем в sidebar-default.config. и создаем новый
  {
  id: 'tag-ui',
  label: 'Tag UI',
  route: '/ui-demo/tag-ui',
  icon: 'tags',
  },
