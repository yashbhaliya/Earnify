$f = 'c:\Users\Admin\Downloads\Earnify\public\admin\app.js'
$c = Get-Content $f -Raw

# Fix thead: replace separate Title and Description headers with one combined
$c = $c -replace '<th>Title</th><th>Description</th>', '<th>Title</th>'

# Fix tbody: replace separate title cell + desc cell with combined cell
$c = $c -replace "'\</td\>\<td\>' \+ r\.title \+ '\</td\>\<td class=\\\\""res-desc\\\\""\>' \+ r\.description \+ '\</td\>'", "'</td><td><div class=""res-title"">' + r.title + '</div><div class=""res-desc"">' + r.description + '</div></td>'"

Set-Content $f $c -NoNewline
Write-Host "done"
