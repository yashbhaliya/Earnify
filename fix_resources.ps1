$f = 'c:\Users\Admin\Downloads\Earnify\public\admin\Resources\index.html'
$c = [System.IO.File]::ReadAllText($f)

# Fix corrupted label - replace anything before SELECT RESOURCE TYPE: inside the label
$c = [regex]::Replace($c, '<label class="resource-label">[^<]*SELECT RESOURCE TYPE:</label>', '<label class="resource-label">📂 SELECT RESOURCE TYPE:</label>')

[System.IO.File]::WriteAllText($f, $c)
Write-Host "Label fixed"

# Verify
$check = Select-String -Path $f -Pattern "resource-label"
Write-Host $check
