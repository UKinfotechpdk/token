const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, 'index.css');
let css = fs.readFileSync(cssPath, 'utf-8');

// 1. Replace variables in :root
const rootRegex = /:root\s*\{([\s\S]*?)\}/;
const newRoot = `:root {
  --font: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;

  /* Midnight Aurora Super Theme (Premium Dark) */
  --primary: #3b82f6;
  --primary-dark: #2563eb;
  --secondary: #ec4899;
  --accent: #8b5cf6;

  --bg-dark: #020617;
  --bg-light: rgba(15, 23, 42, 0.7);
  --bg-surface: #0f172a;
  --bg-card: rgba(15, 23, 42, 0.65);

  --text-main: #f8fafc;
  --text-muted: #94a3b8;

  /* Elevated Glass */
  --glass-bg: rgba(15, 23, 42, 0.65);
  --glass-border: rgba(255, 255, 255, 0.1);
  --glass-blur: 24px;
  --shadow-sm: 0 4px 12px rgba(0, 0, 0, 0.3);
  --shadow-md: 0 8px 24px rgba(0, 0, 0, 0.4);
  --shadow-lg: 0 16px 48px rgba(0, 0, 0, 0.5);
  --glow-shadow: 0 0 20px rgba(59, 130, 246, 0.15);

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
  --grad-success: linear-gradient(135deg, #10b981 0%, #059669 100%);
  --grad-warning: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  --grad-info: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
  --grad-purple: linear-gradient(135deg, #a855f7 0%, #7e22ce 100%);
  --grad-rose: linear-gradient(135deg, #f43f5e 0%, #e11d48 100%);
  --grad-header: linear-gradient(135deg, rgba(2, 6, 23, 0.7) 0%, rgba(15, 23, 42, 0.8) 100%);
}`;
css = css.replace(rootRegex, newRoot);

// 2. Replace body styles to have dynamic animated background
const bodyRegex = /body\s*\{([\s\S]*?)\}/;
const newBody = `body {
  margin: 0;
  font-family: var(--font);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: var(--bg-dark);
  color: var(--text-main);
  min-height: 100vh;
  position: relative;
  overflow-x: hidden;
}

/* Super Animated Background */
body::before, body::after {
  content: "";
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: -1;
  pointer-events: none;
}

body::before {
  background: 
    radial-gradient(circle at 15% 50%, rgba(59, 130, 246, 0.12), transparent 45%),
    radial-gradient(circle at 85% 30%, rgba(139, 92, 246, 0.12), transparent 45%),
    radial-gradient(circle at 50% 80%, rgba(236, 72, 153, 0.1), transparent 45%);
  animation: bg-pan 20s cubic-bezier(0.4, 0, 0.2, 1) infinite alternate;
}

body::after {
  background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.02'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
  opacity: 0.6;
}

@keyframes bg-pan {
  0% { transform: scale(1) translate(0, 0); }
  50% { transform: scale(1.1) translate(1.5%, -1.5%); }
  100% { transform: scale(1) translate(-1.5%, 1.5%); }
}`;
css = css.replace(bodyRegex, newBody);

// 3. Fix colors and hardcoded values for dark mode layout
// Convert white backgrounds to glass surface or bg-surface
css = css.replace(/background:\s*white;/g, 'background: var(--bg-surface);');
css = css.replace(/background-color:\s*white;/g, 'background-color: var(--bg-surface);');
css = css.replace(/background:\s*#ffffff;/g, 'background: var(--bg-surface);');
css = css.replace(/background-color:\s*#ffffff;/g, 'background-color: var(--bg-surface);');
css = css.replace(/background:\s*#fff;/gi, 'background: var(--bg-surface);');
css = css.replace(/background-color:\s*#fff;/gi, 'background-color: var(--bg-surface);');

// Change text color in headers and cards if they are forcing dark colors
css = css.replace(/color:\s*var\(--slate-800\);/g, 'color: var(--slate-100);');
css = css.replace(/color:\s*var\(--slate-900\);/g, 'color: var(--text-main);');
css = css.replace(/color:\s*var\(--slate-600\);/g, 'color: var(--slate-300);');
css = css.replace(/border: 1px solid var\(--slate-100\);/g, 'border: 1px solid var(--glass-border);');
css = css.replace(/border: 1px solid var\(--slate-200\);/g, 'border: 1px solid var(--glass-border);');
css = css.replace(/border-color: var\(--slate-200\);/g, 'border-color: var(--glass-border);');

// Enhance .dash-card
css = css.replace(/\.dash-card\s*\{([\s\S]*?)\}/, `.dash-card {
  position: relative;
  padding: 28px;
  border-radius: var(--r-lg);
  cursor: pointer;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 200px;
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  background: var(--bg-card);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  border: 1px solid var(--glass-border);
  box-shadow: var(--shadow-md);
  animation: cardFadeIn 0.5s ease both;
}`);

// Enhance Glass Hover
css = css.replace(/\.glass-hover:hover\s*\{([\s\S]*?)\}/, `.glass-hover:hover {
  background: rgba(30, 41, 59, 0.8);
  transform: translateY(-6px);
  box-shadow: var(--glow-shadow), 0 20px 40px rgba(0, 0, 0, 0.5);
  border-color: rgba(59, 130, 246, 0.3);
}`);

// Replace hero gradient
css = css.replace(/\.hero-gradient\s*\{([\s\S]*?)\}/, `.hero-gradient {
  background: var(--grad-header);
  color: white;
  position: relative;
  overflow: hidden;
  border: 1px solid var(--glass-border);
  backdrop-filter: blur(20px);
}`);

// Make sure top-header handles dark mode
css = css.replace(/\.top-header\s*\{([\s\S]*?)\}/, `.top-header {
  background: rgba(2, 6, 23, 0.7);
  backdrop-filter: blur(30px);
  -webkit-backdrop-filter: blur(30px);
  color: white;
  min-height: 72px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 40px;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.4);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  transition: all 0.3s ease;
}`);

// Make sure body content stretches properly
css += `
/* Force root block background reset */
#root {
  background-color: transparent !important;
}
`;

// Write back
fs.writeFileSync(cssPath, css);
console.log('Successfully patched index.css with Super Theme');
