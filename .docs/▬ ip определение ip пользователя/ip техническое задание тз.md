Отличная идея! Нормализация как отдельная фаза повышает качество архитектуры. Принимается.

# Полное ТЗ: Модуль определения IP-адреса пользователя

## 1. Цель и назначение

Создать production-ready модуль для определения реального IP-адреса пользователя в веб-приложении с учетом прокси-серверов, требований безопасности и полной observability.

## 2. Архитектурные требования

### 2.1 Компоненты системы

- **Backend API endpoint** (ASP.NET Core/.NET 8)
- **Angular 19 сервис** (standalone)
- **State Machine для IP resolution**
- **Система логирования и мониторинга**
- **Конфигурационный модуль доверенных прокси**

### 2.2 Принципы архитектуры

- Собственное решение без внешних API
- State Machine с предсказуемыми переходами
- Минимальная латентность (<50ms p99)
- Отказоустойчивость с graceful degradation
- Полное логирование для аудита и debugging

## 3. State Machine Algorithm

### 3.1 Состояния системы

```
START
→ VALIDATE_REQUEST
→ NORMALIZE_INPUT
→ SOURCE_CLASSIFICATION
→ [EDGE_TRUSTED | INTERNAL_TRUSTED | UNTRUSTED]
→ [PARSE_EDGE_HEADERS | PARSE_INTERNAL_HEADERS | USE_CONNECTION_IP]
→ VALIDATE_IP_RESULT
→ SUCCESS
→ LOG_RESULT
```

### 3.2 Детализация состояний

#### State 1: `VALIDATE_REQUEST`

**Цель:** Базовая проверка входных данных

```csharp
// Входные данные
- HttpContext
- Headers collection
- Connection metadata

// Проверки
✅ Request не null
✅ Headers коллекция доступна
✅ Connection.RemoteIpAddress существует

// Переходы
SUCCESS → NORMALIZE_INPUT
FAILURE → FALLBACK_CONNECTION (с error log)
```

#### State 2: `NORMALIZE_INPUT` ⭐ **НОВОЕ**

**Цель:** Нормализация и предварительная обработка всех входных данных

```csharp
// Обработка заголовков
normalizedHeaders = new Dictionary<string, string>();

foreach (header in request.Headers)
{
    key = header.Key.ToLowerInvariant().Trim()
    value = header.Value.ToString().Trim()

    if (!string.IsNullOrEmpty(value))
        normalizedHeaders[key] = value
}

// Специальная обработка X-Forwarded-For
if (normalizedHeaders.ContainsKey("x-forwarded-for"))
{
    xffValue = normalizedHeaders["x-forwarded-for"]

    // Разбор цепочки: "ip1, ip2, ip3" → ["ip1", "ip2", "ip3"]
    xffTokens = xffValue
        .Split(',', StringSplitOptions.RemoveEmptyEntries)
        .Select(token => token.Trim())
        .Where(token => !string.IsNullOrEmpty(token) && token.Length <= 45) // IPv6 max length
        .ToList()

    normalizedHeaders["x-forwarded-for-parsed"] = string.Join(";", xffTokens)
}

// Обработка других составных заголовков
// CF-Connecting-IP, X-Real-IP - простой trim

// Метрики
RecordMetric("normalize_input_total")
RecordMetric("normalize_xff_tokens_count", xffTokens?.Count ?? 0)

→ SOURCE_CLASSIFICATION(normalizedHeaders)
```

**Метрики нормализации:**

- `normalize_input_duration_ms`
- `normalize_malformed_headers_total`
- `normalize_xff_chain_length_histogram`

#### State 3: `SOURCE_CLASSIFICATION`

**Цель:** Определить уровень доверия к источнику запроса

```csharp
connectionIP = HttpContext.Connection.RemoteIpAddress
trustLevel = DetermineSourceTrust(connectionIP)

switch (trustLevel)
{
    case EdgeTrusted:
        → EDGE_TRUSTED(normalizedHeaders, connectionIP)
    case InternalTrusted:
        → INTERNAL_TRUSTED(normalizedHeaders, connectionIP)
    case Untrusted:
        → UNTRUSTED(normalizedHeaders, connectionIP)
}

// Конфигурация доверия
EdgeProxyRanges: ["173.245.48.0/20", "103.21.244.0/22"] // CloudFlare
InternalProxyRanges: ["10.0.0.0/8", "192.168.0.0/16", "custom ranges"]
```

