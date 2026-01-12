# Техническое задание: Health Check Component для Angular 19

## 1. Цель

Создать простой компонент для мониторинга доступности C# Web API с отображением статуса в реальном времени.

## 2. Архитектура (Service + Component)

### 2.1 Health Check Service

```typescript
// ============================================================================
// 🏥 HEALTH CHECK SERVICE - ИНТЕРФЕЙСЫ
// ============================================================================

/**
 * Статус здоровья API
 */
export interface HealthStatus {
  /** API доступен */
  isOnline: boolean;

  /** Время отклика в миллисекундах */
  responseTime: number;

  /** Время последней проверки */
  lastCheck: Date;

  /** Описание ошибки (если есть) */
  error?: string;
}

/**
 * Конфигурация мониторинга
 */
export interface HealthCheckConfig {
  /** URL endpoint для проверки */
  endpoint?: string;

  /** Интервал проверки в миллисекундах */
  interval?: number;

  /** Timeout запроса в миллисекундах */
  timeout?: number;

  /** Автостарт мониторинга */
  autoStart?: boolean;
}

/**
 * Интерфейс сервиса
 */
export interface IHealthCheckService {
  /** Observable с текущим статусом */
  readonly status$: Observable<HealthStatus>;

  /** Запустить мониторинг */
  startMonitoring(config?: Partial<HealthCheckConfig>): void;

  /** Остановить мониторинг */
  stopMonitoring(): void;

  /** Проверить здоровье прямо сейчас */
  checkHealth(): Promise<HealthStatus>;

  /** Получить текущий статус без запроса */
  getCurrentStatus(): HealthStatus;
}
```

### 2.2 Health Check Component

```typescript
/**
 * Пропсы компонента
 */
export interface HealthCheckProps {
  /** Показывать кнопку "Check Now" */
  showCheckButton?: boolean;

  /** Показывать кнопку Start/Stop */
  showToggleButton?: boolean;

  /** Компактный вид */
  compact?: boolean;

  /** Автостарт мониторинга */
  autoStart?: boolean;

  /** Интервал проверки */
  interval?: number;
}
```

## 3. Реализация

### 3.1 Service Implementation

```typescript
@Injectable({
  providedIn: "root",
})
export class HealthCheckService implements IHealthCheckService {
  private http = inject(HttpClient);

  private statusSubject = new BehaviorSubject<HealthStatus>({
    isOnline: false,
    responseTime: 0,
    lastCheck: new Date(),
  });

  readonly status$ = this.statusSubject.asObservable();

  private config: Required<HealthCheckConfig> = {
    endpoint: "/api/health",
    interval: 30000,
    timeout: 10000,
    autoStart: true,
  };

  private monitoringSubscription?: Subscription;

  startMonitoring(configOverride?: Partial<HealthCheckConfig>): void {
    this.stopMonitoring();

    if (configOverride) {
      this.config = { ...this.config, ...configOverride };
    }

    // Сразу проверяем
    this.performHealthCheck().subscribe();

    // Запускаем периодическую проверку
    this.monitoringSubscription = interval(this.config.interval)
      .pipe(switchMap(() => this.performHealthCheck()))
      .subscribe();
  }

  stopMonitoring(): void {
    this.monitoringSubscription?.unsubscribe();
    this.monitoringSubscription = undefined;
  }

  async checkHealth(): Promise<HealthStatus> {
    return firstValueFrom(this.performHealthCheck());
  }

  getCurrentStatus(): HealthStatus {
    return this.statusSubject.value;
  }

  private performHealthCheck(): Observable<HealthStatus> {
    const startTime = performance.now();

    return this.http
      .get(this.config.endpoint, {
        observe: "response",
        timeout: this.config.timeout,
      })
      .pipe(
        map((response) => {
          const responseTime = Math.round(performance.now() - startTime);
          const status: HealthStatus = {
            isOnline: response.ok,
            responseTime,
            lastCheck: new Date(),
          };
          this.statusSubject.next(status);
          return status;
        }),
        catchError((error) => {
          const responseTime = Math.round(performance.now() - startTime);
          const status: HealthStatus = {
            isOnline: false,
            responseTime,
            lastCheck: new Date(),
            error: this.getErrorMessage(error),
          };
          this.statusSubject.next(status);
          return of(status);
        })
      );
  }

  private getErrorMessage(error: any): string {
    if (error.name === "TimeoutError") return "Timeout";
    if (error.status === 0) return "Network Error";
    if (error.status) return `HTTP ${error.status}`;
    return "Unknown Error";
  }
}
```

