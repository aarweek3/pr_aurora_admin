
$dtoPath = 'D:\_PROGECT\pr_srv_names\Project_Server_Auth\Dtos\AuthDtos.cs'
$content = Get-Content $dtoPath -Raw

# Remove the line that looks like a duplicate Roles property with a comment
# Example: public List<string> Roles { get; set; } = new(); // SOMETHING
# Since the agent might not handle cyrillic correctly, we match by // and any characters after it

$content = $content -replace 'public List<string> Roles \{ get; set; \} = new\(\);\s*//.*', ""

Set-Content $dtoPath $content -NoNewline
Write-Output "Fixed duplicate Roles in AuthDtos.cs"
