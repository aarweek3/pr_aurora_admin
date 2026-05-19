# Документация: Универсальный SEO Модуль (Aurora Universal SEO)

## 📖 Обзор

Универсальный SEO модуль — это архитектурное решение для управления поисковой оптимизацией любых сущностей в системе. Он построен на принципе **композиции** (вместо наследования), что позволяет гибко подключать расширенные SEO-настройки к любому контенту (статьи, товары, категории и т.д.) только тогда, когда это необходимо.

---

## 🏗️ Архитектура модуля

Модуль изолирован в пространстве имен `pr_srv_names.Pages.Shared.Seo` и состоит из следующих компонентов:

1.  **`SeoData` (Entity)**: Чистая POCO-сущность в БД. Хранит только данные (Meta, OG, Twitter, Schema.org). Не содержит логики или полей аудита.
2.  **`SeoDataDto`**: Объект передачи данных для API.
3.  **`SeoDataDtoValidator`**: Централизованная валидация (FluentValidation). Правила длины заголовков, формата URL-slug и приоритетов.
4.  **`SeoDataExtensions`**: Слой бизнес-логики. Содержит методы для:
    - Автозаполнения (OG на основе Meta).
    - Расчета скоринга оптимизации (0-100%).
    - Генерации рекомендаций.
    - Формирования robots.txt директив.
5.  **`SeoProfile`**: Профиль AutoMapper для автоматического маппинга между сущностью и DTO.

---

## 🚀 Инструкция по подключению к новому компоненту

Чтобы добавить SEO-поддержку к новой сущности (например, `Article`), выполните следующие шаги:

### 1. Backend: Модель данных (DAL)

Обычно SEO привязывается к локализованному описанию сущности.
Добавьте связь в вашу таблицу описаний:

```csharp
public class ArticleDescription
{
    public int Id { get; set; }
    // ... другие поля (Name, Content) ...

    // Связь с SEO
    public int? SeoDataId { get; set; }
    [ForeignKey("SeoDataId")]
    public virtual SeoData? SeoData { get; set; }
}
```

### 2. Backend: Настройка БД (AppDbContext)

В методе `OnModelCreating` настройте связь 1:1 и каскадное удаление:

```csharp
builder.Entity<ArticleDescription>(entity =>
{
    entity.HasOne(d => d.SeoData)
          .WithOne()
          .HasForeignKey<ArticleDescription>(d => d.SeoDataId)
          .OnDelete(DeleteBehavior.Cascade); // SEO удаляется вместе с описанием
});
```

### 3. Backend: DTO

Добавьте `SeoDataDto` в ваше DTO описания:

```csharp
public class ArticleDescriptionDto
{
    public string Name { get; set; }
    public string Content { get; set; }
    public SeoDataDto? SeoData { get; set; } // Вложенный объект SEO
}
```

### 4. Backend: Логика сервиса (Service)

В методе `Create` или `Update` вашего сервиса используйте маппинг и расширения:

```csharp
// При создании/обновлении
if (dto.SeoData != null)
{
    // Мапим DTO в сущность
    description.SeoData = _mapper.Map<SeoData>(dto.SeoData);

    // Используем расширение для умного автозаполнения пропущенных полей
    description.SeoData.AutoFillRelatedFields();
}
```

### 5. Frontend: Angular

1.  **Модель**: Добавьте поле `seoData: SeoDataDto | null` в соответствующий интерфейс TypeScript.
2.  **Компонент**: Используйте готовый компонент `SeoFormComponent`:

```html
<app-seo-form [formGroup]="languageTab.get('seoData')"></app-seo-form>
```

---

## 💎 Преимущества данного подхода

- **Чистота базы данных**: Если для статьи не заполнены SEO-данные, запись в таблице `SeoData` не создается (`SeoDataId` остается `null`).
- **Единая точка правды**: Если изменятся требования Google к длине Meta-описания, вы правите только один файл — `SeoDataDtoValidator.cs`.
- **Умное заполнение**: Метод `AutoFillRelatedFields()` экономит время контент-менеджера, автоматически копируя данные из Meta в социальные теги (Open Graph / Twitter).
- **SEO-Скоринг**: Вы можете выводить в админке индикатор "Качество SEO" (0-100%), используя метод `CalculateOptimizationScore()`.

---

## 🛠️ Состав полей SeoData

- **Meta**: Title, Description, Keywords, UrlSlug, CanonicalUrl.
- **Open Graph (FB/VK)**: Title, Description, Image, Type, Url.
- **Twitter**: CardType, Title, Description, Image.
- **Schema.org**: SchemaType, SchemaJsonLd (в формате JSONB).
- **Дополнительно**: AuthorName, PublisherName, PublishedDate, NoIndex, NoFollow, Priority (0-10).