#### State 4a: `EDGE_TRUSTED`

**Цель:** Обработка заголовков от edge прокси (CloudFlare, CDN)

```csharp
// Приоритет заголовков для Edge
edgeHeaders = ["cf-connecting-ip", "true-client-ip", "x-forwarded-for"]

foreach (headerName in edgeHeaders)
{
    if (normalizedHeaders.ContainsKey(headerName))
    {
        candidateIP = normalizedHeaders[headerName]

        // Для XFF берем первый токен после нормализации
        if (headerName == "x-forwarded-for" && normalizedHeaders.ContainsKey("x-forwarded-for-parsed"))
        {
            tokens = normalizedHeaders["x-forwarded-for-parsed"].Split(';')
            candidateIP = tokens.FirstOrDefault()
        }

        if (!string.IsNullOrEmpty(candidateIP))
        {
            → PARSE_EDGE_HEADERS(candidateIP, headerName)
        }
    }
}

// Если ни один заголовок не найден
LogWarning("Edge proxy without expected headers")
→ FALLBACK_CONNECTION("missing_edge_headers")
```

#### State 4b: `INTERNAL_TRUSTED`

**Цель:** Обработка заголовков от внутренних прокси

```csharp
// X-Forwarded-For - основной источник
if (normalizedHeaders.ContainsKey("x-forwarded-for-parsed"))
{
    tokens = normalizedHeaders["x-forwarded-for-parsed"].Split(';')
    → PARSE_INTERNAL_HEADERS(tokens, "x-forwarded-for")
}
// X-Real-IP - fallback
else if (normalizedHeaders.ContainsKey("x-real-ip"))
{
    realIP = normalizedHeaders["x-real-ip"]
    → PARSE_INTERNAL_HEADERS([realIP], "x-real-ip")
}
else
{
    LogWarning("Internal proxy without XFF or X-Real-IP")
    → FALLBACK_CONNECTION("missing_internal_headers")
}
```

#### State 4c: `UNTRUSTED`

**Цель:** Обработка запросов от недоверенных источников

```csharp
// Детектирование попыток спуфинга
suspiciousHeaders = DetectSpoofingAttempt(normalizedHeaders)

if (suspiciousHeaders.Any())
{
    LogSecurityEvent("header_spoofing_attempt", new {
        ConnectionIP = connectionIP,
        SuspiciousHeaders = suspiciousHeaders,
        UserAgent = normalizedHeaders.GetValueOrDefault("user-agent", "")
    })
}

// Игнорируем ВСЕ заголовки, используем только connection IP
→ USE_CONNECTION_IP(connectionIP, "untrusted_source")
```

#### State 5a: `PARSE_EDGE_HEADERS`

**Цель:** Валидация IP от edge прокси

```csharp
// Входные данные: candidateIP, headerSource

// Базовая валидация
if (!IPAddress.TryParse(candidateIP, out parsedIP))
{
    LogWarning($"Invalid IP format from edge: {candidateIP}")
    → FALLBACK_CONNECTION("invalid_edge_ip")
}

// Проверка на приватные диапазоны
if (IsPrivateOrReservedRange(parsedIP))
{
    LogWarning($"Edge proxy sent private/reserved IP: {candidateIP}")
    → FALLBACK_CONNECTION("private_ip_from_edge")
}

// Успешный результат
result = new IPResolutionResult
{
    IP = candidateIP,
    Source = headerSource,
    TrustLevel = "high",
    ProxyDepth = 1,
    IsPrivate = false
}

→ VALIDATE_IP_RESULT(result)
```

#### State 5b: `PARSE_INTERNAL_HEADERS`

**Цель:** Обработка X-Forwarded-For цепочки от внутренних прокси

