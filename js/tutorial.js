/* =========================================================
 * HIDDENSTONE — 인터랙티브 튜토리얼 (직접 해보는 연습)
 *
 * 읽는 가이드(js/guide.js)와 역할이 다르다. 여기서는 실제 보드에
 * 작은 상황을 깔아주고 사람이 직접 그 수를 놓아봐야 다음으로 넘어간다.
 * 9줄 연습판을 쓰고, 실제 룰 엔진·실제 UI 버튼(H/S)을 그대로 쓴다.
 *
 * main.js가 host 객체로 행동 실행(doMove/doHidden/doScan)과 화면 갱신을 넘겨준다.
 * ========================================================= */
(function (global) {
  'use strict';

  const { HiddenStoneGame, EMPTY, BLACK, WHITE } = global.HS;
  const t = (k, p) => global.HSI18n.t(k, p);

  const SIZE = 9;

  /* 좌표를 화면 표기(국제 바둑 표기)로 — 프롬프트에서 "F6" 처럼 안내 */
  function label(x, y) {
    return global.HSUI.BoardView.colLabel(x) + String(SIZE - y);
  }

  /* ---------------- 단계 정의 ----------------
   * stones: [{x,y,c:'b'|'w',base?,hidden?}]
   * plus/minus: [[x,y]]
   * need: 'hidden' | 'scan' (그 도구를 먼저 켜야 하는 단계)
   * expect: {x,y} 정확히 그 자리 / null 이면 빈 자리 아무 곳
   * ------------------------------------------- */
  const STEPS = [
    {
      id: 'place',
      stones: [],
      expect: null,
    },
    {
      id: 'capture',
      stones: [
        { x: 4, y: 3, c: 'b' }, { x: 3, y: 4, c: 'b' }, { x: 5, y: 4, c: 'b' },
        { x: 4, y: 4, c: 'w' },
        { x: 1, y: 7, c: 'w' }, { x: 7, y: 1, c: 'b' },
      ],
      expect: { x: 4, y: 5 },
    },
    {
      id: 'plus',
      plus: [[4, 2]],
      minus: [[2, 6]],
      stones: [{ x: 6, y: 5, c: 'w' }, { x: 3, y: 5, c: 'b' }],
      expect: { x: 4, y: 2 },
    },
    {
      id: 'base',
      stones: [
        { x: 4, y: 3, c: 'b' }, { x: 3, y: 4, c: 'b' }, { x: 5, y: 4, c: 'b' },
        { x: 4, y: 4, c: 'w', base: true },
        { x: 2, y: 7, c: 'w', base: true }, { x: 7, y: 2, c: 'b', base: true },
      ],
      expect: { x: 4, y: 5 },
    },
    {
      id: 'hidden',
      need: 'hidden',
      stones: [
        { x: 3, y: 3, c: 'b' }, { x: 5, y: 5, c: 'w' },
        { x: 2, y: 5, c: 'w' }, { x: 6, y: 3, c: 'b' },
      ],
      expect: null,
    },
    {
      id: 'scan',
      need: 'scan',
      stones: [
        { x: 3, y: 3, c: 'b' }, { x: 5, y: 5, c: 'w' },
        { x: 2, y: 5, c: 'w' }, { x: 6, y: 3, c: 'b' },
        { x: 5, y: 3, c: 'w', hidden: true },   // 사람 화면에는 안 보인다
      ],
      expect: { x: 5, y: 3 },
    },
  ];

  /* ---------------- 상태 ---------------- */
  let host = null;
  let cur = 0;
  let game = null;
  let done = false;

  function step() { return STEPS[cur]; }

  /* 단계별 연습판을 새로 깐다 (베이스·베팅 단계는 건너뛰고 바로 대국 상태) */
  function buildBoard(st) {
    const map = { size: SIZE, plus: st.plus || [], minus: st.minus || [] };
    const g = new HiddenStoneGame({ map });
    (st.stones || []).forEach((s) => {
      const i = g.idx(s.x, s.y);
      g.board[i] = s.c === 'b' ? BLACK : WHITE;
      if (s.base) g.isBase[i] = 1;
      if (s.hidden) g.isHidden[i] = 1;
    });
    g.phase = 'play';
    g.firstPlayer = BLACK;
    g.turn = BLACK;
    g.hashHistory = [g.hash()];
    return g;
  }

  /* 안내 문구 — 필요한 도구를 아직 켜지 않았으면 그 안내를 먼저 보여준다 */
  function promptText() {
    const st = step();
    const params = st.expect ? { coord: label(st.expect.x, st.expect.y) } : {};
    return t('tut.' + st.id + '.ask', params);
  }

  function paint() {
    const st = step();
    host.setGame(game);
    const v = host.view();
    v.opts.showHiddenFor = BLACK;      // 내 돌만 — 상대 히든은 사람에게 안 보인다
    v.opts.tempReveal = host.tempReveal();
    v.opts.deadSet = new Set();
    v.opts.territory = null;
    v.opts.interactive = true;
    v.opts.ghost = st.need === 'scan' ? 'scan' : st.need === 'hidden' ? 'hidden' : 'stone';
    v.opts.ghostColor = BLACK;
    v.opts.pendingBases = null;
    host.render();
    host.setBar({
      n: cur + 1,
      total: STEPS.length,
      title: t('tut.' + st.id + '.title'),
      body: promptText(),
      tool: st.need || null,
    });
  }

  function loadStep(k) {
    cur = Math.max(0, Math.min(STEPS.length - 1, k));
    done = false;
    game = buildBoard(step());
    host.resetClickMode();
    paint();
  }

  function finish() {
    done = true;
    host.showFinish();
  }

  function next() {
    if (cur + 1 >= STEPS.length) { finish(); return; }
    loadStep(cur + 1);
  }

  const Tutorial = {
    stepCount: STEPS.length,

    /** host: main.js가 넘겨주는 연결부 */
    start(h) {
      host = h;
      loadStep(0);
    },

    /** 현재 단계의 연습판 (main.js가 App.game으로 쓴다) */
    game() { return game; },
    index() { return cur; },
    isDone() { return done; },

    /** 보드 클릭 — 맞는 수인지 검사하고 통과하면 실제로 착수시킨다 */
    click(pt) {
      if (!game || done) return;
      const st = step();
      const i = game.idx(pt.x, pt.y);

      // 1) 필요한 도구를 먼저 켜야 하는 단계
      if (st.need && host.clickMode() !== st.need) {
        host.nudge(t('tut.need.' + st.need));
        return;
      }
      // 2) 정해진 자리가 있는 단계
      if (st.expect) {
        if (i !== game.idx(st.expect.x, st.expect.y)) {
          host.nudge(t('tut.' + st.id + '.wrong', { coord: label(st.expect.x, st.expect.y) }));
          return;
        }
      } else if (game.board[i] !== EMPTY) {
        host.nudge(t('tut.wrong.occupied'));
        return;
      }

      // 3) 실제 행동 실행 (엔진·사운드·토스트는 본 게임과 동일하게 동작)
      const ok = host.act(st.need || 'move', pt);
      if (!ok) { host.nudge(t('tut.wrong.illegal')); return; }

      /* 연습판에는 상대가 없다. 착수 후 차례를 나로 되돌려 두어야
       * 상태줄이 "상대 차례 — 대기 중"이라고 잘못 안내하지 않고,
       * 다음 단계에서 H/S 버튼도 계속 눌릴 수 있다. */
      game.turn = BLACK;
      game.passes = 0;

      host.render();
      host.setBar({
        n: cur + 1, total: STEPS.length,
        title: t('tut.' + st.id + '.title'),
        body: t('tut.' + st.id + '.done'),
        tool: null,
        advance: true,      // "다음" 버튼을 띄운다
      });
    },

    next,
    prev() { loadStep(cur - 1); },
    goto: loadStep,
  };

  global.HSTutorial = Tutorial;
})(window);
