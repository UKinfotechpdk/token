const fs = require('fs');
const cssPath = 'C:\\Users\\LENOVO\\Downloads\\token_system_admin\\token_system_admin\\frontend\\src\\index.css';
let css = fs.readFileSync(cssPath, 'utf8');

const whiteFormPatch = `
/* =====================================================
   PURE WHITE FORM THEME (User Requested - Final Fix)
   Targets: Modal.jsx -> module-overlay, module-panel
   ===================================================== */

/* Dark blurred overlay when any modal is open */
.module-overlay {
  position: fixed !important;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(15, 23, 42, 0.5) !important;
  backdrop-filter: blur(10px) !important;
  -webkit-backdrop-filter: blur(10px) !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  z-index: 1000 !important;
  padding: 20px !important;
  box-sizing: border-box !important;
  animation: overlayFadeIn 0.2s ease !important;
}

@keyframes overlayFadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}

/* The white modal card */
.module-panel {
  background: #ffffff !important;
  border-radius: 24px !important;
  box-shadow: 0 32px 80px rgba(0, 0, 0, 0.15), 0 4px 20px rgba(0, 0, 0, 0.06) !important;
  border: 1px solid #f1f5f9 !important;
  width: 100% !important;
  max-width: var(--modal-max-width, 580px) !important;
  max-height: 90vh !important;
  overflow-y: auto !important;
  animation: modalSlideUp 0.28s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
}

@keyframes modalSlideUp {
  from { opacity: 0; transform: scale(0.94) translateY(20px); }
  to   { opacity: 1; transform: scale(1) translateY(0); }
}

/* Modal Header */
.module-panel-header {
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  padding: 24px 28px !important;
  border-bottom: 1px solid #f1f5f9 !important;
  background: #ffffff !important;
  border-radius: 24px 24px 0 0 !important;
  position: sticky !important;
  top: 0 !important;
  z-index: 1 !important;
}

.module-panel-header h2 {
  font-size: 20px !important;
  font-weight: 900 !important;
  color: #0f172a !important;
  margin: 0 !important;
  display: flex !important;
  align-items: center !important;
  gap: 10px !important;
}

.modal-header-actions {
  display: flex !important;
  align-items: center !important;
  gap: 8px !important;
}

/* Close button */
.modal-close {
  width: 34px !important;
  height: 34px !important;
  border-radius: 50% !important;
  border: none !important;
  background: #f1f5f9 !important;
  color: #64748b !important;
  font-size: 16px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  cursor: pointer !important;
  transition: all 0.2s ease !important;
  font-weight: 700 !important;
}

.modal-close:hover {
  background: #e2e8f0 !important;
  color: #0f172a !important;
  transform: scale(1.1) !important;
}

/* Modal Body */
.module-panel-body {
  padding: 24px 28px 28px !important;
  background: #ffffff !important;
  border-radius: 0 0 24px 24px !important;
}

/* --- All form inputs inside modals --- */
.module-panel input,
.module-panel select,
.module-panel textarea,
.module-panel .form-control {
  background: #f8fafc !important;
  border: 1.5px solid #e2e8f0 !important;
  border-radius: 12px !important;
  padding: 13px 16px !important;
  font-size: 15px !important;
  font-weight: 500 !important;
  color: #0f172a !important;
  width: 100% !important;
  box-sizing: border-box !important;
  transition: all 0.2s ease !important;
  outline: none !important;
}

.module-panel input:focus,
.module-panel select:focus,
.module-panel textarea:focus,
.module-panel .form-control:focus {
  border-color: #2563eb !important;
  background: #ffffff !important;
  box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.12) !important;
}

.module-panel input:hover:not(:focus),
.module-panel select:hover:not(:focus),
.module-panel textarea:hover:not(:focus) {
  border-color: #94a3b8 !important;
  background: #ffffff !important;
}

.module-panel label {
  font-size: 11px !important;
  font-weight: 800 !important;
  letter-spacing: 1px !important;
  text-transform: uppercase !important;
  color: #64748b !important;
  margin-bottom: 6px !important;
  display: block !important;
}

.module-panel textarea {
  resize: vertical !important;
  min-height: 90px !important;
  line-height: 1.6 !important;
}

/* Form group spacing inside modals */
.module-panel .form-group,
.module-panel-body > div > label + * {
  margin-bottom: 18px !important;
}

/* Modal footer actions row */
.module-panel-footer,
.module-panel-body .modal-actions,
.module-panel-body > div:last-child:has(button) {
  display: flex !important;
  gap: 12px !important;
  justify-content: flex-end !important;
  padding-top: 20px !important;
  border-top: 1px solid #f1f5f9 !important;
  margin-top: 20px !important;
}
`;

fs.writeFileSync(cssPath, css + '\n' + whiteFormPatch);
console.log('Successfully applied pure white form theme!');
