
$path = 'D:\_PROGECT\pr_srv_names\Project_Server_Auth\Dtos\AuthDtos.cs'
$content = Get-Content $path -Raw
if ($content -notlike "*public List<string> Roles*") {
    $old = 'public DateTime? LastLogin { get; set; }'
    $new = 'public DateTime? LastLogin { get; set; }; public List<string> Roles { get; set; } = new();'
    $content = $content.Replace($old, $new)
    Set-Content $path $content
    Write-Output "Updated AuthDtos.cs"
} else {
    Write-Output "AuthDtos.cs already updated"
}

$servicePath = 'D:\_PROGECT\pr_srv_names\Project_Server_Auth\Services\AuthService.cs'
$serviceContent = Get-Content $servicePath -Raw

# 1. Update MapToUserProfileDto definition
$oldMapDef = 'private UserProfileDto MapToUserProfileDto(ApplicationUser user)'
$newMapDef = 'private UserProfileDto MapToUserProfileDto(ApplicationUser user, IList<string> roles)'
$serviceContent = $serviceContent.Replace($oldMapDef, $newMapDef)

# 2. Update MapToUserProfileDto body
$oldMapBodyClose = 'LastLogin = user.LastLogin`r`n            };'
# Just in case of different line endings
$serviceContent = $serviceContent -replace 'LastLogin = user.LastLogin\s*};', "LastLogin = user.LastLogin, Roles = roles.ToList() };"

# 3. Update calls to MapToUserProfileDto
# Using regex to find and replace the calls with role fetching
# This is tricky with string replacement, let's try a safer approach for each method

# Helper function to update method: fetch roles then map
# RegisterAsync
$serviceContent = $serviceContent -replace 'User = MapToUserProfileDto\(user\)', 'User = MapToUserProfileDto(user, await _userManager.GetRolesAsync(user))'
# LoginAsync
$serviceContent = $serviceContent -replace 'User = MapToUserProfileDto\(user\)', 'User = MapToUserProfileDto(user, await _userManager.GetRolesAsync(user))'
# RefreshTokenFromCookieAsync
$serviceContent = $serviceContent -replace 'User = MapToUserProfileDto\(session.User\)', 'User = MapToUserProfileDto(session.User, await _userManager.GetRolesAsync(session.User))'

# GetUserProfileAsync (this one is special because it's a return)
$serviceContent = $serviceContent -replace 'return user != null \? MapToUserProfileDto\(user\) : null;', 'if (user == null) return null; var roles = await _userManager.GetRolesAsync(user); return MapToUserProfileDto(user, roles);'

Set-Content $servicePath $serviceContent
Write-Output "Updated AuthService.cs"
