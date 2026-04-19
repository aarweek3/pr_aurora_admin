# ====================================================================
# Скрипт заполнения тестовых данных для модуля "Платформы"
# ====================================================================
# Автор: Aurora Admin Team
# Дата: 2 февраля 2026 г.
# Версия: 1.0
#
# Описание:
#   Создает базовый набор платформ через API с мультиязычной поддержкой
#
# Использование:
#   .\seed-platforms.ps1 [-ApiUrl "https://api.example.com"] [-Token "your-jwt-token"] [-SkipExisting]
#
# Параметры:
#   -ApiUrl       : URL API (по умолчанию: http://localhost:5000)
#   -Token        : JWT токен авторизации (опционально)
#   -SkipExisting : Пропустить существующие платформы
#   -Priority     : Приоритет данных (1=минимум, 2=расширенный, 3=все) по умолчанию: 1
# ====================================================================

param(
    [string]$ApiUrl = "http://localhost:5000",
    [string]$Token = "",
    [switch]$SkipExisting = $false,
    [int]$Priority = 1
)

# Настройки
$ErrorActionPreference = "Stop"
$baseUrl = "$ApiUrl/api/v1/platforms"

# Цвета для вывода
function Write-ColorOutput($ForegroundColor) {
    $fc = $host.UI.RawUI.ForegroundColor
    $host.UI.RawUI.ForegroundColor = $ForegroundColor
    if ($args) {
        Write-Output $args
    }
    $host.UI.RawUI.ForegroundColor = $fc
}

Write-Host "`n╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║          ЗАПОЛНЕНИЕ БАЗЫ ДАННЫХ ПЛАТФОРМАМИ                  ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

Write-Host "Параметры запуска:" -ForegroundColor Yellow
Write-Host "  API URL: $ApiUrl" -ForegroundColor Gray
Write-Host "  Приоритет данных: $Priority" -ForegroundColor Gray
Write-Host "  Пропускать существующие: $SkipExisting`n" -ForegroundColor Gray

# Заголовки для HTTP запросов
$headers = @{
    "Content-Type" = "application/json"
    "Accept" = "application/json"
}

if ($Token) {
    $headers["Authorization"] = "Bearer $Token"
}

# ====================================================================
# ДАННЫЕ ПЛАТФОРМ
# ====================================================================

# Priority 1: Обязательный минимум
$platformsPriority1 = @(
    @{
        name = "Windows Desktop"
        code = "windows"
        family = "desktop"
        isActive = $true
        sortOrder = 10
        translations = @(
            @{
                languageId = 1
                languageCode = "ru"
                name = "Windows"
                description = "Операционная система Microsoft Windows для настольных компьютеров и ноутбуков. Поддерживаются версии Windows 10 и Windows 11."
                seoData = @{
                    title = "Скачать приложение для Windows | Бесплатная загрузка"
                    description = "Загрузите официальное приложение для Windows 10 и Windows 11. Быстрая установка, регулярные обновления, полная совместимость."
                    keywords = "windows, скачать, приложение, windows 10, windows 11, загрузка"
                }
            }
        )
    },
    @{
        name = "macOS"
        code = "macos"
        family = "desktop"
        isActive = $true
        sortOrder = 20
        translations = @(
            @{
                languageId = 1
                languageCode = "ru"
                name = "macOS"
                description = "Операционная система Apple для компьютеров Mac. Поддерживаются версии macOS 12 (Monterey) и выше."
                seoData = @{
                    title = "Скачать приложение для macOS | Apple Mac"
                    description = "Загрузите приложение для macOS. Совместимо с macOS 12+. Оптимизировано для процессоров Apple Silicon (M1/M2) и Intel."
                    keywords = "macos, mac, скачать, apple, приложение, m1, m2"
                }
            }
        )
    },
    @{
        name = "Linux"
        code = "linux"
        family = "desktop"
        isActive = $true
        sortOrder = 30
        translations = @(
            @{
                languageId = 1
                languageCode = "ru"
                name = "Linux"
                description = "Кроссплатформенное приложение для различных дистрибутивов Linux: Ubuntu, Fedora, Debian, Arch и других."
                seoData = @{
                    title = "Скачать приложение для Linux | Ubuntu, Fedora, Debian"
                    description = "Загрузите приложение для Linux. Поддержка популярных дистрибутивов. Форматы: .deb, .rpm, AppImage."
                    keywords = "linux, ubuntu, fedora, debian, arch, скачать, приложение"
                }
            }
        )
    },
    @{
        name = "Android"
        code = "android"
        family = "mobile"
        isActive = $true
        sortOrder = 40
        translations = @(
            @{
                languageId = 1
                languageCode = "ru"
                name = "Android"
                description = "Мобильное приложение для смартфонов и планшетов на Android. Минимальная версия: Android 8.0 (Oreo)."
                seoData = @{
                    title = "Скачать приложение для Android | Google Play"
                    description = "Загрузите приложение для Android из Google Play. Совместимо с Android 8.0 и выше. Поддержка планшетов."
                    keywords = "android, скачать, google play, мобильное приложение, смартфон, планшет"
                }
            }
        )
    },
    @{
        name = "iOS"
        code = "ios"
        family = "mobile"
        isActive = $true
        sortOrder = 50
        translations = @(
            @{
                languageId = 1
                languageCode = "ru"
                name = "iOS"
                description = "Мобильное приложение для iPhone и iPad. Минимальная версия: iOS 14.0."
                seoData = @{
                    title = "Скачать приложение для iOS | iPhone и iPad"
                    description = "Загрузите приложение для iOS из App Store. Совместимо с iOS 14+. Поддержка iPhone и iPad."
                    keywords = "ios, iphone, ipad, скачать, app store, мобильное приложение"
                }
            }
        )
    },
    @{
        name = "Web Application"
        code = "web"
        family = "web"
        isActive = $true
        sortOrder = 60
        translations = @(
            @{
                languageId = 1
                languageCode = "ru"
                name = "Веб-версия"
                description = "Полнофункциональное веб-приложение, работающее в любом современном браузере без установки."
                seoData = @{
                    title = "Веб-версия приложения | Онлайн доступ"
                    description = "Используйте приложение прямо в браузере. Не требует установки. Работает на всех устройствах."
                    keywords = "веб-приложение, онлайн, браузер, без установки"
                }
            }
        )
    }
)

