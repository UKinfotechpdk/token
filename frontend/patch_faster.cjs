const fs = require('fs');
const cssPath = 'C:\\Users\\LENOVO\\Downloads\\token_system_admin\\token_system_admin\\frontend\\src\\index.css';
let css = fs.readFileSync(cssPath, 'utf8');

const fastPatch = `
/* User Requested V-Fast Hover Animations (0.2s) */
.dash-card, .glass-card, .card-analytics, .card-revenue, .card-alerts, .card-activity, .card-critical {
  transition: transform 0.22s ease-out, box-shadow 0.22s ease-out !important; 
}
`;

fs.writeFileSync(cssPath, css + '\n' + fastPatch);
console.log('Successfully patched 0.2s Animations!');
