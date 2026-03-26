const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, 'index.css');
let css = fs.readFileSync(cssPath, 'utf-8');

// Replace variables in :root
const rootRegex = /:root\s*\{([\s\S]*?)\}/;
const newRoot = `:root {
  --font: 'Inter', system-ui, -apple-system, sans-serif;

  /* Premium SaaS Colors */
  --primary: #2563eb; 
  --primary-dark: #1e40af;
  --secondary: #10b981;
  --accent-1: #6366f1;
  --accent-2: #f43f5e;
  --accent-3: #f59e0b;
  --accent-teal: #14b8a6;

  /* Backgrounds */
  --bg-dark: #0f172a;
  --bg-light: #ffffff;
  --bg-surface: rgba(255, 255, 255, 0.85);
  --bg-card: rgba(255, 255, 255, 0.7);
  --bg-input: #f1f5f9;

  /* Typography */
  --text-main: #1e293b;
  --text-muted: #64748b;

  /* Elevated Glass */
  --glass-bg: rgba(255, 255, 255, 0.7);
  --glass-border: rgba(255, 255, 255, 0.4);
  --glass-blur: 16px;
  
  /* Soft Shadows */
  --shadow-sm: 0 4px 12px rgba(37, 99, 235, 0.05);
  --shadow-md: 0 10px 30px rgba(37, 99, 235, 0.08);
  --shadow-lg: 0 20px 40px rgba(37, 99, 235, 0.12);
  --glow-primary: 0 0 15px rgba(37, 99, 235, 0.3);

  /* Functional */
  --success: #10b981;
  --danger: #ef4444;
  --warning: #f59e0b;
  --info: #3b82f6;

  /* Neutrals */
  --slate-50: #f8fafc;
  --slate-100: #f1f5f9;
  --slate-200: #e2e8f0;
  --slate-300: #cbd5e1;
  --slate-400: #94a3b8;
  --slate-500: #64748b;
  --slate-600: #475569;
  --slate-700: #334155;
  --slate-800: #1e293b;
  --slate-900: #0f172a;

  /* Radius */
  --r-sm: 10px;
  --r-md: 14px;
  --r-lg: 20px;
  --r-xl: 24px;
  --r-full: 9999px;

  /* Button Gradients */
  --grad-primary: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  --grad-success: linear-gradient(135deg, #10b981 0%, #059669 100%);
  --grad-danger: linear-gradient(135deg, #f43f5e 0%, #e11d48 100%);
  
  /* Card Gradients */
  --card-analytics: linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(224, 231, 255, 0.6) 100%);
  --card-success: linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(209, 250, 229, 0.6) 100%);
  --card-warning: linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(254, 243, 199, 0.6) 100%);
  --card-info: linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(237, 233, 254, 0.6) 100%);
}`;
css = css.replace(rootRegex, newRoot);

// Replace body
const bodyRegex = /body\s*\{([\s\S]*?)\}/;
const newBody = "body {\n  margin: 0;\n  font-family: var(--font);\n  -webkit-font-smoothing: antialiased;\n  -moz-osx-font-smoothing: grayscale;\n  background: linear-gradient(135deg, #f8fafc, #e0e7ff, #f0fdfa);\n  color: var(--text-main);\n  min-height: 100vh;\n  position: relative;\n  overflow-x: hidden;\n  background-attachment: fixed;\n}\n\n/* Subtle Radial Glow Lights */\nbody::before, body::after {\n  content: \"\";\n  position: fixed;\n  width: 600px;\n  height: 600px;\n  border-radius: 50%;\n  filter: blur(100px);\n  z-index: -1;\n  pointer-events: none;\n  opacity: 0.6;\n}\n\nbody::before {\n  top: -200px;\n  left: -200px;\n  background: rgba(37, 99, 235, 0.15); /* Soft blue glow */\n  animation: float-glow 15s ease-in-out infinite alternate;\n}\n\nbody::after {\n  bottom: -200px;\n  right: -200px;\n  background: rgba(99, 102, 241, 0.15); /* Purple/Indigo glow */\n  animation: float-glow 20s ease-in-out infinite alternate-reverse;\n}\n\n@keyframes float-glow {\n  0% { transform: translate(0, 0) scale(1); }\n  100% { transform: translate(50px, 50px) scale(1.1); }\n}";
css = css.replace(bodyRegex, newBody);

