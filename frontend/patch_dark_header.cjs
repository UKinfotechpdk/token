const fs = require('fs');
const cssPath = 'C:\\Users\\LENOVO\\Downloads\\token_system_admin\\token_system_admin\\frontend\\src\\index.css';
let css = fs.readFileSync(cssPath, 'utf8');

const newHeaderCss = `
/* Dark Premium Navbar Override (Final Fix) */
.top-header, header.hero-gradient {
  background: #0f172a !important; /* Extremely sleek dark slate */
  color: #ffffff !important;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15) !important;
  border-bottom: 1px solid rgba(255,255,255,0.05) !important;
}

/* Ensure all text inside the header becomes pure white */
.top-header h1, .top-header h2, .top-header span, .top-header p, .top-header div,
header.hero-gradient h1, header.hero-gradient h2, header.hero-gradient span, header.hero-gradient p, header.hero-gradient div {
  color: #ffffff !important;
}

/* Make header buttons translucent white glass instead of standard secondary */
.top-header .btn-secondary, .top-header .sign-out-btn,
header.hero-gradient .btn-secondary, header.hero-gradient .logout-btn {
  background: rgba(255, 255, 255, 0.1) !important;
  color: #ffffff !important;
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
  backdrop-filter: blur(10px) !important;
}

.top-header .btn-secondary:hover, .top-header .sign-out-btn:hover {
  background: rgba(255, 255, 255, 0.2) !important;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.2) !important;
}
`;

fs.writeFileSync(cssPath, css + '\n' + newHeaderCss);
console.log('Successfully patched Dark Slate navbar CSS!');
