const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, 'index.css');
let css = fs.readFileSync(cssPath, 'utf-8');

// 1. Replace variables in :root
const rootRegex = /:root\s*\{([\s\S]*?)\}/;
const newRoot = `:root {
  --font: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;

  /* Radiant Light Super Theme (Premium Light Glass) */
  --primary: #3b82f6; 
  --primary-dark: #2563eb;
  --secondary: #ec4899;
  --accent: #8b5cf6;

  --bg-dark: #f8fafc;
  --bg-light: #ffffff;
  --bg-surface: rgba(255, 255, 255, 0.9);
  --bg-card: rgba(255, 255, 255, 0.75);

  --text-main: #0f172a;
  --text-muted: #475569;

  /* Elevated Glass */
  --glass-bg: rgba(255, 255, 255, 0.6);
  --glass-border: rgba(255, 255, 255, 1);
  --glass-blur: 24px;
  --shadow-sm: 0 4px 12px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 8px 24px rgba(0, 0, 0, 0.08);
  --shadow-lg: 0 16px 48px rgba(0, 0, 0, 0.12);
  --glow-shadow: 0 0 20px rgba(59, 130, 246, 0.2);

  /* Functional */
  --success: #10b981;
  --danger: #ef4444;
  --warning: #f59e0b;
  --info: #0ea5e9;

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
  --r-md: 16px;
  --r-lg: 24px;
  --r-xl: 32px;
  --r-full: 9999px;

  /* Premium Gradients */
  --grad-primary: linear-gradient(135deg, #3b82f6 0%, #2563eb 50%, #1d4ed8 100%);
  --grad-header: linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(248,250,252,0.95) 100%);
}`;
css = css.replace(rootRegex, newRoot);

// 2. Replace body
const bodyRegex = /body\s*\{([\s\S]*?)\}/;
const newBody = "body {\n  margin: 0;\n  font-family: var(--font);\n  -webkit-font-smoothing: antialiased;\n  -moz-osx-font-smoothing: grayscale;\n  background-color: #f8fafc;\n  color: var(--text-main);\n  min-height: 100vh;\n  position: relative;\n  overflow-x: hidden;\n}\n\n/* Super Animated Background - Light */\nbody::before, body::after {\n  content: \"\";\n  position: fixed;\n  top: 0;\n  left: 0;\n  width: 100vw;\n  height: 100vh;\n  z-index: -1;\n  pointer-events: none;\n}\n\nbody::before {\n  background: \n    radial-gradient(circle at 15% 50%, rgba(59, 130, 246, 0.15), transparent 50%),\n    radial-gradient(circle at 85% 30%, rgba(139, 92, 246, 0.15), transparent 50%),\n    radial-gradient(circle at 50% 80%, rgba(236, 72, 153, 0.15), transparent 50%);\n  animation: bg-pan 20s cubic-bezier(0.4, 0, 0.2, 1) infinite alternate;\n}\n\nbody::after {\n  background-image: url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%230f172a' fill-opacity='0.02'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\");\n  opacity: 1;\n}\n\n@keyframes bg-pan {\n  0% { transform: scale(1) translate(0, 0); }\n  50% { transform: scale(1.1) translate(1.5%, -1.5%); }\n  100% { transform: scale(1) translate(-1.5%, 1.5%); }\n}";
css = css.replace(bodyRegex, newBody);

// Reverting hardcoded dark values back to light reading
css = css.replace(/color:\s*var\(--slate-100\);/g, "color: var(--slate-800);");
css = css.replace(/color:\s*var\(--text-main\);/g, "color: var(--slate-900);");
css = css.replace(/color:\s*var\(--slate-300\);/g, "color: var(--slate-600);");
css = css.replace(/color:\s*white;/g, "color: var(--slate-900);");
css = css.replace(/color:\s*#ffffff;/g, "color: var(--slate-900);");

// The top header
css = css.replace(/\.top-header\s*\{([\s\S]*?)\}/, ".top-header {\n  background: var(--grad-header);\n  backdrop-filter: blur(30px);\n  -webkit-backdrop-filter: blur(30px);\n  color: var(--slate-900);\n  min-height: 72px;\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  padding: 10px 40px;\n  position: sticky;\n  top: 0;\n  z-index: 100;\n  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.05);\n  border-bottom: 1px solid rgba(0, 0, 0, 0.05);\n  transition: all 0.3s ease;\n}");

css = css.replace(/\.module-header\s*\{([\s\S]*?)\}/, ".module-header {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  margin-bottom: 24px;\n  background: var(--bg-surface);\n  padding: 20px 24px;\n  border-radius: var(--r-lg);\n  box-shadow: var(--shadow-sm);\n  border: 1px solid var(--glass-border);\n  backdrop-filter: blur(12px);\n}");

css += "\n/* GLOBAL FIX FOR TEXT VISIBILITY */\n* {\n  color: var(--slate-800);\n}\n.btn-primary, .btn-primary * {\n  color: #ffffff !important;\n}\n.badge {\n  color: inherit;\n}\n.badge-available { color: #065f46 !important; }\n.badge-booked { color: #075985 !important; }\n.badge-serving { color: #16a34a !important; }\ntable, th, td {\n  color: var(--slate-800) !important;\n  background-color: transparent !important;\n}\nth {\n  background-color: rgba(255,255,255,0.7) !important;\n  color: var(--slate-900) !important;\n}\ntr {\n  background-color: var(--bg-surface) !important;\n  border-bottom: 1px solid rgba(0,0,0,0.05) !important;\n}\n\n/* Ensure layout text is always readable */\nh1, h2, h3, h4, h5, h6, p, span, div, td {\n  color: inherit;\n}\n\n/* Fix cards explicitly */\n.dash-card, .glass-card {\n  background: var(--bg-card) !important;\n  color: var(--slate-900) !important;\n}\n.module-panel {\n  background: #ffffff !important;\n  color: var(--slate-900) !important;\n}\n.top-header *, .module-header * {\n  color: var(--slate-900);\n}\n";

fs.writeFileSync(cssPath, css);
console.log('Successfully patched index.css with Radiant Light Theme');
