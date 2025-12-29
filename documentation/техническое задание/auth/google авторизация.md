Идентификатор клиента
YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com

Секрет клиента
YOUR_GOOGLE_CLIENT_SECRET

Вот пошаговое руководство, как настроить это правильно, чтобы исчезла ошибка invalid_client и авторизация заработала.

1. Настройка в коде (Program.cs)
   Код, который вы прислали, правильный. Он говорит приложению: "Возьми ID и Secret из конфигурации и слушай путь /signin-google для ответа от Google".

Убедитесь, что вы разместили его до builder.Build():

csharp
// Добавляем аутентификацию и Google
builder.Services.AddAuthentication() // Обычно здесь указываются схемы по умолчанию, например .AddJwtBearer(...)
.AddGoogle(options =>
{
// Эти ключи будут браться из appsettings.json или User Secrets
options.ClientId = builder.Configuration["Authentication:Google:ClientId"];
options.ClientSecret = builder.Configuration["Authentication:Google:ClientSecret"];

        // Это путь внутри вашего API, который перехватит ответ от Google.
        // Менять его обычно не нужно, но он должен совпадать с тем, что в Google Console (см. пункт 3).
        options.CallbackPath = "/signin-google";
    });

2. Настройка конфигурации (appsettings.json)
   В файл appsettings.json (в вашем .NET проекте) добавьте секцию Authentication. Если вы используете "User Secrets" (рекомендуется для локальной разработки), добавьте это туда.

json
{
"Logging": { ... },
"AllowedHosts": "\*",
// ДОБАВИТЬ ЭТО:
"Authentication": {
"Google": {
"ClientId": "ВАШ*CLIENT_ID*ИЗ*GOOGLE_CONSOLE.apps.googleusercontent.com",
"ClientSecret": "ВАШ_CLIENT_SECRET*ИЗ_GOOGLE_CONSOLE"
}
}
} 3. Настройка Google Cloud Console (Самое важное!)
Ошибка invalid_client возникает именно здесь.

Зайдите в Google Cloud Console.
Создайте проект (если нет).
Перейдите в «Окно запроса доступа OAuth» (OAuth Consent Screen):
Выберите External (Внешний).
Заполните обязательные поля (название приложения, email разработчика).
Нажмите "Save and Continue".
Перейдите в «Учетные данные» (Credentials) -> «Создать учетные данные» -> «Идентификатор клиента OAuth» (OAuth Client ID).
Выберите тип приложения: Веб-приложение (Web application).
Настройка URI (КРИТИЧНО):
Разрешенные источники JavaScript (Authorized JavaScript origins): Укажите адрес вашего БЭКЕНДА и ФРОНТЕНДА (на всякий случай, хотя для этого метода важен бэкенд).
https://localhost:7233 (адрес вашего API)
http://localhost:4200 (адрес Angular)
Разрешенные URI перенаправления (Authorized redirect URIs): Здесь нужно указать адрес вашего API + CallbackPath. Google отправит пользователя именно сюда после логина.
https://localhost:7233/signin-google (Замените https://localhost:7233 на реальный адрес вашего API, если он другой. Проверьте launchSettings.json, если не уверены).
Нажмите "Создать".
Скопируйте полученные Client ID и Client Secret и вставьте их в appsettings.json (пункт 2).
Проверка
Перезапустите Backend API.
Нажмите кнопку "Войти через Google" в вашем Angular приложении.
Front перекинет на Back -> Back на Google.
Вы выберете аккаунт.
Google вернет вас на https://localhost:7233/signin-google.
ASP.NET Core (благодаря AddGoogle) перехватит этот запрос, создаст "ClaimsPrincipal".
Ваш контроллер
ExternalLoginCallback
(который вы создали ранее) подхватит результат и сгенерирует JWT.
