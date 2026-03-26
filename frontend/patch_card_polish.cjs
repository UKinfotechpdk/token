const fs = require('fs');
const cssPath = 'C:\\Users\\LENOVO\\Downloads\\token_system_admin\\token_system_admin\\frontend\\src\\index.css';
let css = fs.readFileSync(cssPath, 'utf8');

const polishPatch = `
/* =====================================================
   MOBILE CARD LIST POLISH (Tablet + Mobile Fix)
   Builds on existing card transforms
   ===================================================== */

@media (max-width: 768px) {

  /* --- Main content area padding on tablet --- */
  .main-content {
    padding: 16px !important;
  }

  /* --- Page title area --- */
  .page-header, .module-header, .list-header {
    flex-direction: column !important;
    align-items: flex-start !important;
    gap: 12px !important;
    margin-bottom: 20px !important;
  }

  .page-header h2, .module-header h2, .list-header h2 {
    font-size: 1.4rem !important;
  }

  /* Make "Add Branch / Add Staff" button full-width on tablet */
  .page-header .btn-primary,
  .module-header .btn-primary,
  .list-header .btn, 
  .module-toolbar .btn-primary {
    width: 100% !important;
    justify-content: center !important;
    text-align: center !important;
  }

  /* Search + Filter toolbar: stack vertically */
  .search-filter-bar, .module-search-row, .staff-search-row {
    flex-direction: column !important;
    gap: 10px !important;
  }

  .search-filter-bar input,
  .search-filter-bar select,
  .module-search-row input,
  .module-search-row select {
    width: 100% !important;
    box-sizing: border-box !important;
  }

  /* --- Enhanced mobile card row --- */
  .list-table tbody tr {
    padding: 18px 16px !important;
    gap: 4px !important;
  }

  /* Name/title row: bigger, more prominent */
  .list-table td.primary-cell {
    font-size: 16px !important;
    font-weight: 900 !important;
    color: #0f172a !important;
    padding-bottom: 12px !important;
    margin-bottom: 6px !important;
    border-bottom: 1.5px solid #f1f5f9 !important;
  }

  /* Field rows inside each card */
  .list-table td {
    padding: 7px 0 !important;
    font-size: 13px !important;
    color: #334155 !important;
    gap: 12px !important;
  }

  /* Labels */
  .list-table td::before {
    min-width: 90px !important;
    font-size: 10px !important;
    font-weight: 800 !important;
    color: #94a3b8 !important;
    text-transform: uppercase !important;
    letter-spacing: 0.8px !important;
  }

  /* Status badges: keep them right-aligned */
  .list-table td:has(.badge),
  .list-table td:has(span[style*="border-radius: 20px"]) {
    justify-content: space-between !important;
  }

  /* Action row: full-width buttons at bottom of card */
  .list-table td:has(.module-actions) {
    justify-content: flex-end !important;
    gap: 8px !important;
    margin-top: 8px !important;
    padding-top: 12px !important;
    border-top: 1px solid #f1f5f9 !important;
    border-bottom: none !important;
  }

  .module-actions {
    display: flex !important;
    gap: 8px !important;
  }

  .btn-icon {
    padding: 8px 14px !important;
    border-radius: 10px !important;
    font-size: 15px !important;
    background: #f1f5f9 !important;
    border: 1px solid #e2e8f0 !important;
    cursor: pointer !important;
    transition: background 0.2s !important;
  }

  .btn-icon:hover {
    background: #e2e8f0 !important;
  }

  .btn-icon.danger:hover {
    background: #fee2e2 !important;
    border-color: #fecaca !important;
  }

  /* Pagination */
  .list-footer {
    margin-top: 20px !important;
  }

  /* Back to dashboard full width */
  .btn-back, .list-footer .btn {
    width: 100% !important;
    justify-content: center !important;
    text-align: center !important;
  }
}
`;

fs.writeFileSync(cssPath, css + '\n' + polishPatch);
console.log('Successfully polished mobile card list view!');
