$f = 'c:\Users\Admin\Downloads\Earnify\public\admin\Resources\style.css'
$c = [System.IO.File]::ReadAllText($f)

# Find the corrupted section start and cut everything from res-list onward
$idx = $c.IndexOf('.res-list {')
# Go back to find the comment/corruption before it
$cutFrom = $c.LastIndexOf([char]10, $idx - 1)
# Find a safe cut point - the newline before the corruption
# Look for last clean CSS rule before res-list
$safeIdx = $c.LastIndexOf('}', $idx) + 1

Write-Host "Safe cut at:" $safeIdx
Write-Host "res-list at:" $idx

$base = $c.Substring(0, $safeIdx)

$newCSS = @'


/* ═══════════════════════════════════
   RESOURCE LIST — card row layout
═══════════════════════════════════ */
.res-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.res-item {
  display: flex;
  align-items: center;
  gap: 14px;
  background: white;
  border: 1.5px solid #e8edf5;
  border-radius: 14px;
  padding: 14px 18px;
  transition: box-shadow .2s, border-color .2s, transform .15s;
}
.res-item:hover {
  border-color: #c7d2fe;
  box-shadow: 0 4px 18px rgba(102,126,234,0.12);
  transform: translateY(-1px);
}

.res-item-icon {
  width: 46px;
  height: 46px;
  object-fit: contain;
  border-radius: 10px;
  background: #f1f5f9;
  padding: 6px;
  flex-shrink: 0;
  border: 1.5px solid #e2e8f0;
}

.res-item-info {
  flex: 1;
  width: 0;
  min-width: 0;
  overflow: hidden;
}

.res-item-name {
  font-size: 14px;
  font-weight: 700;
  color: #1e293b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: block;
  margin-bottom: 3px;
}

.res-item-desc {
  font-size: 12.5px;
  color: #94a3b8;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: block;
}

.res-item-price {
  font-size: 15px;
  font-weight: 800;
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  white-space: nowrap;
  flex-shrink: 0;
  min-width: 72px;
  text-align: right;
}

.res-item-actions {
  display: flex;
  gap: 6px;
  flex-shrink: 0;
}
.res-item-actions button {
  padding: 6px 14px !important;
  border-radius: 8px !important;
  border: 1.5px solid transparent !important;
  font-size: 12px !important;
  font-weight: 600 !important;
  cursor: pointer !important;
  background: white !important;
  color: #1e293b !important;
  transition: background .15s !important;
  font-family: inherit !important;
  white-space: nowrap !important;
  box-shadow: none !important;
  transform: none !important;
}
.res-item-actions .btn-view   { border-color: #3b82f6 !important; }
.res-item-actions .btn-edit   { border-color: #f59e0b !important; }
.res-item-actions .btn-delete { border-color: #ef4444 !important; }
.res-item-actions .btn-view:hover   { background: #dbeafe !important; color: #1d4ed8 !important; }
.res-item-actions .btn-edit:hover   { background: #fef3c7 !important; color: #b45309 !important; }
.res-item-actions .btn-delete:hover { background: #fee2e2 !important; color: #b91c1c !important; }

.res-item.res-shimmer { pointer-events: none; }
.sh {
  background: #e2e8f0;
  border-radius: 4px;
  height: 16px;
  position: relative;
  overflow: hidden;
  display: block;
}
.sh::after {
  content: '';
  position: absolute;
  top: 0; left: -150%; width: 150%; height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.7), transparent);
  animation: shimmer 1.6s infinite;
}
.sh-sm { width: 50px; }
.sh-md { width: 120px; }
.sh-lg { width: 200px; }
'@

$final = $base + $newCSS
[System.IO.File]::WriteAllText($f, $final)
Write-Host "Done. Length:" $final.Length
