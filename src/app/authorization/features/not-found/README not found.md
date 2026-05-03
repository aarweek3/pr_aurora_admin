# NotFoundComponent для Angular 19

Современный компонент 404 страницы с использованием Ng Zorro UI.

## Возможности

✅ **Angular 19 Standalone Component** - современная архитектура без NgModules
✅ **Ng Zorro UI интеграция** - красивый дизайн с готовыми компонентами
✅ **Responsive дизайн** - адаптация под все устройства
✅ **Анимации** - плавные переходы и декоративные элементы
✅ **Навигация** - кнопки возврата и быстрые ссылки
✅ **Accessibility** - поддержка скрин-ридеров
✅ **TypeScript** - полная типизация

## Компоненты Ng Zorro

- `nz-result` - основной компонент для отображения результата
- `nz-button` - стилизованные кнопки действий
- `nz-icon` - иконки для улучшения UX
- `nz-card` - карточки с дополнительной информацией
- `nz-space` - компоновка элементов с отступами
- `nz-typography` - типографика
- `nz-divider` - разделители контента

## Структура компонента

```
not-found.component.ts
├── Основной результат 404 (nz-result)
├── Карточка помощи (nz-card)
├── Быстрые ссылки (nz-card + nz-space)
├── Контактная информация
└── Декоративные элементы
```

## Использование

### 1. Импорт в маршрутизацию:
```typescript
import { NotFoundComponent } from './shared/components/not-found.component';

const routes: Routes = [
  // ... другие маршруты
  {
    path: '404',
    component: NotFoundComponent
  },
  {
    path: '**',
    redirectTo: '/404'
  }
];
```

### 2. Как ленивый компонент:
```typescript
{
  path: '404',
  loadComponent: () => import('./shared/components/not-found.component')
    .then(m => m.NotFoundComponent)
}
```

### 3. Программная навигация:
```typescript
// В сервисе или компоненте
this.router.navigate(['/404']);
```

## Методы компонента

- `goHome()` - переход на главную страницу
- `goBack()` - возврат на предыдущую страницу  
- `navigateTo(route: string)` - навигация к указанному маршруту
- `refreshPage()` - обновление страницы

## Особенности дизайна

### Цветовая схема:
- **Основной цвет ошибки**: #ff4d4f (красный)
- **Фон**: Градиент от #f0f2f5 до #f6ffed
- **Акценты**: #1890ff (синий), #52c41a (зеленый)

### Анимации:
- `fadeInUp` - появление контента снизу вверх
- `float` - плавающие декоративные элементы
- Hover эффекты на кнопках

### Responsive точки:
- **Desktop**: > 768px - полный функционал
- **Tablet**: 481px - 768px - адаптированная компоновка  
- **Mobile**: ≤ 480px - вертикальная компоновка

## Кастомизация

### Изменение текста:
```typescript
// В template измените:
nzTitle="404"
nzSubTitle="Ваш текст ошибки"
```

### Добавление новых быстрых ссылок:
```html
<button nz-button nzType="link" routerLink="/your-route">
  <span nz-icon nzType="your-icon"></span>
  Ваш раздел
</button>
```

### Кастомные стили:
```scss
// Переопределение переменных
:host {
  --primary-color: #your-color;
  --background-gradient: your-gradient();
}
```

## Зависимости

```json
{
  "dependencies": {
    "@angular/common": "^19.0.0",
    "@angular/core": "^19.0.0", 
    "@angular/router": "^19.0.0",
    "ng-zorro-antd": "^19.0.0"
  }
}
```

## Производительность

- **Standalone компонент** - загружается только при необходимости
- **Lazy loading** совместим
- **Tree shaking** - оптимизированный bundle
- **OnPush** стратегия не требуется (нет изменяемых данных)

Создано: 05.09.2025 21:33:07,21
Путь: D:\components\shared\components\
