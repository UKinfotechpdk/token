const fs = require('fs');
const cssPath = 'C:\\Users\\LENOVO\\Downloads\\token_system_admin\\token_system_admin\\frontend\\src\\index.css';
let css = fs.readFileSync(cssPath, 'utf8');

const masterPatch = `
/* Final Premium Refinements: Light Glass Navbar & Bouncy Card Animations */
.top-header, header.hero-gradient {
  background: rgba(255, 255, 255, 0.85) !important; /* Beautiful pure frosted glass */
  backdrop-filter: blur(24px) !important;
  -webkit-backdrop-filter: blur(24px) !important;
  color: #0f172a !important; /* Dark text for contrast against light glass */
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05) !important;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05) !important;
}

/* Ensure text inside header is dark slate for readability */
.top-header h1, .top-header h2, .top-header span, .top-header p, .top-header div,
header.hero-gradient h1, header.hero-gradient h2, header.hero-gradient span, header.hero-gradient p, header.hero-gradient div {
  color: #0f172a !important;
}

/* Make header buttons look premium in light mode */
.top-header .btn-secondary, .top-header .sign-out-btn,
header.hero-gradient .btn-secondary, header.hero-gradient .logout-btn {
  background: white !important;
  color: #0f172a !important;
  border: 1px solid #e2e8f0 !important;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05) !important;
  font-weight: 800 !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

.top-header .btn-secondary:hover, .top-header .sign-out-btn:hover {
  background: #f8fafc !important;
  transform: translateY(-2px) !important;
  border-color: #cbd5e1 !important;
  box-shadow: 0 6px 16px rgba(0,0,0,0.08) !important;
}

/* --- Pronounced Card Hover Animations & Interactivity --- */
.dash-card, .glass-card, .card-analytics, .card-revenue, .card-alerts, .card-activity, .card-critical {
  transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) !important; /* Smooth bouncy spring */
}

/* Universal hover lift */
.dash-card:hover, .glass-card:hover, .card-analytics:hover, .card-revenue:hover, .card-alerts:hover, .card-activity:hover, .card-critical:hover {
  transform: translateY(-10px) scale(1.02) !important;
  z-index: 20 !important;
  cursor: pointer !important;
}

/* Add a very soft glowing ring on hover for plain cards */
.dash-card:hover:not(.card-analytics):not(.card-revenue):not(.card-alerts):not(.card-activity):not(.card-critical),
.glass-card:hover:not(.card-analytics):not(.card-revenue):not(.card-alerts):not(.card-activity):not(.card-critical) {
  box-shadow: 0 25px 50px -12px rgba(0,0,0,0.15), 0 0 0 2px rgba(59, 130, 246, 0.4) !important;
}

/* Boost the shadow strength for semantic colored cards */
.card-analytics:hover { box-shadow: 0 25px 50px -12px rgba(37, 99, 235, 0.5), 0 0 40px rgba(37,99,235,0.3) !important; }
.card-revenue:hover   { box-shadow: 0 25px 50px -12px rgba(16, 185, 129, 0.5), 0 0 40px rgba(16,185,129,0.3) !important; }
.card-alerts:hover    { box-shadow: 0 25px 50px -12px rgba(245, 158, 11, 0.5), 0 0 40px rgba(245,158,11,0.3) !important; }
.card-activity:hover  { box-shadow: 0 25px 50px -12px rgba(99, 102, 241, 0.5), 0 0 40px rgba(99,102,241,0.3) !important; }
.card-critical:hover  { box-shadow: 0 25px 50px -12px rgba(244, 63, 94, 0.5), 0 0 40px rgba(244,63,94,0.3) !important; }
`;

fs.writeFileSync(cssPath, css + '\n' + masterPatch);
console.log('Successfully patched Frost Header and Bouncy Cards CSS!');
