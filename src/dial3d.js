// dial3d.js · КАЛИБР · циферблат в объёме: сталь корпуса, солнечный синий циферблат с направленной шлифовкой,
// накладные золотые индексы 24 сил, лучи восьми осей с метками на значениях, стрелки на двух сильнейших осях.
// Свет ходит за курсором и прокруткой; одно движение при открытии.
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const TAU = Math.PI * 2;
const ang = (i, n) => Math.PI / 2 - TAU * i / n;            // по часовой от 12 (в плоскости XY, Y вверх)
const axA = (i, n) => ang(i, n) - Math.PI / n;               // лучи между 12 и 6
const R0 = 0.26, R1 = 0.74;
const rOf = v => R0 + Math.max(0, Math.min(1, (v - 40) / 60)) * (R1 - R0);

function dialTexture(axes, nick, S = 2048) {
  const c = document.createElement('canvas'); c.width = c.height = S; const g = c.getContext('2d'), C = S / 2, k = S / 2;
  const grd = g.createRadialGradient(C, C * 0.86, 0, C, C, k);
  grd.addColorStop(0, '#1d4796'); grd.addColorStop(0.55, '#0f2c66'); grd.addColorStop(1, '#06132e');
  g.fillStyle = grd; g.fillRect(0, 0, S, S);
  g.save(); g.translate(C, C);
  for (let i = 0; i < 720; i++) { const a = TAU * i / 720; g.strokeStyle = `rgba(255,255,255,${i % 2 ? 0.012 : 0.03})`; g.lineWidth = 1.4;
    g.beginPath(); g.moveTo(Math.cos(a) * k * 0.04, Math.sin(a) * k * 0.04); g.lineTo(Math.cos(a) * k, Math.sin(a) * k); g.stroke(); }
  for (let i = 0; i < 14; i++) { g.strokeStyle = 'rgba(255,255,255,0.035)'; g.lineWidth = 1.2; g.beginPath(); g.arc(0, 0, k * (0.88 + i * 0.006), 0, TAU); g.stroke(); }
  // минутная дорожка
  for (let i = 0; i < 120; i++) { const a = TAU * i / 120 - Math.PI / 2, big = i % 10 === 0, mid = i % 5 === 0; const r1 = k * 0.985, r2 = k * (big ? 0.95 : mid ? 0.962 : 0.972);
    g.strokeStyle = `rgba(214,222,236,${big ? 0.85 : mid ? 0.5 : 0.28})`; g.lineWidth = big ? 4 : 2;
    g.beginPath(); g.moveTo(Math.cos(a) * r1, Math.sin(a) * r1); g.lineTo(Math.cos(a) * r2, Math.sin(a) * r2); g.stroke(); }
  // лучи осей и деления 50…100
  const n = axes.length;
  axes.forEach((ax, i) => { const t = -axA(i, n);           // в координатах холста y вниз
    g.strokeStyle = 'rgba(214,222,236,0.22)'; g.lineWidth = 2;
    g.beginPath(); g.moveTo(Math.cos(t) * k * (R0 - 0.04), Math.sin(t) * k * (R0 - 0.04)); g.lineTo(Math.cos(t) * k * (R1 + 0.02), Math.sin(t) * k * (R1 + 0.02)); g.stroke();
    for (const v of [50, 60, 70, 80, 90, 100]) { const r = rOf(v) * k, px = -Math.sin(t) * 9, py = Math.cos(t) * 9;
      g.strokeStyle = 'rgba(214,222,236,0.32)'; g.lineWidth = 2; g.beginPath(); g.moveTo(Math.cos(t) * r - px, Math.sin(t) * r - py); g.lineTo(Math.cos(t) * r + px, Math.sin(t) * r + py); g.stroke(); }
    // подпись по дуге
    const label = ax.name.toUpperCase(), low = Math.sin(t) > 0.05, rr = k * (low ? 0.83 : 0.80);
    g.save(); g.fillStyle = 'rgba(226,231,240,0.82)'; g.font = `500 ${S * 0.0185}px "Geologica Variable", sans-serif`;
    const chars = [...label], step = 0.031, total = (chars.length - 1) * step;
    chars.forEach((ch, j) => { const a = low ? t + total / 2 - j * step : t - total / 2 + j * step;
      g.save(); g.translate(Math.cos(a) * rr, Math.sin(a) * rr); g.rotate(low ? a - Math.PI / 2 : a + Math.PI / 2); g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(ch, 0, 0); g.restore(); });
    g.restore();
  });
  g.textAlign = 'center'; g.fillStyle = 'rgba(232,236,244,0.92)'; g.font = `500 ${S * 0.03}px "Geologica Variable", sans-serif`;
  g.save(); g.letterSpacing = `${S * 0.012}px`; g.fillText('КАЛИБР', 0, -k * 0.38); g.restore();
  g.fillStyle = 'rgba(215,190,130,0.9)'; g.font = `300 ${S * 0.021}px "Geologica Variable", sans-serif`; g.fillText(nick || '', 0, k * 0.42);
  g.restore();
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8; return tex;
}
// направление шлифовки: радиальное (солнечный узор): карта анизотропии: RG направление, B сила
function brushMap(S = 512) {
  const c = document.createElement('canvas'); c.width = c.height = S; const g = c.getContext('2d'), im = g.createImageData(S, S);
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) { const dx = x / S - 0.5, dy = 0.5 - y / S, a = Math.atan2(dy, dx), o = (y * S + x) * 4;
    im.data[o] = (Math.cos(a) * 0.5 + 0.5) * 255; im.data[o + 1] = (Math.sin(a) * 0.5 + 0.5) * 255; im.data[o + 2] = 255; im.data[o + 3] = 255; }
  g.putImageData(im, 0, 0); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.NoColorSpace; return t;
}
function dauphine(len, w, back) {
  const s = new THREE.Shape(); s.moveTo(0, len); s.lineTo(w, 0.06); s.lineTo(w * 0.55, -back); s.lineTo(-w * 0.55, -back); s.lineTo(-w, 0.06); s.closePath();
  const geo = new THREE.ExtrudeGeometry(s, { depth: 0.006, bevelEnabled: true, bevelThickness: 0.004, bevelSize: 0.004, bevelSegments: 2 });
  return geo;
}

