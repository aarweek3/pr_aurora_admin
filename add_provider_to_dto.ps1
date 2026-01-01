$ErrorActionPreference = "Stop"

Write-Host "=== Добавление полей IsExternalAccount и ExternalProvider в UserProfileDto ===" -ForegroundColor Cyan

$filePath = "d:\_PROGECT\pr_srv_names\Project_Server_Auth\Dtos\AuthDtos.cs"

# Читаем файл с правильной кодировкой
$content = Get-Content $filePath -Raw -Encoding UTF8

# Проверяем, есть ли уже эти поля
if ($content -match "IsExternalAccount") {
    Write-Host "Поля уже существуют в файле" -ForegroundColor Yellow
    exit 0
}

# Ищем класс UserProfileDto и добавляем поля перед закрывающей скобкой
$pattern = '(public class UserProfileDto\s*\{[^}]+)(public List<string>\? Roles[^}]+\})'
$replacement = '$1$2' + "`r`n        public bool IsExternalAccount { get; set; }`r`n        public string? ExternalProvider { get; set; }"

if ($content -match $pattern) {
    $newContent = $content -replace $pattern, $replacement

    # Сохраняем с UTF-8 BOM
    [System.IO.File]::WriteAllText($filePath, $newContent, [System.Text.UTF8Encoding]::new($true))

    Write-Host "✓ Поля успешно добавлены в UserProfileDto" -ForegroundColor Green
} else {
    Write-Host "✗ Не удалось найти класс UserProfileDto" -ForegroundColor Red
    Write-Host "Попробуем альтернативный метод..." -ForegroundColor Yellow

    # Альтернативный подход - добавляем перед последней закрывающей скобкой класса
    $lines = $content -split "`r?`n"
    $newLines = @()
    $inUserProfileDto = $false
    $bracketCount = 0

    for ($i = 0; $i -lt $lines.Count; $i++) {
        $line = $lines[$i]

        if ($line -match "class UserProfileDto") {
            $inUserProfileDto = $true
        }

        if ($inUserProfileDto) {
            if ($line -match "\{") { $bracketCount++ }
            if ($line -match "\}") { $bracketCount-- }

            # Когда находим закрывающую скобку класса
            if ($bracketCount -eq 0 -and $line -match "^\s*\}") {
                # Добавляем наши поля перед закрывающей скобкой
                $newLines += "        public bool IsExternalAccount { get; set; }"
                $newLines += "        public string? ExternalProvider { get; set; }"
                $inUserProfileDto = $false
            }
        }

        $newLines += $line
    }

    $newContent = $newLines -join "`r`n"
    [System.IO.File]::WriteAllText($filePath, $newContent, [System.Text.UTF8Encoding]::new($true))

    Write-Host "✓ Поля добавлены альтернативным методом" -ForegroundColor Green
}

Write-Host "`n=== Готово! ===" -ForegroundColor Green
Write-Host "Перезапустите backend сервер для применения изменений" -ForegroundColor Yellow
