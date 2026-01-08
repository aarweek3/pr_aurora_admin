$basePath = "src/assets/icons"
$categories = @{
    "actions" = @("add", "close", "plus", "minus", "trash", "floppy-disk", "check-mark", "checkbox", "zoom-out", "upload", "loop", "redo", "calculate", "equalizer", "eraser", "hammer", "tray", "thumb-up", "thumb-down", "eye-of-a-human", "eye-blocked")
    "arrows" = @("arrow", "back", "down-arrow", "forward", "next-track", "previous", "right-arrow", "up-arrow", "four-arrows", "expand")
    "charts" = @("bars-graphic", "line-graph", "pie-chart", "sigma")
    "communication" = @("mail", "phone", "speech-bubble", "telephone", "rss-feed")
    "editor" = @("bold", "alignment", "paragraph", "italic", "list", "numbered-list", "pencil", "quill", "underline", "font", "strikethrough", "pilcrow", "text-width", "table")
    "files" = @("book", "folder", "excel", "html", "zip", "paperclip", "blog-symbol")
    "media" = @("image", "images", "volume", "mute", "play", "pause", "screen", "tablet", "brightness")
    "social" = @("github", "google", "wordpress", "twitter", "youtube", "opera")
    "system" = @("cogwheel", "gear", "settings", "bug", "information", "warning", "notification", "padlock", "round-key", "qr-code", "bar-code", "spinner", "embed", "code")
    "time" = @("alarm-clock", "clock", "stopwatch")
    "user" = @("profile", "user", "users")
    "general" = @("earth", "heart", "home", "house", "road", "ticket", "trophy", "tag", "dice", "dollar", "circle", "angry", "happy", "stars")
}

# Create directories
foreach ($cat in $categories.Keys) {
    $dir = Join-Path $basePath $cat
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force
    }
}

$files = Get-ChildItem -Path $basePath -Filter "*.svg"

foreach ($file in $files) {
    $name = $file.Name.ToLower()
    $found = $false

    foreach ($cat in $categories.Keys) {
        foreach ($keyword in $categories[$cat]) {
            if ($name -match $keyword) {
                # Clean name: remove icon-icons.com stuff and numbers
                $cleanName = $file.BaseName -replace "_icon-icons.com_.*", "" -replace "-\d+$", "" -replace "_\d+$", "" -replace " \(\d+\)", ""
                $newName = "av_$cleanName" + $file.Extension

                $dest = Join-Path $basePath $cat $newName
                Move-Item -Path $file.FullName -Destination $dest -Force
                $found = $true
                break
            }
        }
        if ($found) { break }
    }

    if (-not $found) {
        # Fallback to general if no keyword matches
        $cleanName = $file.BaseName -replace "_icon-icons.com_.*", ""
        $newName = "av_$cleanName" + $file.Extension
        $dest = Join-Path $basePath "general" $newName
        Move-Item -Path $file.FullName -Destination $dest -Force
    }
}
