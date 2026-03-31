$f = 'c:\Users\Admin\Downloads\Earnify\public\admin\Resources\index.html'
$c = [System.IO.File]::ReadAllText($f)

# Fix the broken section after combined-card - remove duplicate allGrid and fix structure
$broken = '<div class="resource-grid" id="allGrid">
          <div class="empty-state">
            <div class="empty-icon">📦</div>
            <h3>No Resources Yet</h3>
            <p>Click the buttons above to add your first resource!</p>
          </div>
        </div>
      </div>
    </div>
        <div class="resource-grid" id="allGrid">
          <div class="empty-state">
            <div class="empty-icon">📦</div>
            <h3>No Resources Yet</h3>
            <p>Click the buttons above to add your first resource!</p>
          </div>
        </div>
      </div>
    </div>'

$fixed = '    <div id="all" class="tab-content active">
      <div class="resource-section">
        <div class="resource-grid" id="allGrid">
          <div class="empty-state">
            <div class="empty-icon">📦</div>
            <h3>No Resources Yet</h3>
            <p>Click the buttons above to add your first resource!</p>
          </div>
        </div>
      </div>
    </div>'

if ($c.Contains($broken)) {
    $c2 = $c.Replace($broken, $fixed)
    [System.IO.File]::WriteAllText($f, $c2)
    Write-Host "Fixed HTML structure"
} else {
    Write-Host "Pattern not found - checking..."
    $idx = $c.IndexOf('id="allGrid"')
    Write-Host "allGrid occurrences check - first at:" $idx
    $idx2 = $c.IndexOf('id="allGrid"', $idx+1)
    Write-Host "second at:" $idx2
}
