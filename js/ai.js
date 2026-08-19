/* =========================================================
 * HIDDENSTONE — AI 상대 (휴리스틱 + 얕은 탐색)
 *
 * ★ 가장 중요한 원칙: AI는 컨닝하지 않는다.
 *   AI와 사람은 같은 JS 컨텍스트에 있어 game.isHidden을 그냥 읽을 수 있다.
 *   그래서 모든 판단은 sanitizedView()가 만든 "AI가 볼 수 있는 판"에서만 한다.
 *   그 판에서는 상대의 미공개 히든 돌이 빈칸으로 지워져 있고, 상대가 히든으로
 *   얻은 ±화점 기록도 가려져 있다. 사람이 보는 것과 정확히 같은 정보다.
 *   → 그래서 AI도 사람처럼 히든 자리를 모르고 찍어보다가(probe) 발견한다.
 *
 * 판단 항목: 베이스 3개 배치 / 턴베팅 / 착수(일반·히든) / 스캔 / 패스
 * 난이도: easy | normal | hard
 * ========================================================= */
(function (global) {
  'use strict';

  const { EMPTY, BLACK, WHITE, other } = global.HS;

  /* ---------------- 난이도 설정 ---------------- */
  const LEVELS = {
    easy: {
      jitter: 7,          // 평가값에 섞는 무작위 폭 (클수록 실수)
      blunder: 0.22,      // 이 확률로 그냥 아무 합법수
      lookahead: 0,       // 상대 응수 검토 후보 수
      selfAtariPenalty: 3,
      bid: [1, 10],          // 폭이 넓다 = 가끔 크게 바가지를 쓴다
      hiddenWindow: [4, 60],
      scanChance: 0.25,
      passSlack: -3,      // 이 값보다 나은 수가 없으면 패스 고려
    },
    normal: {
      jitter: 2.2,
      blunder: 0.04,
      lookahead: 0,
      selfAtariPenalty: 9,
      bid: [3, 9],
      hiddenWindow: [6, 34],
      scanChance: 0.5,
      passSlack: -1,
    },
    hard: {
      jitter: 0.7,
      blunder: 0,
      lookahead: 12,
      selfAtariPenalty: 10,
      bid: [4, 7],           // 실측 적정가(약 7점) 아래로만 부른다
      hiddenWindow: [6, 26],
      scanChance: 0.7,
      passSlack: -0.5,
    },
  };

  const rnd = (a, b) => a + Math.random() * (b - a);
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

  /* ---------------- 게임 복제 ---------------- */
  /* 엔진은 상태를 직접 바꾸므로, 수를 시험해보려면 복제본이 필요하다. */
  function cloneGame(g) {
    const c = Object.create(Object.getPrototypeOf(g));
    Object.assign(c, g);
    c.board = g.board.slice();
    c.isBase = g.isBase.slice();
    c.isHidden = g.isHidden.slice();
    c.plus = new Set(g.plus);
    c.minus = new Set(g.minus);
    c.bonusLog = g.bonusLog.map((b) => ({ ...b }));
    c.capturedStones = { ...g.capturedStones };
    c.scanBonus = { ...g.scanBonus };
    c.timePenalty = { ...g.timePenalty };
    c.betting = { ...g.betting };
    c.hiddenUsed = { ...g.hiddenUsed };
    c.scanUsed = { ...g.scanUsed };
    c.hiddenQuota = { ...g.hiddenQuota };
    c.scanQuota = { ...g.scanQuota };
    c.hashHistory = g.hashHistory.slice();
    c.hashSeen = new Set(g.hashSeen);   // 초과패 판정도 그대로 이어받는다
    c.moveLog = [];
    c.baseCollisions = g.baseCollisions.slice();
    return c;
  }

  /* AI가 볼 수 있는 판만 남긴다 (상대 히든 = 빈칸, 상대 히든 ±획득 = 가림) */
  function sanitizedView(g, me) {
    const c = cloneGame(g);
    const enemy = other(me);
    for (let i = 0; i < c.board.length; i++) {
      if (c.isHidden[i] && c.board[i] === enemy) {
        c.board[i] = EMPTY;
        c.isHidden[i] = 0;
        c.isBase[i] = 0;
      }
    }
    c.bonusLog = c.bonusLog.filter((b) => !(b.hidden && b.color === enemy));

    /* lastMove가 상대의 미공개 히든을 가리키면 지운다.
     * UI는 히든 돌에 마지막 착수 표식을 그리지 않으므로 사람은 이 정보를 못 본다.
     * 지우지 않으면 localityBonus가 "보이지 않는 돌" 옆으로 끌려가 사실상 컨닝이 된다. */
    if (c.lastMove >= 0 &&
        g.isHidden[c.lastMove] && g.board[c.lastMove] === enemy) {
      c.lastMove = -1;
    }

    /* hashHistory는 일부러 실제 이력을 그대로 둔다.
     * 패(ko) 성립 여부는 양쪽이 아는 공개 규칙 상태이고, AI는 해시를 정보로
     * 들여다보지 않는다(합법성 판정에만 쓴다). 여기를 비우면 뷰에서 패를 못 걸러
     * 실제 판에서 거부되는 수를 계속 제안하게 된다. */
    return c;
  }

  /* ---------------- 평가 ---------------- */
  /* 엔진의 실제 점수 함수를 그대로 목적함수로 쓴다(집·돌·베이스·±·베팅 전부 반영) */
  function material(g, me) {
    const s = g.score(null, {});
    return s[me].total - s[other(me)].total;
  }

  /* 변 끝에서 몇 번째 줄인가 — 바둑에서 3~4선이 실속 있다 */
  function lineBonus(g, i, movesPlayed) {
    const [x, y] = g.xy(i);
    const n = g.size;
    const d = Math.min(x, y, n - 1 - x, n - 1 - y);
    const early = movesPlayed < n * 2;
    if (!early) return d === 0 ? -0.4 : 0;
    if (d === 0) return -3.2;      // 초반 1선은 거의 손해
    if (d === 1) return -0.6;
    if (d === 2 || d === 3) return 1.4;
    return 0.5;
  }

  /* 주변에 돌이 있는 쪽으로 두게 해서 판이 흩어지지 않게 한다 */
  function shapeBonus(g, i, me) {
    const enemy = other(me);
    let own = 0, foe = 0, empt = 0;
    const nbs = g.neighbors(i);
    for (const nb of nbs) {
      if (g.board[nb] === me) own++;
      else if (g.board[nb] === enemy) foe++;
      else empt++;
    }
    let v = own * 0.55 + foe * 0.4;
    // 사방이 내 돌이면 대개 내 눈을 메우는 수 — 피한다
    if (own === nbs.length) v -= 6;
    // 완전히 고립된 자리는 초반엔 나쁘지 않지만 우선순위를 낮춘다
    if (own === 0 && foe === 0) v -= 0.5;
    void empt;
    return v;
  }

  /* 직전 상대 수 근처에 응수하도록 (국지전 감각) */
  function localityBonus(g, i) {
    if (g.lastMove < 0) return 0;
    const [ax, ay] = g.xy(i);
    const [bx, by] = g.xy(g.lastMove);
    const d = Math.abs(ax - bx) + Math.abs(ay - by);
    if (d <= 2) return 1.6;
    if (d <= 4) return 0.7;
    return 0;
  }

  /* 놓자마자 활로 1개가 되는(따냄 없는) 수 = 자기 돌 헌납 */
  function isSelfAtari(after, i, me, captured) {
    if (captured > 0) return false;
    if (after.board[i] !== me) return false;   // 놓자마자 잡혔음
    return after.group(i).libs.size <= 1;
  }

  /* ---------------- 착수 후보 평가 ---------------- */
  function candidateMoves(view, me, cfg) {
    const out = [];
    const movesPlayed = view.moveCount;
    for (let i = 0; i < view.board.length; i++) {
      if (view.board[i] !== EMPTY) continue;
      const [x, y] = view.xy(i);
      const t = cloneGame(view);
      const r = t.tryMove(me, x, y);
      if (!r.ok || r.type === 'probe') continue;   // 불법수 / 히든 찍기는 후보 아님

      const capturedVal = (r.captures || []).reduce(
        (a, s) => a + (view.isBase[s] ? 5 : 1), 0);

      const mat = material(t, me);
      let v = mat;
      v += shapeBonus(view, i, me);
      v += lineBonus(view, i, movesPlayed);
      v += localityBonus(view, i);
      if (isSelfAtari(t, i, me, capturedVal)) v -= cfg.selfAtariPenalty;
      if ((r.selfCaptured || []).length > 0) v -= 6;   // 히든에 걸려 잡히는 자리
      v += rnd(-cfg.jitter, cfg.jitter);

      out.push({ i, x, y, v, rawV: v, mat, capturedVal, res: r, after: t });
    }
    out.sort((a, b) => b.v - a.v);
    return out;
  }

  /**
   * hard 난이도: 상위 후보에 대해 상대의 최선 응수까지 한 수 내다본다(2수 미니맥스).
   * 평가값에서 "내 착수 직후의 우위" 항만 "상대 최선 응수 뒤의 우위"로 교체하고,
   * 모양·선·국지성 같은 위치 보너스는 그대로 남긴다.
   */
  function applyLookahead(view, me, cands, cfg) {
    const enemy = other(me);
    const top = cands.slice(0, cfg.lookahead);
    for (const c of top) {
      const g = c.after;
      let bestForEnemy = -Infinity;
      for (let i = 0; i < g.board.length; i++) {
        if (g.board[i] !== EMPTY) continue;
        const [x, y] = g.xy(i);
        const t = cloneGame(g);
        const r = t.tryMove(enemy, x, y);
        if (!r.ok || r.type === 'probe') continue;
        const val = material(t, enemy);
        if (val > bestForEnemy) bestForEnemy = val;
      }
      // 상대가 둘 곳이 없으면 현 상태 그대로
      if (bestForEnemy === -Infinity) bestForEnemy = material(g, enemy);
      // 상대 최선 응수 뒤의 내 우위 = -bestForEnemy
      c.v = c.v - c.mat + (-bestForEnemy);
      c.looked = true;
    }
    /* 검토한 후보들 안에서만 다시 정렬해 돌려준다.
     * 전체를 정렬하면 검토하지 않은(=낙관적인 1수 값 그대로인) 후보가
     * 위로 떠올라 선견이 아무 의미가 없어진다. */
    top.sort((a, b) => b.v - a.v);
    return top;
  }

  /* ---------------- 히든 사용 판단 ---------------- */
  /* 히든은 "지금 당장 따내지 않는" 수여야 의미가 있다(따내면 즉시 공개). */
  function wantHidden(view, me, best, cfg) {
    if (view.hiddenUsed[me] >= view.hiddenQuota[me]) return false;
    if (!best) return false;
    if (best.capturedVal > 0) return false;                    // 따내면 바로 들킨다
    if ((best.res.selfCaptured || []).length > 0) return false; // 잡히면 바로 들킨다
    const mc = view.moveCount;
    if (mc < cfg.hiddenWindow[0] || mc > cfg.hiddenWindow[1]) return false;
    // 상대 돌이 근처에 있을 때(접전지) 숨기는 값이 크다
    const enemy = other(me);
    let foe = 0;
    for (const nb of view.neighbors(best.i)) if (view.board[nb] === enemy) foe++;
    const contested = foe > 0;
    // 남은 창 안에서 조금씩 확률을 올려 매 판 타이밍이 달라지게 한다
    const span = Math.max(1, cfg.hiddenWindow[1] - cfg.hiddenWindow[0]);
    const p = (contested ? 0.30 : 0.10) + 0.5 * ((mc - cfg.hiddenWindow[0]) / span);
    return Math.random() < p;
  }

  /* ---------------- 스캔 판단 ---------------- */
  /* 상대가 히든을 쓴 뒤에만 의미가 있다. 위치는 "여기 있으면 내가 제일 아픈 곳"으로 추정. */
  function wantScan(view, me, cfg) {
    const enemy = other(me);
    if (view.scanUsed[me] >= view.scanQuota[me]) return null;
    if (view.hiddenUsed[enemy] === 0) return null;   // 아직 안 썼으면 스캔할 게 없다
    if (Math.random() > cfg.scanChance) return null;

    // 내 그룹의 활로가 적을수록 그 근처에 상대 히든이 있으면 치명적이다.
    let bestI = -1, bestScore = 0;
    for (let i = 0; i < view.board.length; i++) {
      if (view.board[i] !== EMPTY) continue;
      let s = 0;
      for (const nb of view.neighbors(i)) {
        if (view.board[nb] === me) {
          const g = view.group(nb);
          s += 4 / Math.max(1, g.libs.size);           // 위태로운 내 돌 옆
          if (view.isBase[nb]) s += 2.5;               // 베이스는 5점짜리
        }
      }
      s += rnd(0, 1.2);
      if (s > bestScore) { bestScore = s; bestI = i; }
    }
    if (bestI < 0 || bestScore < 2.2) return null;
    return bestI;
  }

  /* ---------------- 공개 API ---------------- */
  const AI = {
    levels: Object.keys(LEVELS),

    /** 베이스 3개 배치 → idx 배열 */
    chooseBases(game, me, level) {
      const cfg = LEVELS[level] || LEVELS.normal;
      const g = game;
      const n = g.size;
      const picks = [];
      const scored = [];
      for (let i = 0; i < g.board.length; i++) {
        if (g.board[i] !== EMPTY) continue;
        const [x, y] = g.xy(i);
        const d = Math.min(x, y, n - 1 - x, n - 1 - y);
        let s = 0;
        if (g.plus.has(i)) s += 9;        // +화점 위 베이스 = 즉시 +5점
        if (g.minus.has(i)) s -= 14;      // −화점은 피한다
        if (d === 2 || d === 3) s += 3;   // 3~4선
        else if (d === 0) s -= 4;
        else if (d === 1) s -= 1;
        s += rnd(0, cfg.jitter);
        scored.push({ i, x, y, s });
      }
      scored.sort((a, b) => b.s - a.s);
      // 서로 너무 붙지 않게 (한 번에 잡히면 15점이 날아간다)
      for (const c of scored) {
        if (picks.length >= g.baseCount) break;
        const tooClose = picks.some((p) => {
          const [px, py] = g.xy(p);
          return Math.abs(px - c.x) + Math.abs(py - c.y) < 3;
        });
        if (!tooClose) picks.push(c.i);
      }
      // 간격 조건 때문에 부족하면 남은 곳으로 채운다
      for (const c of scored) {
        if (picks.length >= g.baseCount) break;
        if (!picks.includes(c.i)) picks.push(c.i);
      }
      return picks.slice(0, g.baseCount);
    },

    /** 턴베팅값 (0~25) */
    chooseBid(game, me, level) {
      const cfg = LEVELS[level] || LEVELS.normal;
      const view = sanitizedView(game, me);
      // 베이스 공개 후 내가 이미 유리하면 선공까지 사려고 무리하지 않는다
      const edge = material(view, me);
      const [lo, hi] = cfg.bid;
      let v = rnd(lo, hi) - edge * 0.25;
      v = Math.round(Math.max(0, Math.min(25, v)));
      return v;
    },

    /**
     * 이번 차례에 할 행동을 고른다.
     * 반환: { type:'scan'|'hidden'|'move'|'pass', x, y, alts?:[{x,y}] }
     * alts는 실제 판에서 불법(주로 패)일 때 이어서 시도할 차선책이다.
     */
    chooseAction(game, me, level) {
      const cfg = LEVELS[level] || LEVELS.normal;
      const view = sanitizedView(game, me);

      // 1) 스캔은 턴을 쓰지 않으므로 착수 전에 따로 판단한다
      const scanAt = wantScan(view, me, cfg);
      if (scanAt != null) {
        const [x, y] = view.xy(scanAt);
        return { type: 'scan', x, y };
      }

      // 2) 착수 후보 평가
      let cands = candidateMoves(view, me, cfg);
      if (!cands.length) return { type: 'pass' };

      /* 3) 패스 판단은 "선견 감점을 하기 전"의 순수 이득으로 한다.
       *    hard 난이도의 상대 응수 감점을 여기 섞으면, 둘 곳이 멀쩡히 남았는데도
       *    모든 수가 나빠 보여서 조급하게 패스해 버린다(그러면 점수를 그냥 헌납한다).
       *    이 게임은 판 위의 돌 1개가 1점이라 보통은 끝까지 두는 게 맞다. */
      const baseline = material(view, me);
      const settled = view.moveCount > view.size * view.size * 0.55;
      const bestRawGain = cands[0].rawV - baseline;
      if (settled && bestRawGain < cfg.passSlack) return { type: 'pass' };

      // 4) 선견을 쓰면 "검토한 후보" 안에서만 고른다
      const pool = cfg.lookahead > 0 ? applyLookahead(view, me, cands, cfg) : cands;

      // 5) 실수 확률 (쉬움 난이도용)
      let best = pool[0];
      if (cfg.blunder > 0 && Math.random() < cfg.blunder) {
        best = pick(pool.slice(0, Math.max(1, Math.ceil(pool.length * 0.5))));
      }

      // 6) 차선책 목록 (실제 판에서 패 등으로 막히면 순서대로 시도)
      //    전체 후보에서 뽑아야 막혔을 때 시도할 자리가 남는다
      const alts = cands.filter((c) => c !== best).slice(0, 6).map((c) => ({ x: c.x, y: c.y }));

      // 5) 히든으로 둘지
      if (wantHidden(view, me, best, cfg)) {
        return { type: 'hidden', x: best.x, y: best.y, alts };
      }
      return { type: 'move', x: best.x, y: best.y, alts };
    },

    /* 테스트용 — 내부 함수 노출 */
    _internal: { cloneGame, sanitizedView, material, LEVELS },
  };

  global.HSAI = AI;
})(window);
