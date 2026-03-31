$f = 'c:\Users\Admin\Downloads\Earnify\public\admin\Resources\style.css'
$c = [System.IO.File]::ReadAllText($f)

# Remove all three duplicate res-item blocks by cutting from first occurrence of res-list to end
# and replacing with one clean block
$cutIdx = $c.IndexOf('/* -- Resource List (desktop card-row view) --')
if ($cutIdx -lt 0) { $cutIdx = $c.IndexOf('/* -- Resource List') }
if ($cutIdx -lt 0) { $cutIdx = $c.IndexOf('.res-list {') }

Write-Host "Cut at:" $cutIdx

if ($cutIdx -gt 0) {
    $clean = $c.Substring(0, $cutIdx)
    $clean += @'

/* ═══════════════════════════════════
   RESOURCE LIST — final clean styles
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
  min-width: 0;
  transition: box-shadow .2s, border-color .2s, transform .15s;
}
.res-item:hover {
  border-color: #c7d2fe;
  box-shadow: 0 4px 18px rgba(102,126,234,0.12);
  transform: translateY(-1px);
}

.res-item-icon {
  width: 48px;
  height: 48px;
  object-fit: contain;
  border-radius: 12px;
  background: #f1f5f9;
  padding: 7px;
  flex-shrink: 0;
  border: 1.5px solid #e2e8f0;
}

.res-item-info {
  flex: 1 1 0;
  min-width: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.res-item-name {
  font-size: 14px;
  font-weight: 700;
  color: #1e293b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: block;
  line-height: 1.4;
}

.res-item-desc {
  font-size: 12.5px;
  color: #94a3b8;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: block;
  line-height: 1.4;
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
  padding: 6px 14px;
  border-radius: 8px;
  border: 1.5px solid transparent;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  background: white;
  color: #1e293b;
  transition: background .15s;
  font-family: inherit;
  white-space: nowrap;
  box-shadow: none !important;
}
.res-item-actions .btn-view   { border-color: #3b82f6; }
.res-item-actions .btn-edit   { border-color: #f59e0b; }
.res-item-actions .btn-delete { border-color: #ef4444; }
.res-item-actions .btn-view:hover   { background: #dbeafe; color: #1d4ed8; }
.res-item-actions .btn-edit:hover   { background: #fef3c7; color: #b45309; }
.res-item-actions .btn-delete:hover { background: #fee2e2; color: #b91c1c; }

/* Shimmer row */
.res-item.res-shimmer { pointer-events: none; }
.sh {
  background: #e2e8f0;
  border-radius: 4px;
  height: 16px;
  position: relative;
  overflow: hidden;
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
    [System.IO.File]::WriteAllText($f, $clean)
    Write-Host "Done. New length:" $clean.Length
} else {
    Write-Host "Cut point not found"
}
