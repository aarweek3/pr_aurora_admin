$filePath = "d:\_PROGECT\pr_srv_names\Project_Server_Auth\Dtos\AuthDtos.cs"

# Читаем содержимое
$content = Get-Content $filePath -Raw -Encoding UTF8

# Заменяем класс UserProfileDto
$oldClass = @'
    // DTO для профиля пользователя (Фаза 3)
    public class UserProfileDto
    {
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? Department { get; set; }
        public string? Avatar { get; set; } // URL аватара
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? LastLogin { get; set; }
        public List<string> Roles { get; set; } = new();
    }
'@

$newClass = @'
    // DTO для профиля пользователя (Фаза 3)
    public class UserProfileDto
    {
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? Department { get; set; }
        public string? Avatar { get; set; } // URL аватара
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? LastLogin { get; set; }
        public List<string> Roles { get; set; } = new();
        public bool IsExternalAccount { get; set; }
        public string? ExternalProvider { get; set; }
    }
'@

$content = $content -replace [regex]::Escape($oldClass), $newClass

# Сохраняем
[System.IO.File]::WriteAllText($filePath, $content, [System.Text.UTF8Encoding]::new($true))

Write-Host "✓ Поля добавлены в UserProfileDto!" -ForegroundColor Green
Write-Host "Перезапустите backend сервер" -ForegroundColor Yellow
