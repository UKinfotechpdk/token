const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, 'index.css');
let css = fs.readFileSync(cssPath, 'utf-8');

const newStyles = `/* Card Types */
.card-analytics, .card-revenue, .card-alerts, .card-activity, .card-critical {
  color: #ffffff !important;
  border: 1px solid rgba(255,255,255,0.2) !important;
  border-radius: var(--r-lg);
  padding: 24px;
  transition: all 0.3s cubic-bezier(0.25, 1, 0.5, 1);
  box-shadow: 0 4px 15px rgba(0,0,0,0.05);
  position: relative;
  overflow: hidden;
}

.card-analytics h1, .card-analytics h2, .card-analytics h3, .card-analytics p, .card-analytics span, .card-analytics div,
.card-revenue h1, .card-revenue h2, .card-revenue h3, .card-revenue p, .card-revenue span, .card-revenue div,
.card-alerts h1, .card-alerts h2, .card-alerts h3, .card-alerts p, .card-alerts span, .card-alerts div,
.card-activity h1, .card-activity h2, .card-activity h3, .card-activity p, .card-activity span, .card-activity div,
.card-critical h1, .card-critical h2, .card-critical h3, .card-critical p, .card-critical span, .card-critical div {
  color: #ffffff !important;
}

/* Primary Analytics -> Blue Gradient */
.card-analytics {
  background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%) !important;
}
.card-analytics:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(37, 99, 235, 0.4), 0 0 15px rgba(37, 99, 235, 0.3) !important;
}

/* Revenue / Growth -> Green Gradient */
.card-revenue, .card-success {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%) !important;
}
.card-revenue:hover, .card-success:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(16, 185, 129, 0.4), 0 0 15px rgba(16, 185, 129, 0.3) !important;
}

/* Alerts / Pending -> Amber Gradient */
.card-alerts, .card-warning {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%) !important;
}
.card-alerts:hover, .card-warning:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(245, 158, 11, 0.4), 0 0 15px rgba(245, 158, 11, 0.3) !important;
}

/* User Activity -> Indigo Gradient */
.card-activity, .card-info {
  background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%) !important;
}
.card-activity:hover, .card-info:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(99, 102, 241, 0.4), 0 0 15px rgba(99, 102, 241, 0.3) !important;
}

/* Errors / Critical -> Rose/Red Gradient */
.card-critical {
  background: linear-gradient(135deg, #f43f5e 0%, #e11d48 100%) !important;
}
.card-critical:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(244, 63, 94, 0.4), 0 0 15px rgba(244, 63, 94, 0.3) !important;
}

`;

if (css.includes('/* Card Types */')) {
  css = css.replace(/\/\* Card Types \*\/[\s\S]*?(?=\/\* Buttons \*\/)/, newStyles);
} else {
  css += newStyles;
}

fs.writeFileSync(cssPath, css);
console.log('Successfully patched index.css with Semantic Card Styles');