css += "\n/* ====================================\n   SaaS Premium Overrides\n   ==================================== */\n\n/* Glass Cards and Modals */\n.dash-card, .glass-card, .module-panel {\n  background: var(--bg-card) !important;\n  backdrop-filter: blur(var(--glass-blur));\n  -webkit-backdrop-filter: blur(var(--glass-blur));\n  border: 1px solid var(--glass-border) !important;\n  border-radius: var(--r-lg);\n  box-shadow: var(--shadow-md);\n  transition: all 0.3s cubic-bezier(0.25, 1, 0.5, 1);\n  color: var(--text-main);\n}\n\n.dash-card:hover, .glass-card:hover {\n  transform: translateY(-4px);\n  box-shadow: var(--shadow-lg), 0 0 15px rgba(255,255,255,0.5);\n  border-color: rgba(255,255,255,0.8) !important;\n}\n\n/* Card Types */\n.card-analytics { background: var(--card-analytics) !important; }\n.card-success { background: var(--card-success) !important; }\n.card-warning { background: var(--card-warning) !important; }\n.card-info { background: var(--card-info) !important; }\n\n/* Buttons */\n.btn-primary {\n  background: var(--grad-primary) !important;\n  color: white !important;\n  border: none !important;\n  border-radius: var(--r-md) !important;\n  box-shadow: 0 4px 10px rgba(37, 99, 235, 0.2) !important;\n  transition: all 0.3s ease !important;\n}\n\n.btn-primary:hover {\n  box-shadow: var(--glow-primary), 0 6px 15px rgba(37, 99, 235, 0.4) !important;\n  transform: translateY(-2px) !important;\n  background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%) !important;\n}\n\n/* Form Inputs */\ninput, select, textarea, .search-input {\n  background: var(--bg-input) !important;\n  border: 1px solid rgba(0,0,0,0.05) !important;\n  border-radius: var(--r-md) !important;\n  padding: 12px 16px !important;\n  transition: all 0.2s ease !important;\n  color: var(--text-main) !important;\n}\n\ninput:focus, select:focus, textarea:focus, .search-input:focus {\n  background: #ffffff !important;\n  border-color: var(--primary) !important;\n  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15), var(--glow-primary) !important;\n  outline: none !important;\n}\n\n.input-error {\n  border-color: var(--danger) !important;\n  animation: shake 0.4s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;\n}\n\n/* Headers / Nav */\n.top-header {\n  background: rgba(255, 255, 255, 0.7) !important;\n  backdrop-filter: blur(20px) !important;\n  -webkit-backdrop-filter: blur(20px) !important;\n  color: var(--slate-900) !important;\n  border-bottom: 1px solid var(--glass-border) !important;\n  box-shadow: var(--shadow-sm) !important;\n}\n\n.top-header h1, .top-header h2, .top-header h3, .top-header span, .top-header div {\n  color: var(--slate-900) !important;\n}\n\n/* Tables */\ntable, th, td {\n  color: var(--text-main) !important;\n  border-collapse: collapse !important;\n}\nth {\n  background-color: rgba(255,255,255,0.6) !important;\n  color: var(--slate-700) !important;\n  font-weight: 600 !important;\n  backdrop-filter: blur(10px) !important;\n}\ntr {\n  background-color: transparent !important;\n  border-bottom: 1px solid rgba(0,0,0,0.05) !important;\n  transition: background 0.2s ease !important;\n}\ntr:hover {\n  background-color: rgba(255,255,255,0.5) !important;\n}\n";

fs.writeFileSync(cssPath, css);
console.log('Successfully patched index.css with SaaS Premium Theme');