# Priority 2: Расширенный набор
$platformsPriority2 = @(
    @{
        name = "Progressive Web App"
        code = "pwa"
        family = "web"
        isActive = $true
        sortOrder = 65
        translations = @(
            @{
                languageId = 1
                languageCode = "ru"
                name = "PWA"
                description = "Прогрессивное веб-приложение с поддержкой оффлайн режима и установки на устройство."
                seoData = @{
                    title = "PWA приложение | Оффлайн доступ"
                    description = "Установите PWA версию для работы без интернета. Быстрая загрузка, нативный опыт."
                    keywords = "pwa, progressive web app, оффлайн, установка"
                }
            }
        )
    },
    @{
        name = "HarmonyOS"
        code = "harmony"
        family = "mobile"
        isActive = $true
        sortOrder = 55
        translations = @(
            @{
                languageId = 1
                languageCode = "ru"
                name = "HarmonyOS"
                description = "Мобильное приложение для устройств Huawei на операционной системе HarmonyOS."
                seoData = @{
                    title = "Скачать приложение для HarmonyOS | Huawei"
                    description = "Загрузите приложение для HarmonyOS из AppGallery. Оптимизировано для устройств Huawei."
                    keywords = "harmonyos, huawei, appgallery, скачать"
                }
            }
        )
    },
    @{
        name = "Chrome OS"
        code = "chrome-os"
        family = "desktop"
        isActive = $true
        sortOrder = 35
        translations = @(
            @{
                languageId = 1
                languageCode = "ru"
                name = "Chrome OS"
                description = "Приложение для Chromebook устройств на базе Chrome OS."
                seoData = @{
                    title = "Скачать приложение для Chrome OS | Chromebook"
                    description = "Загрузите приложение для Chromebook. Полная поддержка Chrome OS."
                    keywords = "chrome os, chromebook, скачать, приложение"
                }
            }
        )
    }
)

