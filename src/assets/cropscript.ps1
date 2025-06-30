$source = "D:\projects\scatternote\frontend\src\assets\purplebg"
$dest = Join-Path $source "cropped"
New-Item -ItemType Directory -Path $dest -Force | Out-Null

# Corrected: reliably finds your pngs without -Include/-Recurse gotchas
$images = Get-ChildItem -Path $source -File | Where-Object { $_.Extension -match '\.(jpg|jpeg|png)$' }

if ($images.Count -eq 0) {
    Write-Host "No matching image files found in $source"
    exit
}

foreach ($img in $images) {
    $in = $img.FullName
    $out = Join-Path $dest $img.Name
    Write-Host "Processing: $($img.Name)"
    magick "$in" -gravity northwest -crop "%[height]x%[height]+0+0" +repage "$out"
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Error processing $($img.Name) with magick."
    } else {
        Write-Host "Created: $out"
    }
}

Read-Host -Prompt "Press Enter to exit"