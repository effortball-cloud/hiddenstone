/* =========================================================
 * HIDDENSTONE — 일러스트 가이드 ("How to Play")
 *
 * 바둑은 알지만 이 게임은 처음인 사람(특히 해외 바둑 유저)을 대상으로
 * 각 규칙을 SVG 미니 보드 그림과 함께 설명한다.
 * 그림은 게임 내 렌더러(js/ui.js)와 같은 시각 언어를 쓴다:
 *   베이스 = 소용돌이 무늬 / 히든 = 청록 점선 링 / ±화점 = 다이아몬드
 *
 * 문구는 전부 i18n 키(guide.*)로 관리 → 언어 전환 시 다시 렌더한다.
 * ========================================================= */
(function (global) {
  'use strict';

  const t = (k, p) => global.HSI18n.t(k, p);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* 게임 내 렌더러와 동일한 색 */
  const C = {
    bg0: '#efe3bd', bg1: '#e7d6a8', bg2: '#dcc890',
    grid: '#5d4a28', label: '#6b5836', edge: 'rgba(70,50,20,0.55)',
    plus: '#c8571f', plusHi: '#eb8b45',
    minus: '#3e6285', minusHi: '#628cb2',
    hidden: '#38b6ff', last: '#e14b3b',
    swirlB: 'rgba(64,199,190,0.95)', swirlW: 'rgba(196,57,43,0.9)',
    terrB: 'rgba(20,20,20,0.72)', terrW: 'rgba(255,255,255,0.92)',
  };

  let uid = 0;   // 그라디언트 id 충돌 방지

  /* 베이스 돌의 소용돌이 무늬 (ui.js의 _drawSwirl과 같은 곡선) */
  function swirlPath(cx, cy, r) {
    const turns = 2.4 * Math.PI;
    let d = '';
    for (let a = 0; a <= turns; a += 0.15) {
      const rr = (a / turns) * r * 0.62;
      const px = cx + rr * Math.cos(a), py = cy + rr * Math.sin(a);
      d += (a === 0 ? 'M' : 'L') + px.toFixed(1) + ' ' + py.toFixed(1);
    }
    return d;
  }

  /* ---------------------------------------------------------
   * 미니 보드 SVG
   *  size   : 줄 수 (예: 7)
   *  cell   : 한 칸 픽셀
   *  coords : 좌표 라벨 표시
   *  stones : [{x,y,c:'b'|'w', base, hidden, ghost, dead}]
   *  marks  : [{x,y,k:'plus'|'minus'|'scan'|'last'|'gone'}]
   *  terr   : [{x,y,c:'b'|'w'}]      계가 시 집 표시
   *  notes  : [{x,y,text,c}]         떠 있는 점수 라벨
   * --------------------------------------------------------- */
  function board(o) {
    const size = o.size || 7;
    const cell = o.cell || 32;
    const coords = !!o.coords;
    const m = coords ? cell * 1.15 : cell * 0.72;   // 여백
    const W = cell * (size - 1) + m * 2;
    const id = 'g' + (++uid);
    const px = (x) => (m + x * cell);
    const py = (y) => (m + y * cell);
    const r = cell * 0.45;
    const s = [];

    s.push(`<svg class="g-board" viewBox="0 0 ${W.toFixed(1)} ${W.toFixed(1)}" width="${W.toFixed(0)}" height="${W.toFixed(0)}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">`);
    s.push('<defs>');
    s.push(`<linearGradient id="${id}bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${C.bg0}"/><stop offset="0.5" stop-color="${C.bg1}"/><stop offset="1" stop-color="${C.bg2}"/></linearGradient>`);
    s.push(`<radialGradient id="${id}b" cx="33%" cy="30%" r="78%">
      <stop offset="0" stop-color="#5a5a5e"/><stop offset="0.5" stop-color="#1c1c20"/><stop offset="1" stop-color="#000"/></radialGradient>`);
    s.push(`<radialGradient id="${id}w" cx="33%" cy="30%" r="78%">
      <stop offset="0" stop-color="#fff"/><stop offset="0.6" stop-color="#f0efe9"/><stop offset="1" stop-color="#c9c6ba"/></radialGradient>`);
    s.push('</defs>');

    // 판
    s.push(`<rect x="1" y="1" width="${(W - 2).toFixed(1)}" height="${(W - 2).toFixed(1)}" rx="7" fill="url(#${id}bg)" stroke="${C.edge}" stroke-width="1.5"/>`);

    // 격자
    s.push(`<g stroke="${C.grid}" stroke-width="1">`);
    for (let i = 0; i < size; i++) {
      s.push(`<line x1="${px(0)}" y1="${py(i)}" x2="${px(size - 1)}" y2="${py(i)}"/>`);
      s.push(`<line x1="${px(i)}" y1="${py(0)}" x2="${px(i)}" y2="${py(size - 1)}"/>`);
    }
    s.push('</g>');
    s.push(`<rect x="${px(0)}" y="${py(0)}" width="${cell * (size - 1)}" height="${cell * (size - 1)}" fill="none" stroke="${C.grid}" stroke-width="1.8"/>`);

    // 좌표 라벨 (국제 표기: I 건너뜀 / 아래가 1)
    if (coords) {
      const LT = 'ABCDEFGHJKLMNOPQRSTUVWXYZ';
      s.push(`<g fill="${C.label}" font-size="${(cell * 0.36).toFixed(1)}" font-weight="600" text-anchor="middle" font-family="'Segoe UI',sans-serif">`);
      for (let x = 0; x < size; x++) s.push(`<text x="${px(x)}" y="${(py(0) - cell * 0.5).toFixed(1)}">${LT[x]}</text>`);
      for (let y = 0; y < size; y++) s.push(`<text x="${(px(0) - cell * 0.6).toFixed(1)}" y="${(py(y) + cell * 0.13).toFixed(1)}">${size - y}</text>`);
      s.push('</g>');
    }

    // 집 표시
    (o.terr || []).forEach((v) => {
      const w = cell * 0.24;
      s.push(`<rect x="${(px(v.x) - w / 2).toFixed(1)}" y="${(py(v.y) - w / 2).toFixed(1)}" width="${w.toFixed(1)}" height="${w.toFixed(1)}" fill="${v.c === 'b' ? C.terrB : C.terrW}" stroke="rgba(60,45,20,0.6)" stroke-width="1"/>`);
    });

    // ± 화점 / 스캔 / 소멸 표시
    (o.marks || []).forEach((v) => {
      const cx = px(v.x), cy = py(v.y);
      if (v.k === 'plus' || v.k === 'minus') {
        const isP = v.k === 'plus';
        const rr = cell * 0.34;
        s.push(`<defs><linearGradient id="${id}d${v.x}${v.y}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="${isP ? C.plusHi : C.minusHi}"/><stop offset="1" stop-color="${isP ? C.plus : C.minus}"/></linearGradient></defs>`);
        s.push(`<polygon points="${cx},${cy - rr} ${cx + rr},${cy} ${cx},${cy + rr} ${cx - rr},${cy}" fill="url(#${id}d${v.x}${v.y})" stroke="rgba(50,30,10,0.45)" stroke-width="1"/>`);
        s.push(`<text x="${cx}" y="${(cy + cell * 0.14).toFixed(1)}" fill="#fff" font-size="${(cell * 0.42).toFixed(1)}" font-weight="800" text-anchor="middle" font-family="'Segoe UI',sans-serif">${isP ? '+' : '−'}</text>`);
      } else if (v.k === 'gone') {   // 소멸한 화점 자리
        const rr = cell * 0.32;
        s.push(`<polygon points="${cx},${cy - rr} ${cx + rr},${cy} ${cx},${cy + rr} ${cx - rr},${cy}" fill="none" stroke="rgba(90,70,35,0.45)" stroke-width="1.5" stroke-dasharray="3 3"/>`);
      } else if (v.k === 'scan') {   // 스캔 조준
        const rr = cell * 0.44;
        s.push(`<g stroke="#1f8fde" stroke-width="2.2" fill="none">
          <circle cx="${cx}" cy="${cy}" r="${(rr * 0.95).toFixed(1)}"/>
          <line x1="${cx - rr * 1.5}" y1="${cy}" x2="${cx - rr * 0.6}" y2="${cy}"/>
          <line x1="${cx + rr * 0.6}" y1="${cy}" x2="${cx + rr * 1.5}" y2="${cy}"/>
          <line x1="${cx}" y1="${cy - rr * 1.5}" x2="${cx}" y2="${cy - rr * 0.6}"/>
          <line x1="${cx}" y1="${cy + rr * 0.6}" x2="${cx}" y2="${cy + rr * 1.5}"/></g>`);
      }
    });

    // 돌
    (o.stones || []).forEach((v) => {
      const cx = px(v.x), cy = py(v.y);
      const op = v.ghost ? 0.42 : (v.hidden ? 0.62 : 1);
      s.push(`<g opacity="${op}">`);
      if (!v.ghost) s.push(`<circle cx="${(cx + r * 0.08).toFixed(1)}" cy="${(cy + r * 0.13).toFixed(1)}" r="${r.toFixed(1)}" fill="rgba(40,25,5,0.33)"/>`);
      s.push(`<circle cx="${cx}" cy="${cy}" r="${r.toFixed(1)}" fill="url(#${id}${v.c})" stroke="${v.c === 'b' ? 'rgba(0,0,0,0.8)' : 'rgba(120,115,100,0.8)'}" stroke-width="1"/>`);
      if (v.base) s.push(`<path d="${swirlPath(cx, cy, r)}" fill="none" stroke="${v.c === 'b' ? C.swirlB : C.swirlW}" stroke-width="${Math.max(1.4, r * 0.14).toFixed(1)}" stroke-linecap="round"/>`);
      if (v.hidden) s.push(`<circle cx="${cx}" cy="${cy}" r="${(r + 2.5).toFixed(1)}" fill="none" stroke="${C.hidden}" stroke-width="2" stroke-dasharray="4 3"/>`);
      s.push('</g>');
      if (v.dead) {
        const q = r * 0.62;
        s.push(`<g stroke="${C.last}" stroke-width="2.6" stroke-linecap="round">
          <line x1="${cx - q}" y1="${cy - q}" x2="${cx + q}" y2="${cy + q}"/>
          <line x1="${cx + q}" y1="${cy - q}" x2="${cx - q}" y2="${cy + q}"/></g>`);
      }
    });

    // 떠 있는 라벨(획득 점수 등)
    (o.notes || []).forEach((v) => {
      const cx = px(v.x), cy = py(v.y);
      const w = cell * 1.28, h = cell * 0.62;
      s.push(`<g><rect x="${(cx - w / 2).toFixed(1)}" y="${(cy - h / 2).toFixed(1)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}" rx="${(h / 2).toFixed(1)}" fill="${v.c || '#2c9755'}" stroke="rgba(0,0,0,0.35)" stroke-width="1"/>
        <text x="${cx}" y="${(cy + cell * 0.15).toFixed(1)}" fill="#fff" font-size="${(cell * 0.42).toFixed(1)}" font-weight="800" text-anchor="middle" font-family="'Segoe UI',sans-serif">${esc(v.text)}</text></g>`);
    });

    s.push('</svg>');
    return s.join('');
  }

  /* ---------------- 레이아웃 조각 ---------------- */
  const panel = (label, inner) =>
    `<div class="g-panel">${label ? `<div class="g-plabel">${esc(label)}</div>` : ''}${inner}</div>`;
  const arrow = () => '<div class="g-arrow" aria-hidden="true">→</div>';
  const row = (...parts) => `<div class="g-row">${parts.join('')}</div>`;
  const cap = (key) => `<p class="g-cap">${esc(t(key))}</p>`;

  /* ---------------- 그림 1: 이 게임이 뭔가 ---------------- */
  function figWhat() {
    const plain = board({
      size: 7, cell: 30,
      stones: [
        { x: 2, y: 2, c: 'b' }, { x: 3, y: 3, c: 'w' }, { x: 4, y: 2, c: 'b' },
        { x: 2, y: 4, c: 'w' }, { x: 4, y: 4, c: 'b' }, { x: 3, y: 1, c: 'w' },
      ],
    });
    const ours = board({
      size: 7, cell: 30,
      marks: [{ x: 3, y: 0, k: 'plus' }, { x: 1, y: 5, k: 'minus' }, { x: 5, y: 1, k: 'minus' }],
      stones: [
        { x: 2, y: 2, c: 'b', base: true }, { x: 3, y: 3, c: 'w' }, { x: 4, y: 2, c: 'b' },
        { x: 2, y: 4, c: 'w', base: true }, { x: 4, y: 4, c: 'b' }, { x: 3, y: 1, c: 'w' },
        { x: 5, y: 4, c: 'b', hidden: true },
      ],
    });
    return row(panel(t('guide.what.panelGo'), plain), panel(t('guide.what.panelHs'), ours)) + cap('guide.what.cap');
  }

  /* ---------------- 그림 2: ±화점 ---------------- */
  function figPoints() {
    const before = board({
      size: 7, cell: 32,
      marks: [{ x: 3, y: 2, k: 'plus' }, { x: 5, y: 4, k: 'minus' }],
      stones: [{ x: 3, y: 2, c: 'b', ghost: true }],
    });
    const after = board({
      size: 7, cell: 32,
      marks: [{ x: 3, y: 2, k: 'gone' }, { x: 5, y: 4, k: 'minus' }],
      stones: [{ x: 3, y: 2, c: 'b' }],
      notes: [{ x: 3, y: 0.7, text: '+5', c: '#2c9755' }],
    });
    return row(panel(t('guide.points.panelBefore'), before), arrow(),
      panel(t('guide.points.panelAfter'), after)) + cap('guide.points.cap');
  }

  /* ---------------- 그림 3: 베이스빌드 ---------------- */
  function figBase() {
    const mine = board({
      size: 7, cell: 27,
      stones: [{ x: 1, y: 4, c: 'b', base: true }, { x: 3, y: 3, c: 'b', base: true }, { x: 4, y: 5, c: 'b', base: true }],
    });
    const theirs = board({
      size: 7, cell: 27,
      stones: [{ x: 5, y: 2, c: 'w', base: true }, { x: 3, y: 3, c: 'w', base: true }, { x: 2, y: 1, c: 'w', base: true }],
    });
    const merged = board({
      size: 7, cell: 27,
      marks: [{ x: 3, y: 3, k: 'minus' }],
      stones: [
        { x: 1, y: 4, c: 'b', base: true }, { x: 4, y: 5, c: 'b', base: true },
        { x: 5, y: 2, c: 'w', base: true }, { x: 2, y: 1, c: 'w', base: true },
      ],
    });
    return row(panel(t('guide.base.panelMine'), mine), panel(t('guide.base.panelTheirs'), theirs),
      arrow(), panel(t('guide.base.panelReveal'), merged)) + cap('guide.base.cap');
  }

  /* ---------------- 그림 4: 턴베팅(코미 경매) ---------------- */
  function figKomi() {
    const ticket = (who, stone, v, win) =>
      `<div class="g-bid${win ? ' win' : ''}">
         <div class="g-bid-who"><span class="g-dot ${stone}"></span>${esc(who)}</div>
         <div class="g-bid-v">${v}</div>
         <div class="g-bid-u">${esc(t('guide.komi.unit'))}</div>
       </div>`;
    const outcome =
      `<div class="g-outcome">
         <div class="g-oc"><span class="g-dot b"></span><b>${esc(t('guide.komi.ocFirst'))}</b><span>${esc(t('guide.komi.ocFirstSub'))}</span></div>
         <div class="g-oc"><span class="g-dot w"></span><b>${esc(t('guide.komi.ocPaid', { v: 8 }))}</b><span>${esc(t('guide.komi.ocPaidSub'))}</span></div>
       </div>`;
    return `<div class="g-row">
        <div class="g-bidrow">${ticket(t('guide.komi.who1'), 'b', 8, true)}${ticket(t('guide.komi.who2'), 'w', 3, false)}</div>
        ${arrow()}${outcome}
      </div>` + cap('guide.komi.cap');
  }

  /* ---------------- 그림 5: 히든 ---------------- */
  function figHidden() {
    const common = [
      { x: 2, y: 2, c: 'b' }, { x: 3, y: 4, c: 'w' }, { x: 4, y: 2, c: 'w' },
      { x: 1, y: 3, c: 'b' }, { x: 5, y: 5, c: 'w' },
    ];
    const you = board({ size: 7, cell: 30, stones: common.concat([{ x: 4, y: 4, c: 'b', hidden: true }]) });
    const them = board({ size: 7, cell: 30, stones: common });
    return row(panel(t('guide.hidden.panelYou'), you), panel(t('guide.hidden.panelThem'), them))
      + cap('guide.hidden.cap');
  }

  /* ---------------- 그림 6: 스캔 ---------------- */
  function figScan() {
    const hit = board({
      size: 7, cell: 29,
      marks: [{ x: 4, y: 3, k: 'scan' }],
      stones: [{ x: 2, y: 2, c: 'b' }, { x: 4, y: 3, c: 'w', hidden: true }, { x: 5, y: 5, c: 'b' }],
    });
    const miss = board({
      size: 7, cell: 29,
      marks: [{ x: 2, y: 4, k: 'scan' }],
      stones: [{ x: 2, y: 2, c: 'b' }, { x: 5, y: 5, c: 'b' }],
    });
    return row(panel(t('guide.scan.panelHit'), hit), panel(t('guide.scan.panelMiss'), miss))
      + cap('guide.scan.cap');
  }

  /* ---------------- 그림 7: 계가 ---------------- */
  function figScoring() {
    const b = board({
      size: 7, cell: 29,
      marks: [{ x: 6, y: 0, k: 'minus' }],
      stones: [
        { x: 1, y: 1, c: 'b', base: true }, { x: 2, y: 1, c: 'b' }, { x: 3, y: 1, c: 'b' },
        { x: 1, y: 2, c: 'b' }, { x: 3, y: 2, c: 'b' }, { x: 1, y: 3, c: 'b' }, { x: 2, y: 3, c: 'b' }, { x: 3, y: 3, c: 'b' },
        { x: 5, y: 4, c: 'w', base: true }, { x: 4, y: 5, c: 'w' }, { x: 5, y: 5, c: 'w' },
        { x: 4, y: 4, c: 'b', dead: true },
      ],
      terr: [{ x: 2, y: 2, c: 'b' }],
    });
    /* 표의 모든 숫자는 위 그림에서 직접 세어 맞출 수 있어야 한다.
     * 흑: 일반 돌 7 + 베이스 1(무늬) = 고리 8개, 안쪽 빈 점 1개가 집.
     * 백: 일반 돌 2 + 베이스 1. 베팅에서 받은 8점 보유.
     * 결과가 15:15 동점 → 후공(백) 승 규칙까지 한 예로 보여준다. */
    const rows = [
      ['res.stones', 7, 2],
      ['res.bases', 5, 5],
      ['res.territory', 1, 0],
      ['res.betting', 0, 8],
      ['res.scanBonus', 2, 0],
    ];
    const fmt = (v) => (v < 0 ? '−' + Math.abs(v) : String(v));
    const body = rows.map(([k, x, y]) =>
      `<tr><td>${esc(t(k))}</td><td>${fmt(x)}</td><td>${fmt(y)}</td></tr>`).join('');
    const tb = rows.reduce((a, r) => a + r[1], 0), tw = rows.reduce((a, r) => a + r[2], 0);
    const table = `<table class="g-score">
        <tr><th></th><th>● ${esc(t('color.black'))}</th><th>○ ${esc(t('color.white'))}</th></tr>
        ${body}
        <tr class="total"><td>${esc(t('res.total'))}</td><td>${tb}</td><td>${tw}</td></tr>
      </table>
      <p class="g-tie">${esc(t('res.tieNote'))}</p>`;
    return row(panel(t('guide.scoring.panelBoard'), b), panel(t('guide.scoring.panelTable'), table))
      + cap('guide.scoring.cap');
  }

  /* ---------------- 그림 8: 진행 순서 ---------------- */
  function figFlow() {
    const steps = ['phase.base', 'phase.betting', 'phase.play', 'phase.scoring'];
    const subs = ['guide.flow.s1', 'guide.flow.s2', 'guide.flow.s3', 'guide.flow.s4'];
    const chips = steps.map((k, i) =>
      `<div class="g-step"><div class="g-step-n">${i + 1}</div>
         <div class="g-step-t">${esc(t(k))}</div>
         <div class="g-step-s">${esc(t(subs[i]))}</div></div>`).join('<div class="g-arrow" aria-hidden="true">→</div>');
    return `<div class="g-flow">${chips}</div>`;
  }

  /* ---------------- 섹션 정의 ---------------- */
  const SECTIONS = [
    { id: 'what', n: 4, fig: figWhat },
    { id: 'points', n: 3, fig: figPoints },
    { id: 'base', n: 3, fig: figBase },
    { id: 'komi', n: 3, fig: figKomi },
    { id: 'hidden', n: 3, fig: figHidden },
    { id: 'scan', n: 3, fig: figScan },
    { id: 'scoring', n: 3, fig: figScoring },
    { id: 'flow', n: 0, fig: figFlow },
  ];

  function renderSection(sec, i) {
    const bullets = [];
    for (let k = 1; k <= sec.n; k++) bullets.push(`<li>${t('guide.' + sec.id + '.p' + k)}</li>`);
    return `<section class="g-sec" id="g-sec-${sec.id}">
      <h3><span class="g-num">${i + 1}</span>${esc(t('guide.' + sec.id + '.title'))}</h3>
      <p class="g-lead">${t('guide.' + sec.id + '.lead')}</p>
      <div class="g-figwrap">${sec.fig()}</div>
      ${bullets.length ? `<ul class="g-points">${bullets.join('')}</ul>` : ''}
    </section>`;
  }

  const Guide = {
    /** 가이드 본문을 container에 그린다 (언어 전환 시 다시 호출) */
    render(container) {
      if (!container) return;
      uid = 0;
      container.innerHTML =
        `<p class="g-intro">${t('guide.intro')}</p>` +
        SECTIONS.map(renderSection).join('') +
        `<p class="g-outro">${t('guide.outro')}</p>`;
    },
    sectionIds: SECTIONS.map((s) => s.id),
  };

  global.HSGuide = Guide;
})(window);
