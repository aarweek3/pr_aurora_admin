
$servicePath = 'D:\_PROGECT\pr_srv_names\Project_Server_Auth\Services\AuthService.cs'
$content = Get-Content $servicePath -Raw

# Update MapToUserProfileDto signature
$content = $content -replace 'private UserProfileDto MapToUserProfileDto\(ApplicationUser user\)', 'private UserProfileDto MapToUserProfileDto(ApplicationUser user, IList<string> roles)'

# Update MapToUserProfileDto body (adding Roles)
$content = $content -replace 'LastLogin = user.LastLogin\s*\}', "LastLogin = user.LastLogin, Roles = roles.ToList() }"

# Update calls
$content = $content -replace 'MapToUserProfileDto\(user\)', 'MapToUserProfileDto(user, await _userManager.GetRolesAsync(user))'
$content = $content -replace 'MapToUserProfileDto\(session.User\)', 'MapToUserProfileDto(session.User, await _userManager.GetRolesAsync(session.User))'

# Update GetUserProfileAsync
$content = $content -replace 'return user != null \? MapToUserProfileDto\(user\) : null;', 'if (user == null) return null; var roles = await _userManager.GetRolesAsync(user); return MapToUserProfileDto(user, roles);'

Set-Content $servicePath $content -NoNewline
Write-Output "Applied changes to AuthService.cs"

# Update AuthDtos.cs
$dtoPath = 'D:\_PROGECT\pr_srv_names\Project_Server_Auth\Dtos\AuthDtos.cs'
$dtocontent = Get-Content $dtoPath -Raw
$dtocontent = $dtocontent -replace 'public DateTime\? LastLogin \{ get; set; \}', 'public DateTime? LastLogin { get; set; }; public List<string> Roles { get; set; } = new();'
Set-Content $dtoPath $dtocontent -NoNewline
Write-Output "Applied changes to AuthDtos.cs"
