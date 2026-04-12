$version = Get-Date -Format "yyyy-MM-dd_HH-mm"
$sourcePath = "src\app\shared\components\av-image-editor-vs"
$destPath = "backups\av-image-editor-vs_v_$version"

if (!(Test-Path "backups")) {
    New-Item -ItemType Directory -Path "backups"
}

Write-Host "Backing up $sourcePath to $destPath..."
Copy-Item -Path $sourcePath -Destination $destPath -Recurse
Write-Host "Backup completed successfully!"
