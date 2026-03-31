const fs = require('fs');

const css = `/* ── Reset ── */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: 'Inter', 'Segoe UI', sans-serif; background: #f1f5f9; display: flex; min-height: 100vh; }

/* ── Sidebar ── */
.sidebar {
  width: 260px; flex-shrink: 0; background: #fff;
  border-right: 1.5px solid #e2e8f0; padding: 0 0 24px;
  position: sticky; top: 0; height: 100vh;
  display: flex; flex-direction: column; overflow-y: auto;
}
.sidebar-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 24px 24px 20px; border-bottom: 1.5px solid #e2e8f0;
}
.sidebar-header h2 {
  font-size: 20px; font-weight: 800;
  background: linear-gradient(135deg,#667eea,#764ba2);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
}
.sidebar-close-btn {
  display: none; background: none; border: none;
  font-size: 24px; cursor: pointer; color: #64748b; border-radius: 6px; padding: 2px 6px;
}
.sidebar-close-btn:hover { background: #f1f5f9; color: #ef4444; }
.sidebar a {
  display: flex; align-items: center; gap: 10px;
  padding: 11px 24px; color: #64748b; text-decoration: none;
  font-size: 14px; font-weight: 500; border-left: 3px solid transparent; transition: all 0.2s;
}
.sidebar a:hover { background: #f8fafc; color: #667eea; border-left-color: #667eea; }
.sidebar a.active-link { background: #f0f0ff; color: #667eea; border-left-color: #667eea; font-weight: 700; }
.sidebar-user { margin-top: auto; padding: 16px 20px; border-top: 1.5px solid #e2e8f0; }
.user-info { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
.user-avatar {
  width: 38px; height: 38px; border-radius: 50%;
  background: linear-gradient(135deg,#667eea,#764ba2);
  display: flex; align-items: center; justify-content: center;
  color: #fff; font-size: 16px; font-weight: 700; flex-shrink: 0;
}
.user-details { flex: 1; overflow: hidden; }
.user-name { font-size: 13px; font-weight: 700; color: #1e293b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.user-email { font-size: 11px; color: #94a3b8; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.logout-link {
  display: flex; align-items: center; justify-content: center;
  padding: 10px; border-radius: 10px; background: #fff; color: #1e293b;
  border: 2px solid #ef4444; font-weight: 600; font-size: 13px;
  cursor: pointer; text-decoration: none; transition: all 0.2s;
}
.logout-link:hover { background: #fee2e2; color: #dc2626; }
.sidebar-overlay {
  display: none; position: fixed; inset: 0;
  background: rgba(0,0,0,0.45); z-index: 998;
}
.sidebar-overlay.active { display: block; }

/* ── Main ── */
.main { flex: 1; padding: 24px 28px; overflow-y: auto; min-width: 0; }

/* ── Page Header ── */
.page-header {
  background: linear-gradient(135deg,#667eea,#764ba2);
  border-radius: 18px; padding: 28px 32px; margin-bottom: 24px;
  box-shadow: 0 4px 20px rgba(102,126,234,0.25);
}
.header-content { display: flex; align-items: center; gap: 14px; }
.header-content h1 { font-size: 28px; font-weight: 800; color: #fff; }
.subtitle { font-size: 14px; color: rgba(255,255,255,0.85); margin-top: 4px; }
.mobile-menu-toggle {
  display: none; flex-direction: column; gap: 5px;
  background: rgba(255,255,255,0.25); border: 2px solid rgba(255,255,255,0.5);
  border-radius: 10px; padding: 8px; cursor: pointer;
  width: 44px; height: 44px; align-items: center; justify-content: center; flex-shrink: 0;
}
.hamburger { width: 22px; height: 2px; background: #fff; border-radius: 2px; display: block; }

/* ── Resource Box ── */
.resource-box {
  background: linear-gradient(135deg,#667eea,#764ba2);
  border-radius: 18px; padding: 18px; margin-bottom: 24px;
  box-shadow: 0 4px 20px rgba(102,126,234,0.2);
}
.resource-label { color: #fff; font-size: 12px; font-weight: 700; letter-spacing: 1.2px; text-transform: uppercase; display: block; margin-bottom: 12px; }
.custom-select {
  background: rgba(255,255,255,0.15); border: 1.5px solid rgba(255,255,255,0.3);
  border-radius: 14px; padding: 10px 14px;
  display: flex; align-items: center; gap: 12px; cursor: pointer; transition: all 0.2s;
}
.custom-select:hover { background: rgba(255,255,255,0.22); }
.select-icon { width: 44px; height: 44px; object-fit: contain; border-radius: 10px; background: rgba(255,255,255,0.2); padding: 6px; }
#selectedText { font-size: 16px; font-weight: 600; color: #fff; flex: 1; }
.arrow { font-size: 13px; color: rgba(255,255,255,0.85); transition: transform 0.2s; }
.arrow.open { transform: rotate(180deg); }
.dropdown {
  display: none; background: #fff; border-radius: 14px;
  margin-top: 10px; overflow: hidden; box-shadow: 0 12px 36px rgba(0,0,0,0.15);
}
.dropdown div {
  padding: 12px 16px; display: flex; align-items: center; gap: 10px;
  cursor: pointer; font-size: 14px; font-weight: 500; color: #1e293b;
  border-bottom: 1px solid #f1f5f9; transition: background 0.15s;
}
.dropdown div:last-child { border-bottom: none; }
.dropdown div:hover { background: #f0f0ff; color: #667eea; }
.dropdown div img { width: 26px; height: 26px; object-fit: contain; border-radius: 6px; }

/* ── Tabs ── */
.tab-content { display: none; }
.tab-content.active { display: block; }

/* ── Resource Section ── */
.resource-section {
  background: #fff; border-radius: 18px; padding: 22px;
  border: 1.5px solid #e8edf5; box-shadow: 0 2px 12px rgba(102,126,234,0.06);
}
.section-header {
  display: flex; justify-content: space-between; align-items: flex-start;
  gap: 16px; margin-bottom: 20px; flex-wrap: wrap;
}
.section-title { display: flex; align-items: center; gap: 12px; }
.section-title h2 { font-size: 20px; font-weight: 700; color: #1e293b; }
.resource-count {
  background: linear-gradient(135deg,#667eea,#764ba2);
  color: #fff; padding: 4px 14px; border-radius: 20px; font-size: 12px; font-weight: 700;
}
.add-buttons-group { display: flex; gap: 8px; flex-wrap: wrap; }
.add-btn {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 8px 14px; border-radius: 10px; border: 2px solid transparent;
  background: #fff; color: #1e293b; font-size: 13px; font-weight: 600;
  cursor: pointer; transition: all 0.2s; white-space: nowrap;
}
.pdf-btn       { border-color: #ef4444; }
.excel-btn     { border-color: #10b981; }
.exam-btn      { border-color: #f59e0b; }
.freelance-btn { border-color: #8b5cf6; }
.pdf-btn:hover       { background: #fee2e2; }
.excel-btn:hover     { background: #d1fae5; }
.exam-btn:hover      { background: #fef3c7; }
.freelance-btn:hover { background: #ede9fe; }
.btn-icon img { width: 18px; height: 18px; object-fit: contain; vertical-align: middle; }

/* ── Empty State ── */
.empty-state {
  text-align: center; padding: 60px 20px;
  background: linear-gradient(135deg,rgba(102,126,234,0.04),rgba(255,255,255,0.9));
  border-radius: 14px; border: 2px dashed #c7d2fe;
}
.empty-icon { font-size: 56px; margin-bottom: 14px; opacity: 0.6; }
.empty-icon img { width: 56px; height: 56px; object-fit: contain; }
.empty-state h3 { font-size: 20px; font-weight: 700; color: #667eea; margin-bottom: 8px; }
.empty-state p  { font-size: 14px; color: #64748b; }

/* ── Desktop Table ── */
.res-table-wrap { width: 100%; overflow-x: auto; border-radius: 14px; border: 1.5px solid #e2e8f0; }
.res-table { width: 100%; border-collapse: collapse; font-size: 13.5px; background: #fff; }
.res-table thead tr { background: linear-gradient(135deg,#667eea,#764ba2); }
.res-table th {
  padding: 13px 16px; text-align: left; color: #fff;
  font-weight: 700; font-size: 12px; letter-spacing: .5px;
  text-transform: uppercase; white-space: nowrap; border: none;
}
.res-table td { padding: 13px 16px; border-bottom: 1px solid #f1f5f9; color: #1e293b; vertical-align: top; }
.res-table tbody tr:last-child td { border-bottom: none; }
.res-table tbody tr:hover { background: #f5f3ff; }
.res-title { font-size: 14px; font-weight: 700; color: #1e293b; margin-bottom: 4px; }
.res-desc  { font-size: 12px; color: #94a3b8; line-height: 1.5; word-break: break-word; white-space: normal; }
.res-badge { display: inline-flex; align-items: center; gap: 4px; padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; text-transform: uppercase; }
.res-badge-pdf       { background: #fee2e2; color: #dc2626; }
.res-badge-excel     { background: #dcfce7; color: #16a34a; }
.res-badge-exam      { background: #fef9c3; color: #ca8a04; }
.res-badge-freelance { background: #ede9fe; color: #7c3aed; }
.res-actions { display: flex; gap: 6px; }
.res-actions button {
  padding: 5px 12px; border-radius: 7px; border: 1.5px solid transparent;
  font-size: 12px; font-weight: 600; cursor: pointer;
  background: #fff; color: #1e293b; font-family: inherit; transition: background .15s; white-space: nowrap;
}
.res-actions .btn-view   { border-color: #3b82f6; }
.res-actions .btn-edit   { border-color: #f59e0b; }
.res-actions .btn-delete { border-color: #ef4444; }
.res-actions .btn-view:hover   { background: #dbeafe; color: #1d4ed8; }
.res-actions .btn-edit:hover   { background: #fef3c7; color: #b45309; }
.res-actions .btn-delete:hover { background: #fee2e2; color: #b91c1c; }

/* ── Mobile Grid Cards ── */
.res-grid { display: grid; grid-template-columns: repeat(auto-fill,minmax(260px,1fr)); gap: 18px; }
.res-card {
  display: flex; flex-direction: column; background: #fff;
  border-radius: 14px; border: 1.5px solid #e8edf5;
  box-shadow: 0 2px 10px rgba(102,126,234,0.07);
  overflow: hidden; transition: transform .2s, box-shadow .2s;
}
.res-card:hover { transform: translateY(-3px); box-shadow: 0 6px 20px rgba(102,126,234,0.14); }
.res-card-top { display: flex; align-items: center; gap: 10px; padding: 14px 14px 0; }
.res-card-img { width: 40px; height: 40px; object-fit: contain; border-radius: 9px; background: #f1f5f9; padding: 5px; border: 1px solid #e2e8f0; flex-shrink: 0; }
.res-card-body { padding: 10px 14px; flex: 1; display: flex; flex-direction: column; gap: 5px; }
.res-card-title { font-size: 14px; font-weight: 700; color: #1e293b; line-height: 1.3; }
.res-card-desc  { font-size: 12px; color: #94a3b8; line-height: 1.5; word-break: break-word; }
.res-card-price {
  font-size: 15px; font-weight: 800; margin-top: 4px;
  background: linear-gradient(135deg,#667eea,#764ba2);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
}
.res-card-actions { display: flex; gap: 6px; padding: 10px 14px; border-top: 1px solid #f1f5f9; }
.res-card-actions button {
  flex: 1; padding: 7px 0; border-radius: 8px; border: 1.5px solid transparent;
  font-size: 12px; font-weight: 600; cursor: pointer;
  background: #fff; color: #1e293b; font-family: inherit; transition: background .15s;
}
.res-card-actions .btn-view   { border-color: #3b82f6; }
.res-card-actions .btn-edit   { border-color: #f59e0b; }
.res-card-actions .btn-delete { border-color: #ef4444; }
.res-card-actions .btn-view:hover   { background: #dbeafe; color: #1d4ed8; }
.res-card-actions .btn-edit:hover   { background: #fef3c7; color: #b45309; }
.res-card-actions .btn-delete:hover { background: #fee2e2; color: #b91c1c; }

/* ── Shimmer ── */
.shimmer-card {
  background: #fff; border-radius: 14px; border: 1.5px solid #e8edf5;
  padding: 18px; overflow: hidden; position: relative;
}
.shimmer-card::after {
  content: ''; position: absolute; inset: 0;
  background: linear-gradient(90deg,transparent,rgba(255,255,255,0.7),transparent);
  animation: shimmer 1.6s infinite;
}
@keyframes shimmer { 0%{transform:translateX(-100%)} 100%{transform:translateX(100%)} }
.shimmer-icon   { width: 44px; height: 44px; background: #e2e8f0; border-radius: 9px; margin-bottom: 12px; }
.shimmer-title  { width: 70%; height: 14px; background: #e2e8f0; border-radius: 4px; margin-bottom: 8px; }
.shimmer-description { width: 100%; height: 11px; background: #e2e8f0; border-radius: 4px; margin-bottom: 6px; }
.shimmer-price  { width: 40%; height: 16px; background: #e2e8f0; border-radius: 4px; margin: 10px 0; }
.shimmer-buttons { display: flex; gap: 6px; margin-top: 10px; }
.shimmer-button { flex: 1; height: 32px; background: #e2e8f0; border-radius: 8px; }

/* ── Modals ── */
.modal { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.55); z-index: 1000; justify-content: center; align-items: center; }
.modal-content { background: #fff; border-radius: 16px; padding: 32px; width: 90%; max-width: 480px; position: relative; box-shadow: 0 20px 60px rgba(0,0,0,0.2); }
.modal-content h2 { font-size: 22px; font-weight: 700; color: #1e293b; margin-bottom: 20px; }
.close { position: absolute; top: 14px; right: 18px; font-size: 26px; cursor: pointer; color: #94a3b8; line-height: 1; }
.close:hover { color: #ef4444; }
#resourceForm input,#resourceForm textarea,#editForm input,#editForm textarea {
  width: 100%; padding: 11px 14px; margin: 8px 0;
  border: 1.5px solid #e2e8f0; border-radius: 10px;
  font-size: 14px; font-family: inherit; background: #f8fafc; color: #1e293b; transition: border-color 0.2s;
}
#resourceForm input:focus,#resourceForm textarea:focus,#editForm input:focus,#editForm textarea:focus { outline: none; border-color: #667eea; background: #fff; }
#resourceForm textarea,#editForm textarea { min-height: 90px; resize: vertical; }
#resourceForm button[type="submit"],#editForm button[type="submit"] {
  width: 100%; padding: 13px; margin-top: 12px;
  background: linear-gradient(135deg,#667eea,#764ba2);
  color: #fff; border: none; border-radius: 10px; font-size: 15px; font-weight: 700; cursor: pointer; transition: opacity 0.2s;
}
#resourceForm button[type="submit"]:hover,#editForm button[type="submit"]:hover { opacity: 0.9; }
#uploadProgress { color: #10b981; font-weight: 600; margin: 8px 0; font-size: 13px; }
.last-file-info { background: #f8fafc; border-radius: 8px; padding: 8px 12px; margin: 8px 0; font-size: 12px; color: #64748b; }
.auth-modal { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.55); z-index: 2000; justify-content: center; align-items: center; }
.auth-modal-content { background: #fff; border-radius: 16px; padding: 36px; width: 90%; max-width: 420px; position: relative; box-shadow: 0 20px 60px rgba(0,0,0,0.2); }
.auth-modal-content h2 { color: #667eea; text-align: center; margin-bottom: 8px; font-size: 22px; }
.auth-modal-content p  { color: #64748b; text-align: center; margin-bottom: 24px; font-size: 14px; }
.form-group { margin-bottom: 16px; }
.form-group label { display: block; font-size: 13px; font-weight: 600; color: #475569; margin-bottom: 6px; }
.form-group input { width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 10px; font-size: 14px; background: #f8fafc; color: #1e293b; transition: border-color 0.2s; }
.form-group input:focus { outline: none; border-color: #667eea; background: #fff; }
.btn-submit { width: 100%; padding: 13px; background: linear-gradient(135deg,#667eea,#764ba2); color: #fff; border: none; border-radius: 10px; font-size: 15px; font-weight: 700; cursor: pointer; transition: opacity 0.2s; }
.btn-submit:hover { opacity: 0.9; }
.toggle-form { text-align: center; margin-top: 16px; font-size: 13px; color: #64748b; }
.toggle-form a { color: #667eea; cursor: pointer; font-weight: 600; text-decoration: none; }
.error-message   { background: #fee2e2; color: #991b1b; padding: 10px 14px; border-radius: 8px; margin-bottom: 14px; font-size: 13px; display: none; border-left: 3px solid #ef4444; }
.success-message { background: #d1fae5; color: #065f46; padding: 10px 14px; border-radius: 8px; margin-bottom: 14px; font-size: 13px; display: none; border-left: 3px solid #10b981; }
.hidden { display: none !important; }

/* ── Desktop only ── */
@media (min-width: 769px) {
  .res-grid { display: none !important; }
  .res-table-wrap { display: block !important; }
  .mobile-menu-toggle { display: none !important; }
  .page-header-toggle { display: none !important; }
}

/* ── Mobile ── */
@media (max-width: 768px) {
  .main { padding: 14px; }
  .page-header { padding: 16px; border-radius: 14px; margin-bottom: 16px; }
  .header-content h1 { font-size: 20px; }
  .subtitle { display: none; }
  .resource-section { padding: 14px; border-radius: 14px; }
  .section-header { flex-direction: column; gap: 12px; }
  .section-title h2 { font-size: 17px; }
  .resource-box { padding: 14px; border-radius: 14px; margin-bottom: 16px; }
  .res-table-wrap { display: none !important; }
  .res-grid { display: grid !important; grid-template-columns: 1fr 1fr !important; gap: 10px !important; }
  .res-card-title { font-size: 13px; }
  .res-card-desc  { font-size: 11px; }
  .res-card-price { font-size: 13px; }
  .res-card-actions button { font-size: 11px; padding: 6px 0; }
  .modal-content { width: 95%; padding: 20px; border-radius: 12px; max-height: 90vh; overflow-y: auto; }
}

@media (max-width: 400px) {
  .res-grid { grid-template-columns: 1fr !important; }
}
`;

fs.writeFileSync('c:/Users/Admin/Downloads/Earnify/public/admin/Resources/style.css', css);
console.log('Written:', css.length, 'chars');