# Priority 3: Игровые платформы
$platformsPriority3 = @(
    @{
        name = "PlayStation"
        code = "playstation"
        family = "console"
        isActive = $true
        sortOrder = 100
        translations = @(
            @{
                languageId = 1
                languageCode = "ru"
                name = "PlayStation"
                description = "Версия для игровых консолей Sony PlayStation 4 и PlayStation 5."
                seoData = @{
                    title = "Скачать для PlayStation | PS4 и PS5"
                    description = "Загрузите приложение для PlayStation из PS Store. Совместимо с PS4 и PS5."
                    keywords = "playstation, ps4, ps5, console, игровая консоль"
                }
            }
        )
    },
    @{
        name = "Xbox"
        code = "xbox"
        family = "console"
        isActive = $true
        sortOrder = 110
        translations = @(
            @{
                languageId = 1
                languageCode = "ru"
                name = "Xbox"
                description = "Версия для игровых консолей Microsoft Xbox Series X/S и Xbox One."
                seoData = @{
                    title = "Скачать для Xbox | Series X/S"
                    description = "Загрузите приложение для Xbox из Microsoft Store. Совместимо с Xbox Series и Xbox One."
                    keywords = "xbox, series x, series s, console, игровая консоль"
                }
            }
        )
    },
    @{
        name = "Nintendo Switch"
        code = "nintendo-switch"
        family = "console"
        isActive = $true
        sortOrder = 120
        translations = @(
            @{
                languageId = 1
                languageCode = "ru"
                name = "Nintendo Switch"
                description = "Версия для портативной игровой консоли Nintendo Switch."
                seoData = @{
                    title = "Скачать для Nintendo Switch"
                    description = "Загрузите приложение для Nintendo Switch из eShop."
                    keywords = "nintendo switch, console, игровая консоль"
                }
            }
        )
    },
    @{
        name = "Steam Deck"
        code = "steam-deck"
        family = "console"
        isActive = $true
        sortOrder = 130
        translations = @(
            @{
                languageId = 1
                languageCode = "ru"
                name = "Steam Deck"
                description = "Версия для портативной игровой консоли Valve Steam Deck."
                seoData = @{
                    title = "Скачать для Steam Deck | Valve"
                    description = "Загрузите приложение для Steam Deck. Полная совместимость с SteamOS."
                    keywords = "steam deck, valve, portable, портативная консоль"
                }
            }
        )
    }
)

# Объединяем данные в зависимости от приоритета
$platforms = $platformsPriority1
if ($Priority -ge 2) {
    $platforms += $platformsPriority2
}
if ($Priority -ge 3) {
    $platforms += $platformsPriority3
}

# ====================================================================
# ФУНКЦИИ
# ====================================================================

function Test-PlatformExists {
    param([string]$code)

    try {
        $response = Invoke-RestMethod -Uri "$baseUrl" -Method Get -Headers $headers -ErrorAction Stop
        $exists = $response.items | Where-Object { $_.code -eq $code }
        return $null -ne $exists
    }
    catch {
        return $false
    }
}

function New-Platform {
    param([hashtable]$platformData)

    try {
        $body = $platformData | ConvertTo-Json -Depth 10
        $response = Invoke-RestMethod -Uri "$baseUrl" -Method Post -Headers $headers -Body $body -ErrorAction Stop
        return $response
    }
    catch {
        Write-ColorOutput Red "  ✗ Ошибка создания: $($_.Exception.Message)"
        if ($_.Exception.Response) {
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            $reader.BaseStream.Position = 0
            $responseBody = $reader.ReadToEnd()
            Write-ColorOutput Red "  Ответ сервера: $responseBody"
        }
        return $null
    }
}

# ====================================================================
# ОСНОВНАЯ ЛОГИКА
# ====================================================================

$successCount = 0
$skippedCount = 0
$errorCount = 0

Write-Host "Начинаем создание платформ ($($platforms.Count) шт.)...`n" -ForegroundColor Cyan

foreach ($platform in $platforms) {
    $displayName = "$($platform.name) ($($platform.code))"
    Write-Host "[$($successCount + $skippedCount + $errorCount + 1)/$($platforms.Count)] Обработка: $displayName" -ForegroundColor Yellow

    # Проверяем существование
    if ($SkipExisting) {
        $exists = Test-PlatformExists -code $platform.code
        if ($exists) {
            Write-ColorOutput Green "  ⊘ Уже существует, пропускаем"
            $skippedCount++
            Write-Host ""
            continue
        }
    }

    # Создаем платформу
    $result = New-Platform -platformData $platform

    if ($result) {
        Write-ColorOutput Green "  ✓ Успешно создано (ID: $($result.id))"
        $successCount++
    }
    else {
        Write-ColorOutput Red "  ✗ Ошибка создания"
        $errorCount++
    }

    Write-Host ""
    Start-Sleep -Milliseconds 200
}

# ====================================================================
# ИТОГИ
# ====================================================================

Write-Host "`n╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                    РЕЗУЛЬТАТЫ ВЫПОЛНЕНИЯ                      ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

Write-ColorOutput Green "✓ Успешно создано:  $successCount"
if ($skippedCount -gt 0) {
    Write-ColorOutput Yellow "⊘ Пропущено:        $skippedCount"
}
if ($errorCount -gt 0) {
    Write-ColorOutput Red "✗ Ошибок:           $errorCount"
}

Write-Host "`nВсего обработано:   $($platforms.Count)" -ForegroundColor Cyan
Write-Host "`nЗавершено: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Gray
Write-Host ""

# Код возврата
if ($errorCount -gt 0) {
    exit 1
}
exit 0