export function mountDial(canvas, { axes, bars, nickname }, opt = {}) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05; renderer.outputColorSpace = THREE.SRGBColorSpace;
  const scene = new THREE.Scene();
  const pm = new THREE.PMREMGenerator(renderer); scene.environment = pm.fromScene(new RoomEnvironment(renderer), 0.03).texture;
  const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 50); camera.position.set(0, 0, 6.3);
  const watch = new THREE.Group(); scene.add(watch);

  // корпус: профиль безеля вращением
  const prof = [[0.995, -0.05], [1.04, -0.045], [1.085, -0.02], [1.1, 0.02], [1.095, 0.06], [1.075, 0.085], [1.04, 0.094], [1.012, 0.086], [1.0, 0.07]].map(([r, z]) => new THREE.Vector2(r, z));
  const steel = new THREE.MeshPhysicalMaterial({ color: 0x9ea8b8, metalness: 1, roughness: 0.34, anisotropy: 0.75, clearcoat: 0.3, clearcoatRoughness: 0.25 });
  const bezel = new THREE.Mesh(new THREE.LatheGeometry(prof, 200), steel); bezel.rotation.x = Math.PI / 2; watch.add(bezel);
  const crown = new THREE.Group();
  const knurl = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.085, 0.11, 40), new THREE.MeshPhysicalMaterial({ color: 0xa8b2c2, metalness: 1, roughness: 0.42 }));
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.08, 24), steel);
  knurl.rotation.z = stem.rotation.z = Math.PI / 2; knurl.position.x = 1.2; stem.position.x = 1.12; crown.add(stem, knurl); crown.position.z = 0.02; watch.add(crown);
  // внутренний скос: полированный
  const rehaut = new THREE.Mesh(new THREE.CylinderGeometry(1.005, 0.985, 0.05, 200, 1, true), new THREE.MeshPhysicalMaterial({ color: 0x9aa6ba, metalness: 1, roughness: 0.12, side: THREE.DoubleSide }));
  rehaut.rotation.x = Math.PI / 2; rehaut.position.z = 0.045; watch.add(rehaut);
  // циферблат с направленной шлифовкой
  const dialMat = new THREE.MeshPhysicalMaterial({ map: dialTexture(axes, nickname), metalness: 0.55, roughness: 0.34, anisotropy: 0.85, anisotropyMap: brushMap(), clearcoat: 0.35, clearcoatRoughness: 0.2 });
  const dial = new THREE.Mesh(new THREE.CircleGeometry(0.99, 200), dialMat); dial.position.z = 0.02; watch.add(dial);

  const gold = new THREE.MeshPhysicalMaterial({ color: 0xe2bf7a, metalness: 1, roughness: 0.18, clearcoat: 1, clearcoatRoughness: 0.08 });
  const lume = new THREE.MeshStandardMaterial({ color: 0xfff4d8, emissive: 0xffe9b5, emissiveIntensity: 0.55, roughness: 0.4 });
  // 24 силы: накладные индексы (открытые: золото по значению), закрытые: точка
  bars.forEach((b, i) => { const a = ang(i, bars.length) - Math.PI / bars.length;
    if (b.open) { const L = 0.035 + (b.value - 55) / 300, m = new THREE.Mesh(new THREE.BoxGeometry(0.022, L, 0.014), gold);
      const r = 0.905 - L / 2; m.position.set(Math.cos(a) * r, Math.sin(a) * r, 0.03); m.rotation.z = a - Math.PI / 2; watch.add(m); }
    else { const m = new THREE.Mesh(new THREE.SphereGeometry(0.009, 16, 12), steel); m.position.set(Math.cos(a) * 0.9, Math.sin(a) * 0.9, 0.027); watch.add(m); } });
  // метки осей и контур
  const n = axes.length, marks = axes.map(() => { const g = new THREE.Group(); const halo = new THREE.Mesh(new THREE.CircleGeometry(0.028, 32), new THREE.MeshBasicMaterial({ color: 0xe7c985, transparent: true, opacity: 0.18 }));
    const dot = new THREE.Mesh(new THREE.SphereGeometry(0.0145, 24, 16), lume); g.add(halo, dot); watch.add(g); return g; });
  const polyGeo = new THREE.BufferGeometry(); polyGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array((n + 1) * 3), 3));
  const poly = new THREE.Line(polyGeo, new THREE.LineBasicMaterial({ color: 0xe7c985, transparent: true, opacity: 0.9 })); watch.add(poly);
  const place = p => { const pos = polyGeo.attributes.position.array;
    axes.forEach((ax, i) => { const r = R0 + (rOf(ax.value) - R0) * p, t = axA(i, n), x = Math.cos(t) * r, y = Math.sin(t) * r; marks[i].position.set(x, y, 0.034); pos.set([x, y, 0.031], i * 3); });
    pos.set(pos.slice(0, 3), n * 3); polyGeo.attributes.position.needsUpdate = true; };
  // стрелки на две сильнейшие оси
  const order = axes.map((a, i) => [a.value, i]).sort((x, y) => y[0] - x[0]);
  const h1 = new THREE.Mesh(dauphine(0.5, 0.034, 0.1), gold), h2 = new THREE.Mesh(dauphine(0.68, 0.024, 0.13), gold);
  h1.position.z = 0.05; h2.position.z = 0.066; watch.add(h1, h2);
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.03, 48), gold); cap.rotation.x = Math.PI / 2; cap.position.z = 0.08; watch.add(cap);
  const target = i => axA(i, n) - Math.PI / 2;                 // поворот стрелки, смотрящей вверх, на ось i
  const t1 = target(order[0][1]), t2 = target(order[1][1]) - TAU;
  // стекло: блик
  const glass = new THREE.Mesh(new THREE.SphereGeometry(3.2, 96, 32, 0, TAU, 0, 0.32), new THREE.MeshPhysicalMaterial({ color: 0xffffff, metalness: 0, roughness: 0, transmission: 0, transparent: true, opacity: 0.12, clearcoat: 1, envMapIntensity: 1.6, depthWrite: false }));
  glass.rotation.x = Math.PI / 2; glass.position.z = 0.14 - 3.2 * Math.cos(0.32) + 0.0; glass.scale.setScalar(1); watch.add(glass);
  // свет, который ходит за курсором
  const key = new THREE.DirectionalLight(0xffffff, 2.2); key.position.set(-2, 2, 3); scene.add(key);
  const rim = new THREE.PointLight(0xffe2b0, 6, 8); rim.position.set(1.6, -1.2, 1.4); scene.add(rim);

  let mx = opt.mx ?? 0.2, my = opt.my ?? -0.15, tilt = { x: opt.tx ?? -0.28, y: opt.ty ?? 0.32 };
  window.addEventListener('pointermove', e => { mx = e.clientX / innerWidth - 0.5; my = e.clientY / innerHeight - 0.5; }, { passive: true });
  const resize = () => { const w = canvas.clientWidth, h = canvas.clientHeight; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); };
  resize(); window.addEventListener('resize', resize);
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const spring = t => 1 - Math.cos(t * Math.PI * 2.2) * Math.exp(-5.2 * t), ease = t => 1 - Math.pow(1 - t, 3);
  const manual = !!window.__kdManual; let vt = 0;
  const t0 = (manual ? 0 : performance.now()) + (opt.delay ?? 400);
  const state = { scroll: 0, visible: true };
  function frame(now) {
    if (state.visible === false && !manual) { requestAnimationFrame(frame); return; }
    const t = reduce ? 1 : Math.max(0, Math.min(1, (now - t0) / 2200));
    place(ease(Math.min(1, t / 0.75)));
    const s = reduce ? 1 : spring(t); h1.rotation.z = t1 * s; h2.rotation.z = t2 * s;
    // наклон: открытие → к курсору; прокрутка выпрямляет и уводит
    const intro = ease(t); tilt.x += (((opt.tx ?? -0.28) + my * 0.22) * (1 - state.scroll) - tilt.x) * 0.06; tilt.y += (((opt.ty ?? 0.32) + mx * 0.3) * (1 - state.scroll) - tilt.y) * 0.06;
    watch.rotation.set(tilt.x, tilt.y, 0); watch.position.y = -0.1 * (1 - intro);
    watch.scale.setScalar(0.92 + 0.08 * intro);
    key.position.set(-2 + mx * 5, 2 - my * 4, 3);
    renderer.render(scene, camera);
    if (!manual) requestAnimationFrame(frame);
  }
  if (manual) window.__kdStep = (ms, x, y) => { vt += ms; if (x != null) { mx = x; my = y; } frame(vt); }; else requestAnimationFrame(frame);
  return { state, renderer };
}
