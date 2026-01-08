
$corsPath = 'D:\_PROGECT\pr_srv_names\Project_Server_Auth\Extensions\CorsExtensions.cs'
$corsContent = Get-Content $corsPath -Raw
# Change Lax back to None and ensure Secure is not removed
$corsContent = $corsContent.Replace('cookies[i].Replace("; Secure", "").Replace("; SameSite=None", "; SameSite=Lax")', 'cookies[i]') # Just keep it as is
Set-Content $corsPath $corsContent -NoNewline
Write-Output "Fixed CorsExtensions.cs"

$authPath = 'D:\_PROGECT\pr_srv_names\Project_Server_Auth\Controllers\AuthController.cs'
$authContent = Get-Content $authPath -Raw
# Set SameSite to None in both cookie options
$authContent = $authContent -replace 'SameSiteMode\.Lax', 'SameSiteMode.None'
# Ensure Secure is true even in development for SameSite=None
$authContent = $authContent -replace 'Secure = !isDevelopment', 'Secure = true'
Set-Content $authPath $authContent -NoNewline
Write-Output "Fixed AuthController.cs"
