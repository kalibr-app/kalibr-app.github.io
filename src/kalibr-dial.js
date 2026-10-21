// kalibr-dial.js · 18.10.2026 · циферблат калибра: в часовом деле калибр — механизм, сердце часов.
// Восемь осей силы — лучи с меткой на значении человека; 24 силы — накладные индексы по кругу (открытые — золото);
// две стрелки показывают две сильнейшие оси. Движение одно, при открытии: стрелки встают на место, метки выходят по лучам.
(function () {
  const NS = 'http://www.w3.org/2000/svg', C = 320;
  const esc = t => String(t ?? '').replace(/[<>&"]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c]));
  const ang = (i, n) => -Math.PI / 2 + 2 * Math.PI * i / n;
  const axA = (i, n) => ang(i, n) + Math.PI / n;               // лучи между 12 и 6 — там надпись калибра и имя
  const at = (a, r) => [C + Math.cos(a) * r, C + Math.sin(a) * r];
  const f = x => x.toFixed(2);
  const R0 = 72, R1 = 222;                                   // луч оси: от центра к ободу
  const rOf = v => R0 + Math.max(0, Math.min(1, (v - 40) / 60)) * (R1 - R0);   // шкала луча 40…100

  function svg(axes, bars, nickname) {
    const n = axes.length;
    const sun = Array.from({ length: 240 }, (_, i) => { const a = ang(i, 240), [x1, y1] = at(a, 18), [x2, y2] = at(a, 268);
      return `<line x1="${f(x1)}" y1="${f(y1)}" x2="${f(x2)}" y2="${f(y2)}" stroke="#fff" stroke-opacity="${i % 2 ? .018 : .045}" stroke-width="1.2"/>`; }).join('');
    const guil = Array.from({ length: 12 }, (_, i) => `<circle cx="${C}" cy="${C}" r="${236 + i * 2.6}" fill="none" stroke="#fff" stroke-opacity=".035" stroke-width=".8"/>`).join('');
    const track = Array.from({ length: 120 }, (_, i) => { const a = ang(i, 120), big = i % 10 === 0, mid = i % 5 === 0, [x1, y1] = at(a, 296), [x2, y2] = at(a, big ? 282 : mid ? 286 : 290);
      return `<line x1="${f(x1)}" y1="${f(y1)}" x2="${f(x2)}" y2="${f(y2)}" stroke="#C9D3E6" stroke-opacity="${big ? .8 : mid ? .45 : .22}" stroke-width="${big ? 1.6 : 1}"/>`; }).join('');
    const idx = bars.map((b, i) => { const a = ang(i, bars.length) + Math.PI / bars.length, len = b.open ? 8 + (b.value - 55) / 3 : 0, [x1, y1] = at(a, 272), [x2, y2] = at(a, 272 - len);
      return b.open
        ? `<g class="kd-ix"><title>${esc(b.skill)} ${b.value}</title><line x1="${f(x1)}" y1="${f(y1)}" x2="${f(x2)}" y2="${f(y2)}" stroke="url(#kdGold)" stroke-width="5.2" stroke-linecap="round"/><line x1="${f(x1)}" y1="${f(y1)}" x2="${f(x2)}" y2="${f(y2)}" stroke="#FFF6DD" stroke-opacity=".55" stroke-width="1.1" stroke-linecap="round"/></g>`
        : `<g class="kd-ix"><title>${esc(b.skill)}</title><circle cx="${f(x1 + (C - x1) * .03)}" cy="${f(y1 + (C - y1) * .03)}" r="2.2" fill="#8EA0C4" fill-opacity=".55"/></g>`; }).join('');
    const rays = axes.map((a, i) => { const t = axA(i, n), [x1, y1] = at(t, R0 - 10), [x2, y2] = at(t, R1 + 6);
      const ticks = [50, 60, 70, 80, 90, 100].map(v => { const r = rOf(v), [p, q] = at(t, r), [u, w] = at(t + Math.PI / 2, 3.2); const dx = u - C, dy = w - C;
        return `<line x1="${f(p - dx)}" y1="${f(q - dy)}" x2="${f(p + dx)}" y2="${f(q + dy)}" stroke="#C9D3E6" stroke-opacity=".35" stroke-width=".9"/>`; }).join('');
      const low = Math.sin(t) > 0.05, r = low ? 257 : 246, w = 0.42, [sx, sy] = at(low ? t + w : t - w, r), [ex, ey] = at(low ? t - w : t + w, r);
      return `<line x1="${f(x1)}" y1="${f(y1)}" x2="${f(x2)}" y2="${f(y2)}" stroke="#C9D3E6" stroke-opacity=".28" stroke-width=".9"/>${ticks}
        <path id="kdArc${i}" d="M ${f(sx)} ${f(sy)} A ${r} ${r} 0 0 ${low ? 0 : 1} ${f(ex)} ${f(ey)}" fill="none"/>
        <text class="kd-ax"><textPath href="#kdArc${i}" startOffset="50%" text-anchor="middle">${esc(a.name)}</textPath></text>`; }).join('');
    const marks = axes.map((a, i) => `<g class="kd-m" data-i="${i}"><circle r="9" fill="#E7C985" fill-opacity=".16"/><circle r="4.6" fill="#FBF3DC" stroke="#C8A35B" stroke-width="1.4"/>
        <text class="kd-v" dy="-14" text-anchor="middle">${a.value}</text></g>`).join('');
    const hand = (cls, len, w) => `<g class="kd-hand ${cls}"><path d="M ${C - w} ${C + 22} L ${C} ${C - len} L ${C + w} ${C + 22} Z" fill="url(#kdHand)"/>
        <path d="M ${C} ${C + 22} L ${C} ${C - len}" stroke="#FFF6DD" stroke-opacity=".7" stroke-width=".9"/></g>`;
    return `<svg class="kdial" viewBox="0 0 640 640" role="img" aria-label="Калибр: восемь осей силы и двадцать четыре силы">
      <defs>
        <radialGradient id="kdDial" cx="50%" cy="42%" r="62%"><stop offset="0" stop-color="#1B3F86"/><stop offset=".55" stop-color="#0F2A61"/><stop offset="1" stop-color="#071634"/></radialGradient>
        <linearGradient id="kdBezel" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#5B6F96"/><stop offset=".35" stop-color="#1A2B4E"/><stop offset=".6" stop-color="#0C1832"/><stop offset="1" stop-color="#4A5D85"/></linearGradient>
        <linearGradient id="kdGold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F6E3AE"/><stop offset=".5" stop-color="#C8A35B"/><stop offset="1" stop-color="#8E6C2E"/></linearGradient>
        <linearGradient id="kdHand" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#9C7838"/><stop offset=".5" stop-color="#F3DDA2"/><stop offset="1" stop-color="#B38D45"/></linearGradient>
        <linearGradient id="kdGlass" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".10"/><stop offset=".45" stop-color="#fff" stop-opacity="0"/></linearGradient>
        <filter id="kdGlow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3"/></filter>
        <filter id="kdShadow" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="6" stdDeviation="6" flood-color="#000" flood-opacity=".45"/></filter>
        <clipPath id="kdClip"><circle cx="${C}" cy="${C}" r="268"/></clipPath>
      </defs>
      <circle cx="${C}" cy="${C}" r="318" fill="url(#kdBezel)"/>
      <circle cx="${C}" cy="${C}" r="317" fill="none" stroke="#9FB2D6" stroke-opacity=".35" stroke-width="1"/>
      <circle cx="${C}" cy="${C}" r="304" fill="#0A1838"/><circle cx="${C}" cy="${C}" r="303" fill="none" stroke="#000" stroke-opacity=".5" stroke-width="2"/>
      <g>${track}</g>
      <circle cx="${C}" cy="${C}" r="270" fill="url(#kdDial)"/>
      <g clip-path="url(#kdClip)" class="kd-sun">${sun}${guil}</g>
      <g>${idx}</g>
      <g class="kd-rays">${rays}</g>
      <path class="kd-poly" fill="#E7C985" fill-opacity=".07" stroke="#E7C985" stroke-opacity=".85" stroke-width="1.3" stroke-linejoin="round"/>
      <g class="kd-marks">${marks}</g>
      <text class="kd-brand" x="${C}" y="${C - 70}" text-anchor="middle">КАЛИБР</text>
      <text class="kd-model" x="${C}" y="${C + 84}" text-anchor="middle">${esc(nickname || '')}</text>
      <g filter="url(#kdShadow)">${hand('h2', 196, 4.2)}${hand('h1', 150, 6.5)}</g>
      <circle cx="${C}" cy="${C}" r="11" fill="url(#kdGold)" filter="url(#kdShadow)"/><circle cx="${C}" cy="${C}" r="3.4" fill="#0A1838"/>
      <circle cx="${C}" cy="${C}" r="270" fill="url(#kdGlass)" pointer-events="none"/>
    </svg>`;
  }

  // одно движение: стрелки с двенадцати встают на две сильнейшие оси (с лёгким перелётом), метки выходят по лучам
  function mount(el, { axes, bars, nickname }) {
    el.innerHTML = svg(axes, bars, nickname);
    const root = el.querySelector('svg'), n = axes.length, poly = root.querySelector('.kd-poly');
    const marks = [...root.querySelectorAll('.kd-m')], h1 = root.querySelector('.h1'), h2 = root.querySelector('.h2');
    const order = axes.map((a, i) => [a.value, i]).sort((a, b) => b[0] - a[0]);
    const deg = i => i * 360 / n + 180 / n;                                             // стрелка смотрит вверх: поворот на угол оси
    const target1 = deg(order[0][1]), target2 = deg(order[1][1]);
    const place = p => {
      const pts = axes.map((a, i) => { const r = R0 + (rOf(a.value) - R0) * p, [x, y] = at(axA(i, n), r); marks[i].setAttribute('transform', `translate(${f(x)} ${f(y)})`); return `${f(x)},${f(y)}`; });
      poly.setAttribute('d', 'M ' + pts.join(' L ') + ' Z');
    };
    const spring = t => 1 - Math.cos(t * Math.PI * 2.2) * Math.exp(-5.2 * t);   // перелёт и успокоение, как у стрелки хронографа
    const ease = t => 1 - Math.pow(1 - t, 3);
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const set = (a1, a2) => { h1.setAttribute('transform', `rotate(${f(a1)} ${C} ${C})`); h2.setAttribute('transform', `rotate(${f(a2)} ${C} ${C})`); };
    if (reduce) { place(1); set(target1, target2); root.classList.add('kd-on'); return; }
    place(0); set(0, 0);
    const t0 = performance.now() + 350;
    const step = now => {
      const t = Math.max(0, (now - t0) / 1900);
      place(ease(Math.min(1, t / .8)));
      const s = spring(Math.min(1, t));
      set(target1 * s, (target2 + 360) * s);                                   // длинная стрелка делает полный оборот и встаёт
      if (t < 1) requestAnimationFrame(step); else { place(1); set(target1, target2 + 360); }
    };
    root.classList.add('kd-on');
    requestAnimationFrame(step);
  }
  window.KDial = { mount };
})();