### 3.2 Component Implementation

```typescript
@Component({
  selector: "app-health-check",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="health-status" [class]="getStatusClass()" [class.compact]="compact">
      <span class="indicator">{{ getStatusIcon() }}</span>

      @if (!compact) {
      <span class="status-text">API: {{ getStatusText() }}</span>
      <small class="details">{{ getDetailsText() }}</small>
      }

      <div class="actions">
        @if (showCheckButton) {
        <button (click)="checkNow()" [disabled]="isChecking()" class="btn-check">
          {{ isChecking() ? "Checking..." : "Check" }}
        </button>
        } @if (showToggleButton) {
        <button (click)="toggleMonitoring()" class="btn-toggle">
          {{ isMonitoring() ? "Stop" : "Start" }}
        </button>
        }
      </div>
    </div>
  `,
  styleUrls: ["./health-check.component.scss"],
})
export class HealthCheckComponent implements OnInit, OnDestroy {
  @Input() showCheckButton = true;
  @Input() showToggleButton = true;
  @Input() compact = false;
  @Input() autoStart = true;
  @Input() interval = 30000;

  private healthService = inject(HealthCheckService);
  private destroyRef = inject(DestroyRef);

  protected status$ = this.healthService.status$;
  protected isMonitoring = signal(false);
  protected isChecking = signal(false);

  ngOnInit(): void {
    if (this.autoStart) {
      this.startMonitoring();
    }
  }

  ngOnDestroy(): void {
    this.healthService.stopMonitoring();
  }

  protected getStatusClass(): string {
    const status = this.healthService.getCurrentStatus();
    return status.isOnline ? "online" : "offline";
  }

  protected getStatusIcon(): string {
    const status = this.healthService.getCurrentStatus();
    if (this.isChecking()) return "🔄";
    return status.isOnline ? "✅" : "❌";
  }

  protected getStatusText(): string {
    const status = this.healthService.getCurrentStatus();
    if (status.isOnline) return "Online";
    return status.error || "Offline";
  }

  protected getDetailsText(): string {
    const status = this.healthService.getCurrentStatus();
    const time = status.lastCheck.toLocaleTimeString();
    return `${status.responseTime}ms • ${time}`;
  }

  protected async checkNow(): Promise<void> {
    this.isChecking.set(true);
    try {
      await this.healthService.checkHealth();
    } finally {
      // Небольшая задержка для UX
      setTimeout(() => this.isChecking.set(false), 500);
    }
  }

  protected toggleMonitoring(): void {
    if (this.isMonitoring()) {
      this.stopMonitoring();
    } else {
      this.startMonitoring();
    }
  }

  private startMonitoring(): void {
    this.healthService.startMonitoring({ interval: this.interval });
    this.isMonitoring.set(true);
  }

