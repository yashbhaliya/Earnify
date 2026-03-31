$f = 'c:\Users\Admin\Downloads\Earnify\public\admin\Resources\index.html'
$c = [System.IO.File]::ReadAllText($f)

# Find the start of the broken section (after combined-card closing div)
$combinedEnd = $c.IndexOf('</div>' + [char]10 + [char]10 + '    <div class="resource-grid" id="allGrid">')
if ($combinedEnd -lt 0) {
    $combinedEnd = $c.IndexOf('</div>
    </div>

    <div class="resource-grid" id="allGrid">')
}

# Find where pdf tab starts (clean section)
$pdfStart = $c.IndexOf('<div id="pdf" class="tab-content">')

Write-Host "combinedEnd:" $combinedEnd
Write-Host "pdfStart:" $pdfStart

if ($combinedEnd -gt 0 -and $pdfStart -gt 0) {
    $before = $c.Substring(0, $combinedEnd + 6) # keep up to </div> of combined-card
    $after = $c.Substring($pdfStart)
    
    $middle = @'

    <div id="all" class="tab-content active">
      <div class="resource-section">
        <div class="resource-grid" id="allGrid">
          <div class="empty-state">
            <div class="empty-icon">📦</div>
            <h3>No Resources Yet</h3>
            <p>Click the buttons above to add your first resource!</p>
          </div>
        </div>
      </div>
    </div>

    '@
    
    $c2 = $before + $middle + $after
    [System.IO.File]::WriteAllText($f, $c2)
    Write-Host "Done. New length:" $c2.Length
} else {
    # fallback: find by index
    $idx1 = $c.IndexOf('<div class="resource-grid" id="allGrid">')
    $idx2 = $c.IndexOf('<div class="resource-grid" id="allGrid">', $idx1+1)
    Write-Host "idx1:" $idx1 "idx2:" $idx2
    
    # Remove everything between combined-card end and pdfStart, replace with clean all tab
    $ccEnd = $c.LastIndexOf('</div>', $idx1) + 6
    Write-Host "ccEnd:" $ccEnd
}
