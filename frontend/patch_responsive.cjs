const fs = require('fs');
const cssPath = 'C:\\Users\\LENOVO\\Downloads\\token_system_admin\\token_system_admin\\frontend\\src\\index.css';
let css = fs.readFileSync(cssPath, 'utf8');

const responsivePatch = `
/* =====================================================
   FULL RESPONSIVE LAYOUT (Mobile-First System)
   Breakpoints: 480px | 640px | 768px | 1024px
   ===================================================== */

/* --- Base Responsive Container --- */
#root, .app-container {
  width: 100% !important;
  overflow-x: hidden !important;
}

/* --- Cards Grid: Responsive on all screens --- */
.cards-grid {
  display: grid !important;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)) !important;
  gap: 20px !important;
}

/* --- Module Panel: Fully Responsive Modals --- */
.module-overlay {
  padding: 16px !important;
  align-items: flex-end !important; /* Slide up from bottom on mobile */
}

.module-panel {
  width: 100% !important;
  max-width: var(--modal-max-width, 580px) !important;
  border-radius: 20px !important;
  max-height: 92vh !important;
  overflow-y: auto !important;
}

.module-panel-header {
  padding: 20px 22px !important;
}

.module-panel-body {
  padding: 20px 22px 24px !important;
}

/* --- Forms inside modals: Responsive grids --- */
.module-panel .form-row,
.module-panel .form-grid,
.module-panel [style*="display: flex"]:has(input) {
  flex-wrap: wrap !important;
}

/* --- Stats Grid in consultant portal --- */
.stats-grid {
  display: grid !important;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)) !important;
  gap: 14px !important;
}

/* --- Data Table: Horizontal scroll on small screens--- */
.table-responsive {
  overflow-x: auto !important;
  -webkit-overflow-scrolling: touch !important;
  border-radius: 12px !important;
}

table {
  min-width: 600px !important;
}

/* --- Dashboard welcome banner --- */
.welcome-banner {
  flex-direction: row !important;
  flex-wrap: wrap !important;
  gap: 16px !important;
}

/* --- Toolbar / List Headers --- */
.module-toolbar, .list-toolbar, .branch-toolbar, .staff-toolbar {
  flex-wrap: wrap !important;
  gap: 12px !important;
}

/* -------------------------------------------------- 
   MOBILE: Max 640px 
   -------------------------------------------------- */
@media (max-width: 640px) {
  /* App padding */
  .main-content {
    padding: 16px !important;
  }

  /* Header brand: smaller text */
  .admin-header-brand h1, .admin-header-brand .title {
    font-size: 1rem !important;
  }

  /* Cards: full width on mobile */
  .cards-grid {
    grid-template-columns: 1fr !important;
    gap: 14px !important;
  }

  .dash-card {
    padding: 20px !important;
  }

  /* Stats chips in consultant: 2-col */
  .stats-grid {
    grid-template-columns: 1fr 1fr !important;
  }

  /* Welcome section stacks vertically */
  .welcome-banner {
    flex-direction: column !important;
    align-items: flex-start !important;
  }

  .welcome-banner h2 {
    font-size: 1.5rem !important;
  }

  /* Modal appears as bottom sheet */
  .module-overlay {
    align-items: flex-end !important;
    padding: 0 !important;
  }

  .module-panel {
    border-radius: 24px 24px 0 0 !important;
    max-height: 88vh !important;
    max-width: 100% !important;
    animation: slideUpMobile 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
  }

  @keyframes slideUpMobile {
    from { transform: translateY(100%); opacity: 0; }
    to   { transform: translateY(0); opacity: 1; }
  }

  /* Forms inside modals stack full-width */
  .module-panel .form-row,
  .module-panel [class*="grid"],
  .module-panel > div > div {
    flex-direction: column !important;
  }

  .module-panel input,
  .module-panel select,
  .module-panel textarea {
    width: 100% !important;
    font-size: 16px !important; /* Prevents iOS zoom on input focus */
  }

  /* Buttons in modals */
  .module-panel-body .btn,
  .module-panel .modal-actions .btn {
    width: 100% !important;
    justify-content: center !important;
  }

  /* Data table: scrollable on mobile */
  table {
    font-size: 13px !important;
  }

  th, td {
    padding: 10px 8px !important;
  }

  /* Toolbar: stack vertically */
  .module-toolbar, .list-toolbar {
    flex-direction: column !important;
  }

  .module-toolbar input[type="text"],
  .list-toolbar input[type="search"],
  .module-toolbar select,
  .list-toolbar select {
    width: 100% !important;
  }

  /* Dashboard title */
  h1 { font-size: 1.6rem !important; }
  h2 { font-size: 1.3rem !important; }

  /* Branch / Staff list cards on mobile */
  .branch-row, .staff-row, .list-row, tr {
    font-size: 13px !important;
  }

  /* Card action row */
  .card-action {
    margin-top: 16px !important;
  }
}

/* --------------------------------------------------
   TABLET: 641px to 1023px
   -------------------------------------------------- */
@media (min-width: 641px) and (max-width: 1023px) {
  .main-content {
    padding: 24px !important;
  }

  .cards-grid {
    grid-template-columns: repeat(2, 1fr) !important;
    gap: 18px !important;
  }

  .module-panel {
    max-width: min(93%, 580px) !important;
    border-radius: 20px !important;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr) !important;
  }
}

/* --------------------------------------------------
   DESKTOP: 1024px+
   -------------------------------------------------- */
@media (min-width: 1024px) {
  .module-overlay {
    align-items: center !important;
  }

  .module-panel {
    border-radius: 24px !important;
  }

  .cards-grid {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)) !important;
  }

  .stats-grid {
    grid-template-columns: repeat(4, 1fr) !important;
  }
}
`;

fs.writeFileSync(cssPath, css + '\n' + responsivePatch);
console.log('Successfully applied full responsive layout CSS!');