```csharp
// Входные данные: ipTokens[], headerSource

proxyDepth = ipTokens.Length
trustLevel = "medium"

// Проверка глубины прокси
if (proxyDepth > MaxProxyDepth)
{
    LogSecurityWarning($"Excessive proxy depth: {proxyDepth}")
    trustLevel = "low"
}

// Поиск первого публичного IP (слева направо)
string clientIP = null;
foreach (token in ipTokens)
{
    if (IPAddress.TryParse(token, out parsedIP) &&
        !IsPrivateOrReservedRange(parsedIP))
    {
        clientIP = token;
        break;
    }
}

if (clientIP == null)
{
    LogWarning("No public IP found in proxy chain")
    → FALLBACK_CONNECTION("no_public_ip_in_chain")
}

result = new IPResolutionResult
{
    IP = clientIP,
    Source = headerSource,
    TrustLevel = trustLevel,
    ProxyDepth = proxyDepth,
    IsPrivate = false
}

→ VALIDATE_IP_RESULT(result)
```

#### State 5c: `USE_CONNECTION_IP`

**Цель:** Использование IP соединения как fallback

```csharp
// Входные данные: connectionIP, reason

connectionIPString = connectionIP.ToString()

result = new IPResolutionResult
{
    IP = connectionIPString,
    Source = "remote-connection",
    TrustLevel = reason == "untrusted_source" ? "medium" : "low",
    ProxyDepth = 0,
    IsPrivate = IsPrivateOrReservedRange(connectionIP),
    FallbackReason = reason
}

→ VALIDATE_IP_RESULT(result)
```

#### State 6: `VALIDATE_IP_RESULT`

**Цель:** Финальная валидация результата

```csharp
// Входные данные: IPResolutionResult

// Security pattern detection
if (DetectSuspiciousPattern(result, requestContext))
{
    result.TrustLevel = DowngradeTrust(result.TrustLevel)
    LogSecurityEvent("suspicious_ip_pattern", result)
}

// Финализация результата
result.Timestamp = DateTime.UtcNow
result.RequestId = HttpContext.TraceIdentifier
result.ProcessingTime = stopwatch.ElapsedMilliseconds

→ SUCCESS(result)
```

#### State 7: `SUCCESS`

**Цель:** Успешное завершение с результатом

```csharp
// Метрики успешного разрешения
RecordMetric("ip_resolution_success_total", new Dictionary<string, string>
{
    {"source", result.Source},
    {"trust_level", result.TrustLevel},
    {"is_private", result.IsPrivate.ToString()}
});

RecordHistogram("ip_resolution_duration_ms", result.ProcessingTime);

→ LOG_RESULT(result)
```

#### State 8: `LOG_RESULT`

**Цель:** Логирование и возврат результата

```csharp
// Структурированное логирование
logger.LogInformation("IP resolved", new
{
    RequestId = result.RequestId,
    IP = ShouldLogFullIP ? result.IP : HashIP(result.IP),
    Source = result.Source,
    TrustLevel = result.TrustLevel,
    ProxyDepth = result.ProxyDepth,
    ProcessingTime = result.ProcessingTime
});

return result;
```

## 4. Структуры данных

### 4.1 IPResolutionResult

```csharp
public class IPResolutionResult
{
    public string IP { get; set; }
    public string Source { get; set; } // Enum: cf-connecting-ip, x-forwarded-for, x-real-ip, remote-connection, fallback-connection
    public string TrustLevel { get; set; } // Enum: high, medium, low
    public int ProxyDepth { get; set; }
    public bool IsPrivate { get; set; }
    public DateTime Timestamp { get; set; }
    public string RequestId { get; set; }
    public long ProcessingTime { get; set; } // ms
    public string? FallbackReason { get; set; }
}
```

### 4.2 Конфигурация

```json
{
  "IPResolution": {
    "MaxProxyDepth": 5,
    "EdgeHeaders": ["cf-connecting-ip", "true-client-ip"],
    "InternalHeaders": ["x-forwarded-for", "x-real-ip"],
    "TrustDowngradeThreshold": 3,
    "SecurityLogging": true,
    "LogFullIP": false,
    "TrustedProxies": {
      "Edge": ["173.245.48.0/20", "103.21.244.0/22"],
      "Internal": ["10.0.0.0/8", "192.168.0.0/16", "192.168.1.10/32"]
    }
  }
}
```

