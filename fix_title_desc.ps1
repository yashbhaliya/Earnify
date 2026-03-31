$f = 'c:\Users\Admin\Downloads\Earnify\public\admin\app.js'
$c = Get-Content $f -Raw

$old = "'<div class=\"res-table-wrap\"><table class=\"res-table\"><thead><tr><th>#</th><th>Type</th><th>Title</th><th>Description</th><th>Price</th><th>Actions</th></tr></thead><tbody>' + resources.map((r,i) => { const badge = {pdf:'res-badge-pdf',excel:'res-badge-excel',exam:'res-badge-exam',freelance:'res-badge-freelance'}[r.type]||''; return '<tr><td>' + (i+1) + '</td><td><span class=""res-badge ' + badge + '"">' + r.type + '</span></td><td>' + r.title + '</td><td class=""res-desc"">' + r.description + '</td><td><strong>&#8377;' + r.price + '</strong></td><td><div class=""res-actions""><button onclick=""openFile(' + r.id + ')"" class=""btn-view"">Open</button><button onclick=""editResource(' + r.id + ')"" class=""btn-edit"">Edit</button><button onclick=""deleteResource(' + r.id + ')"" class=""btn-delete"">Delete</button></div></td></tr>'; }).join('') + '</tbody></table></div>'"

$new = "'<div class=\"res-table-wrap\"><table class=\"res-table\"><thead><tr><th>#</th><th>Type</th><th>Title &amp; Description</th><th>Price</th><th>Actions</th></tr></thead><tbody>' + resources.map((r,i) => { const badge = {pdf:'res-badge-pdf',excel:'res-badge-excel',exam:'res-badge-exam',freelance:'res-badge-freelance'}[r.type]||''; return '<tr><td>' + (i+1) + '</td><td><span class=""res-badge ' + badge + '"">' + r.type + '</span></td><td><div class=""res-title"">' + r.title + '</div><div class=""res-desc"">' + r.description + '</div></td><td><strong>&#8377;' + r.price + '</strong></td><td><div class=""res-actions""><button onclick=""openFile(' + r.id + ')"" class=""btn-view"">Open</button><button onclick=""editResource(' + r.id + ')"" class=""btn-edit"">Edit</button><button onclick=""deleteResource(' + r.id + ')"" class=""btn-delete"">Delete</button></div></td></tr>'; }).join('') + '</tbody></table></div>'"

$c = $c.Replace($old, $new)
Set-Content $f $c -NoNewline
Write-Host "done"
