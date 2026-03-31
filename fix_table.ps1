$f = 'c:\Users\Admin\Downloads\Earnify\public\admin\app.js'
$c = [System.IO.File]::ReadAllText($f)

$start = $c.IndexOf('if (window.innerWidth > 768)')
$end   = $c.IndexOf('} else {', $start) + '} else {'.Length

$oldBlock = $c.Substring($start, $end - $start)

$newBlock = 'if (window.innerWidth > 768) {
      grid.innerHTML = `<div class="res-list">${resources.map(r => `
        <div class="res-item">
          <img src="/file/${r.type === "freelance" ? "service" : r.type}.jpg" class="res-item-icon" alt="${r.type}">
          <div class="res-item-info">
            <div class="res-item-name">${r.title}</div>
            <div class="res-item-desc">${r.description}</div>
          </div>
          <div class="res-item-price">&#8377;${r.price}</div>
          <div class="res-item-actions">
            <button onclick="openFile(${r.id})" class="btn-view">Open</button>
            <button onclick="editResource(${r.id})" class="btn-edit">Edit</button>
            <button onclick="deleteResource(${r.id})" class="btn-delete">Delete</button>
          </div>
        </div>`).join("")}</div>`;
    } else {'

$c2 = $c.Replace($oldBlock, $newBlock)
if ($c2 -eq $c) { Write-Host "NO CHANGE" } else { [System.IO.File]::WriteAllText($f, $c2); Write-Host "Done" }