## 5. Backend Implementation (ASP.NET Core)

### 5.1 Controller

```csharp
[ApiController]
[Route("api/[controller]")]
public class IPController : ControllerBase
{
    private readonly IIPResolutionService _ipService;
    private readonly ILogger<IPController> _logger;

    [HttpGet("detect")]
    [ProducesResponseType(typeof(IPResolutionResult), 200)]
    public async Task<IActionResult> DetectIP()
    {
        var result = await _ipService.ResolveIPAsync(HttpContext);
        return Ok(result);
    }
}
```

### 5.2 Service Interface

```csharp
public interface IIPResolutionService
{
    Task<IPResolutionResult> ResolveIPAsync(HttpContext context);
    Task<bool> ReloadConfigurationAsync();
}
```

## 6. Angular 19 Service

### 6.1 Service Implementation

```typescript
@Injectable({
  providedIn: "root",
})
export class IPDetectionService {
  private readonly SESSION_KEY = "ip_detection_result";
  private readonly CACHE_DURATION = 30 * 60 * 1000; // 30 минут

  private circuitBreaker = {
    isOpen: false,
    failures: 0,
    lastFailure: 0,
    timeout: 30000, // 30 секунд
  };

  constructor(private http: HttpClient) {}

  async getClientIP(): Promise<IPDetectionResult> {
    // Проверка кэша
    const cached = this.getFromCache();
    if (cached && !this.isCacheExpired(cached)) {
      return cached.result;
    }

    // Проверка circuit breaker
    if (this.isCircuitBreakerOpen()) {
      return this.getFallbackResult("circuit_breaker_open");
    }

    try {
      const result = await this.fetchWithRetry();
      this.saveToCache(result);
      this.resetCircuitBreaker();
      return result;
    } catch (error) {
      this.handleFailure(error);
      return this.getFallbackResult("api_error");
    }
  }

  private async fetchWithRetry(): Promise<IPDetectionResult> {
    const delays = [100, 300, 900]; // exponential backoff

    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const result = await firstValueFrom(this.http.get<IPDetectionResult>("/api/ip/detect").pipe(timeout(5000)));
        return result;
      } catch (error) {
        if (attempt === 2) throw error;
        await this.delay(delays[attempt]);
      }
    }

    throw new Error("All retry attempts failed");
  }
}
```

### 6.2 TypeScript Types

```typescript
export interface IPDetectionResult {
  ip: string;
  source: "cf-connecting-ip" | "x-forwarded-for" | "x-real-ip" | "remote-connection" | "fallback-connection";
  trustLevel: "high" | "medium" | "low";
  proxyDepth: number;
  isPrivate: boolean;
  timestamp: string;
  requestId: string;
  processingTime: number;
  fallbackReason?: string;
}

interface CachedResult {
  result: IPDetectionResult;
  cachedAt: number;
}
```

## 7. Безопасность

### 7.1 Rate Limiting

```csharp
// Composite key для rate limiting
public class IPDetectionRateLimiter
{
    // Ключи: IP + Route + UserAgent hash
    // Лимиты: 10 запросов/минуту на IP
    // Алгоритм: Sliding window
    // Исключения: Whitelist для monitoring систем
}
```

### 7.2 Security Logging

```csharp
// Обязательное логирование
- Все запросы с IP, timestamp, source
- Подозрительная активность (spoofing, rate limit)
- Изменения конфигурации
- Fallback срабатывания
```

## 8. Мониторинг и метрики

### 8.1 Основные метрики

```
// Переходы состояний
ip_resolution_state_transitions_total{from="state", to="state"}

// Распределение результатов
ip_resolution_trust_level_total{level="high|medium|low"}
ip_resolution_source_total{source="cf-connecting-ip|x-forwarded-for|..."}

// Производительность
ip_resolution_duration_ms_histogram
ip_resolution_success_rate

// Проблемы
ip_resolution_fallback_total{reason="missing_headers|invalid_ip|..."}
ip_resolution_security_events_total{type="spoofing|excessive_depth|..."}

// Нормализация (НОВЫЕ)
normalize_input_duration_ms_histogram
normalize_malformed_headers_total
normalize_xff_chain_length_histogram
```

