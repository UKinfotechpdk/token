const fs = require('fs');
const cssPath = 'C:\\Users\\LENOVO\\Downloads\\token_system_admin\\token_system_admin\\frontend\\src\\index.css';
let css = fs.readFileSync(cssPath, 'utf8');

const formPatch = `
/* =====================================================
   PREMIUM FORM & MODAL THEME (Responsive + Glassmorphic)
   ===================================================== */

/* --- Form Labels --- */
.form-group label,
label.form-label,
form label {
  display: block;
  font-size: 11px;
  font-weight: 800;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 1.2px;
  margin-bottom: 8px;
}

/* --- Base Input / Select / Textarea styling --- */
input, select, textarea,
.form-control,
input[type="text"],
input[type="email"],
input[type="password"],
input[type="number"],
input[type="tel"],
input[type="date"],
input[type="time"] {
  width: 100%;
  box-sizing: border-box;
  padding: 13px 16px !important;
  border-radius: 12px !important;
  border: 1.5px solid #e2e8f0 !important;
  background: #f8fafc !important;
  color: #0f172a !important;
  font-size: 15px !important;
  font-weight: 500 !important;
  outline: none !important;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease !important;
  font-family: inherit !important;
}

input::placeholder, textarea::placeholder {
  color: #94a3b8 !important;
  font-weight: 400 !important;
}

/* -- Focus glow for all inputs -- */
input:focus, select:focus, textarea:focus,
.form-control:focus {
  border-color: #2563eb !important;
  background: #ffffff !important;
  box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.12) !important;
}

/* Hover state */
input:hover:not(:focus), select:hover:not(:focus), textarea:hover:not(:focus) {
  border-color: #94a3b8 !important;
  background: #ffffff !important;
}

select {
  appearance: auto !important;
  cursor: pointer !important;
}

textarea {
  resize: vertical;
  min-height: 100px;
  line-height: 1.6 !important;
}

/* --- Form Groups --- */
.form-group, .form-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 20px;
}

/* --- Glass Modal Container --- */
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(15, 23, 42, 0.55) !important;
  backdrop-filter: blur(12px) !important;
  -webkit-backdrop-filter: blur(12px) !important;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeInOverlay 0.2s ease;
}

@keyframes fadeInOverlay {
  from { opacity: 0; }
  to   { opacity: 1; }
}

/* Modal Card / Content Box */
.modal, .modal-content, .modal-container, [class*="modal-box"], [class*="modal_content"] {
  background: rgba(255, 255, 255, 0.95) !important;
  backdrop-filter: blur(24px) !important;
  -webkit-backdrop-filter: blur(24px) !important;
  border: 1px solid rgba(255, 255, 255, 0.8) !important;
  border-radius: 24px !important;
  box-shadow: 0 32px 80px rgba(0, 0, 0, 0.18), 0 4px 16px rgba(0,0,0,0.06) !important;
  padding: 36px !important;
  width: 90% !important;
  max-width: 560px !important;
  animation: slideUpModal 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  overflow-y: auto;
  max-height: 90vh;
}

@keyframes slideUpModal {
  from { opacity: 0; transform: scale(0.94) translateY(24px); }
  to   { opacity: 1; transform: scale(1) translateY(0); }
}

/* Modal title */
.modal h2, .modal h3, .modal-content h2, .modal-content h3 {
  font-size: 22px !important;
  font-weight: 900 !important;
  color: #0f172a !important;
  margin: 0 0 24px 0 !important;
}

/* Modal close button */
.modal-close, button[aria-label="close"] {
  width: 36px !important;
  height: 36px !important;
  border-radius: 50% !important;
  background: #f1f5f9 !important;
  border: none !important;
  cursor: pointer !important;
  font-size: 18px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  transition: background 0.2s ease !important;
  color: #475569 !important;
}

.modal-close:hover, button[aria-label="close"]:hover {
  background: #e2e8f0 !important;
}

/* --- Responsive Form Grid helper --- */
@media (min-width: 640px) {
  .form-grid-2 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }
}

@media (max-width: 639px) {
  .modal, .modal-content, .modal-container {
    padding: 24px !important;
    border-radius: 20px !important;
    width: 95% !important;
  }
}
`;

fs.writeFileSync(cssPath, css + '\n' + formPatch);
console.log('Successfully patched premium form & modal CSS!');
