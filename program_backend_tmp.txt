using AutoMapper;
using DAL;
using DAL.Interfaces;
using DAL.Repositories;
using DAL.Repositories.Interfaces;
using FluentValidation;
using pr_srv_names.Deepl;
using pr_srv_names.Extensions;
using pr_srv_names.Middleware;
using pr_srv_names.Pages.AdvancedImageEditor.Services;
using pr_srv_names.Pages.Anecdote.Interfaces;
using pr_srv_names.Pages.Anecdote.Services;
using pr_srv_names.Pages.Health.Services;
using pr_srv_names.Pages.Language.Intarfaces;
using pr_srv_names.Pages.Language.Services;
using pr_srv_names.Pages.NameMain.Intarfaces;
using pr_srv_names.Pages.NameMain.Services;
using pr_srv_names.Pages.Sample.Intarfaces;
using pr_srv_names.Pages.Sample.Services;
using pr_srv_names.Services.Editor;
using pr_srv_names.Supports.Deepl;
using Serilog;


var builder = WebApplication.CreateBuilder(args);

// =================================================================
// 1. КОНФИГУРАЦИЯ БИЛДЕРА (WebHost, Logging)
// =================================================================
builder.WebHost.ConfigureKestrel(serverOptions => { serverOptions.AddServerHeader = false; });

builder.ConfigureLogging();

// =================================================================
// 2. РЕГИСТРАЦИЯ СЕРВИСОВ (ОБЯЗАТЕЛЬНО ДО builder.Build())
// =================================================================

// Конфигурация базы данных
builder.Services.AddDatabaseConfiguration(builder.Configuration);

// Конфигурация Identity
builder.Services.AddIdentityConfiguration(builder.Configuration);
builder.Services.AddIdentityPolicies();

// Конфигурация JWT
builder.Services.AddJwtAuthentication(builder.Configuration, builder.Environment);
builder.Services.AddJwtSettings(builder.Configuration);
builder.Services.ConfigureJwtCookies(builder.Configuration);

// Конфигурация CORS
builder.Services.AddCorsConfiguration(builder.Configuration, builder.Environment);

// Регистрация общих сервисов и Swagger
builder.Services.RegisterAllServices();
builder.Services.AddSwaggerDocumentation();

#region 8. Mapping Configuration

Log.Information("Настройка маппинга...");
var mapperConfig = new MapperConfiguration(cfg => { cfg.AddMaps(typeof(Program).Assembly); });
var mapper = mapperConfig.CreateMapper();
builder.Services.AddSingleton(mapper);

#endregion

#region 9. FluentValidation Configuration

Log.Information("Настройка FluentValidation...");
builder.Services.AddValidatorsFromAssemblyContaining<Program>();

#endregion

#region 10. HttpClient Configuration

Log.Information("Настройка HttpClient для DeepL...");
builder.Services.AddHttpClient<IDeepLTranslationService, DeepLTranslationService>(client =>
{
    client.Timeout = TimeSpan.FromSeconds(30);
});

#endregion

// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
// РЕГИСТРАЦИЯ КОНКРЕТНЫХ СЕРВИСОВ 
// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();

builder.Services.AddScoped<ILanguageService, LanguageService>();
builder.Services.AddScoped<ILanguageRepository, LanguageRepository>();

builder.Services.AddScoped<ISampleService, SampleService>();
builder.Services.AddScoped<ISampleRepository, SampleRepository>();

// Сервисы и репозитории для работы с анекдотами и именами
builder.Services.AddScoped<IAnecdoteService, AnecdoteService>();
builder.Services.AddScoped<IAnecdoteRepository, AnecdoteRepository>();

builder.Services.AddScoped<INameMainService, NameMainService>();
builder.Services.AddScoped<INameMainRepository, NameMainRepository>();

// работа с изображениями (модальное окно-простой вариант) - Мой редактор
builder.Services.AddScoped<IEditorImageService, EditorImageService>();

// ✅ ДОБАВЬТЕ ЭТО - Advanced Image Editor - Мой редактор - РАСШИРЕННАЯ ВЕРСИЯ ОБРАБОТКИ IMAGE
builder.Services.AddScoped<IAdvancedImageProcessingService, AdvancedImageProcessingService>();

builder.Services.AddScoped<IHealthCheckEnhancedService, HealthCheckEnhancedService>();

// ✅ ДОБАВЬТЕ ЭТУ СТРОКУ:
builder.Services.AddHealthChecks();


// DeepLTranslationService уже зарегистрирован через AddHttpClient выше
// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

var app = builder.Build();

// =================================================================
// 3. КОНФИГУРАЦИЯ PIPELINE ПРИЛОЖЕНИЯ (ПОСЛЕ app.Build())
// =================================================================

// Инициализация базы данных
await app.InitializeDatabaseAsync();

// Конфигурация pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwaggerDocumentation();
}

// 1. CORS (должен быть до маршрутизации)
app.UseCorsConfiguration(app.Environment);

// 2. Обработчик ошибок
app.UseMiddleware<AuthExceptionMiddleware>();

// 3. HTTPS редирект
app.UseHttpsRedirection();

// 4. Заголовки безопасности
app.UseHsts();
app.UseMiddleware<SecurityHeadersMiddleware>();

// ✅ ДОБАВЬТЕ ЭТО: Статические файлы (ВАЖНО: до UseRouting)
app.UseStaticFiles();

// 5. Routing
app.UseRouting();

// 6. Модификация cookies
app.AddCookieModificationMiddleware(app.Environment);

// 7. Аутентификация и авторизация
app.UseAuthentication();
app.UseAuthorization();

// 8. Rate limiting
app.UseMiddleware<RateLimitingMiddleware>();

// 9. Debug endpoints (только в development)
if (app.Environment.IsDevelopment())
{
    app.ConfigureDebugEndpoints();
}

// 10. Контроллеры
app.MapControllers();

app.Run();