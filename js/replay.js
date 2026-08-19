/* =========================================================
 * HIDDENSTONE — 기보 다시보기
 *
 * 저장된 기보(js/records.js)를 처음부터 다시 두어 각 수순의 판을 만든다.
 * 엔진이 결정적이라 같은 입력이면 같은 판이 나온다(253수 재생·판 일치 확인됨).
 *
 * 다시보기에서는 히든 돌도 전부 보여준다 — 이미 끝난 대국의 기록이니
 * 숨길 이유가 없고, 오히려 "그때 여기 숨어 있었구나"가 이 게임의 재미다.
 * ========================================================= */
(function (global) {
  'use strict';

  const { HiddenStoneGame, BLACK, WHITE } = global.HS;

  const col = (c) => (c === 'b' ? BLACK : WHITE);

  /**
   * 기보를 n수까지 재생한 게임 상태를 만든다.
   * @param {object} rec  저장된 기보
   * @param {number} upto 적용할 수순 개수 (0 = 베이스빌드 직후)
   */
  function rebuild(rec, upto) {
    const map = global.HSMaps[rec.map] || { size: rec.size, plus: [], minus: [] };
    const g = new HiddenStoneGame({ map });

    g.setBases({ [BLACK]: rec.bases.b || [], [WHITE]: rec.bases.w || [] });

    const first = col(rec.first);
    const bids = rec.bids
      ? { [BLACK]: rec.bids.b, [WHITE]: rec.bids.w }
      : null;
    g.startPlay(first, rec.winnerBid || 0, bids);

    const n = Math.max(0, Math.min(upto, rec.moves.length));
    for (let k = 0; k < n; k++) {
      const m = rec.moves[k];
      const c = col(m.c);
      if (m.t === 'pass') { g.pass(c); continue; }
      if (m.i == null) continue;
      const [x, y] = g.xy(m.i);
      if (m.t === 'scan') g.scan(c, x, y);
      else if (m.t === 'hidden') g.tryHidden(c, x, y);
      else g.tryMove(c, x, y);        // 'move'와 'probe' 모두 동일 경로
    }
    return g;
  }

  /* 사람이 읽는 수순 설명 — "23. 흑 F7 (2점 따냄)" */
  function describe(rec, k) {
    const t = (key, p) => global.HSI18n.t(key, p);
    if (k <= 0) return t('replay.start');
    const m = rec.moves[k - 1];
    const side = t(m.c === 'b' ? 'color.black' : 'color.white');
    if (m.t === 'pass') return t('replay.movePass', { n: k, side });
    const size = rec.size;
    const x = m.i % size, y = Math.floor(m.i / size);
    const coord = global.HSUI.BoardView.colLabel(x) + String(size - y);
    const kind = m.t === 'hidden' ? t('replay.kindHidden')
               : m.t === 'scan' ? t('replay.kindScan')
               : m.t === 'probe' ? t('replay.kindProbe')
               : '';
    return t('replay.move', { n: k, side, coord }) + (kind ? ' · ' + kind : '');
  }

  /* 목록에 쓰는 한 줄 요약 */
  function summary(rec) {
    const t = (key, p) => global.HSI18n.t(key, p);
    const me = rec.me;
    const won = me ? rec.result.winner === me : null;
    const opp = me ? (me === 'b' ? rec.names.w : rec.names.b) : null;
    let score = '';
    if (rec.result.b != null) score = rec.result.b + ' : ' + rec.result.w;
    else score = t('replay.byResign');
    return {
      won,
      outcome: won == null ? t('replay.outcomeNone')
             : won ? t('replay.outcomeWin') : t('replay.outcomeLoss'),
      opponent: opp || (rec.names.b + ' vs ' + rec.names.w),
      score,
      moves: rec.moves.length,
      map: t('map.' + rec.map + '.name'),
      when: new Date(rec.ts).toLocaleDateString(
        global.HSI18n.lang === 'ko' ? 'ko-KR' : 'en-US',
        { month: 'short', day: 'numeric' }),
    };
  }

  global.HSReplay = { rebuild, describe, summary, BLACK, WHITE };
})(window);
