import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const cssPath = path.resolve(__dirname, 'src/game/gameStyles.css');
let css = fs.readFileSync(cssPath, 'utf-8');

// The ultimate dark-to-light brinjal transformation
const replacements = [
  // Backgrounds:
  { from: /#07050f/gi, to: '#f5f0f9' },
  { from: /#0f172a/gi, to: '#f5f0f9' },
  { from: /#080514/gi, to: '#ffffff' },
  { from: /#0d0820/gi, to: '#ffffff' },
  { from: /#120929/gi, to: '#ffffff' },
  { from: /background:\s*linear-gradient\([^)]+20,10,35[^)]+\)/gi, to: 'background: #ffffff' },
  { from: /background:\s*linear-gradient\([^)]+30,15,55[^)]+\)/gi, to: 'background: #ffffff' },
  { from: /rgba\(20,\s*10,\s*35,\s*0\.9\)/gi, to: '#ffffff' },
  { from: /rgba\(30,\s*15,\s*50,\s*0\.7\)/gi, to: 'rgba(255,255,255,0.9)' },
  { from: /rgba\(20,\s*10,\s*40,\s*0\.[0-9]+\)/gi, to: '#ffffff' },
  { from: /rgba\(30,\s*15,\s*55,\s*0\.[0-9]+\)/gi, to: '#ffffff' },
  { from: /rgba\(40,\s*20,\s*70,\s*0\.[0-9]+\)/gi, to: '#ffffff' },
  { from: /rgba\(15,\s*23,\s*42,\s*0\.[0-9]+\)/gi, to: '#ffffff' },
  { from: /rgba\(7,\s*5,\s*15,/gi, to: 'rgba(245, 240, 249,' }, // Modals overlay
  
  // Text colors (White -> Dark Brinjal):
  { from: /#fff(?![a-zA-Z0-9])/gi, to: '#1a0a2e' },
  { from: /#ffffff(?![a-zA-Z0-9])/gi, to: '#1a0a2e' },
  { from: /color:\s*rgba\(255,\s*255,\s*255,\s*0\.35\)/gi, to: 'color: #8b7aa8' },
  { from: /color:\s*rgba\(255,\s*255,\s*255,\s*0\.4\)/gi, to: 'color: #8b7aa8' },
  { from: /color:\s*rgba\(255,\s*255,\s*255,\s*0\.45\)/gi, to: 'color: #5a4478' },
  { from: /color:\s*rgba\(255,\s*255,\s*255,\s*0\.55\)/gi, to: 'color: #5a4478' },
  { from: /color:\s*rgba\(255,\s*255,\s*255,\s*0\.7\)/gi, to: 'color: #1a0a2e' },
  { from: /color:\s*rgba\(255,\s*255,\s*255,\s*0\.75\)/gi, to: 'color: #1a0a2e' },
  { from: /rgba\(255,\s*255,\s*255,\s*0\.[0-9]+\)/gi, to: 'rgba(26, 10, 46, 0.6)' },
  { from: /color:\s*#e2d9f3/gi, to: 'color: #1a0a2e' },
  
  // Neon Purple Accents (#a855f7) -> Deep Brinjal (#6b1d6e) / Brinjal Light (#8b3a8e)
  { from: /#a855f7/gi, to: '#6b1d6e' },
  { from: /rgba\(168,\s*85,\s*247,/gi, to: 'rgba(107, 29, 110,' },
  
  // #6b1d6e (The deep purple used in gradients) is fine everywhere, it's exact brinjal.
  // #f47a20 is orange. Keep it.
  
  // Green success
  { from: /#4ade80/gi, to: '#16a34a' },
  { from: /rgba\(74,\s*222,\s*128,/gi, to: 'rgba(22, 163, 74,' },
  
  // Red error
  { from: /#f87171/gi, to: '#ef4444' },
  { from: /rgba\(248,\s*113,\s*113,/gi, to: 'rgba(239, 68, 68,' },
  
  // Misc borders
  { from: /border:\s*([0-9.]+)px solid rgba\(107,\s*29,\s*110,\s*0\.2\)/gi, to: 'border: $1px solid rgba(107, 29, 110, 0.1)' },
  { from: /border:\s*([0-9.]+)px solid #1e293b/gi, to: 'border: $1px solid rgba(107, 29, 110, 0.15)' },
  { from: /border-color:\s*#a855f7/gi, to: 'border-color: #6b1d6e' },
  
  // Shadows (Make them softer for light theme)
  { from: /box-shadow:\s*0 40px 100px rgba\(0,\s*0,\s*0,\s*0\.7\)/gi, to: 'box-shadow: 0 40px 100px rgba(74, 14, 78, 0.15)' },
  { from: /box-shadow:\s*([^;]+)rgba\(0,\s*0,\s*0,\s*0\.4\)/gi, to: 'box-shadow: $1rgba(74, 14, 78, 0.15)' },
];

replacements.forEach(({ from, to }) => {
  css = css.replace(from, to);
});

// Since we replaced the #fff text inside the active buttons back to dark, we need to explicitly make primary buttons have white text on dark background!
// Let's manually fix .game-play-btn.active-btn which should have color: #ffffff
css = css.replace(/\.game-play-btn\.active-btn\s*\{[^}]+\}/g, (match) => {
  return match.replace(/color:\s*#1a0a2e/gi, 'color: #ffffff');
});
css = css.replace(/\.arena-title\s*\{[^}]+\}/g, (match) => {
  return match.replace(/color:\s*#1a0a2e/gi, 'color: #1a0a2e');
});
css = css.replace(/\.quiz-game-score-badge\s*\{[^}]+\}/g, (match) => {
  return match.replace(/background:\s*linear-gradient\([^)]+\)/gi, 'background: rgba(244,122,32,0.1)');
});

fs.writeFileSync(cssPath, css);
console.log('SUCCESS: Converted gameArena.css to light brinjal theme');