### 8.2 Алерты

```
- Rate limit превышения > 100/час
- Fallback rate > 5%
- Security events > 10/час
- Processing time p99 > 100ms
```

## 9. GDPR и Compliance

### 9.1 Данные и retention

```
- IP адреса - персональные данные
- Полные IP в логах: 7 дней
- Хешированные IP для метрик: 30 дней
- Право на удаление: API для purge по RequestId
```

## 10. Тестирование

### 10.1 Unit тесты по состояниям

```csharp
[TestClass]
public class IPResolutionStateMachineTests
{
    [Test] public void NormalizeInput_WithValidXFF_ParsesCorrectly()
    [Test] public void EdgeTrusted_WithValidCFHeader_ReturnsHighTrust()
    [Test] public void InternalTrusted_WithExcessiveDepth_ReturnsLowTrust()
    [Test] public void Untrusted_WithSpoofedHeaders_IgnoresHeaders()
    [Test] public void ValidateResult_WithSuspiciousPattern_DowngradesTrust()
}
```

### 10.2 Integration тесты

```csharp
[Test] public void RealWorld_CloudFlareProxy_E2E()
[Test] public void RealWorld_NginxChain_ParsesXFFCorrectly()
[Test] public void Attack_HeaderSpoofing_FallsBackSecurely()
[Test] public void Performance_1000RPS_MaintainsLatency()
```

---

## 📋 Checklist для реализации

### Phase 1: Core State Machine

- [ ] Базовая State Machine инфраструктура
- [ ] Состояния VALIDATE_REQUEST, NORMALIZE_INPUT
- [ ] SOURCE_CLASSIFICATION с конфигурацией прокси
- [ ] Базовое логирование переходов

### Phase 2: IP Resolution Logic

- [ ] EDGE_TRUSTED, INTERNAL_TRUSTED, UNTRUSTED состояния
- [ ] Парсинг заголовков и валидация IP
- [ ] FALLBACK_CONNECTION обработка
- [ ] Unit тесты для каждого состояния

### Phase 3: Security & Monitoring

- [ ] Security event detection
- [ ] Rate limiting
- [ ] Comprehensive метрики
- [ ] Production logging

### Phase 4: Frontend Integration

- [ ] Angular 19 service с кэшированием
- [ ] Circuit breaker implementation
- [ ] Error handling и fallbacks
- [ ] E2E тестирование

### Phase 5: Production Readiness

- [ ] Load тестирование
- [ ] Security penetration тесты
- [ ] GDPR compliance validation
- [ ] Documentation и runbooks

Готово к реализации!

---

## ЧЕК ЛИСТ

# Чек-лист реализации модуля определения IP с временным графиком

## 📅 Общий график проекта: **4 недели** (160 часов)

```
Week 1: Core State Machine (40h)
Week 2: IP Resolution Logic (40h)
Week 3: Security & Monitoring (40h)
Week 4: Frontend Integration + Production (40h)
```

---

## 🗓️ **WEEK 1: Core State Machine** (40 часов)

### **День 1-2: Инфраструктура (16ч)**

#### Backend Infrastructure (12ч)

- [ ] **4ч** - Создание ASP.NET Core проекта и базовой структуры
  - Контроллер IPController
  - Interface IIPResolutionService
  - Базовые модели (IPResolutionResult)
- [ ] **4ч** - State Machine framework
  - Базовый State Machine engine
  - Enum для состояний
  - Контекст переходов между состояниями
- [ ] **4ч** - Конфигурационная система
  - appsettings.json структура
  - IConfiguration binding
  - Validation конфигурации

#### Testing Setup (4ч)

- [ ] **2ч** - Unit test проект
- [ ] **2ч** - Integration test инфраструктура

**Milestone 1:** Базовая инфраструктура готова ✅

### **День 3-4: Базовые состояния (16ч)**

#### VALIDATE_REQUEST State (4ч)

- [ ] **2ч** - Реализация валидации HttpContext
- [ ] **2ч** - Unit тесты для VALIDATE_REQUEST

#### NORMALIZE_INPUT State (8ч) ⭐

