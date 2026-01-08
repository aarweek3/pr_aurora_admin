
$tokenPath = 'D:\_PROGECT\pr_srv_names\Project_Server_Auth\Services\TokenService.cs'
$tokenContent = Get-Content $tokenPath -Raw
# Add .Distinct().ToList() to roles fetching
$tokenContent = $tokenContent.Replace('var roles = await _userManager.GetRolesAsync(user);', 'var roles = (await _userManager.GetRolesAsync(user)).Distinct().ToList();')
Set-Content $tokenPath $tokenContent -NoNewline
Write-Output "Applied Distinct to TokenService.cs"

$authPath = 'D:\_PROGECT\pr_srv_names\Project_Server_Auth\Services\AuthService.cs'
$authContent = Get-Content $authPath -Raw
# Update calls to include .Distinct()
$authContent = $authContent -replace 'await _userManager\.GetRolesAsync\(user\)', '(await _userManager.GetRolesAsync(user)).Distinct().ToList()'
$authContent = $authContent -replace 'await _userManager\.GetRolesAsync\(session.User\)', '(await _userManager.GetRolesAsync(session.User)).Distinct().ToList()'
# Also the mapping itself for extra safety
$authContent = $authContent -replace 'Roles = roles\.ToList\(\)', 'Roles = roles.Distinct().ToList()'

Set-Content $authPath $authContent -NoNewline
Write-Output "Applied Distinct to AuthService.cs"
