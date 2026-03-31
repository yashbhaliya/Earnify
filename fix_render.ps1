$f = 'c:\Users\Admin\Downloads\Earnify\public\admin\app.js'
$c = [System.IO.File]::ReadAllText($f)

# Find the render block after empty state (second if window.innerWidth block)
$firstIdx  = $c.IndexOf('if (window.innerWidth > 768)')
$secondIdx = $c.IndexOf('if (window.innerWidth > 768)', $firstIdx + 10)
$catchIdx  = $c.IndexOf('} catch (error)', $secondIdx)

$oldRender = $c.Substring($secondIdx, $catchIdx - $secondIdx)
Write-Host "Old render length:" $oldRender.Length
Write-Host "First 60:" $oldRender.Substring(0,60)

$newRender = 'if (window.innerWidth > 768) {
      grid.innerHTML = ''<div class="res-list">'' + resources.map(r => {
        const imgSrc = ''/file/'' + (r.type === ''freelance'' ? ''service'' : r.type) + ''.jpg'';
        return ''<div class="res-item">'' +
          ''<img src="'' + imgSrc + ''" class="res-item-icon" alt="'' + r.type + ''">'' +
          ''<div class="res-item-info">'' +
            ''<div class="res-item-name">'' + r.title + ''</div>'' +
            ''<div class="res-item-desc">'' + r.description + ''</div>'' +
          ''</div>'' +
          ''<div class="res-item-price">&#8377;'' + r.price + ''</div>'' +
          ''<div class="res-item-actions">'' +
            ''<button onclick="openFile('' + r.id + '')" class="btn-view">Open</button>'' +
            ''<button onclick="editResource('' + r.id + '')" class="btn-edit">Edit</button>'' +
            ''<button onclick="deleteResource('' + r.id + '')" class="btn-delete">Delete</button>'' +
          ''</div>'' +
        ''</div>'';
      }).join('''') + ''</div>'';
    } else {
      grid.innerHTML = resources.map(r => {
        return ''<div class="resource-card">'' +
          ''<div class="resource-icon">'' + getTypeIcon(r.type) + ''</div>'' +
          ''<h3>'' + r.title + ''</h3>'' +
          ''<p>'' + r.description + ''</p>'' +
          ''<div class="resource-price">&#8377;'' + r.price + ''</div>'' +
          ''<div class="resource-actions">'' +
            ''<button onclick="openFile('' + r.id + '')" class="btn-view">Open</button>'' +
            ''<button onclick="editResource('' + r.id + '')" class="btn-edit">Edit</button>'' +
            ''<button onclick="deleteResource('' + r.id + '')" class="btn-delete">Delete</button>'' +
          ''</div>'' +
        ''</div>'';
      }).join('''');
    }

  '

$c2 = $c.Replace($oldRender, $newRender)
if ($c2 -eq $c) { Write-Host "NO CHANGE" } else { [System.IO.File]::WriteAllText($f, $c2); Write-Host "Done" }
