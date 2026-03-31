$f = 'c:\Users\Admin\Downloads\Earnify\public\admin\app.js'
$c = [System.IO.File]::ReadAllText($f)

# Find shimmer block start and try block start
$shimStart = $c.IndexOf('// Show shimmer loading')
$tryStart  = $c.IndexOf('try {', $shimStart)

$oldShimmer = $c.Substring($shimStart, $tryStart - $shimStart)
Write-Host "Shimmer block length:" $oldShimmer.Length
Write-Host "First 80 chars:" $oldShimmer.Substring(0, [Math]::Min(80, $oldShimmer.Length))

$newShimmer = '// Show shimmer loading
  if (window.innerWidth > 768) {
    const sr = ''<div class="res-item res-shimmer"><div class="sh" style="width:46px;height:46px;border-radius:10px;flex-shrink:0;"></div><div style="flex:1;display:flex;flex-direction:column;gap:6px;"><div class="sh sh-md"></div><div class="sh sh-lg"></div></div><div class="sh" style="width:60px;height:18px;border-radius:6px;"></div><div style="display:flex;gap:6px;"><div class="sh" style="width:52px;height:30px;border-radius:8px;"></div><div class="sh" style="width:44px;height:30px;border-radius:8px;"></div><div class="sh" style="width:56px;height:30px;border-radius:8px;"></div></div></div>'';
    grid.innerHTML = ''<div class="res-list">'' + sr.repeat(5) + ''</div>'';
  } else {
    const sc = ''<div class="shimmer-card"><div class="shimmer-icon"></div><div class="shimmer-title"></div><div class="shimmer-description"></div><div class="shimmer-description"></div><div class="shimmer-price"></div><div class="shimmer-buttons"><div class="shimmer-button"></div><div class="shimmer-button"></div><div class="shimmer-button"></div></div></div>'';
    grid.innerHTML = sc + sc + sc;
  }

  '

$c2 = $c.Replace($oldShimmer, $newShimmer)
if ($c2 -eq $c) { Write-Host "NO CHANGE" } else { [System.IO.File]::WriteAllText($f, $c2); Write-Host "Done" }
