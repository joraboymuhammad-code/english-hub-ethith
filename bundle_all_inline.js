const fs = require('fs');
const vm = require('vm');

console.log('=== BUNDLING ALL SCRIPTS & STYLES INLINE ===');

let html = fs.existsSync('index.clean_template.html') ? fs.readFileSync('index.clean_template.html', 'utf8') : fs.readFileSync('index.html', 'utf8');

// Strip existing inlined blocks if present
html = html.replace(/<style id="ethith-custom-styles">[\s\S]*?<\/style>\s*/g, '');
html = html.replace(/<script id="ethith-core-bundle">[\s\S]*?<\/script>\s*/g, '');

// Also strip external tags
html = html.replace(/<link rel="stylesheet" href="ethith_styles\.css">\s*/g, '');
html = html.replace(/<script src="data_assets\.js"><\/script>\s*/g, '');
html = html.replace(/<script src="ethith_quiz_engine\.js"><\/script>\s*/g, '');
html = html.replace(/<script src="ethith_sync\.js"><\/script>\s*/g, '');
html = html.replace(/<script src="ethith_ai\.js"><\/script>\s*/g, '');
html = html.replace(/<script src="ethith_app\.js"><\/script>\s*/g, '');
html = html.replace(/<script src="ethith_views\.js"><\/script>\s*/g, '');
html = html.replace(/<script src="ethith_workbook\.js"><\/script>\s*/g, '');

const pahoContent = fs.readFileSync('paho-mqtt.min.js', 'utf8');
const xlsxContent = fs.readFileSync('xlsx.full.min.js', 'utf8');
const chartContent = fs.readFileSync('chart.umd.min.js', 'utf8');
const html2canvasContent = fs.existsSync('html2canvas.min.js') ? fs.readFileSync('html2canvas.min.js', 'utf8') : '';
const cssContent = fs.readFileSync('ethith_styles.css', 'utf8');
const dataAssetsContent = fs.readFileSync('data_assets.js', 'utf8');
const boosterEngineContent = fs.readFileSync('ethith_booster_engine.js', 'utf8');
const navigateCurriculumContent = fs.readFileSync('navigate_curriculum.js', 'utf8');
const quizEngineContent = fs.readFileSync('ethith_quiz_engine.js', 'utf8');
const syncContent = fs.readFileSync('ethith_sync.js', 'utf8');
const aiContent = fs.readFileSync('ethith_ai.js', 'utf8');
const appContent = fs.readFileSync('ethith_app.js', 'utf8');
const navigateViewsContent = fs.readFileSync('navigate_views.js', 'utf8');
const viewsContent = fs.readFileSync('ethith_views.js', 'utf8');
const testsDataContent = fs.existsSync('ethith_curriculum_tests_data.js') ? fs.readFileSync('ethith_curriculum_tests_data.js', 'utf8') : '';
const workbookContent = fs.readFileSync('ethith_workbook.js', 'utf8');
const attendanceContent = fs.readFileSync('ethith_attendance.js', 'utf8');
const enterpriseContent = fs.readFileSync('ethith_enterprise.js', 'utf8');
const chatContent = fs.readFileSync('ethith_chat.js', 'utf8');
const pdfContent = fs.readFileSync('pdf.min.js', 'utf8');

const verObj = JSON.parse(fs.readFileSync('version.json', 'utf8'));
const buildVersionScript = `window.ETHITH_BUILD_VERSION = ${JSON.stringify(verObj.version)};`;
const storeObj = JSON.parse(fs.readFileSync('shared_store.json', 'utf8'));
const initialStoreScript = `window.ETHITH_INITIAL_STORE = ${JSON.stringify(storeObj)};`;

