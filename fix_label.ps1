$f = 'c:\Users\Admin\Downloads\Earnify\public\admin\Resources\index.html'
$c = [System.IO.File]::ReadAllText($f)

# Replace corrupted label content with clean text (no emoji to avoid encoding issues)
$c = [regex]::Replace($c, '<label class="resource-label">[^<]+</label>', '<label class="resource-label">SELECT RESOURCE TYPE:</label>')

[System.IO.File]::WriteAllText($f, $c)
Write-Host "Done"
Select-String -Path $f -Pattern "resource-label>" | Select-Object -First 3