- [ ] **4ч** - Реализация нормализации заголовков
  - Trim и lowercase обработка
  - X-Forwarded-For parsing
  - Удаление пустых значений
- [ ] **2ч** - Метрики для нормализации
- [ ] **2ч** - Unit тесты нормализации

#### SOURCE_CLASSIFICATION State (4ч)

- [ ] **2ч** - Логика определения trust level
- [ ] **2ч** - Unit тесты классификации

**Milestone 2:** Базовые состояния работают ✅

### **День 5: Логирование и переходы (8ч)**

#### State Transitions (4ч)

- [ ] **2ч** - Реализация переходов между состояниями
- [ ] **2ч** - Тестирование переходов

#### Basic Logging (4ч)

- [ ] **2ч** - Structured logging настройка
- [ ] **2ч** - Логирование переходов состояний

**Week 1 Deliverable:** Working State Machine core с базовой функциональностью

---

## 🗓️ **WEEK 2: IP Resolution Logic** (40 часов)

### **День 6-7: Trusted Proxy States (16ч)**

#### EDGE_TRUSTED State (8ч)

- [ ] **4ч** - Реализация обработки CloudFlare headers
  - CF-Connecting-IP приоритет
  - True-Client-IP fallback
  - X-Forwarded-For для edge
- [ ] **4ч** - Unit тесты для edge proxy

#### INTERNAL_TRUSTED State (8ч)

- [ ] **4ч** - Реализация X-Forwarded-For chain parsing
  - Парсинг цепочки IP
  - Поиск первого публичного IP
  - MaxProxyDepth validation
- [ ] **4ч** - Unit тесты для internal proxy

**Milestone 3:** Proxy states реализованы ✅

### **День 8-9: IP Parsing & Validation (16ч)**

#### PARSE_EDGE_HEADERS State (6ч)

- [ ] **4ч** - IP валидация и обработка
  - IPv4/IPv6 parsing
  - Private/Reserved range detection
  - Trust level assignment
- [ ] **2ч** - Unit тесты

#### PARSE_INTERNAL_HEADERS State (6ч)

- [ ] **4ч** - Chain processing логика
  - Multiple IP handling
  - Proxy depth calculation
  - Trust downgrade логика
- [ ] **2ч** - Unit тесты

#### USE_CONNECTION_IP State (4ч)

- [ ] **2ч** - Fallback логика
- [ ] **2ч** - Unit тесты

**Milestone 4:** Все parsing states готовы ✅

### **День 10: Validation & Integration (8ч)**

#### VALIDATE_IP_RESULT State (4ч)

- [ ] **2ч** - Final validation логика
- [ ] **2ч** - Suspicious pattern detection

#### Integration Testing (4ч)

- [ ] **2ч** - End-to-end тесты State Machine
- [ ] **2ч** - Edge case тестирование

**Week 2 Deliverable:** Полнофункциональная IP resolution логика

---

## 🗓️ **WEEK 3: Security & Monitoring** (40 часов)

### **День 11-12: Security Implementation (16ч)**

#### Security Event Detection (8ч)

- [ ] **4ч** - Spoofing detection алгоритмы
  - Header consistency проверки
  - Suspicious pattern recognition
  - Trust downgrade logic
- [ ] **4ч** - Security logging implementation

#### Rate Limiting (8ч)

- [ ] **4ч** - Sliding window rate limiter
  - Composite key (IP + Route + UserAgent)
  - Redis/Memory provider
  - Configuration
- [ ] **4ч** - Rate limiting middleware integration

**Milestone 5:** Security features реализованы ✅

### **День 13-14: Monitoring & Metrics (16ч)**

#### Metrics Implementation (10ч)

- [ ] **3ч** - State transition metrics
- [ ] **3ч** - Performance metrics (duration, success rate)
- [ ] **2ч** - Security metrics (spoofing attempts, rate limits)
- [ ] **2ч** - Normalization metrics

#### Observability (6ч)

- [ ] **3ч** - Prometheus/OpenTelemetry integration
- [ ] **3ч** - Dashboard configuration (Grafana)

**Milestone 6:** Полный monitoring stack ✅

