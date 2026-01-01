
$path = 'D:\_PROGECT\pr_srv_names\Project_Server_Auth\Controllers\AuthController.cs'
$content = Get-Content $path -Raw

# In DebugToken, if it extracts roles from User.Claims, make it distinct
# Usually it looks like: .Select(c => c.Value).ToList()
# We want: .Select(c => c.Value).Distinct().ToList()

$content = $content -replace '\.Select\(c => c\.Value\)\.ToList\(\)', '.Select(c => c.Value).Distinct().ToList()'

Set-Content $path $content -NoNewline
Write-Output "Applied Distinct to AuthController.cs"
