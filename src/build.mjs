import fs from 'node:fs';
const mode = process.argv[2] || 'local';
const src = fs.readFileSync('site.src.html', 'utf8');
const data = fs.readFileSync('site-data.json', 'utf8');
let dial = fs.readFileSync('dial3d.js', 'utf8').replace(/^export function mountDial/m, 'function mountDial').replace(/^import .*$/mg, '');
dial = `async function loadDial() {\nconst THREE = await import('three');\nconst { RoomEnvironment } = await import('three/addons/environments/RoomEnvironment.js');\n${dial}\nreturn mountDial;\n}`;
const dial2d = fs.readFileSync('kalibr-dial.js', 'utf8').replace(/ — /g, ': ').replace(/—/g, '-');
const imgs = s => s.replace(/img\/(k-[a-z]+)\.jpg/g, (m, n) => 'data:image/jpeg;base64,' + fs.readFileSync('img/' + n + '.jpg').toString('base64'));
const L = mode === 'local';
const fam = L ? "'Geologica Variable'" : "'Geologica'";
dial = dial.replaceAll('"Geologica Variable"', L ? '"Geologica Variable"' : '"Geologica"');
const fonts = L ? '<link rel="stylesheet" href="node_modules/@fontsource-variable/geologica/wght.css">'
  : '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Geologica:wght@100..900&display=swap">';
const im = L ? { three: './node_modules/three/build/three.module.js', 'three/addons/': './node_modules/three/examples/jsm/' }
  : { three: 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js', 'three/addons/': 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/' };
const out = src.replace('%%FONTS%%', fonts).replace('%%FAMILY%%', fam)
  .replace('%%IMPORTMAP%%', `<script type="importmap">${JSON.stringify({ imports: im })}</script>`)
  .replace('%%DATA%%', () => data).replace('%%DIAL%%', () => dial).replace('%%DIAL2D%%', () => dial2d)
  .replace("await document.fonts.ready;", `await document.fonts.ready; await document.fonts.load('500 40px ${fam.replace(/'/g, '"')}');`);
const file = L ? 'site.html' : mode === 'github' ? '../index.html' : 'publish/kalibr.html';
let fin = imgs(out); if (mode === 'publish') { const head = fin.slice(fin.indexOf('<title>'), fin.indexOf('</head>')); const body = fin.slice(fin.indexOf('<body>') + 6, fin.lastIndexOf('</body>')); fin = head + body; }
fs.mkdirSync('publish', { recursive: true }); fs.mkdirSync('github', { recursive: true }); fs.writeFileSync(file, fin);
const left = out.match(/%%[A-Z]+%%/g); console.log(file, fin.length, 'незаменённых', left || 0, 'длинных тире', (fin.match(/—/g) || []).length);
