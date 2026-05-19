# Руководство по созданию модульных компонентов в Aurora Admin

Это руководство описывает архитектурный стандарт создания изолированных модулей (на примере `languageApp`), которые легко поддерживать, тестировать и масштабировать.

## 1. Структура директорий

Каждый модуль должен иметь четкую структуру папок для разделения ответственности:

```text
module-name/
├── components/      # Standalone компоненты (Smart и Dumb)
├── services/        # Бизнес-логика (Signals) и API-сервисы
├── models/          # Интерфейсы и типы данных
├── config/          # Константы, конфигурации и маппинги
├── modals/          # (Опционально) Специфичные для модуля модальные окна
├── styles/          # (Опционально) Общие стили модуля
└── end-points.ts    # Реестр эндпоинтов API модуля
```

## 2. Моделирование данных (`/models`)

Начинайте с описания данных. Используйте `interface` для объектов и `type` для состояний.

**Пример (`appLanguage.model.ts`):**
```typescript
export interface AppLanguage {
  id: number;
  code: string;
  nativeTitle: string;
  enabled: boolean;
  // ... другие свойства
}

export interface LanguageState {
  current: AppLanguage | null;
  available: AppLanguage[];
  isLoading: boolean;
  syncStatus: 'idle' | 'syncing' | 'synced' | 'error';
}
```

## 3. Интеграция с API (`/services` и `end-points.ts`)

### Реестр эндпоинтов
Выносите все URL в отдельный файл `end-points.ts`. Это упрощает обновление путей при изменении API.

### API Сервис
Используйте `HttpClient` для базовых CRUD операций. Сервис должен возвращать `Observable`.

**Пример (`language-api.service.ts`):**
```typescript
@Injectable({ providedIn: 'root' })
export class LanguageApiService {
  private http = inject(HttpClient);
  
  getAll(): Observable<AppLanguage[]> {
    return this.http.get<AppLanguage[]>(LANGUAGE_APP_ENDPOINTS.GET_ALL);
  }
}
```

## 4. Управление состоянием (`/services`)

Используйте **Angular Signals** для хранения и управления состоянием модуля. Это обеспечивает высокую производительность и чистый код в компонентах.

- Используйте `signal` для приватного состояния.
- Используйте `computed` для публичных данных.
- Используйте `effect` для побочных эффектов (например, сохранение в LocalStorage).

**Пример (`language.service.ts`):**
```typescript
export class LanguageService {
  private state = signal<LanguageState>({ ...initialState });
  
  allLanguages = computed(() => this.state().all);
  isLoading = computed(() => this.state().isLoading);

  refreshList() {
    this.state.update(s => ({ ...s, isLoading: true }));
    // ... логика загрузки через apiService
  }
}
```

## 5. UI Компоненты (`/components`)

В Aurora Admin мы придерживаемся следующих правил для компонентов:
1. **Standalone**: Каждый компонент должен быть `standalone: true`.
2. **BEM**: Используйте методологию BEM для именования классов в CSS/SCSS.
3. **Smart/Dumb**:
    - "Умные" компоненты инжектят сервисы и управляют данными.
    - "Глупые" (презентационные) компоненты получают данные через `@Input` и сообщают о действиях через `@Output`.

## 6. Бизнес-правила и защита

Внедряйте проверки на уровне сервисов:
- Защита системных данных (например, `isSystem: true` — запрет на удаление).
- Состояния по умолчанию (что делать, если база пуста).
- Обработка критических ошибок через `NzModalService` или `NzMessageService`.