### **День 15: Load Testing & Optimization (8ч)**

#### Performance Testing (6ч)

- [ ] **3ч** - Load test implementation (NBomber/k6)
- [ ] **3ч** - Performance optimization

#### Production Readiness (2ч)

- [ ] **2ч** - Configuration review и hardening

**Week 3 Deliverable:** Production-ready backend с полным monitoring

---

## 🗓️ **WEEK 4: Frontend Integration + Production** (40 часов)

### **День 16-17: Angular Service (16ч)**

#### Core Service Implementation (10ч)

- [ ] **4ч** - IPDetectionService базовая реализация
  - HTTP client integration
  - Error handling
  - TypeScript types
- [ ] **3ч** - Caching mechanism
  - SessionStorage implementation
  - TTL logic
  - Cache validation
- [ ] **3ч** - Circuit breaker pattern
  - Failure counting
  - Timeout logic
  - Auto-reset

#### Retry Logic (6ч)

- [ ] **3ч** - Exponential backoff implementation
- [ ] **3ч** - Angular service unit tests

**Milestone 7:** Angular service готов ✅

### **День 18-19: E2E Testing (16ч)**

#### Integration Testing (8ч)

- [ ] **4ч** - Frontend-Backend integration tests
- [ ] **4ч** - Real proxy scenarios тестирование

#### Security Testing (8ч)

- [ ] **4ч** - Penetration testing scenarios
  - Header spoofing attempts
  - Rate limiting bypass attempts
  - XFF chain manipulation
- [ ] **4ч** - Security test automation

**Milestone 8:** Полное E2E тестирование ✅

### **День 20: Production Deployment (8ч)**

#### GDPR Compliance (4ч)

- [ ] **2ч** - Data retention policy implementation
- [ ] **2ч** - IP anonymization для long-term metrics

#### Production Deployment (4ч)

- [ ] **2ч** - Docker configuration
- [ ] **1ч** - Environment configuration
- [ ] **1ч** - Monitoring alerts setup

**Week 4 Deliverable:** Production deployment готов к запуску

---

## 📊 **Критический путь проекта**

### **Блокирующие зависимости:**

1. **State Machine framework** → все остальные состояния
2. **NORMALIZE_INPUT** → все parsing states
3. **IP validation logic** → security features
4. **Backend API** → Angular service
5. **Metrics infrastructure** → monitoring dashboard

### **Параллельные работы:**

- Unit тесты можно писать параллельно с реализацией
- Frontend development после готовности API (день 15+)
- Monitoring dashboard после metrics implementation
- Documentation на протяжении всего проекта

---

## ⚠️ **Риски и митигация**

### **High Risk (Red Zone):**

- **Производительность State Machine**
  - _Митигация:_ Load testing на день 15, buffer для оптимизации
- **Сложность X-Forwarded-For parsing**
  - _Митигация:_ Детальные unit тесты, edge cases в week 2
- **Rate limiting под нагрузкой**
  - _Митигация:_ Stress testing, fallback mechanisms

### **Medium Risk (Yellow Zone):**

- **Angular circuit breaker сложность**
  - _Митигация:_ Простая реализация первой итерации
- **Security testing coverage**
  - _Митигация:_ Automated security tests в week 4

### **Contingency Plan:**

- **2 дня buffer** для критических проблем
- **Scope reduction:** убрать advanced security features если нужно
- **MVP fallback:** basic IP detection без advanced trust levels

---

## 🎯 **Success Criteria**

### **Technical KPIs:**

- [ ] Response time p99 < 50ms
- [ ] Success rate > 99.5%
- [ ] Security tests pass 100%
- [ ] Load test: 1000 RPS sustained

### **Business KPIs:**

- [ ] GDPR compliance validated
- [ ] Production deployment successful
- [ ] Zero security incidents in testing
- [ ] Documentation complete

---

## 📝 **Daily Standup Template**

```
Yesterday:
- Completed: [tasks from checklist]
- Blocked: [any blockers]

Today:
- Planning: [next tasks]
- Risks: [any new risks]

Tomorrow:
- Dependencies: [what needs other work first]
- Testing: [validation plans]
```

**Готов к старту! 🚀**
