Техническое задание: Система мониторинга здоровья сервера и токенов

1. Общие требования
   1.1 Архитектура
   Frontend: Angular 19 (standalone components)
   Backend: C# ASP.NET Core Web API
   Логирование: JSON файлы с ротацией
   Мониторинг: Real-time статус в UI
   1.2 Функциональные требования
   Проверка здоровья сервера каждые 30 секунд
   Валидация токенов (access/refresh)
   Логирование результатов в JSON
   Real-time отображение статуса
   Компонент для детального мониторинга
2. Структура проекта
   2.1 Backend структура папок (C# ASP.NET Core)
   YourProject.API/
   ├── Features/
   │ └── Health/
   │ ├── Controllers/
   │ │ └── HealthController.cs
   │ ├── Services/
   │ │ ├── Interfaces/
   │ │ │ ├── IHealthCheckService.cs
   │ │ │ ├── IHealthLogService.cs
   │ │ │ └── ITokenValidationService.cs
   │ │ └── Implementations/
   │ │ ├── HealthCheckService.cs
   │ │ ├── HealthLogService.cs
   │ │ └── TokenValidationService.cs
   │ ├── Models/
   │ │ ├── HealthCheckResult.cs
   │ │ ├── TokenValidationResult.cs
   │ │ ├── HealthLogEntry.cs
   │ │ ├── DetailedHealthResponse.cs
   │ │ └── ServerMetrics.cs
   │ ├── DTOs/
   │ │ ├── HealthStatusDto.cs
   │ │ ├── HealthLogDto.cs
   │ │ └── ServerMetricsDto.cs
   │ ├── Validators/
   │ │ ├── TokenValidator.cs
   │ │ └── HealthCheckValidator.cs
   │ ├── Configuration/
   │ │ ├── HealthCheckOptions.cs
   │ │ └── LoggingOptions.cs
   │ └── Utilities/
   │ ├── HealthHelper.cs
   │ ├── LogFormatter.cs
   │ └── MetricsCalculator.cs
   ├── Core/
   │ ├── Services/
   │ │ ├── Interfaces/
   │ │ │ └── INotificationService.cs
   │ │ └── Implementations/
   │ │ └── NotificationService.cs
   │ ├── Middleware/
   │ │ ├── HealthCheckLoggingMiddleware.cs
   │ │ ├── ExceptionHandlingMiddleware.cs
   │ │ └── Extensions/
   │ │ └── MiddlewareExtensions.cs
   │ ├── Models/
   │ │ ├── BaseResponse.cs
   │ │ ├── ApiResponse.cs
   │ │ └── ErrorResponse.cs
   │ └── Extensions/
   │ └── ServiceCollectionExtensions.cs
   ├── Authentication/
   │ ├── Services/
   │ │ ├── Interfaces/
   │ │ │ └── IAuthService.cs
   │ │ └── Implementations/
   │ │ └── AuthService.cs
   │ ├── Models/
   │ │ ├── TokenModel.cs
   │ │ └── AuthResult.cs
   │ └── Configuration/
   │ └── JwtOptions.cs
   ├── Logs/
   │ ├── health-2025-12-19.json
   │ ├── health-2025-12-18.json
   │ └── archived/
   ├── appsettings.json
   ├── appsettings.Development.json
   ├── Program.cs
   ├── YourProject.API.csproj
   └── README.md

2.2 Frontend структура папок (Angular 19)
src/
├── app/
│ ├── core/
│ │ ├── services/
│ │ │ ├── auth.service.ts
│ │ │ ├── token.service.ts
│ │ │ ├── notification.service.ts
│ │ │ └── base-http.service.ts
│ │ ├── interceptors/
│ │ │ ├── auth.interceptor.ts
│ │ │ ├── error.interceptor.ts
│ │ │ └── logging.interceptor.ts
│ │ ├── guards/
│ │ │ ├── auth.guard.ts
│ │ │ └── role.guard.ts
│ │ ├── models/
│ │ │ ├── user.models.ts
│ │ │ ├── token.models.ts
│ │ │ └── api-response.models.ts
│ │ └── utils/
│ │ ├── storage.utils.ts
│ │ ├── date.utils.ts
│ │ └── validation.utils.ts
│ ├── shared/
│ │ ├── components/
│ │ │ ├── loading-spinner/
│ │ │ ├── confirmation-dialog/
│ │ │ └── error-message/
│ │ ├── directives/
│ │ │ ├── highlight.directive.ts
│ │ │ ├── click-outside.directive.ts
│ │ │ └── auto-focus.directive.ts
│ │ ├── pipes/
│ │ │ ├── time-ago.pipe.ts
│ │ │ ├── bytes.pipe.ts
│ │ │ └── safe-html.pipe.ts
│ │ ├── interfaces/
│ │ │ ├── common.interfaces.ts
│ │ │ └── api.interfaces.ts
│ │ └── constants/
│ │ ├── api.constants.ts
│ │ └── app.constants.ts
│ ├── features/
│ │ ├── health/
│ │ │ ├── components/
│ │ │ │ ├── health-monitor/
│ │ │ │ │ ├── health-monitor.component.ts
│ │ │ │ │ ├── health-monitor.component.html
│ │ │ │ │ ├── health-monitor.component.scss
│ │ │ │ │ └── health-monitor.component.spec.ts
│ │ │ │ ├── health-status-bar/
│ │ │ │ │ ├── health-status-bar.component.ts
│ │ │ │ │ ├── health-status-bar.component.html
│ │ │ │ │ ├── health-status-bar.component.scss
│ │ │ │ │ └── health-status-bar.component.spec.ts
│ │ │ │ ├── health-logs/
│ │ │ │ │ ├── health-logs.component.ts
│ │ │ │ │ ├── health-logs.component.html
│ │ │ │ │ ├── health-logs.component.scss
│ │ │ │ │ └── health-logs.component.spec.ts
│ │ │ │ ├── token-status/
│ │ │ │ │ ├── token-status.component.ts
│ │ │ │ │ ├── token-status.component.html
│ │ │ │ │ ├── token-status.component.scss
│ │ │ │ │ └── token-status.component.spec.ts
│ │ │ │ ├── server-metrics/
│ │ │ │ │ ├── server-metrics.component.ts
│ │ │ │ │ ├── server-metrics.component.html
│ │ │ │ │ ├── server-metrics.component.scss
│ │ │ │ │ └── server-metrics.component.spec.ts
│ │ │ │ ├── health-indicator/
│ │ │ │ │ ├── health-indicator.component.ts
│ │ │ │ │ ├── health-indicator.component.html
│ │ │ │ │ ├── health-indicator.component.scss
│ │ │ │ │ └── health-indicator.component.spec.ts
│ │ │ │ └── health-chart/
│ │ │ │ ├── health-chart.component.ts
│ │ │ │ ├── health-chart.component.html
│ │ │ │ ├── health-chart.component.scss
│ │ │ │ └── health-chart.component.spec.ts
│ │ │ ├── services/
│ │ │ │ ├── health-check.service.ts
│ │ │ │ ├── health-monitor.service.ts
│ │ │ │ ├── health-analytics.service.ts
│ │ │ │ ├── health-logger.service.ts
│ │ │ │ └── health-websocket.service.ts
│ │ │ ├── models/
│ │ │ │ ├── health.models.ts
│ │ │ │ ├── health-log.models.ts
│ │ │ │ ├── server-metrics.models.ts
│ │ │ │ └── token-validation.models.ts
│ │ │ ├── interfaces/
│ │ │ │ ├── health.interfaces.ts
│ │ │ │ ├── health-check.interfaces.ts
│ │ │ │ ├── monitoring.interfaces.ts
│ │ │ │ └── metrics.interfaces.ts
│ │ │ ├── constants/
│ │ │ │ ├── health.constants.ts
│ │ │ │ ├── health-endpoints.constants.ts
│ │ │ │ └── health-intervals.constants.ts
│ │ │ ├── pipes/
│ │ │ │ ├── health-status.pipe.ts
│ │ │ │ ├── server-status.pipe.ts
│ │ │ │ └── health-duration.pipe.ts
│ │ │ ├── directives/
│ │ │ │ ├── health-status-color.directive.ts
│ │ │ │ ├── auto-refresh-health.directive.ts
│ │ │ │ └── health-tooltip.directive.ts
│ │ │ ├── validators/
│ │ │ │ ├── health-form.validators.ts
│ │ │ │ └── metrics.validators.ts
│ │ │ ├── utils/
│ │ │ │ ├── health.utils.ts
│ │ │ │ ├── metrics-formatter.utils.ts
│ │ │ │ └── status-calculator.utils.ts
│ │ │ ├── guards/
│ │ │ │ ├── health-access.guard.ts
│ │ │ │ └── monitoring.guard.ts
│ │ │ ├── interceptors/
│ │ │ │ └── health-metrics.interceptor.ts
│ │ │ ├── styles/
│ │ │ │ ├── \_health-variables.scss
│ │ │ │ ├── \_health-mixins.scss
│ │ │ │ ├── \_health-components.scss
│ │ │ │ └── health.theme.scss
│ │ │ ├── tests/
│ │ │ │ ├── mocks/
│ │ │ │ │ ├── health-service.mock.ts
│ │ │ │ │ └── health-data.mock.ts
│ │ │ │ └── fixtures/
│ │ │ │ └── health-test-data.ts
│ │ │ ├── health.routes.ts
│ │ │ └── index.ts
│ │ ├── dashboard/
│ │ │ ├── components/
│ │ │ └── dashboard.routes.ts
│ │ ├── authentication/
│ │ │ ├── components/
│ │ │ ├── services/
│ │ │ └── auth.routes.ts
│ │ └── profile/
│ │ ├── components/
│ │ └── profile.routes.ts
│ ├── layout/
│ │ ├── components/
│ │ │ ├── header/
│ │ │ ├── sidebar/
│ │ │ └── footer/
│ │ └── layout.component.ts
│ ├── app.component.ts
│ ├── app.component.html
│ ├── app.component.scss
│ ├── app.config.ts
│ └── app.routes.ts
├── assets/
│ ├── images/
│ │ └── health/
│ │ ├── icons/
│ │ │ ├── health-check.svg
│ │ │ ├── server-status.svg
│ │ │ ├── token-valid.svg
│ │ │ ├── token-invalid.svg
│ │ │ └── monitoring.svg
│ │ └── charts/
│ ├── styles/
│ │ ├── \_variables.scss
│ │ ├── \_mixins.scss
│ │ └── themes/
│ │ └── health-theme.scss
│ ├── i18n/
│ │ ├── health/
│ │ │ ├── health.en.json
│ │ │ └── health.ru.json
│ │ ├── en.json
│ │ └── ru.json
│ └── config/
│ ├── api.config.json
│ ├── health.config.json
│ └── app.config.json
├── environments/
│ ├── environment.ts
│ ├── environment.development.ts
│ └── environment.production.ts
├── styles.scss
├── main.ts
└── index.html

3.  Backend Implementation
    3.1 Модели данных
    // Features/Health/Models/HealthCheckResult.cs
    namespace YourProject.API.Features.Health.Models
    {
    public interface IHealthCheckResult
    {
    string Status { get; set; }
    DateTime Timestamp { get; set; }
    TimeSpan Duration { get; set; }
    Dictionary<string, object> Details { get; set; }
    }

        public class HealthCheckResult : IHealthCheckResult
        {
            public string Status { get; set; } = string.Empty;
            public DateTime Timestamp { get; set; }
            public TimeSpan Duration { get; set; }
            public Dictionary<string, object> Details { get; set; } = new();
        }

    }

// Features/Health/Models/TokenValidationResult.cs
namespace YourProject.API.Features.Health.Models
{
public interface ITokenValidationResult
{
bool IsAccessTokenValid { get; set; }
bool IsRefreshTokenValid { get; set; }
DateTime? AccessTokenExpiry { get; set; }
DateTime? RefreshTokenExpiry { get; set; }
string UserId { get; set; }
string? TokenIssuer { get; set; }
List<string> Roles { get; set; }
}

    public class TokenValidationResult : ITokenValidationResult
    {
        public bool IsAccessTokenValid { get; set; }
        public bool IsRefreshTokenValid { get; set; }
        public DateTime? AccessTokenExpiry { get; set; }
        public DateTime? RefreshTokenExpiry { get; set; }
        public string UserId { get; set; } = string.Empty;
        public string? TokenIssuer { get; set; }
        public List<string> Roles { get; set; } = new();
    }

}

// Features/Health/Models/HealthLogEntry.cs
namespace YourProject.API.Features.Health.Models
{
public interface IHealthLogEntry
{
DateTime Timestamp { get; set; }
string Endpoint { get; set; }
string Status { get; set; }
double DurationMs { get; set; }
string? ClientIp { get; set; }
string? UserId { get; set; }
bool HasAccessToken { get; set; }
bool HasRefreshToken { get; set; }
string? TokenFingerprint { get; set; }
Dictionary<string, object> AdditionalData { get; set; }
}

    public class HealthLogEntry : IHealthLogEntry
    {
        public DateTime Timestamp { get; set; }
        public string Endpoint { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public double DurationMs { get; set; }
        public string? ClientIp { get; set; }
        public string? UserId { get; set; }
        public bool HasAccessToken { get; set; }
        public bool HasRefreshToken { get; set; }
        public string? TokenFingerprint { get; set; }
        public Dictionary<string, object> AdditionalData { get; set; } = new();
    }

}

// Features/Health/Models/ServerMetrics.cs
namespace YourProject.API.Features.Health.Models
{
public interface IServerMetrics
{
double CpuUsagePercentage { get; set; }
long MemoryUsageBytes { get; set; }
long AvailableMemoryBytes { get; set; }
int ActiveConnections { get; set; }
long UptimeMs { get; set; }
Dictionary<string, object> CustomMetrics { get; set; }
}

    public class ServerMetrics : IServerMetrics
    {
        public double CpuUsagePercentage { get; set; }
        public long MemoryUsageBytes { get; set; }
        public long AvailableMemoryBytes { get; set; }
        public int ActiveConnections { get; set; }
        public long UptimeMs { get; set; }
        public Dictionary<string, object> CustomMetrics { get; set; } = new();
    }

}

// Features/Health/Models/DetailedHealthResponse.cs
namespace YourProject.API.Features.Health.Models
{
public class DetailedHealthResponse
{
public HealthCheckResult Health { get; set; } = new();
public TokenValidationResult Tokens { get; set; } = new();
public ServerMetrics ServerMetrics { get; set; } = new();
public DateTime Timestamp { get; set; }
public string Environment { get; set; } = string.Empty;
public string Version { get; set; } = string.Empty;
}
}

3.2 Конфигурация
// Features/Health/Configuration/HealthCheckOptions.cs
namespace YourProject.API.Features.Health.Configuration
{
public class HealthCheckOptions
{
public const string SectionName = "HealthCheck";

        public string LogDirectory { get; set; } = "logs";
        public int LogRetentionDays { get; set; } = 30;
        public bool EnableDetailedLogging { get; set; } = true;
        public int MaxLogFileSize { get; set; } = 50; // MB
        public string LogFilePrefix { get; set; } = "health";
        public List<string> MonitoredEndpoints { get; set; } = new();
        public int HealthCheckTimeoutSeconds { get; set; } = 10;
        public bool EnableMetricsCollection { get; set; } = true;
        public bool CompressOldLogs { get; set; } = true;
    }

}

// Features/Health/Configuration/LoggingOptions.cs
namespace YourProject.API.Features.Health.Configuration
{
public class LoggingOptions
{
public const string SectionName = "HealthLogging";

        public bool LogTokenFingerprints { get; set; } = true;
        public int FingerprintLength { get; set; } = 8;
        public string DateFormat { get; set; } = "yyyy-MM-dd HH:mm:ss.fff";
        public bool IncludeHeaders { get; set; } = false;
        public bool IncludeQueryParameters { get; set; } = false;
        public List<string> ExcludedHeaders { get; set; } = new() { "Authorization", "Cookie" };
    }

}

3.3 Сервисы
// Features/Health/Services/Interfaces/IHealthCheckService.cs
namespace YourProject.API.Features.Health.Services.Interfaces
{
public interface IHealthCheckService
{
Task<IHealthCheckResult> CheckServerHealthAsync();
Task<ITokenValidationResult> ValidateTokensAsync(string? accessToken, string? refreshToken);
Task<IServerMetrics> GetServerMetricsAsync();
Task<bool> IsSystemHealthyAsync();
}
}

// Features/Health/Services/Interfaces/IHealthLogService.cs
namespace YourProject.API.Features.Health.Services.Interfaces
{
public interface IHealthLogService
{
Task LogHealthCheckAsync(IHealthLogEntry logEntry);
Task<List<IHealthLogEntry>> GetRecentLogsAsync(int count = 50);
Task<List<IHealthLogEntry>> GetLogsForDateRangeAsync(DateTime from, DateTime to);
Task CleanupOldLogsAsync();
Task<Dictionary<string, int>> GetLogStatisticsAsync(DateTime from, DateTime to);
}
}

// Features/Health/Services/Implementations/HealthCheckService.cs
using YourProject.API.Features.Health.Services.Interfaces;
using YourProject.API.Features.Health.Models;
using YourProject.API.Features.Health.Configuration;
using Microsoft.Extensions.Options;
using System.Diagnostics;
using System.IdentityModel.Tokens.Jwt;

namespace YourProject.API.Features.Health.Services.Implementations
{
public class HealthCheckService : IHealthCheckService
{
private readonly IServiceProvider \_serviceProvider;
private readonly ILogger<HealthCheckService> \_logger;
private readonly HealthCheckOptions \_options;
private readonly PerformanceCounter \_cpuCounter;

        public HealthCheckService(
            IServiceProvider serviceProvider,
            ILogger<HealthCheckService> logger,
            IOptions<HealthCheckOptions> options)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
            _options = options.Value;
            _cpuCounter = new PerformanceCounter("Processor", "% Processor Time", "_Total");
        }

        public async Task<IHealthCheckResult> CheckServerHealthAsync()
        {
            var startTime = DateTime.UtcNow;
            var result = new HealthCheckResult
            {
                Timestamp = startTime,
                Details = new Dictionary<string, object>()
            };

            try
            {
                var healthChecks = new List<Task<(string key, object value, bool isHealthy)>>
                {
                    CheckDatabaseAsync(),
                    CheckMemoryAsync(),
                    CheckDiskSpaceAsync(),
                    CheckExternalServicesAsync()
                };

                var results = await Task.WhenAll(healthChecks);
                var allHealthy = true;

                foreach (var (key, value, isHealthy) in results)
                {
                    result.Details.Add(key, value);
                    if (!isHealthy) allHealthy = false;
                }

                result.Status = allHealthy ? "Healthy" : "Unhealthy";
            }
            catch (Exception ex)
            {
                result.Status = "Unhealthy";
                result.Details.Add("error", ex.Message);
                _logger.LogError(ex, "Health check failed");
            }
            finally
            {
                result.Duration = DateTime.UtcNow - startTime;
            }

            return result;
        }

        public async Task<ITokenValidationResult> ValidateTokensAsync(string? accessToken, string? refreshToken)
        {
            var result = new TokenValidationResult();

            if (!string.IsNullOrEmpty(accessToken))
            {
                try
                {
                    var tokenHandler = new JwtSecurityTokenHandler();
                    if (tokenHandler.CanReadToken(accessToken))
                    {
                        var token = tokenHandler.ReadJwtToken(accessToken);
                        result.IsAccessTokenValid = token.ValidTo > DateTime.UtcNow;
                        result.AccessTokenExpiry = token.ValidTo;
                        result.UserId = token.Claims.FirstOrDefault(c => c.Type == "sub")?.Value ?? "";
                        result.TokenIssuer = token.Issuer;
                        result.Roles = token.Claims.Where(c => c.Type == "role").Select(c => c.Value).ToList();
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Failed to validate access token");
                    result.IsAccessTokenValid = false;
                }
            }

            if (!string.IsNullOrEmpty(refreshToken))
            {
                // Здесь должна быть логика валидации refresh токена
                // Обычно проверяется в базе данных или кэше
                result.IsRefreshTokenValid = await ValidateRefreshTokenInStorageAsync(refreshToken);
            }

            return result;
        }

        public async Task<IServerMetrics> GetServerMetricsAsync()
        {
            var metrics = new ServerMetrics();

            try
            {
                // CPU использование
                _cpuCounter.NextValue();
                await Task.Delay(1000); // Нужна пауза для корректного измерения CPU
                metrics.CpuUsagePercentage = Math.Round(_cpuCounter.NextValue(), 2);

                // Память
                var gc = GC.GetTotalMemory(false);
                metrics.MemoryUsageBytes = gc;

                // Доступная память (примерно)
                var workingSet = Process.GetCurrentProcess().WorkingSet64;
                metrics.AvailableMemoryBytes = Environment.WorkingSet - workingSet;

                // Время работы
                metrics.UptimeMs = Environment.TickCount64;

                // Активные подключения (приблизительно)
                metrics.ActiveConnections = Process.GetCurrentProcess().Threads.Count;

                // Дополнительные метрики
                metrics.CustomMetrics.Add("threadCount", Environment.CurrentManagedThreadId);
                metrics.CustomMetrics.Add("gcCollections", new
                {
                    gen0 = GC.CollectionCount(0),
                    gen1 = GC.CollectionCount(1),
                    gen2 = GC.CollectionCount(2)
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to collect server metrics");
            }

            return metrics;
        }

        public async Task<bool> IsSystemHealthyAsync()
        {
            try
            {
                var health = await CheckServerHealthAsync();
                return health.Status == "Healthy";
            }
            catch
            {
                return false;
            }
        }

        private async Task<(string key, object value, bool isHealthy)> CheckDatabaseAsync()
        {
            try
            {
                using var scope = _serviceProvider.CreateScope();
                // var dbContext = scope.ServiceProvider.GetRequiredService<YourDbContext>();
                // var canConnect = await dbContext.Database.CanConnectAsync();
                var canConnect = true; // Заглушка

                return ("database", new { status = canConnect ? "connected" : "disconnected" }, canConnect);
            }
            catch (Exception ex)
            {
                return ("database", new { status = "error", message = ex.Message }, false);
            }
        }

        private async Task<(string key, object value, bool isHealthy)> CheckMemoryAsync()
        {
            try
            {
                var memoryUsed = GC.GetTotalMemory(false);
                var memoryLimit = 1024 * 1024 * 1024; // 1GB лимит для примера
                var isHealthy = memoryUsed < memoryLimit * 0.8; // Предупреждение на 80%

                return ("memory", new
                {
                    used = memoryUsed,
                    limit = memoryLimit,
                    percentage = Math.Round((double)memoryUsed / memoryLimit * 100, 2)
                }, isHealthy);
            }
            catch (Exception ex)
            {
                return ("memory", new { status = "error", message = ex.Message }, false);
            }
        }

        private async Task<(string key, object value, bool isHealthy)> CheckDiskSpaceAsync()
        {
            try
            {
                var drive = new DriveInfo(Path.GetPathRoot(Environment.CurrentDirectory));
                var freeSpacePercentage = (double)drive.AvailableFreeSpace / drive.TotalSize * 100;
                var isHealthy = freeSpacePercentage > 10; // Предупреждение если свободного места меньше 10%

                return ("diskSpace", new
                {
                    freeBytes = drive.AvailableFreeSpace,
                    totalBytes = drive.TotalSize,
                    freePercentage = Math.Round(freeSpacePercentage, 2)
                }, isHealthy);
            }
            catch (Exception ex)
            {
                return ("diskSpace", new { status = "error", message = ex.Message }, false);
            }
        }

        private async Task<(string key, object value, bool isHealthy)> CheckExternalServicesAsync()
        {
            // Здесь можно добавить проверки внешних сервисов
            return ("externalServices", new { status = "not_configured" }, true);
        }

        private async Task<bool> ValidateRefreshTokenInStorageAsync(string refreshToken)
        {
            // Здесь должна быть проверка в базе данных или кэше
            // Возвращаем true как заглушку
            return await Task.FromResult(true);
        }
    }

}

// Features/Health/Services/Implementations/HealthLogService.cs
using YourProject.API.Features.Health.Services.Interfaces;
using YourProject.API.Features.Health.Models;
using YourProject.API.Features.Health.Configuration;
using Microsoft.Extensions.Options;
using System.Text.Json;
using System.IO.Compression;

namespace YourProject.API.Features.Health.Services.Implementations
{
public class HealthLogService : IHealthLogService
{
private readonly HealthCheckOptions \_healthOptions;
private readonly LoggingOptions \_loggingOptions;
private readonly ILogger<HealthLogService> \_logger;
private readonly string \_logDirectory;

        public HealthLogService(
            IOptions<HealthCheckOptions> healthOptions,
            IOptions<LoggingOptions> loggingOptions,
            ILogger<HealthLogService> logger)
        {
            _healthOptions = healthOptions.Value;
            _loggingOptions = loggingOptions.Value;
            _logger = logger;
            _logDirectory = Path.GetFullPath(_healthOptions.LogDirectory);
        }

        public async Task LogHealthCheckAsync(IHealthLogEntry logEntry)
        {
            try
            {
                var fileName = $"{_healthOptions.LogFilePrefix}-{DateTime.UtcNow:yyyy-MM-dd}.json";
                var filePath = Path.Combine(_logDirectory, fileName);

                Directory.CreateDirectory(_logDirectory);

                var json = JsonSerializer.Serialize(logEntry, new JsonSerializerOptions
                {
                    WriteIndented = false,
                    PropertyNamingPolicy = JsonNamingPolicy.CamelCase
                });

                await File.AppendAllTextAsync(filePath, json + Environment.NewLine);

                // Проверяем размер файла и архивируем если нужно
                await CheckAndArchiveLogFileAsync(filePath);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to write health log entry");
            }
        }

        public async Task<List<IHealthLogEntry>> GetRecentLogsAsync(int count = 50)
        {
            var logs = new List<IHealthLogEntry>();

            try
            {
                var files = Directory.GetFiles(_logDirectory, $"{_healthOptions.LogFilePrefix}-*.json")
                                    .OrderByDescending(f => f)
                                    .Take(7); // Последние 7 дней

                foreach (var file in files)
                {
                    var lines = await File.ReadAllLinesAsync(file);
                    foreach (var line in lines.Reverse().Take(count - logs.Count))
                    {
                        if (!string.IsNullOrEmpty(line))
                        {
                            try
                            {
                                var entry = JsonSerializer.Deserialize<HealthLogEntry>(line, new JsonSerializerOptions
                                {
                                    PropertyNamingPolicy = JsonNamingPolicy.CamelCase
                                });
                                if (entry != null) logs.Add(entry);
                            }
                            catch (JsonException ex)
                            {
                                _logger.LogWarning(ex, "Failed to deserialize log entry: {Line}", line);
                            }
                        }

                        if (logs.Count >= count) break;
                    }

                    if (logs.Count >= count) break;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to read health logs");
            }

            return logs.OrderByDescending(l => l.Timestamp).Take(count).ToList();
        }

        public async Task<List<IHealthLogEntry>> GetLogsForDateRangeAsync(DateTime from, DateTime to)
        {
            var logs = new List<IHealthLogEntry>();

            try
            {
                var current = from.Date;
                while (current <= to.Date)
                {
                    var fileName = $"{_healthOptions.LogFilePrefix}-{current:yyyy-MM-dd}.json";
                    var filePath = Path.Combine(_logDirectory, fileName);

                    if (File.Exists(filePath))
                    {
                        var lines = await File.ReadAllLinesAsync(filePath);
                        foreach (var line in lines)
                        {
                            if (!string.IsNullOrEmpty(line))
                            {
                                try
                                {
                                    var entry = JsonSerializer.Deserialize<HealthLogEntry>(line, new JsonSerializerOptions
                                    {
                                        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
                                    });

                                    if (entry != null && entry.Timestamp >= from && entry.Timestamp <= to)
                                    {
                                        logs.Add(entry);
                                    }
                                }
                                catch (JsonException ex)
                                {
                                    _logger.LogWarning(ex, "Failed to deserialize log entry: {Line}", line);
                                }
                            }
                        }
                    }

                    current = current.AddDays(1);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to read health logs for date range");
            }

            return logs.OrderByDescending(l => l.Timestamp).ToList();
        }

        public async Task CleanupOldLogsAsync()
        {
            try
            {
                var cutoffDate = DateTime.UtcNow.AddDays(-_healthOptions.LogRetentionDays);
                var files = Directory.GetFiles(_logDirectory, $"{_healthOptions.LogFilePrefix}-*.json");

                foreach (var file in files)
                {
                    var fileName = Path.GetFileNameWithoutExtension(file);
                    var datePart = fileName.Substring(_healthOptions.LogFilePrefix.Length + 1);

                    if (DateTime.TryParseExact(datePart, "yyyy-MM-dd", null, DateTimeStyles.None, out var fileDate))
                    {
                        if (fileDate < cutoffDate)
                        {
                            if (_healthOptions.CompressOldLogs)
                            {
                                await CompressLogFileAsync(file);
                            }
                            else
                            {
                                File.Delete(file);
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to cleanup old health logs");
            }
        }

        public async Task<Dictionary<string, int>> GetLogStatisticsAsync(DateTime from, DateTime to)
        {
            var stats = new Dictionary<string, int>
            {
                ["total"] = 0,
                ["healthy"] = 0,
                ["unhealthy"] = 0,
                ["degraded"] = 0
            };

            try
            {
                var logs = await GetLogsForDateRangeAsync(from, to);
                stats["total"] = logs.Count;

                foreach (var log in logs)
                {
                    var status = log.Status.ToLower();
                    if (stats.ContainsKey(status))
                    {
                        stats[status]++;
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to calculate health log statistics");
            }

            return stats;
        }

        private async Task CheckAndArchiveLogFileAsync(string filePath)
        {
            try
            {
                var fileInfo = new FileInfo(filePath);
                var maxSizeBytes = _healthOptions.MaxLogFileSize * 1024 * 1024; // Convert MB to bytes

                if (fileInfo.Length > maxSizeBytes)
                {
                    await CompressLogFileAsync(filePath);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to check/archive log file: {FilePath}", filePath);
            }
        }

        private async Task CompressLogFileAsync(string filePath)
        {
            try
            {
                var compressedPath = $"{filePath}.gz";

                using var originalStream = File.OpenRead(filePath);
                using var compressedStream = File.Create(compressedPath);
                using var gzipStream = new GZipStream(compressedStream, CompressionMode.Compress);

                await originalStream.CopyToAsync(gzipStream);

                File.Delete(filePath);
                _logger.LogInformation("Compressed log file: {FilePath} -> {CompressedPath}", filePath, compressedPath);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to compress log file: {FilePath}", filePath);
            }
        }
    }

}

3.4 Middleware
// Core/Middleware/HealthCheckLoggingMiddleware.cs
using YourProject.API.Features.Health.Services.Interfaces;
using YourProject.API.Features.Health.Models;
using YourProject.API.Features.Health.Configuration;
using Microsoft.Extensions.Options;
using System.Security.Claims;

namespace YourProject.API.Core.Middleware
{
public class HealthCheckLoggingMiddleware
{
private readonly RequestDelegate \_next;
private readonly IHealthLogService \_logService;
private readonly ILogger<HealthCheckLoggingMiddleware> \_logger;
private readonly HealthCheckOptions \_options;
private readonly LoggingOptions \_loggingOptions;

        public HealthCheckLoggingMiddleware(
            RequestDelegate next,
            IHealthLogService logService,
            ILogger<HealthCheckLoggingMiddleware> logger,
            IOptions<HealthCheckOptions> options,
            IOptions<LoggingOptions> loggingOptions)
        {
            _next = next;
            _logService = logService;
            _logger = logger;
            _options = options.Value;
            _loggingOptions = loggingOptions.Value;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            var path = context.Request.Path.Value?.ToLowerInvariant();
            var shouldLog = _options.MonitoredEndpoints.Any(endpoint =>
                path?.Contains(endpoint.ToLowerInvariant()) == true);

            if (shouldLog)
            {
                var start = DateTime.UtcNow;
                var originalBodyStream = context.Response.Body;

                try
                {
                    await _next(context);
                }
                finally
                {
                    await LogHealthCheckAsync(context, start, DateTime.UtcNow);
                }
            }
            else
            {
                await _next(context);
            }
        }

        private async Task LogHealthCheckAsync(HttpContext context, DateTime startTime, DateTime endTime)
        {
            try
            {
                var duration = endTime - startTime;
                var accessToken = GetAccessToken(context);
                var refreshToken = GetRefreshToken(context);

                var logEntry = new HealthLogEntry
                {
                    Timestamp = endTime,
                    Endpoint = context.Request.Path,
                    Status = GetHealthStatus(context.Response.StatusCode),
                    DurationMs = duration.TotalMilliseconds,
                    ClientIp = GetClientIpAddress(context),
                    UserId = context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value,
                    HasAccessToken = !string.IsNullOrEmpty(accessToken),
                    HasRefreshToken = !string.IsNullOrEmpty(refreshToken),
                    TokenFingerprint = GetTokenFingerprint(accessToken),
                    AdditionalData = CollectAdditionalData(context)
                };

                await _logService.LogHealthCheckAsync(logEntry);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to log health check for {Path}", context.Request.Path);
            }
        }

        private string GetAccessToken(HttpContext context)
        {
            var authHeader = context.Request.Headers.Authorization.ToString();
            if (authHeader.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
            {
                return authHeader.Substring("Bearer ".Length).Trim();
            }
            return string.Empty;
        }

        private string GetRefreshToken(HttpContext context)
        {
            // Проверяем в заголовках
            var refreshFromHeader = context.Request.Headers["X-Refresh-Token"].ToString();
            if (!string.IsNullOrEmpty(refreshFromHeader))
            {
                return refreshFromHeader;
            }

            // Проверяем в cookies
            context.Request.Cookies.TryGetValue("refreshToken", out var refreshFromCookie);
            return refreshFromCookie ?? string.Empty;
        }

        private string GetHealthStatus(int statusCode)
        {
            return statusCode switch
            {
                200 => "Healthy",
                >= 400 and < 500 => "Degraded",
                >= 500 => "Unhealthy",
                _ => "Unknown"
            };
        }

        private string? GetClientIpAddress(HttpContext context)
        {
            // Проверяем заголовки прокси
            var forwardedFor = context.Request.Headers["X-Forwarded-For"].FirstOrDefault();
            if (!string.IsNullOrEmpty(forwardedFor))
            {
                return forwardedFor.Split(',')[0].Trim();
            }

            var realIp = context.Request.Headers["X-Real-IP"].FirstOrDefault();
            if (!string.IsNullOrEmpty(realIp))
            {
                return realIp;
            }

            return context.Connection.RemoteIpAddress?.ToString();
        }

        private string? GetTokenFingerprint(string? accessToken)
        {
            if (string.IsNullOrEmpty(accessToken) || !_loggingOptions.LogTokenFingerprints)
            {
                return null;
            }

            var length = Math.Min(_loggingOptions.FingerprintLength, accessToken.Length);
            return accessToken.Substring(0, length) + "...";
        }

        private Dictionary<string, object> CollectAdditionalData(HttpContext context)
        {
            var data = new Dictionary<string, object>
            {
                ["method"] = context.Request.Method,
                ["userAgent"] = context.Request.Headers.UserAgent.ToString(),
                ["contentType"] = context.Request.ContentType ?? string.Empty,
                ["responseStatusCode"] = context.Response.StatusCode,
                ["protocol"] = context.Request.Protocol
            };

            if (_loggingOptions.IncludeQueryParameters && context.Request.QueryString.HasValue)
            {
                data["queryString"] = context.Request.QueryString.Value;
            }

            if (_loggingOptions.IncludeHeaders)
            {
                var headers = new Dictionary<string, string>();
                foreach (var header in context.Request.Headers)
                {
                    if (!_loggingOptions.ExcludedHeaders.Contains(header.Key))
                    {
                        headers[header.Key] = header.Value.ToString();
                    }
                }
                data["headers"] = headers;
            }

            return data;
        }
    }

}

3.5 Controllers
// Features/Health/Controllers/HealthController.cs
using Microsoft.AspNetCore.Mvc;
using YourProject.API.Features.Health.Services.Interfaces;
using YourProject.API.Features.Health.Models;

namespace YourProject.API.Features.Health.Controllers
{
[ApiController]
[Route("api/[controller]")]
public class HealthController : ControllerBase
{
private readonly IHealthCheckService \_healthCheckService;
private readonly IHealthLogService \_logService;
private readonly ILogger<HealthController> \_logger;

        public HealthController(
            IHealthCheckService healthCheckService,
            IHealthLogService logService,
            ILogger<HealthController> logger)
        {
            _healthCheckService = healthCheckService;
            _logService = logService;
            _logger = logger;
        }

        /// <summary>
        /// Простая проверка здоровья сервера
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<IHealthCheckResult>> GetHealth()
        {
            try
            {
                var result = await _healthCheckService.CheckServerHealthAsync();
                var statusCode = result.Status switch
                {
                    "Healthy" => 200,
                    "Degraded" => 200, // Или 206 для частичного успеха
                    "Unhealthy" => 503,
                    _ => 500
                };

                return StatusCode(statusCode, result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Health check failed");
                return StatusCode(503, new { status = "Unhealthy", error = ex.Message });
            }
        }

        /// <summary>
        /// Детальная проверка здоровья с валидацией токенов
        /// </summary>
        [HttpGet("detailed")]
        public async Task<ActionResult<DetailedHealthResponse>> GetDetailedHealth()
        {
            try
            {
                var accessToken = GetAccessTokenFromRequest();
                var refreshToken = GetRefreshTokenFromRequest();

                var healthTask = _healthCheckService.CheckServerHealthAsync();
                var tokenValidationTask = _healthCheckService.ValidateTokensAsync(accessToken, refreshToken);
                var metricsTask = _healthCheckService.GetServerMetricsAsync();

                await Task.WhenAll(healthTask, tokenValidationTask, metricsTask);

                var response = new DetailedHealthResponse
                {
                    Health = (HealthCheckResult)healthTask.Result,
                    Tokens = (TokenValidationResult)tokenValidationTask.Result,
                    ServerMetrics = (ServerMetrics)metricsTask.Result,
                    Timestamp = DateTime.UtcNow,
                    Environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Unknown",
                    Version = System.Reflection.Assembly.GetExecutingAssembly().GetName().Version?.ToString() ?? "Unknown"
                };

                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Detailed health check failed");
                return StatusCode(500, new { error = ex.Message });
            }
        }

        /// <summary>
        /// Получение логов проверок здоровья
        /// </summary>
        [HttpGet("logs")]
        public async Task<ActionResult<List<IHealthLogEntry>>> GetLogs(
            [FromQuery] int count = 50,
            [FromQuery] DateTime? from = null,
            [FromQuery] DateTime? to = null)
        {
            try
            {
                List<IHealthLogEntry> logs;

                if (from.HasValue && to.HasValue)
                {
                    logs = await _logService.GetLogsForDateRangeAsync(from.Value, to.Value);
                }
                else
                {
                    logs = await _logService.GetRecentLogsAsync(count);
                }

                return Ok(logs);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to retrieve health logs");
                return StatusCode(500, new { error = ex.Message });
            }
        }

        /// <summary>
        /// Получение метрик сервера
        /// </summary>
        [HttpGet("metrics")]
        public async Task<ActionResult<IServerMetrics>> GetMetrics()
        {
            try
            {
                var metrics = await _healthCheckService.GetServerMetricsAsync();
                return Ok(metrics);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to retrieve server metrics");
                return StatusCode(500, new { error = ex.Message });
            }
        }

        /// <summary>
        /// Получение статистики логов
        /// </summary>
        [HttpGet("statistics")]
        public async Task<ActionResult<Dictionary<string, int>>> GetStatistics(
            [FromQuery] DateTime? from = null,
            [FromQuery] DateTime? to = null)
        {
            try
            {
                var fromDate = from ?? DateTime.UtcNow.AddDays(-7);
                var toDate = to ?? DateTime.UtcNow;

                var statistics = await _logService.GetLogStatisticsAsync(fromDate, toDate);
                return Ok(statistics);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to retrieve health statistics");
                return StatusCode(500, new { error = ex.Message });
            }
        }

        /// <summary>
        /// Принудительная очистка старых логов
        /// </summary>
        [HttpPost("cleanup")]
        public async Task<ActionResult> CleanupLogs()
        {
            try
            {
                await _logService.CleanupOldLogsAsync();
                return Ok(new { message = "Cleanup completed successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to cleanup health logs");
                return StatusCode(500, new { error = ex.Message });
            }
        }

        private string? GetAccessTokenFromRequest()
        {
            var authHeader = Request.Headers.Authorization.ToString();
            if (authHeader.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
            {
                return authHeader.Substring("Bearer ".Length).Trim();
            }
            return null;
        }

        private string? GetRefreshTokenFromRequest()
        {
            // Проверяем заголовок
            var refreshFromHeader = Request.Headers["X-Refresh-Token"].ToString();
            if (!string.IsNullOrEmpty(refreshFromHeader))
            {
                return refreshFromHeader;
            }

            // Проверяем cookies
            Request.Cookies.TryGetValue("refreshToken", out var refreshFromCookie);
            return refreshFromCookie;
        }
    }

}

4. Frontend Implementation
   4.1 Barrel Export
   // app/features/health/index.ts
   // Components
   export _ from './components/health-monitor/health-monitor.component';
   export _ from './components/health-status-bar/health-status-bar.component';
   export _ from './components/health-logs/health-logs.component';
   export _ from './components/token-status/token-status.component';
   export _ from './components/server-metrics/server-metrics.component';
   export _ from './components/health-indicator/health-indicator.component';
   export \* from './components/health-chart/health-chart.component';

// Services
export _ from './services/health-check.service';
export _ from './services/health-monitor.service';
export _ from './services/health-analytics.service';
export _ from './services/health-logger.service';

// Models
export _ from './models/health.models';
export _ from './models/health-log.models';
export _ from './models/server-metrics.models';
export _ from './models/token-validation.models';

// Interfaces
export _ from './interfaces/health.interfaces';
export _ from './interfaces/health-check.interfaces';
export _ from './interfaces/monitoring.interfaces';
export _ from './interfaces/metrics.interfaces';

// Constants
export _ from './constants/health.constants';
export _ from './constants/health-endpoints.constants';
export \* from './constants/health-intervals.constants';

// Pipes
export _ from './pipes/health-status.pipe';
export _ from './pipes/server-status.pipe';
export \* from './pipes/health-duration.pipe';

// Directives
export _ from './directives/health-status-color.directive';
export _ from './directives/auto-refresh-health.directive';
export \* from './directives/health-tooltip.directive';

// Utils
export _ from './utils/health.utils';
export _ from './utils/metrics-formatter.utils';
export \* from './utils/status-calculator.utils';

4.2 Константы
// app/features/health/constants/health-endpoints.constants.ts
export const HEALTH_ENDPOINTS = {
BASE: '/api/health',
DETAILED: '/api/health/detailed',
LOGS: '/api/health/logs',
METRICS: '/api/health/metrics',
STATISTICS: '/api/health/statistics',
CLEANUP: '/api/health/cleanup'
} as const;

// app/features/health/constants/health-intervals.constants.ts
export const HEALTH_INTERVALS = {
HEALTH_CHECK: 30000, // 30 секунд
LOG_REFRESH: 60000, // 1 минута
METRICS_REFRESH: 15000, // 15 секунд
STATISTICS_REFRESH: 300000, // 5 минут
CLEANUP_CHECK: 3600000 // 1 час
} as const;

// app/features/health/constants/health.constants.ts
export const HEALTH_STATUS = {
HEALTHY: 'Healthy',
DEGRADED: 'Degraded',
UNHEALTHY: 'Unhealthy',
UNKNOWN: 'Unknown'
} as const;

export const HEALTH_STATUS_COLORS = {
[HEALTH_STATUS.HEALTHY]: '#4caf50',
[HEALTH_STATUS.DEGRADED]: '#ffc107',
[HEALTH_STATUS.UNHEALTHY]: '#dc3545',
[HEALTH_STATUS.UNKNOWN]: '#6c757d'
} as const;

export const HEALTH_STATUS_ICONS = {
[HEALTH_STATUS.HEALTHY]: '✓',
[HEALTH_STATUS.DEGRADED]: '⚠',
[HEALTH_STATUS.UNHEALTHY]: '✗',
[HEALTH_STATUS.UNKNOWN]: '?'
} as const;

export const TOKEN_STATUS = {
VALID: 'valid',
INVALID: 'invalid',
EXPIRED: 'expired',
MISSING: 'missing'
} as const;

4.3 Интерфейсы
// app/features/health/interfaces/health.interfaces.ts
export interface HealthStatus {
status: 'Healthy' | 'Degraded' | 'Unhealthy';
timestamp: string;
duration: number;
details: Record<string, any>;
}

export interface TokenValidation {
isAccessTokenValid: boolean;
isRefreshTokenValid: boolean;
accessTokenExpiry?: string;
refreshTokenExpiry?: string;
userId: string;
tokenIssuer?: string;
roles: string[];
}

export interface ServerMetrics {
cpuUsagePercentage: number;
memoryUsageBytes: number;
availableMemoryBytes: number;
activeConnections: number;
uptimeMs: number;
customMetrics: Record<string, any>;
}

export interface DetailedHealthResponse {
health: HealthStatus;
tokens: TokenValidation;
serverMetrics: ServerMetrics;
timestamp: string;
environment: string;
version: string;
}

export interface HealthLogEntry {
timestamp: string;
endpoint: string;
status: string;
durationMs: number;
clientIp?: string;
userId?: string;
hasAccessToken: boolean;
hasRefreshToken: boolean;
tokenFingerprint?: string;
additionalData: Record<string, any>;
}

export interface HealthStatistics {
total: number;
healthy: number;
unhealthy: number;
degraded: number;
averageResponseTime: number;
uptime: number;
errorRate: number;
}

// app/features/health/interfaces/monitoring.interfaces.ts
export interface ServerStatusInfo {
isOnline: boolean;
lastCheck: string;
status: 'Healthy' | 'Degraded' | 'Unhealthy';
responseTime: number;
tokensValid: boolean;
environment?: string;
version?: string;
}

export interface MonitoringConfig {
enabled: boolean;
interval: number;
timeout: number;
retryAttempts: number;
endpoints: string[];
}

export interface HealthAlert {
id: string;
type: 'error' | 'warning' | 'info';
message: string;
timestamp: string;
acknowledged: boolean;
severity: 'low' | 'medium' | 'high' | 'critical';
}

4.4 Модели
// app/features/health/models/health.models.ts
export class HealthStatusModel {
status: 'Healthy' | 'Degraded' | 'Unhealthy';
timestamp: Date;
duration: number;
details: Map<string, any>;

constructor(data: any) {
this.status = data.status || 'Unhealthy';
this.timestamp = new Date(data.timestamp);
this.duration = data.duration || 0;
this.details = new Map(Object.entries(data.details || {}));
}

isHealthy(): boolean {
return this.status === 'Healthy';
}

isDegraded(): boolean {
return this.status === 'Degraded';
}

isUnhealthy(): boolean {
return this.status === 'Unhealthy';
}

getStatusColor(): string {
return HEALTH_STATUS_COLORS[this.status] || HEALTH_STATUS_COLORS.UNKNOWN;
}

getStatusIcon(): string {
return HEALTH_STATUS_ICONS[this.status] || HEALTH_STATUS_ICONS.UNKNOWN;
}

getDurationInSeconds(): number {
return Math.round(this.duration / 1000);
}
}

// app/features/health/models/server-metrics.models.ts
export class ServerMetricsModel {
cpuUsagePercentage: number;
memoryUsageBytes: number;
availableMemoryBytes: number;
activeConnections: number;
uptimeMs: number;
customMetrics: Map<string, any>;

constructor(data: any) {
this.cpuUsagePercentage = data.cpuUsagePercentage || 0;
this.memoryUsageBytes = data.memoryUsageBytes || 0;
this.availableMemoryBytes = data.availableMemoryBytes || 0;
this.activeConnections = data.activeConnections || 0;
this.uptimeMs = data.uptimeMs || 0;
this.customMetrics = new Map(Object.entries(data.customMetrics || {}));
}

getMemoryUsagePercentage(): number {
const total = this.memoryUsageBytes + this.availableMemoryBytes;
return total > 0 ? Math.round((this.memoryUsageBytes / total) \* 100) : 0;
}

getUptimeFormatted(): string {
const seconds = Math.floor(this.uptimeMs / 1000);
const days = Math.floor(seconds / (3600 _ 24));
const hours = Math.floor((seconds % (3600 _ 24)) / 3600);
const minutes = Math.floor((seconds % 3600) / 60);

    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;

}

formatBytes(bytes: number): string {
if (bytes === 0) return '0 B';
const k = 1024;
const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
const i = Math.floor(Math.log(bytes) / Math.log(k));
return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

getFormattedMemoryUsage(): string {
return this.formatBytes(this.memoryUsageBytes);
}

getFormattedAvailableMemory(): string {
return this.formatBytes(this.availableMemoryBytes);
}

isCpuUsageHigh(): boolean {
return this.cpuUsagePercentage > 80;
}

isMemoryUsageHigh(): boolean {
return this.getMemoryUsagePercentage() > 85;
}
}

4.5 Сервисы
// app/features/health/services/health-check.service.ts
import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { interval, switchMap, catchError, of, BehaviorSubject, Observable } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
HealthStatus,
TokenValidation,
DetailedHealthResponse,
HealthLogEntry,
ServerStatusInfo,
ServerMetrics,
HealthStatistics
} from '../interfaces/health.interfaces';
import { HEALTH_ENDPOINTS } from '../constants/health-endpoints.constants';
import { HEALTH_INTERVALS } from '../constants/health-intervals.constants';
import { HealthStatusModel, ServerMetricsModel } from '../models/health.models';

@Injectable({
providedIn: 'root'
})
export class HealthCheckService {
private http = inject(HttpClient);

// Signals для reactive UI
private serverStatus = signal<ServerStatusInfo>({
isOnline: false,
lastCheck: new Date().toISOString(),
status: 'Unhealthy',
responseTime: 0,
tokensValid: false
});

private healthLogs = signal<HealthLogEntry[]>([]);
private serverMetrics = signal<ServerMetricsModel | null>(null);
private healthStatistics = signal<HealthStatistics | null>(null);
private alerts = signal<any[]>([]);

// Computed values для UI
readonly status = computed(() => this.serverStatus());
readonly isServerHealthy = computed(() => this.serverStatus().status === 'Healthy');
readonly logs = computed(() => this.healthLogs());
readonly metrics = computed(() => this.serverMetrics());
readonly statistics = computed(() => this.healthStatistics());
readonly currentAlerts = computed(() => this.alerts());

// Subjects для streams
private statusSubject = new BehaviorSubject<ServerStatusInfo>(this.serverStatus());
private metricsSubject = new BehaviorSubject<ServerMetricsModel | null>(null);

private monitoringActive = false;
private retryCount = 0;
private readonly maxRetries = 3;

constructor() {
// Синхронизация signals с subjects
this.serverStatus.set = ((value: ServerStatusInfo) => {
signal<ServerStatusInfo>(value);
this.statusSubject.next(value);
return value;
}) as any;

    // Автостарт мониторинга
    this.startMonitoring();

}

// Публичные методы для запуска/остановки мониторинга
startMonitoring(): void {
if (this.monitoringActive) return;

    this.monitoringActive = true;

    // Основной health check
    interval(HEALTH_INTERVALS.HEALTH_CHECK).pipe(
      switchMap(() => this.performHealthCheck()),
      takeUntilDestroyed()
    ).subscribe();

    // Обновление метрик
    interval(HEALTH_INTERVALS.METRICS_REFRESH).pipe(
      switchMap(() => this.refreshMetrics()),
      takeUntilDestroyed()
    ).subscribe();

    // Обновление статистики
    interval(HEALTH_INTERVALS.STATISTICS_REFRESH).pipe(
      switchMap(() => this.refreshStatistics()),
      takeUntilDestroyed()
    ).subscribe();

}

stopMonitoring(): void {
this.monitoringActive = false;
}

// Основной health check
private performHealthCheck(): Observable<any> {
const startTime = performance.now();

    const headers = this.getAuthHeaders();

    return this.http.get<DetailedHealthResponse>(HEALTH_ENDPOINTS.DETAILED, { headers })
      .pipe(
        catchError(error => {
          console.error('Health check failed:', error);
          this.retryCount++;
          return of(null);
        })
      )
      .pipe(
        switchMap(response => {
          const responseTime = performance.now() - startTime;
          this.processHealthCheckResponse(response, responseTime);
          return of(response);
        })
      );

}

private processHealthCheckResponse(response: DetailedHealthResponse | null, responseTime: number): void {
if (response) {
this.retryCount = 0; // Сброс счетчика при успешном ответе

      const newStatus: ServerStatusInfo = {
        isOnline: true,
        lastCheck: new Date().toISOString(),
        status: response.health.status,
        responseTime: Math.round(responseTime),
        tokensValid: response.tokens.isAccessTokenValid && response.tokens.isRefreshTokenValid,
        environment: response.environment,
        version: response.version
      };

      this.serverStatus.set(newStatus);

      // Обновляем метрики
      if (response.serverMetrics) {
        this.serverMetrics.set(new ServerMetricsModel(response.serverMetrics));
        this.metricsSubject.next(this.serverMetrics());
      }

      // Проверяем алерты
      this.checkForAlerts(response);
    } else {
      const newStatus: ServerStatusInfo = {
        isOnline: false,
        lastCheck: new Date().toISOString(),
        status: 'Unhealthy',
        responseTime: Math.round(responseTime),
        tokensValid: false
      };

      this.serverStatus.set(newStatus);

      // Добавляем алерт если превышено количество попыток
      if (this.retryCount >= this.maxRetries) {
        this.addAlert({
          id: Date.now().toString(),
          type: 'error',
          message: 'Сервер недоступен более чем в ' + this.maxRetries + ' попытках',
          timestamp: new Date().toISOString(),
          acknowledged: false,
          severity: 'critical'
        });
      }
    }

}

// Получение логов
async getHealthLogs(count: number = 50, from?: Date, to?: Date): Promise<void> {
try {
let params = new HttpParams().set('count', count.toString());

      if (from) params = params.set('from', from.toISOString());
      if (to) params = params.set('to', to.toISOString());

      const logs = await this.http.get<HealthLogEntry[]>(HEALTH_ENDPOINTS.LOGS, { params }).toPromise();
      if (logs) {
        this.healthLogs.set(logs);
      }
    } catch (error) {
      console.error('Failed to fetch health logs:', error);
    }

}

// Получение метрик сервера
private refreshMetrics(): Observable<any> {
return this.http.get<ServerMetrics>(HEALTH_ENDPOINTS.METRICS).pipe(
catchError(error => {
console.error('Failed to fetch server metrics:', error);
return of(null);
}),
switchMap(metrics => {
if (metrics) {
this.serverMetrics.set(new ServerMetricsModel(metrics));
this.metricsSubject.next(this.serverMetrics());
}
return of(metrics);
})
);
}

// Получение статистики
private refreshStatistics(): Observable<any> {
const from = new Date();
from.setDate(from.getDate() - 7); // Последние 7 дней

    let params = new HttpParams()
      .set('from', from.toISOString())
      .set('to', new Date().toISOString());

    return this.http.get<HealthStatistics>(HEALTH_ENDPOINTS.STATISTICS, { params }).pipe(
      catchError(error => {
        console.error('Failed to fetch health statistics:', error);
        return of(null);
      }),
      switchMap(stats => {
        if (stats) {
          this.healthStatistics.set(stats);
        }
        return of(stats);
      })
    );

}

// Принудительное обновление данных
async forceRefresh(): Promise<void> {
try {
await Promise.all([
this.performHealthCheck().toPromise(),
this.refreshMetrics().toPromise(),
this.getHealthLogs(100)
]);
} catch (error) {
console.error('Failed to force refresh:', error);
}
}

// Очистка старых логов
async cleanupLogs(): Promise<boolean> {
try {
await this.http.post(HEALTH_ENDPOINTS.CLEANUP, {}).toPromise();
return true;
} catch (error) {
console.error('Failed to cleanup logs:', error);
return false;
}
}

// Методы для получения streams
getStatusStream(): Observable<ServerStatusInfo> {
return this.statusSubject.asObservable();
}

getMetricsStream(): Observable<ServerMetricsModel | null> {
return this.metricsSubject.asObservable();
}

// Методы для работы с алертами
private checkForAlerts(response: DetailedHealthResponse): void {
const alerts: any[] = [];

    // Проверка статуса токенов
    if (!response.tokens.isAccessTokenValid) {
      alerts.push({
        id: 'token-invalid-' + Date.now(),
        type: 'warning',
        message: 'Access token недействителен',
        timestamp: new Date().toISOString(),
        acknowledged: false,
        severity: 'medium'
      });
    }

    // Проверка метрик сервера
    const metrics = new ServerMetricsModel(response.serverMetrics);
    if (metrics.isCpuUsageHigh()) {
      alerts.push({
        id: 'cpu-high-' + Date.now(),
        type: 'warning',
        message: `Высокая загрузка CPU: ${metrics.cpuUsagePercentage}%`,
        timestamp: new Date().toISOString(),
        acknowledged: false,
        severity: 'high'
      });
    }

    if (metrics.isMemoryUsageHigh()) {
      alerts.push({
        id: 'memory-high-' + Date.now(),
        type: 'warning',
        message: `Высокое потребление памяти: ${metrics.getMemoryUsagePercentage()}%`,
        timestamp: new Date().toISOString(),
        acknowledged: false,
        severity: 'high'
      });
    }

    if (alerts.length > 0) {
      const currentAlerts = this.alerts();
      this.alerts.set([...currentAlerts, ...alerts]);
    }

}

private addAlert(alert: any): void {
const currentAlerts = this.alerts();
this.alerts.set([...currentAlerts, alert]);
}

acknowledgeAlert(alertId: string): void {
const currentAlerts = this.alerts();
const updatedAlerts = currentAlerts.map(alert =>
alert.id === alertId ? { ...alert, acknowledged: true } : alert
);
this.alerts.set(updatedAlerts);
}

clearAlerts(): void {
this.alerts.set([]);
}

// Утилиты
private getAuthHeaders(): HttpHeaders {
let headers = new HttpHeaders();

    const accessToken = localStorage.getItem('access_token');
    if (accessToken) {
      headers = headers.set('Authorization', `Bearer ${accessToken}`);
    }

    const refreshToken = localStorage.getItem('refresh_token');
    if (refreshToken) {
      headers = headers.set('X-Refresh-Token', refreshToken);
    }

    return headers;

}

// Методы для статус бара
getStatusForStatusBar(): ServerStatusInfo {
return this.serverStatus();
}

// Проверка доступности API
async isApiAvailable(): Promise<boolean> {
try {
const response = await this.http.get(HEALTH_ENDPOINTS.BASE, {
observe: 'response',
timeout: 5000
}).toPromise();
return response?.status === 200;
} catch {
return false;
}
}
}

4.6 Основной компонент мониторинга
// app/features/health/components/health-monitor/health-monitor.component.ts
import { Component, inject, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HealthCheckService } from '../../services/health-check.service';
import { HealthLogsComponent } from '../health-logs/health-logs.component';
import { TokenStatusComponent } from '../token-status/token-status.component';
import { ServerMetricsComponent } from '../server-metrics/server-metrics.component';
import { HealthChartComponent } from '../health-chart/health-chart.component';
import { HEALTH_STATUS_COLORS } from '../../constants/health.constants';

@Component({
selector: 'app-health-monitor',
standalone: true,
imports: [
CommonModule,
FormsModule,
HealthLogsComponent,
TokenStatusComponent,
ServerMetricsComponent,
HealthChartComponent
],
templateUrl: './health-monitor.component.html',
styleUrls: ['./health-monitor.component.scss']
})
export class HealthMonitorComponent implements OnInit, OnDestroy {
private healthService = inject(HealthCheckService);

// Signals
readonly status = this.healthService.status;
readonly logs = this.healthService.logs;
readonly metrics = this.healthService.metrics;
readonly statistics = this.healthService.statistics;
readonly alerts = this.healthService.currentAlerts;

// Local state
readonly isLoading = signal(false);
readonly selectedTab = signal<'overview' | 'logs' | 'metrics' | 'alerts'>('overview');
readonly autoRefresh = signal(true);

// Computed properties
readonly statusColors = HEALTH_STATUS_COLORS;
readonly unacknowledgedAlerts = computed(() =>
this.alerts().filter(alert => !alert.acknowledged)
);

private refreshInterval?: number;

ngOnInit(): void {
this.loadInitialData();
this.startAutoRefresh();
}

ngOnDestroy(): void {
this.stopAutoRefresh();
}

async loadInitialData(): Promise<void> {
this.isLoading.set(true);
try {
await this.healthService.forceRefresh();
} finally {
this.isLoading.set(false);
}
}

async onRefresh(): Promise<void> {
await this.loadInitialData();
}

async onCleanupLogs(): Promise<void> {
if (confirm('Вы уверены, что хотите очистить старые логи?')) {
this.isLoading.set(true);
try {
const success = await this.healthService.cleanupLogs();
if (success) {
alert('Логи успешно очищены');
await this.healthService.getHealthLogs();
} else {
alert('Ошибка при очистке логов');
}
} finally {
this.isLoading.set(false);
}
}
}

onTabChange(tab: 'overview' | 'logs' | 'metrics' | 'alerts'): void {
this.selectedTab.set(tab);
}

onAutoRefreshToggle(): void {
const newValue = !this.autoRefresh();
this.autoRefresh.set(newValue);

    if (newValue) {
      this.startAutoRefresh();
    } else {
      this.stopAutoRefresh();
    }

}

onAcknowledgeAlert(alertId: string): void {
this.healthService.acknowledgeAlert(alertId);
}

onClearAllAlerts(): void {
if (confirm('Очистить все алерты?')) {
this.healthService.clearAlerts();
}
}

getStatusClass(): string {
const status = this.status().status.toLowerCase();
return status === 'healthy' ? 'healthy' :
status === 'degraded' ? 'degraded' : 'unhealthy';
}

getAlertClass(severity: string): string {
return `alert-${severity}`;
}

private startAutoRefresh(): void {
if (this.refreshInterval) return;

    this.refreshInterval = window.setInterval(async () => {
      if (this.autoRefresh()) {
        await this.healthService.forceRefresh();
      }
    }, 60000); // Обновляем каждую минуту

}

private stopAutoRefresh(): void {
if (this.refreshInterval) {
clearInterval(this.refreshInterval);
this.refreshInterval = undefined;
}
}
}

4.7 Компонент статус бара
// app/features/health/components/health-status-bar/health-status-bar.component.ts
import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HealthCheckService } from '../../services/health-check.service';
import { HealthIndicatorComponent } from '../health-indicator/health-indicator.component';

@Component({
selector: 'app-health-status-bar',
standalone: true,
imports: [CommonModule, RouterModule, HealthIndicatorComponent],
template: `
<div class="health-status-bar" [class]="statusClass()">
<div class="status-content">
<app-health-indicator
[status]="status().status"
[size]="'small'">
</app-health-indicator>

        <span class="status-text">
          {{ statusText() }}
          @if (status().isOnline) {
            <small class="response-time">({{ status().responseTime }}мс)</small>
          }
        </span>

        @if (unacknowledgedAlertsCount() > 0) {
          <span class="alert-badge"
                [title]="'Неподтвержденных алертов: ' + unacknowledgedAlertsCount()">
            ⚠️ {{ unacknowledgedAlertsCount() }}
          </span>
        }

        @if (!status().tokensValid && status().isOnline) {
          <span class="token-warning" title="Проблемы с токенами">
            🔑 ⚠️
          </span>
        }

        <span class="last-check">
          Последняя проверка: {{ getFormattedLastCheck() }}
        </span>
      </div>

      <div class="status-actions">
        <button
          class="details-btn"
          routerLink="/health-monitor"
          title="Подробная информация">
          📊
        </button>
      </div>
    </div>

`,
styleUrls: ['./health-status-bar.component.scss']
})
export class HealthStatusBarComponent {
private healthService = inject(HealthCheckService);

readonly status = this.healthService.status;
readonly alerts = this.healthService.currentAlerts;

readonly statusClass = computed(() => {
const status = this.status();
if (!status.isOnline) return 'status-offline';

    switch (status.status) {
      case 'Healthy': return 'status-healthy';
      case 'Degraded': return 'status-degraded';
      case 'Unhealthy': return 'status-unhealthy';
      default: return 'status-unknown';
    }

});

readonly statusText = computed(() => {
const status = this.status();
if (!status.isOnline) return 'Сервер недоступен';

    switch (status.status) {
      case 'Healthy': return 'Система работает нормально';
      case 'Degraded': return 'Система работает с ошибками';
      case 'Unhealthy': return 'Система не работает';
      default: return 'Статус неизвестен';
    }

});

readonly unacknowledgedAlertsCount = computed(() =>
this.alerts().filter(alert => !alert.acknowledged).length
);

getFormattedLastCheck(): string {
const lastCheck = new Date(this.status().lastCheck);
const now = new Date();
const diffMs = now.getTime() - lastCheck.getTime();
const diffSeconds = Math.floor(diffMs / 1000);

    if (diffSeconds < 60) return `${diffSeconds}с назад`;
    if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}м назад`;
    return lastCheck.toLocaleTimeString();

}
}

4.8 Стили для health модуля
// app/features/health/styles/\_health-variables.scss
:root {
--health-color-healthy: #4caf50;
--health-color-degraded: #ffc107;
--health-color-unhealthy: #dc3545;
--health-color-unknown: #6c757d;
--health-color-offline: #343a40;

--health-bg-healthy: #d4edda;
--health-bg-degraded: #fff3cd;
--health-bg-unhealthy: #f8d7da;
--health-bg-unknown: #f8f9fa;
--health-bg-offline: #e9ecef;

--health-border-radius: 6px;
--health-box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
--health-transition: all 0.3s ease;
}

// app/features/health/styles/\_health-components.scss
.health-status-bar {
display: flex;
align-items: center;
justify-content: space-between;
padding: 8px 16px;
border-radius: var(--health-border-radius);
transition: var(--health-transition);
font-size: 14px;
box-shadow: var(--health-box-shadow);

&.status-healthy {
background-color: var(--health-bg-healthy);
color: #155724;
border: 1px solid var(--health-color-healthy);
}

&.status-degraded {
background-color: var(--health-bg-degraded);
color: #856404;
border: 1px solid var(--health-color-degraded);
}

&.status-unhealthy {
background-color: var(--health-bg-unhealthy);
color: #721c24;
border: 1px solid var(--health-color-unhealthy);
}

&.status-offline {
background-color: var(--health-bg-offline);
color: #495057;
border: 1px solid var(--health-color-offline);
}

.status-content {
display: flex;
align-items: center;
gap: 12px;
}

.response-time {
opacity: 0.7;
font-size: 12px;
}

.alert-badge {
background: var(--health-color-unhealthy);
color: white;
padding: 2px 6px;
border-radius: 12px;
font-size: 11px;
font-weight: bold;
}

.token-warning {
color: var(--health-color-degraded);
font-weight: bold;
}

.last-check {
font-size: 11px;
opacity: 0.6;
}

.details-btn {
background: none;
border: none;
cursor: pointer;
padding: 4px 8px;
border-radius: 4px;
transition: var(--health-transition);

    &:hover {
      background: rgba(0, 0, 0, 0.1);
    }

}
}

.health-monitor {
padding: 24px;
max-width: 1200px;
margin: 0 auto;

.monitor-header {
display: flex;
justify-content: space-between;
align-items: center;
margin-bottom: 24px;

    h1 {
      color: #333;
      margin: 0;
    }

    .header-actions {
      display: flex;
      gap: 12px;
    }

}

.status-overview {
display: grid;
grid-template-columns: 1fr 1fr 1fr;
gap: 20px;
margin-bottom: 32px;

    @media (max-width: 768px) {
      grid-template-columns: 1fr;
    }

}

.status-card {
background: white;
padding: 20px;
border-radius: var(--health-border-radius);
box-shadow: var(--health-box-shadow);
border-left: 4px solid;

    &.healthy { border-left-color: var(--health-color-healthy); }
    &.degraded { border-left-color: var(--health-color-degraded); }
    &.unhealthy { border-left-color: var(--health-color-unhealthy); }

    h3 {
      margin: 0 0 8px 0;
      color: #333;
    }

    .metric-value {
      font-size: 24px;
      font-weight: bold;
      margin: 8px 0;
    }

    .metric-label {
      font-size: 14px;
      color: #666;
    }

}

.monitor-tabs {
display: flex;
border-bottom: 2px solid #e0e0e0;
margin-bottom: 24px;

    .tab {
      padding: 12px 24px;
      background: none;
      border: none;
      cursor: pointer;
      font-size: 16px;
      color: #666;
      border-bottom: 2px solid transparent;
      transition: var(--health-transition);

      &:hover {
        color: #333;
        background: #f5f5f5;
      }

      &.active {
        color: #007bff;
        border-bottom-color: #007bff;
      }
    }

}

.tab-content {
min-height: 400px;
}
}

.alert-list {
.alert-item {
display: flex;
justify-content: space-between;
align-items: center;
padding: 12px 16px;
margin: 8px 0;
border-radius: var(--health-border-radius);
border-left: 4px solid;

    &.alert-low {
      border-left-color: #17a2b8;
      background: #d1ecf1;
    }
    &.alert-medium {
      border-left-color: #ffc107;
      background: #fff3cd;
    }
    &.alert-high {
      border-left-color: #fd7e14;
      background: #ffe5d0;
    }
    &.alert-critical {
      border-left-color: #dc3545;
      background: #f8d7da;
    }

    .alert-content {
      flex: 1;

      .alert-message {
        font-weight: 500;
        margin-bottom: 4px;
      }

      .alert-timestamp {
        font-size: 12px;
        color: #666;
      }
    }

    .alert-actions {
      display: flex;
      gap: 8px;

      button {
        padding: 4px 12px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 12px;
        transition: var(--health-transition);

        &.acknowledge-btn {
          background: #007bff;
          color: white;

          &:hover {
            background: #0056b3;
          }
        }
      }
    }

    &.acknowledged {
      opacity: 0.6;

      .alert-content .alert-message::after {
        content: " ✓";
        color: #28a745;
        font-weight: bold;
      }
    }

}
}

// Анимации
@keyframes pulse {
0% { opacity: 1; }
50% { opacity: 0.5; }
100% { opacity: 1; }
}

.loading {
animation: pulse 1.5s ease-in-out infinite;
}

.status-indicator {
width: 12px; height: 12px; border-radius: 50%; display: inline-block;
&.healthy { background: var(--health-color-healthy); } &.degraded { background: var(--health-color-degraded); } &.unhealthy { background: var(--health-color-unhealthy); } &.unknown { background: var(--health-color-unknown); } }

## 5. Конфигурационные файлы

### 5.1 Backend конфигурация

```json
// appsettings.json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "HealthCheck": {
    "LogDirectory": "logs",
    "LogRetentionDays": 30,
    "EnableDetailedLogging": true,
    "MaxLogFileSize": 50,
    "LogFilePrefix": "health",
    "MonitoredEndpoints": [
      "/health",
      "/api/health",
      "/api/health/detailed"
    ],
    "HealthCheckTimeoutSeconds": 10,
    "EnableMetricsCollection": true,
    "CompressOldLogs": true
  },
  "HealthLogging": {
    "LogTokenFingerprints": true,
    "FingerprintLength": 8,
    "DateFormat": "yyyy-MM-dd HH:mm:ss.fff",
    "IncludeHeaders": false,
    "IncludeQueryParameters": false,
    "ExcludedHeaders": [ "Authorization", "Cookie", "X-Refresh-Token" ]
  },
  "AllowedHosts": "*"
}

5.2 Program.cs
// Program.cs
using YourProject.API.Features.Health.Services.Interfaces;
using YourProject.API.Features.Health.Services.Implementations;
using YourProject.API.Features.Health.Configuration;
using YourProject.API.Core.Middleware;

var builder = WebApplication.CreateBuilder(args);

// Конфигурация
builder.Services.Configure<HealthCheckOptions>(
    builder.Configuration.GetSection(HealthCheckOptions.SectionName));
builder.Services.Configure<LoggingOptions>(
    builder.Configuration.GetSection(LoggingOptions.SectionName));

// Сервисы Health
builder.Services.AddScoped<IHealthCheckService, HealthCheckService>();
builder.Services.AddScoped<IHealthLogService, HealthLogService>();

// Health Checks
builder.Services.AddHealthChecks();

// Controllers
builder.Services.AddControllers();

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("HealthPolicy", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var app = builder.Build();

// Middleware pipeline
app.UseMiddleware<HealthCheckLoggingMiddleware>();

app.UseCors("HealthPolicy");

app.MapHealthChecks("/health");
app.MapControllers();

// Background service для очистки логов
app.Services.CreateScope().ServiceProvider
    .GetRequiredService<IHealthLogService>()
    .CleanupOldLogsAsync();

app.Run();

5.3 Frontend конфигурация
// src/environments/environment.ts
export const environment = {
  production: false,
  apiUrl: 'https://localhost:7000/api',
  healthCheck: {
    enabled: true,
    interval: 30000,
    timeout: 10000,
    retryAttempts: 3,
    endpoints: ['/health', '/api/health/detailed']
  },
  logging: {
    enabled: true,
    logLevel: 'info'
  }
};

// src/assets/config/health.config.json
{
  "monitoring": {
    "enabled": true,
    "autoStart": true,
    "intervals": {
      "healthCheck": 30000,
      "metricsRefresh": 15000,
      "logsRefresh": 60000,
      "statisticsRefresh": 300000
    }
  },
  "alerts": {
    "enabled": true,
    "thresholds": {
      "cpuUsage": 80,
      "memoryUsage": 85,
      "responseTime": 5000,
      "errorRate": 10
    }
  },
  "display": {
    "showStatusBar": true,
    "showMetrics": true,
    "showAlerts": true,
    "theme": "default"
  }
}

6. Роуты
// app/features/health/health.routes.ts
import { Routes } from '@angular/router';

export const healthRoutes: Routes = [
  {
    path: 'health-monitor',
    loadComponent: () =>
      import('./components/health-monitor/health-monitor.component')
        .then(m => m.HealthMonitorComponent),
    title: 'Мониторинг здоровья системы'
  },
  {
    path: 'health-logs',
    loadComponent: () =>
      import('./components/health-logs/health-logs.component')
        .then(m => m.HealthLogsComponent),
    title: 'Логи проверок здоровья'
  },
  {
    path: 'health-metrics',
    loadComponent: () =>
      import('./components/server-metrics/server-metrics.component')
        .then(m => m.ServerMetricsComponent),
    title: 'Метрики сервера'
  }
];

// app/app.routes.ts
import { Routes } from '@angular/router';
import { healthRoutes } from './features/health/health.routes';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/dashboard/components/dashboard/dashboard.component')
        .then(m => m.DashboardComponent)
  },
  ...healthRoutes,
  {
    path: '**',
    redirectTo: ''
  }
];

7. Результат
Система обеспечивает:
✅ Концентрированная структура: Вся Health логика в папке features/health/
✅ Real-time мониторинг: Автоматические проверки каждые 30 секунд
✅ Валидация токенов: Проверка access и refresh токенов
✅ Безопасное логирование: Только fingerprints токенов, не полные значения
✅ Структурированные логи: JSON формат с ротацией по дням
✅ Метрики сервера: CPU, память, соединения, время работы
✅ Система алертов: Автоматические уведомления о проблемах
✅ Компоненты UI: Детальный мониторинг и статус бар
✅ Архивирование: Автоматическое сжатие старых логов
✅ Масштабируемость: Четкая архитектура для расширения
✅ Barrel exports: Удобные импорты через index.ts
✅ TypeScript типизация: Строгая типизация всех интерфейсов

```
