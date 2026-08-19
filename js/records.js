/* =========================================================
 * HIDDENSTONE — 전적 · 기보 저장 (브라우저 로컬)
 *
 * 서버 없이 이 기기 안에만 저장한다. 나중에 로그인을 붙이면
 * 여기 save/list만 서버 호출로 바꾸면 되도록 포맷을 그대로 올릴 수 있게 잡았다.
 *
 * 기보 한 판은 "처음부터 다시 두면 같은 판이 나오는" 최소 정보만 담는다.
 * (맵 + 베이스 배치 + 베팅 + 선공 + 수순)  — 253수 기준 약 7KB.
 *
 * 주의: 온라인 대전은 P2P라 서버가 결과를 목격하지 않는다.
 *       그래서 이 기록은 "내가 본 내 전적"이지 공인 기록이 아니다.
 *       공개 랭킹을 만들려면 서버가 대국을 검증해야 한다.
 * ========================================================= */
(function (global) {
  'use strict';

  const { BLACK, WHITE } = global.HS;

  const KEY_STATS = 'hs-stats-v1';
  const KEY_GAMES = 'hs-games-v1';
  const KEEP = 20;   // 기기에 보관할 기보 수 (오래된 것부터 버림)

  const cname = (c) => (c === BLACK ? 'b' : 'w');

  function load(key, dflt) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : dflt;
    } catch (e) { return dflt; }
  }

  function store(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); return true; }
    catch (e) { return false; }     // 용량 초과·시크릿 모드 등
  }

  function emptyStats() {
    return { v: 1, games: 0, wins: 0, losses: 0, byMode: {} };
  }

  /**
   * 대국 하나를 기보로 만든다.
   * @param {object} o
   *   game    HiddenStoneGame (끝난 상태)
   *   mode    'ai' | 'host' | 'guest' | 'public' | 'hotseat'
   *   level   AI 난이도 (ai 모드일 때)
   *   mapId   맵 id
   *   names   { 1: '...', 2: '...' }
   *   playerColor { 1: BLACK|WHITE, 2: ... }
   *   myPlayer 내 플레이어 번호 (핫시트면 null → 전적에 안 넣음)
   *   basePicks { 1:[idx], 2:[idx] }
   *   deadSet Set  계가에서 지정한 사석
   *   result  score() 결과 (없으면 기권/시간패)
   *   loserColor, reason  기권·시간패·이탈일 때
   */
  function build(o) {
    const g = o.game;
    const bases = {
      b: (o.playerColor[1] === BLACK ? o.basePicks[1] : o.basePicks[2]) || [],
      w: (o.playerColor[1] === WHITE ? o.basePicks[1] : o.basePicks[2]) || [],
    };
    const bids = g.bids
      ? { b: g.bids[BLACK] != null ? g.bids[BLACK] : null,
          w: g.bids[WHITE] != null ? g.bids[WHITE] : null }
      : null;

    // 수순은 최소 필드만 (t: 종류, c: 색, i: 자리)
    const moves = g.moveLog.map((m) => {
      const e = { t: m.t, c: cname(m.color) };
      if (m.i != null) e.i = m.i;
      return e;
    });

    let result;
    if (o.result) {
      result = {
        b: o.result[BLACK].total, w: o.result[WHITE].total,
        winner: cname(o.result.winner), reason: 'score',
        tie: !!o.result.tie,
      };
    } else {
      const winner = o.loserColor === BLACK ? WHITE : BLACK;
      result = { b: null, w: null, winner: cname(winner), reason: o.reason || 'resign' };
    }

    const colorOfPlayer = (p) => cname(o.playerColor[p]);
    return {
      v: 1,
      id: 'g' + Date.now().toString(36) + Math.floor(Math.random() * 1e4).toString(36),
      ts: Date.now(),
      mode: o.mode,
      level: o.mode === 'ai' ? o.level : null,
      map: o.mapId,
      size: g.size,
      names: { b: o.names[o.playerColor[1] === BLACK ? 1 : 2],
               w: o.names[o.playerColor[1] === WHITE ? 1 : 2] },
      me: o.myPlayer ? colorOfPlayer(o.myPlayer) : null,
      bases,
      bids,
      first: cname(g.firstPlayer),
      winnerBid: g.betting[BLACK] || g.betting[WHITE] || 0,
      moves,
      dead: o.deadSet ? [...o.deadSet] : [],
      result,
    };
  }

  const Records = {
    /** 기보를 저장하고 전적을 갱신한다. 저장 실패해도 게임 진행에는 영향 없음. */
    add(o) {
      let rec;
      try { rec = build(o); } catch (e) { console.warn('기보 생성 실패', e); return null; }

      const games = load(KEY_GAMES, []);
      games.unshift(rec);
      while (games.length > KEEP) games.pop();
      store(KEY_GAMES, games);

      // 내 색이 정해지는 모드만 승패로 센다 (핫시트는 "내"가 없음)
      if (rec.me) {
        const st = load(KEY_STATS, emptyStats());
        const key = rec.mode === 'ai' ? 'ai:' + (rec.level || 'normal') : 'online';
        st.byMode[key] = st.byMode[key] || { w: 0, l: 0 };
        st.games++;
        if (rec.result.winner === rec.me) { st.wins++; st.byMode[key].w++; }
        else { st.losses++; st.byMode[key].l++; }
        store(KEY_STATS, st);
      }
      return rec;
    },

    stats() {
      const st = load(KEY_STATS, emptyStats());
      st.winRate = st.games > 0 ? Math.round((st.wins / st.games) * 100) : null;
      return st;
    },

    /** 최근 기보 목록 (새것부터) */
    list(n) {
      const games = load(KEY_GAMES, []);
      return n ? games.slice(0, n) : games;
    },

    get(id) { return load(KEY_GAMES, []).find((g) => g.id === id) || null; },

    count() { return load(KEY_GAMES, []).length; },

    clear() {
      try { localStorage.removeItem(KEY_STATS); localStorage.removeItem(KEY_GAMES); } catch (e) {}
    },

    /** 저장 용량 감각 (디버그용) */
    _size() {
      try { return (localStorage.getItem(KEY_GAMES) || '').length; } catch (e) { return 0; }
    },
  };

  global.HSRecords = Records;
})(window);
