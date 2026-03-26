const fs = require('fs');
const cssPath = 'C:\\Users\\LENOVO\\Downloads\\token_system_admin\\token_system_admin\\frontend\\src\\index.css';
let css = fs.readFileSync(cssPath, 'utf8');

const listCardPatch = `
/* =====================================================
   LIST TABLE → MOBILE CARD VIEW
   Converts data tables (Branch, Staff, Consultant) into
   stacked cards on mobile using data-label attributes.
   ===================================================== */

/* Scrollable table wrapper on all screens */
.list-table-wrap {
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  background: white;
}

.list-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.list-table thead tr {
  background: #f8fafc;
  border-bottom: 2px solid #e2e8f0;
}

.list-table thead th {
  padding: 14px 18px;
  text-align: left;
  font-size: 11px;
  font-weight: 800;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 1px;
  white-space: nowrap;
}

.list-table tbody tr {
  border-bottom: 1px solid #f1f5f9;
  transition: background 0.15s ease;
}

.list-table tbody tr:hover {
  background: #f8fafc;
}

.list-table tbody tr:last-child {
  border-bottom: none;
}

.list-table td {
  padding: 14px 18px !important;
  vertical-align: middle;
  color: #334155;
  font-weight: 500;
}

.list-table .row-num {
  color: #94a3b8;
  font-size: 12px;
  font-weight: 700;
  width: 48px;
}

.list-table .primary-cell {
  font-weight: 700;
  color: #0f172a;
}

/* --- MOBILE: Stack table rows as cards at ≤768px --- */
@media (max-width: 768px) {
  .list-table-wrap {
    border: none !important;
    background: transparent !important;
    border-radius: 0 !important;
    overflow-x: visible !important;
  }

  .list-table {
    display: block !important;
    width: 100% !important;
  }

  /* Hide the table header */
  .list-table thead {
    display: none !important;
  }

  /* Tbody as a vertical stack */
  .list-table tbody {
    display: flex !important;
    flex-direction: column !important;
    gap: 12px !important;
    width: 100% !important;
  }

  /* Each row becomes a white card */
  .list-table tbody tr {
    display: block !important;
    background: #ffffff !important;
    border: 1px solid #e2e8f0 !important;
    border-radius: 16px !important;
    padding: 16px !important;
    box-shadow: 0 2px 8px rgba(0,0,0,0.04) !important;
    transition: box-shadow 0.2s ease, transform 0.2s ease !important;
    border-bottom: 1px solid #e2e8f0 !important;
  }

  .list-table tbody tr:hover {
    transform: translateY(-2px) !important;
    box-shadow: 0 8px 24px rgba(0,0,0,0.08) !important;
  }

  /* Hide empty filler rows on mobile */
  .list-table tbody tr.empty-row {
    display: none !important;
  }

  /* Each cell: label on left, value on right */
  .list-table td {
    display: flex !important;
    justify-content: space-between !important;
    align-items: center !important;
    padding: 8px 0 !important;
    border-bottom: 1px solid #f1f5f9 !important;
    font-size: 13px !important;
    min-height: unset !important;
    height: auto !important;
  }

  .list-table td:last-child {
    border-bottom: none !important;
  }

  /* Hide the # column on mobile */
  .list-table td.row-num {
    display: none !important;
  }

  /* Data label (from data-label attribute) */
  .list-table td::before {
    content: attr(data-label);
    font-size: 10px !important;
    font-weight: 800 !important;
    color: #94a3b8 !important;
    text-transform: uppercase !important;
    letter-spacing: 0.8px !important;
    min-width: 80px !important;
    flex-shrink: 0 !important;
  }

  /* Primary cell (name): bigger and bold */
  .list-table td.primary-cell {
    font-size: 15px !important;
    font-weight: 800 !important;
    color: #0f172a !important;
    justify-content: flex-start !important;
    gap: 8px !important;
    padding-bottom: 10px !important;
    border-bottom: 2px solid #f1f5f9 !important;
    margin-bottom: 4px !important;
  }

  .list-table td.primary-cell::before {
    display: none !important; /* Hide label for the main name row */
  }

  /* Action buttons row */
  .list-table td:has(.module-actions) {
    justify-content: flex-end !important;
    padding-top: 10px !important;
    margin-top: 4px !important;
  }

  .list-table td:has(.module-actions)::before {
    display: none !important;
  }

  /* List footer: stack on mobile */
  .list-footer {
    flex-direction: column !important;
    align-items: stretch !important;
    gap: 12px !important;
  }

  .list-footer > button {
    width: 100% !important;
    justify-content: center !important;
  }
}
`;

fs.writeFileSync(cssPath, css + '\n' + listCardPatch);
console.log('Successfully applied mobile card-view for list tables!');