  private stopMonitoring(): void {
    this.healthService.stopMonitoring();
    this.isMonitoring.set(false);
  }
}
```

## 4. Стили

```scss
// health-check.component.scss
.health-status {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 14px;
  border: 1px solid transparent;
  transition: all 0.2s ease;

  &.online {
    background: #d4edda;
    border-color: #c3e6cb;
    color: #155724;
  }

  &.offline {
    background: #f8d7da;
    border-color: #f5c6cb;
    color: #721c24;
  }

  &.compact {
    padding: 4px 8px;
    font-size: 12px;

    .indicator {
      font-size: 14px;
    }
  }

  .indicator {
    font-size: 16px;
    animation: pulse 1s ease-in-out infinite;
  }

  .status-text {
    font-weight: 500;
  }

  .details {
    opacity: 0.7;
    font-size: 12px;
    white-space: nowrap;
  }

  .actions {
    display: flex;
    gap: 4px;
    margin-left: auto;
  }

  button {
    padding: 4px 8px;
    border: none;
    border-radius: 3px;
    cursor: pointer;
    font-size: 12px;
    transition: opacity 0.2s ease;

    &:hover:not(:disabled) {
      opacity: 0.8;
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }

  .btn-check {
    background: #007bff;
    color: white;
  }

  .btn-toggle {
    background: #6c757d;
    color: white;
  }
}

@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}
```

## 5. Использование

```typescript
// В любом компоненте
@Component({
  template: `
    <!-- Полный компонент -->
    <app-health-check />

    <!-- Компактный в header -->
    <app-health-check [compact]="true" [showToggleButton]="false" />

    <!-- Кастомный интервал -->
    <app-health-check [interval]="10000" />
  `,
})
export class SomeComponent {}

// Подписка на статус в других компонентах
@Component({
  template: ` <div class="api-indicator" [class]="healthService.getCurrentStatus().isOnline ? 'ok' : 'error'">API {{ healthService.getCurrentStatus().isOnline ? "OK" : "DOWN" }}</div> `,
})
export class HeaderComponent {
  protected healthService = inject(HealthCheckService);
}
```

## 6. C# API Endpoint

```csharp
[ApiController]
[Route("api/[controller]")]
public class HealthController : ControllerBase
{
    [HttpGet]
    public IActionResult Get()
    {
        return Ok(new
        {
            status = "healthy",
            timestamp = DateTime.UtcNow,
            version = Assembly.GetExecutingAssembly().GetName().Version?.ToString()
        });
    }
}
```

## 7. Требования

### Функциональные:

- ✅ Проверка доступности API
- ✅ Отображение времени отклика
- ✅ Автоматический мониторинг
- ✅ Ручная проверка
- ✅ Компактный режим

### Технические:

- ✅ Angular 19 standalone компонент
- ✅ RxJS для реактивности
- ✅ Signals для состояния
- ✅ HttpClient для запросов
- ✅ TypeScript типизация

### Метрики:

- **Bundle size**: < 3KB
- **Dependencies**: 0 внешних (только Angular)
- **Время интеграции**: < 10 минут

---

## **Результат**: Переиспользуемый компонент с сервисом для мониторинга API, готовый к использованию в любом месте приложения.

Вкладка Network в профессиональных мониторингах обычно отвечает за две вещи: метрики соединения между клиентом и сервером и доступность внешних API (платежные шлюзы, почтовые сервисы, облачное хранилище).

Что будем писать и откуда брать?
Предлагаю реализовать три ключевых блока данных:
Client-to-Server Performance (Детализация задержки):
Откуда: Прямо из браузера, используя Resource Timing API. Мы можем разложить каждый запрос
HealthCheck
на составляющие: сколько времени ушло на поиск DNS, сколько на установку TCP-соединения, сколько на SSL-рукопожатие и сколько сервер «думал» перед ответом (TTFB).
Это выглядит очень круто и технично.
External Connectivity (С сервера «наружу»):
Откуда: С бэкенда (Program.cs). Мы добавим проверки типа «Доступен ли DeepL API?», «Есть ли связь с Google Storage?» или «Пингуется ли SMTP-сервер?».
Эти данные придут в том же массиве checks, но мы отфильтруем их для вкладки Network.
Browser Context:
Откуда: Локальные свойства браузера - тип протокола (HTTP/2, HTTP/3), наличие Service Worker.
