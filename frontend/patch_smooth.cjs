const fs = require('fs');
const cssPath = 'C:\\Users\\LENOVO\\Downloads\\token_system_admin\\token_system_admin\\frontend\\src\\index.css';
let css = fs.readFileSync(cssPath, 'utf8');

const smoothPatch = `
/* --- Ultra-Smooth Elegant Hover Animations (Liquid Fluidity Fix) --- */
.dash-card, .glass-card, .card-analytics, .card-revenue, .card-alerts, .card-activity, .card-critical {
  /* Only animate transform and box-shadow to prevent layout thrashing */
  transition: transform 0.6s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) !important; 
  will-change: transform, box-shadow; /* Hardware GPU acceleration hint */
}

/* Elegant, buttery smooth hover lift (Less jumpy, extremely smooth) */
.dash-card:hover, .glass-card:hover, .card-analytics:hover, .card-revenue:hover, .card-alerts:hover, .card-activity:hover, .card-critical:hover {
  transform: translateY(-6px) scale(1.01) !important;
  z-index: 20 !important;
  cursor: pointer !important;
}

/* Soft glowing shadow on hover for plain cards */
.dash-card:hover:not(.card-analytics):not(.card-revenue):not(.card-alerts):not(.card-activity):not(.card-critical),
.glass-card:hover:not(.card-analytics):not(.card-revenue):not(.card-alerts):not(.card-activity):not(.card-critical) {
  box-shadow: 0 20px 40px -8px rgba(0,0,0,0.1), 0 0 0 1px rgba(255, 255, 255, 0.6) !important;
}

/* Elegant shadow boost for semantic colored cards */
.card-analytics:hover { box-shadow: 0 20px 40px -8px rgba(37, 99, 235, 0.4), 0 0 30px rgba(37, 99, 235, 0.2) !important; }
.card-revenue:hover   { box-shadow: 0 20px 40px -8px rgba(16, 185, 129, 0.4), 0 0 30px rgba(16, 185, 129, 0.2) !important; }
.card-alerts:hover    { box-shadow: 0 20px 40px -8px rgba(245, 158, 11, 0.4), 0 0 30px rgba(245, 158, 11, 0.2) !important; }
.card-activity:hover  { box-shadow: 0 20px 40px -8px rgba(99, 102, 241, 0.4), 0 0 30px rgba(99, 102, 241, 0.2) !important; }
.card-critical:hover  { box-shadow: 0 20px 40px -8px rgba(244, 63, 94, 0.4), 0 0 30px rgba(244, 63, 94, 0.2) !important; }
`;

fs.writeFileSync(cssPath, css + '\n' + smoothPatch);
console.log('Successfully patched Liquid Smooth Animations!');
