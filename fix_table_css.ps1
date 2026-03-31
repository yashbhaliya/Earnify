$f = 'c:\Users\Admin\Downloads\Earnify\public\admin\Resources\style.css'
$c = Get-Content $f -Raw

# Make resource-grid a plain block when it contains a table
$append = @'

/* ── Table view override ── */
.resource-grid:has(.res-table-wrap) {
  display: block !important;
  grid-template-columns: unset !important;
}
.res-table-wrap {
  width: 100%;
  overflow-x: auto;
  border-radius: 14px;
  border: 1.5px solid #e2e8f0;
  box-shadow: 0 2px 12px rgba(102,126,234,0.08);
}
.res-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13.5px;
  background: white;
  border-radius: 14px;
  overflow: hidden;
}
.res-table thead tr {
  background: linear-gradient(135deg, #667eea, #764ba2);
}
.res-table th {
  padding: 13px 16px;
  text-align: left;
  color: white;
  font-weight: 700;
  font-size: 12px;
  letter-spacing: .5px;
  text-transform: uppercase;
  white-space: nowrap;
  border: none;
}
.res-table td {
  padding: 12px 16px;
  border-bottom: 1px solid #f1f5f9;
  color: #1e293b;
  vertical-align: middle;
  font-size: 13.5px;
}
.res-table tbody tr:last-child td { border-bottom: none; }
.res-table tbody tr { transition: background .15s; }
.res-table tbody tr:hover { background: #f5f3ff; }
.res-desc {
  max-width: 220px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #64748b !important;
  font-size: 13px !important;
}
.res-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .4px;
}
.res-badge-pdf       { background: #fee2e2; color: #dc2626; }
.res-badge-excel     { background: #dcfce7; color: #16a34a; }
.res-badge-exam      { background: #fef9c3; color: #ca8a04; }
.res-badge-freelance { background: #ede9fe; color: #7c3aed; }
.res-actions { display: flex; gap: 6px; }
.res-actions button {
  padding: 5px 13px;
  border-radius: 7px;
  border: 1.5px solid transparent;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  background: white;
  color: #1e293b;
  transition: all .18s;
  font-family: inherit;
  box-shadow: none !important;
  white-space: nowrap;
}
.res-actions .btn-view   { border-color: #3b82f6; }
.res-actions .btn-edit   { border-color: #f59e0b; }
.res-actions .btn-delete { border-color: #ef4444; }
.res-actions .btn-view:hover   { background: #dbeafe; color: #1d4ed8; }
.res-actions .btn-edit:hover   { background: #fef3c7; color: #b45309; }
.res-actions .btn-delete:hover { background: #fee2e2; color: #b91c1c; }

@media (max-width: 768px) {
  .res-table th:nth-child(1),
  .res-table td:nth-child(1) { display: none; }
  .res-table th:nth-child(4),
  .res-table td:nth-child(4) { display: none; }
  .res-table th, .res-table td { padding: 10px 10px; font-size: 12px; }
  .res-actions button { padding: 4px 8px; font-size: 11px; }
}
'@

$c = $c + $append
Set-Content $f $c -NoNewline
Write-Host "done"
