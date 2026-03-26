const fs = require('fs');
const cssPath = 'C:\\Users\\LENOVO\\Downloads\\token_system_admin\\token_system_admin\\frontend\\src\\index.css';
let css = fs.readFileSync(cssPath, 'utf8');

const cardResponsivePatch = `
/* =====================================================
   UNIVERSAL CARD RESPONSIVE PATCH
   Makes ALL cards/grids responsive on every page—
   including admin, staff, consultant, user portals.
   ===================================================== */

/* --- Branch / Staff / Consultant list cards (table rows styled as cards) --- */
.glass-card {
  box-sizing: border-box !important;
  width: 100% !important;
}

/* --- Schedule list card grid wrappers --- */
.detail-grid,
.meta-grid,
[class*="detail-grid"],
[class*="meta-grid"],
[class*="stats-grid"] {
  display: grid !important;
  gap: 16px !important;
}

/* --- QueueStatusCard --- */
.queue-status-card, [class*="queue-card"] {
  width: 100% !important;
  box-sizing: border-box !important;
}

/* Horizontal scrollable containers */
.overflow-x-scroll, [class*="list-scroll"] {
  overflow-x: auto !important;
  -webkit-overflow-scrolling: touch !important;
}

/* ===== MOBILE: max 640px ===== */
@media (max-width: 640px) {
  /* Force ALL two-column grids to stack on mobile */
  .detail-grid,
  .meta-grid,
  [class*="detail-grid"],
  [class*="meta-grid"] {
    grid-template-columns: 1fr !important;
  }

  /* All inline grids defined in JSX with 2 columns */
  [style*="gridTemplateColumns: '1fr 1fr'"],
  [style*="grid-template-columns: 1fr 1fr"],
  [style*="1.2fr 1fr"] {
    display: flex !important;
    flex-direction: column !important;
  }

  /* Any 2-col form-row becomes single column */
  .form-row {
    flex-direction: column !important;
    gap: 14px !important;
  }

  /* Branch / Staff: list row as a stacked card */
  tr {
    display: block !important;
    border-bottom: 1px solid #e2e8f0 !important;
  }

  td {
    display: flex !important;
    justify-content: space-between !important;
    align-items: center !important;
    padding: 8px 12px !important;
    font-size: 13px !important;
    border-bottom: none !important;
  }

  td::before {
    content: attr(data-label);
    font-weight: 700;
    font-size: 11px;
    text-transform: uppercase;
    color: #64748b;
    letter-spacing: 0.5px;
    margin-right: 8px;
  }

  /* Hide table header on mobile (labels replace them) */
  thead {
    display: none !important;
  }

  /* Schedule cards */
  .schedule-card, [class*="schedule-card"] {
    padding: 16px !important;
  }

  /* ScheduleDetailPage panels */
  .module-panel {
    padding: 0 !important;
  }

  /* Stop any component from overflowing horizontally */
  section, article, main, aside {
    overflow-x: hidden !important;
  }

  /* Stats cards in Consultant: 2-col, tight gap */
  .stats-grid {
    grid-template-columns: 1fr 1fr !important;
    gap: 10px !important;
  }

  .stats-grid > div {
    padding: 16px !important;
    border-radius: 14px !important;
  }

  .stats-grid > div > div:nth-child(2) {
    font-size: 24px !important;
  }

  /* User dashboard: cards fully stack */
  .dashboard-main > section,
  .dashboard-container > div > main {
    padding: 0 !important;
  }

  /* Cards that have explicit minmax */
  [style*="minmax(300px"] {
    grid-template-columns: 1fr !important;
  }

  [style*="minmax(340px"] {
    grid-template-columns: 1fr !important;
  }

  [style*="minmax(320px"] {
    grid-template-columns: 1fr !important;
  }

  /* Kiosk / Payment step cards */
  .kiosk-card, [class*="kiosk"] {
    padding: 16px !important;
    border-radius: 16px !important;
  }

  /* Daily summary / payment cards */
  [style*="minmax(200px"] {
    grid-template-columns: 1fr 1fr !important;
  }
}

/* ===== TABLET: 641px - 1023px ===== */
@media (min-width: 641px) and (max-width: 1023px) {
  .detail-grid {
    grid-template-columns: 1fr !important;
  }

  .meta-grid, .stats-grid {
    grid-template-columns: 1fr 1fr !important;
  }

  [style*="minmax(300px"] {
    grid-template-columns: repeat(2, 1fr) !important;
  }

  [style*="minmax(340px"] {
    grid-template-columns: 1fr !important;
  }

  tr { display: table-row !important; }
  td { display: table-cell !important; }
  thead { display: table-header-group !important; }
}
`;

fs.writeFileSync(cssPath, css + '\n' + cardResponsivePatch);
console.log('Successfully patched all page cards for mobile responsiveness!');
