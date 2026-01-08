
$dtoPath = 'D:\_PROGECT\pr_srv_names\Project_Server_Auth\Dtos\AuthDtos.cs'
$content = Get-Content $dtoPath -Raw

# Remove the duplicate Roles line in UserListItemDto
# It's at the end of the class.

# The user showed this:
# public List<string> Roles { get; set; } = new();
# public bool IsExternalAccount { get; set; }
# public string? ExternalProvider { get; set; }
# public List<string> Roles { get; set; } = new(); // ДОБАВИТЬ

# Let's just remove the line with "// ДОБАВИТЬ" or the second occurrence.

# Safer: replace the specific block if found
$badBlock = 'public List<string> Roles { get; set; } = new();\s*// ДОБАВИТЬ'
$content = $content -replace $badBlock, ""

Set-Content $dtoPath $content -NoNewline
Write-Output "Fixed duplicate Roles in AuthDtos.cs"
