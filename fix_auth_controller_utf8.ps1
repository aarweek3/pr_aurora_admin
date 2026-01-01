
$path = 'D:\_PROGECT\pr_srv_names\Project_Server_Auth\Controllers\AuthController.cs'
$content = [System.IO.File]::ReadAllText($path, [System.Text.Encoding]::UTF8)

# Fix duplicate roles in DebugToken response
$content = $content -replace '\.Select\(c => c\.Value\)\.ToList\(\)', '.Select(c => c.Value).Distinct().ToList()'

[System.IO.File]::WriteAllText($path, $content, [System.Text.Encoding]::UTF8)
Write-Output "Applied Distinct to AuthController.cs via clean UTF8 write"
