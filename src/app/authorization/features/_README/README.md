# Layout Components - Этап 1

Создано: 05.09.2025 19:15:47,75
Путь: D:\components\

## Созданные компоненты:

### 1. AuthLayoutComponent
**Файл:** `features/auth/components/auth-layout/auth-layout.component.ts`
**Назначение:** Макет для страниц авторизации
**Ng Zorro модули:**
- NzLayoutModule - основной layout
- NzCardModule - карточка формы
- NzSpinModule - лоадер

**Особенности:**
- Центрированная карточка на градиентном фоне
- Responsive дизайн
- Логотип и брендинг
- Готов для router-outlet

### 2. MainLayoutComponent  
**Файл:** `layout/main-layout/main-layout.component.ts`
**Назначение:** Основной макет приложения после авторизации
**Ng Zorro модули:**
- NzLayoutModule - layout с header/sider/content/footer
- NzMenuModule - навигационное меню
- NzDropDownModule - выпадающее меню профиля
- NzAvatarModule - аватар пользователя
- NzBreadCrumbModule - хлебные крошки

**Особенности:**
- Фиксированный header
- Коллапсируемый sidebar
- Breadcrumb навигация
- Dropdown профиля пользователя
- Mobile responsive

### 3. LoaderComponent
**Файл:** `shared/components/loader/loader.component.ts`
**Назначение:** Универсальный компонент загрузки
**Ng Zorro модули:**
- NzSpinModule - спиннеры загрузки
- NzIconModule - иконки

**Типы лоадеров:**
- Глобальный overlay лоадер
- Inline лоадер для контента
- Простой спиннер
- Кастомный лоадер с иконкой

## Использование:

### AuthLayoutComponent
```html
<app-auth-layout>
  <!-- Формы авторизации -->
</app-auth-layout>
```

### MainLayoutComponent
```html
<app-main-layout>
  <!-- Основной контент приложения -->
</app-main-layout>
```

### LoaderComponent
```html
<!-- Глобальный лоадер -->
<app-loader [isGlobalLoading]="true" globalLoadingText="Загрузка данных..."></app-loader>

<!-- Inline лоадер -->
<app-loader [isInlineLoading]="true">
  <div>Контент, который загружается</div>
</app-loader>

<!-- Простой спиннер -->
<app-loader [isSimpleSpinner]="true" size="large"></app-loader>
```

## Следующие шаги:

1. Скопировать компоненты в Angular проект
2. Добавить в app.routes.ts маршруты с этими layout
3. Установить ng-zorro-antd если не установлен
4. Добавить изображения в assets/images/
5. Протестировать responsive поведение

## Требуемые зависимости:

```bash
npm install ng-zorro-antd
```

## Ng Zorro конфигурация:
Убедитесь что в app.config.ts добавлены провайдеры Ng Zorro