// Standardize primary teacher account
if (fs.existsSync('shared_store.json')) {
  try {
    const store = JSON.parse(fs.readFileSync('shared_store.json', 'utf8'));
    if (Array.isArray(store.accounts)) {
      // Ensure admin root account exists
      if (!store.accounts.some(a => a && a.id === 'admin_official_root')) {
        store.accounts.push({
          id: 'admin_official_root',
          name: 'Bosh Admin',
          email: 'admin_12038f1aq8syash@ethith.uz',
          role: 'admin'
        });
      }
      // Ensure Ustoz (admin_official_teacher) account exists
      if (!store.accounts.some(a => a && a.id === 'admin_official_teacher')) {
        store.accounts.push({
          id: 'admin_official_teacher',
          name: 'Ustoz',
          login: 'ustoz77',
          password: 'ustoz2026',
          email: 'ustoz77@ethith.uz',
          role: 'teacher',
          teacherId: 'admin_official_teacher',
          subject: 'Ingliz tili',
          salarySharePercent: 50
        });
      }
      fs.writeFileSync('shared_store.json', JSON.stringify(store, null, 2), 'utf8');
      console.log('✓ Standardized primary teacher account in shared_store.json');
    }
  } catch (e) {
    console.warn('Warning updating shared_store.json:', e.message);
  }
}

const combinedJs = [
  buildVersionScript,
  initialStoreScript,
  html2canvasContent,
  pahoContent,
  xlsxContent,
  chartContent,
  dataAssetsContent,
  boosterEngineContent,
  navigateCurriculumContent,
  quizEngineContent,
  syncContent,
  aiContent,
  appContent,
  navigateViewsContent,
  viewsContent,
  workbookContent,
  attendanceContent,
  pdfContent,
  enterpriseContent,
  chatContent
].join('\n\n');

// Syntax validation
try {
  new vm.Script(combinedJs);
  console.log('✓ Combined JS bundle is 100% SYNTAX VALID!');
} catch (err) {
  console.error('Syntax error in combined JS:', err.message);
  process.exit(1);
}

const inlineCss = '\n<style id="ethith-custom-styles">\n' + cssContent + '\n</style>\n';
const inlineJs = '\n<script id="ethith-core-bundle">\n' + combinedJs + '\n</script>\n';

// Ensure CSP allows wss: and ws:
html = html.replace(/connect-src\s+[^;"]+;/, 'connect-src * data: blob: https: wss: ws:;');

// Strip existing cache-control meta tags if present
html = html.replace(/<meta http-equiv="(Cache-Control|Pragma|Expires)"[^>]*>\s*/gi, '');

const cacheMeta = '\n<meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate" />\n<meta http-equiv="Pragma" content="no-cache" />\n<meta http-equiv="Expires" content="0" />\n';

let insertPos = html.indexOf('</head>\n<body>');
if (insertPos === -1) {
  insertPos = html.lastIndexOf('</head>');
}
if (insertPos === -1) {
  insertPos = html.indexOf('<div id="landing">');
}
if (insertPos === -1) {
  insertPos = html.indexOf('<div id="app"');
}
if (insertPos === -1) {
  console.error('Neither </head> nor <div id="landing"> found in index.html');
  process.exit(1);
}

html = html.slice(0, insertPos) + cacheMeta + inlineCss + inlineJs + html.slice(insertPos);

// Unbreakable safeguard: Validate ALL inline script tags in final HTML before writing to disk
const scriptRegex = /<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi;
let match;
let scriptIdx = 0;
while ((match = scriptRegex.exec(html)) !== null) {
  const code = match[1].trim();
  if (!code) continue;
  try {
    new vm.Script(code);
    scriptIdx++;
  } catch (err) {
    console.error(`❌ FATAL: Syntax error in script #${scriptIdx} of final index.html:`, err.message);
    process.exit(1);
  }
}
console.log(`✓ All ${scriptIdx} inline scripts in final index.html validated and 100% SYNTAX VALID!`);

fs.writeFileSync('index.html', html, 'utf8');
console.log('✓ Successfully wrote self-contained index.html! New size:', html.length, 'bytes');
