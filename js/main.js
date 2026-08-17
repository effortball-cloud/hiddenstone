/* =========================================================
 * HIDDENSTONE — 앱 상태 머신 / 화면 전환 / 입력 처리
 * 모드:
 *  - hotseat: 한 기기에서 1P/2P 교대 (비밀 단계는 핸드오프 화면으로 가림)
 *  - host/guest/public: PeerJS 온라인 1:1
 *
 * 사용자에게 보이는 문자열은 전부 js/i18n.js의 키로 다룬다(t 함수).
 * 언어를 바꾸면 HSI18n이 정적 DOM을 갱신하고, relabelUI()가 동적 문구를 다시 만든다.
 * ========================================================= */
(function () {
  'use strict';

  const { HiddenStoneGame, EMPTY, BLACK, WHITE, other } = window.HS;
  const { BoardView } = window.HSUI;
  const { NetSession } = window.HSNet;
  const MAPS = window.HSMaps;
  const I18n = window.HSI18n;
  const t = (k, p) => I18n.t(k, p);

  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => [...document.querySelectorAll(sel)];

  const mapName = (id) => t('map.' + id + '.name');
  const mapDesc = (id) => t('map.' + id + '.desc');

  /* ---------------- 상태 ---------------- */
  const App = {
    mode: 'hotseat',      // hotseat | host | guest | public
    net: null,
    game: null,
    view: null,
    mapId: 'genesis',
    names: { 1: '', 2: '' },
    myPlayer: null,        // 온라인에서 1(방장)/2(참가자), hotseat이면 null
    playerColor: { 1: BLACK, 2: WHITE },  // 베팅 전 잠정 배정
    stage: 'lobby',        // lobby | base | betting | play | scoring | over
    clickMode: 'move',     // move | hidden | scan
    base: null,            // { current, picks:{1:[],2:[]}, confirmed:{1,2} }
    bet: null,             // { round, bids:{1:null,2:null} }
    deadSet: new Set(),
    scoreConfirmed: { 1: false, 2: false },
    rematchWant: { 1: false, 2: false },
    tempReveal: new Set(),
    clocks: { 1: 0, 2: 0 },
    clockTimer: null,
    byoyomi: null,          // null(무제한) | { sec, periods }
    byo: null,              // { 1:{left,count}, 2:{left,count} } 진행 상태
    _clockTurn: null,
    lobby: null,            // LobbyClient (공개방 목록)
    publicCode: null,       // 내가 만든 공개방 코드
    _status: null,          // 언어 전환 시 다시 그리기 위한 { key, params }
    _phase: null,           // 같은 이유로 보관하는 단계 칩 키
    _lastResult: null,      // 결과 오버레이를 다시 그리기 위한 인자 보관
  };
  App.names[1] = t('name.p1');
  App.names[2] = t('name.p2');

  const colorPlayer = (c) => (App.playerColor[1] === c ? 1 : 2);
  const nameOfColor = (c) => App.names[colorPlayer(c)];
  const colorName = (c) => t(c === BLACK ? 'color.black' : 'color.white');
  const isOnline = () => App.mode === 'host' || App.mode === 'guest' || App.mode === 'public';
  const myColor = () => (isOnline() ? App.playerColor[App.myPlayer] : null);
  // 지금 이 기기에서 조작 중인 플레이어 번호
  const actor = () => (isOnline() ? App.myPlayer : colorPlayer(App.game.turn));
  const canAct = () => {
    if (!App.game || App.game.phase !== 'play') return false;
    if (isOnline()) return App.game.turn === myColor();
    return true; // hotseat: 항상 현재 턴 주인이 조작
  };

  /* ---------------- 토스트 ---------------- */
  function toast(msg, kind, ms) {
    const box = $('#toasts');
    const el = document.createElement('div');
    el.className = 'toast' + (kind ? ' ' + kind : '');
    el.textContent = msg;
    box.appendChild(el);
    requestAnimationFrame(() => el.classList.add('show'));
    setTimeout(() => {
      el.classList.remove('show');
      setTimeout(() => el.remove(), 350);
    }, ms || 3200);
  }

  /* 상태 문구/단계 칩은 키로 보관해 두었다가 언어가 바뀌면 그대로 다시 만든다 */
  function setStatus(key, params) {
    App._status = { key, params };
    $('#status-msg').textContent = t(key, params);
  }
  function setStatusRaw(text) {   // 이미 조립된 문자열(턴 안내 등)
    App._status = null;
    $('#status-msg').textContent = text;
  }
  function setPhaseChip(key) {
    App._phase = key;
    $('#phase-chip').textContent = t(key);
  }

  /* ---------------- 오버레이 ---------------- */
  function showOverlay(id) { $$('.overlay').forEach((o) => o.classList.remove('show')); if (id) $(id).classList.add('show'); }
  function hideOverlays() { $$('.overlay').forEach((o) => o.classList.remove('show')); }

  function handoff(title, desc, cb) {
    $('#handoff-title').textContent = title;
    $('#handoff-desc').textContent = desc;
    showOverlay('#ov-handoff');
    $('#btn-handoff-ok').onclick = () => { hideOverlays(); cb(); };
  }

  function confirmDialog(msg, cb) {
    $('#confirm-msg').textContent = msg;
    showOverlay('#ov-confirm');
    $('#btn-confirm-yes').onclick = () => { hideOverlays(); cb(true); };
    $('#btn-confirm-no').onclick = () => { hideOverlays(); cb(false); };
  }

  /* ---------------- 가이드 오버레이 ---------------- */
  let guideDirty = true;   // 언어가 바뀌면 다시 그려야 함

  function renderGuideIfNeeded() {
    if (!guideDirty) return;
    window.HSGuide.render($('#guide-body'));
    guideDirty = false;
  }

  function setGuideTab(tab) {
    $$('.g-tab').forEach((b) => b.classList.toggle('selected', b.dataset.tab === tab));
    $('#guide-body').style.display = tab === 'how' ? 'block' : 'none';
    $('#rules-body').style.display = tab === 'rules' ? 'block' : 'none';
    const scroll = tab === 'how' ? $('#guide-body') : $('#rules-body');
    if (scroll) scroll.scrollTop = 0;
  }

  function openGuide(tab) {
    renderGuideIfNeeded();
    setGuideTab(tab || 'how');
    showOverlay('#ov-help');
  }

  function initGuide() {
    $$('.g-tab').forEach((b) => { b.onclick = () => setGuideTab(b.dataset.tab); });
    $('#btn-help-lobby').onclick = () => openGuide('how');
    $('#btn-learn').onclick = () => openGuide('how');
    $('#btn-help').onclick = () => openGuide('rules');   // 대국 중엔 빠른 참조
    $('#btn-help-close').onclick = hideOverlays;
  }

  /* ---------------- 언어 ---------------- */
  function syncLangUI() {
    $$('.lang-chip').forEach((c) => c.classList.toggle('selected', c.dataset.lang === I18n.lang));
    const code = $('#lang-code');
    if (code) code.textContent = I18n.other().toUpperCase();
  }

  function initLang() {
    $$('.lang-chip').forEach((chip) => {
      chip.onclick = () => I18n.setLang(chip.dataset.lang);
    });
    $('#btn-lang').onclick = () => I18n.toggle();
    I18n.onChange(relabelUI);
    syncLangUI();
  }

  /* 언어 전환 후 동적으로 만들어진 문구를 전부 다시 만든다 */
  function relabelUI() {
    syncLangUI();
    guideDirty = true;
    if ($('#ov-help').classList.contains('show')) renderGuideIfNeeded();
    renderMapCards();
    if (App.lobby) renderRooms([...App.lobby.rooms.values()].map((r) => r.info));
    $('#name-p1-label').textContent = App.mode === 'hotseat' ? t('label.p1') : t('label.myName');

    // 기본 이름을 쓰는 중이면 새 언어의 기본 이름으로 따라간다
    for (const p of [1, 2]) {
      const key = p === 1 ? 'name.p1' : 'name.p2';
      if (App.names[p] === I18n.inLang('ko', key) || App.names[p] === I18n.inLang('en', key)) {
        App.names[p] = t(key);
      }
    }

    if (App._phase) setPhaseChip(App._phase);
    if (App._status) setStatus(App._status.key, App._status.params);

    // 결과 오버레이가 떠 있으면 표까지 새 언어로 다시 그린다
    if (App._lastResult && $('#ov-result').classList.contains('show')) {
      const r = App._lastResult;
      renderResult(r.res, r.loserColor, r.reason);
    }

    if (!App.game) return;
    if (App.stage === 'base') updateBaseUI();
    if (App.stage === 'scoring') $('#btn-confirm').textContent = t('btn.scoreConfirm');
    if ($('#ov-bet').classList.contains('show')) relabelBetTitle();
    refreshAll();
  }

  /* ---------------- 로비 ---------------- */
  function renderMapCards() {
    const mapList = $('#map-list');
    if (!mapList) return;
    mapList.innerHTML = '';
    Object.values(MAPS).forEach((m) => {
      const el = document.createElement('div');
      el.className = 'map-card' + (m.id === App.mapId ? ' selected' : '');
      el.innerHTML = `<div class="map-name">${escapeHtml(mapName(m.id))}</div>
        <div class="map-size">${m.size}×${m.size}</div>
        <div class="map-desc">${escapeHtml(mapDesc(m.id))}</div>
        <div class="map-pts">${escapeHtml(t('map.pts', { plus: m.plus.length, minus: m.minus.length }))}</div>`;
      el.onclick = () => {
        App.mapId = m.id;
        $$('.map-card').forEach((c) => c.classList.remove('selected'));
        el.classList.add('selected');
      };
      mapList.appendChild(el);
    });
  }

  function initLobby() {
    // 모드 카드
    $$('.mode-card').forEach((card) => {
      card.onclick = () => {
        $$('.mode-card').forEach((c) => c.classList.remove('selected'));
        card.classList.add('selected');
        App.mode = card.dataset.mode;
        const m = App.mode;
        $('#join-row').style.display = m === 'guest' ? 'flex' : 'none';
        $('#name-p2-row').style.display = m === 'hotseat' ? 'flex' : 'none';
        // 맵은 만드는 쪽만 고른다(참가 시엔 방장 맵을 따름)
        $('#map-section').style.display = (m === 'guest') ? 'none' : 'block';
        $('#name-p1-label').textContent = m === 'hotseat' ? t('label.p1') : t('label.myName');
        $('#online-public').style.display = m === 'public' ? 'block' : 'none';
        $('#btn-start').style.display = m === 'public' ? 'none' : 'block';
        if (m === 'public') initPublicLobby();
        else teardownPublicLobby();
      };
    });

    // 공개방 버튼
    $('#btn-create-public').onclick = createPublicRoom;
    $('#btn-refresh-public').onclick = () => { if (App.lobby) renderRooms([...App.lobby.rooms.values()].map((r) => r.info)); };

    // 로비 BGM 스타일 칩
    const syncBgmChips = () => {
      $$('.bgm-chip').forEach((c) => c.classList.toggle('selected', c.dataset.bgm === HSAudio.getLobbyStyle()));
    };
    $$('.bgm-chip').forEach((chip) => {
      chip.onclick = () => {
        HSAudio.setLobbyStyle(chip.dataset.bgm);
        syncBgmChips();
        if (!HSAudio.isMuted()) HSAudio.lobby(); // 클릭 자체가 제스처 → 바로 미리듣기
      };
    });
    syncBgmChips();

    renderMapCards();

    // 초읽기 카드
    $$('.byo-card').forEach((card) => {
      card.onclick = () => {
        $$('.byo-card').forEach((c) => c.classList.remove('selected'));
        card.classList.add('selected');
      };
    });

    if (!new NetSession().available()) {
      $('#online-warn').style.display = 'block';
    }

    $('#btn-start').onclick = onLobbyStart;
  }

  function readByoyomi() {
    const byoCard = $('.byo-card.selected');
    const byoSec = byoCard ? parseInt(byoCard.dataset.sec, 10) : 0;
    App.byoyomi = byoSec > 0 ? { sec: byoSec, periods: 3 } : null;
  }

  /* 히든 준비 상태 해제 (음악 정지 + 상대에게 통지) */
  function cancelHiddenArm() {
    if (App.clickMode !== 'hidden') return;
    App.clickMode = 'move';
    HSAudio.hiddenCancel();
    if (isOnline() && App.net) App.net.send({ t: 'hiddenCancel' });
  }

  /* 공통 온라인 핸들러 배선 (호스트/게스트/공개방 공용) */
  function wireNet() {
    App.net = new NetSession();
    App.net
      .on('error', (m) => { toast(m, 'bad', 5000); showLobby(); })
      .on('close', () => {
        // 대국 중 상대 이탈 → 자동 승리 처리
        if (App.game && App.stage !== 'over' && App.stage !== 'lobby') {
          const theirColor = App.playerColor[App.myPlayer === 1 ? 2 : 1];
          App.game.resign(theirColor);
          App.stage = 'over';
          stopClock();
          HSAudio.hiddenCancel();
          toast(t('toast.oppLeft'), 'warn', 5000);
          showResult(null, theirColor, 'left');
        } else {
          toast(t('toast.disconnected'), 'bad', 6000);
        }
      })
      .on('message', onNetMessage);
  }

  function onLobbyStart() {
    App.names[1] = $('#name-p1').value.trim() || (App.mode === 'hotseat' ? t('name.p1') : t('name.me'));
    App.names[2] = $('#name-p2').value.trim() || t('name.p2');
    readByoyomi();

    if (App.mode === 'hotseat') {
      startGame();
      return;
    }
    // 온라인
    wireNet();

    if (App.mode === 'host') {
      App.myPlayer = 1;
      App.net.on('waiting', (code) => {
        $('#wait-msg').textContent = t('wait.forOpponent');
        $('#room-code').textContent = code;
        $('#room-code-row').style.display = 'block';
        showOverlay('#ov-wait');
      });
      App.net.on('open', () => {
        App.net.send({ t: 'hello', name: App.names[1] });
      });
      App.net.host();
    } else {
      const code = $('#join-code').value.trim();
      if (!code) { toast(t('err.needCode'), 'bad'); return; }
      App.myPlayer = 2;
      App.names[2] = App.names[1]; // 입력 필드는 하나(내 이름) → 참가자는 P2
      App.names[1] = t('name.opponent');
      $('#wait-msg').textContent = t('wait.joining');
      $('#room-code-row').style.display = 'none';
      showOverlay('#ov-wait');
      App.net.on('open', () => {
        App.net.send({ t: 'hello', name: App.names[2] });
      });
      App.net.join(code);
    }
  }

  /* ---------------- 공개방 로비 ---------------- */
  function initPublicLobby() {
    if (App.lobby) return;
    const { LobbyClient } = window.HSNet;
    App.lobby = new LobbyClient();
    if (!App.lobby.available()) {
      setLobbyStatus('error', t('lobby.noMqttLib'));
      $('#room-list').innerHTML = `<div class="room-empty">${escapeHtml(t('lobby.unavailable'))}</div>`;
      return;
    }
    setLobbyStatus('connecting', t('lobby.connecting'));
    $('#room-list').innerHTML = `<div class="room-empty">${escapeHtml(t('lobby.connecting'))}</div>`;
    App.lobby.connect({
      status: setLobbyStatus,
      change: renderRooms,
    });
  }

  function teardownPublicLobby() {
    if (App.lobby) { App.lobby.disconnect(); App.lobby = null; }
  }

  function setLobbyStatus(kind, msg) {
    const el = $('#lobby-status');
    if (!el) return;
    el.className = 'lobby-status' + (kind === 'ok' ? ' ok' : kind === 'error' ? ' error' : ' connecting');
    el.removeAttribute('data-i18n'); // 이후엔 코드가 직접 관리
    el.textContent = msg;
  }

  function renderRooms(rooms) {
    const list = $('#room-list');
    if (!list) return;
    rooms = (rooms || []).slice().sort((a, b) => (b.ts || 0) - (a.ts || 0));
    if (!rooms.length) {
      list.innerHTML = `<div class="room-empty">${escapeHtml(t('lobby.noRooms'))}</div>`;
      return;
    }
    list.innerHTML = '';
    rooms.forEach((r) => {
      const mName = MAPS[r.map] ? mapName(r.map) : (r.map || '?');
      const el = document.createElement('div');
      el.className = 'room-item';
      el.innerHTML =
        `<span class="r-host">${escapeHtml(r.name || t('room.anon'))}</span>` +
        `<span class="r-meta">${escapeHtml(mName)} · ${r.size}×${r.size}</span>` +
        `<span class="r-badge">${escapeHtml(t('room.waiting'))}</span>` +
        `<button class="r-join">${escapeHtml(t('room.join'))}</button>`;
      el.querySelector('.r-join').onclick = () => joinPublicRoom(r.id, r.name);
      list.appendChild(el);
    });
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  function createPublicRoom() {
    if (!new NetSession().available()) { toast(t('err.noPeerHost'), 'bad', 5000); return; }
    App.mode = 'public';
    App.myPlayer = 1;
    App.names[1] = $('#name-p1').value.trim() || t('name.me');
    readByoyomi();
    wireNet();
    App.net.on('waiting', (code) => {
      App.publicCode = code;
      if (App.lobby) App.lobby.announce({ id: code, name: App.names[1], map: App.mapId, size: MAPS[App.mapId].size });
      $('#wait-msg').textContent = t('wait.publicOpen');
      $('#room-code').textContent = code;
      $('#room-code-row').style.display = 'block';
      showOverlay('#ov-wait');
    });
    App.net.on('open', () => {
      // 상대 접속 → 방을 목록에서 내림
      if (App.lobby) App.lobby.closeRoom();
      App.net.send({ t: 'hello', name: App.names[1] });
    });
    App.net.host();
  }

  function joinPublicRoom(roomId, hostName) {
    if (!new NetSession().available()) { toast(t('err.noPeerJoin'), 'bad', 5000); return; }
    App.mode = 'public';
    App.myPlayer = 2;
    App.names[2] = $('#name-p1').value.trim() || t('name.me');
    App.names[1] = hostName || t('name.opponent');
    wireNet();
    $('#wait-msg').textContent = t('wait.joiningRoom', { name: App.names[1] });
    $('#room-code-row').style.display = 'none';
    showOverlay('#ov-wait');
    App.net.on('open', () => {
      App.net.send({ t: 'hello', name: App.names[2] });
    });
    App.net.join(roomId);
  }

  /* ---------------- 게임 시작 ---------------- */
  function startGame() {
    const map = MAPS[App.mapId];
    App.game = new HiddenStoneGame({ map });
    App.playerColor = { 1: BLACK, 2: WHITE };
    App.stage = 'base';
    App.clickMode = 'move';
    App.deadSet = new Set();
    App.tempReveal = new Set();
    App.scoreConfirmed = { 1: false, 2: false };
    App.rematchWant = { 1: false, 2: false };
    App.base = { current: 1, picks: { 1: [], 2: [] }, confirmed: { 1: false, 2: false } };
    App.bet = { round: 1, bids: { 1: null, 2: null } };
    App.clocks = { 1: 0, 2: 0 };
    App._clockTurn = null;
    App.byo = App.byoyomi
      ? { 1: { left: App.byoyomi.periods, count: App.byoyomi.sec },
          2: { left: App.byoyomi.periods, count: App.byoyomi.sec } }
      : null;

    teardownPublicLobby(); // 게임 진입 시 로비 구독 종료
    $('#screen-lobby').classList.add('hidden');
    $('#screen-game').classList.remove('hidden');
    hideOverlays();
    HSAudio.gameStart();

    if (!App.view) {
      App.view = new BoardView($('#board'));
      App.view.onClick = onBoardClick;
    }
    App.view.opts.showHiddenFor = isOnline() ? myColor() : null;
    App.view.opts.tempReveal = App.tempReveal;
    App.view.opts.deadSet = App.deadSet;
    App.view.opts.territory = null;
    App.view.setGame(App.game);

    startClock();
    enterBasePhase();
  }

  /* ---------------- 1) 베이스빌드 ---------------- */
  function enterBasePhase() {
    setPhaseChip('phase.base');
    $('#btn-pass').style.display = 'none';
    $('#btn-resume').style.display = 'none';
    $('#btn-confirm').style.display = 'inline-block';
    updateBaseUI();

    if (App.mode === 'hotseat') {
      handoff(t('handoff.baseTitle', { name: App.names[1] }),
        t('handoff.baseDesc', { other: App.names[2], n: App.game.baseCount }),
        () => beginBasePick(1));
    } else {
      beginBasePick(App.myPlayer);
    }
  }

  function beginBasePick(p) {
    App.base.current = p;
    App.view.opts.interactive = true;
    App.view.opts.pendingBases = { color: App.playerColor[p], list: App.base.picks[p] };
    App.view.opts.ghost = 'base';
    App.view.opts.ghostColor = App.playerColor[p];
    setStatus('status.basePick', { name: App.names[p], n: App.game.baseCount });
    updateBaseUI();
    App.view.render();
  }

  function baseClick(pt) {
    const p = App.base.current;
    if (App.base.confirmed[p]) return;
    const i = App.game.idx(pt.x, pt.y);
    const picks = App.base.picks[p];
    const at = picks.indexOf(i);
    if (at >= 0) picks.splice(at, 1);
    else {
      if (picks.length >= App.game.baseCount) { toast(t('err.baseMax', { n: App.game.baseCount }), 'bad'); return; }
      picks.push(i);
    }
    updateBaseUI();
    App.view.render();
  }

  function updateBaseUI() {
    if (App.stage !== 'base') return;
    const p = App.base.current;
    const nBtn = $('#btn-confirm');
    nBtn.textContent = t('btn.baseConfirm', { cur: App.base.picks[p].length, max: App.game.baseCount });
    nBtn.disabled = App.base.picks[p].length !== App.game.baseCount || App.base.confirmed[p];
  }

  function confirmBase() {
    const p = App.base.current;
    if (App.base.picks[p].length !== App.game.baseCount) return;
    App.base.confirmed[p] = true;

    if (App.mode === 'hotseat') {
      App.view.opts.pendingBases = null;
      App.view.render();
      if (p === 1) {
        handoff(t('handoff.baseTitle', { name: App.names[2] }),
          t('handoff.baseDesc', { other: App.names[1], n: App.game.baseCount }),
          () => beginBasePick(2));
      } else {
        revealBases();
      }
    } else {
      App.net.send({ t: 'base', list: App.base.picks[App.myPlayer] });
      App.view.opts.pendingBases = { color: myColor(), list: App.base.picks[App.myPlayer] };
      setStatus('status.waitBase');
      $('#btn-confirm').disabled = true;
      maybeRevealBases();
    }
  }

  function maybeRevealBases() {
    if (App.base.confirmed[1] && App.base.confirmed[2]) revealBases();
  }

  function revealBases() {
    const placement = {};
    placement[App.playerColor[1]] = App.base.picks[1];
    placement[App.playerColor[2]] = App.base.picks[2];
    const collisions = App.game.setBases(placement);
    App.view.opts.pendingBases = null;
    App.view.opts.ghost = null;
    App.view.render();
    if (collisions.length > 0) {
      toast(t('toast.baseCollision', { n: collisions.length }), 'warn', 4500);
    }
    toast(t('toast.baseReveal'), 'good');
    enterBettingPhase();
  }

  /* ---------------- 2) 턴베팅 ---------------- */
  function enterBettingPhase() {
    App.stage = 'betting';
    setPhaseChip('phase.betting');
    $('#btn-confirm').style.display = 'none';
    setStatus('status.betting');

    if (App.mode === 'hotseat') {
      handoff(t('handoff.betTitle', { name: App.names[1] }),
        t('handoff.betDesc', { other: App.names[2] }),
        () => openBetOverlay(1));
    } else {
      openBetOverlay(App.myPlayer);
    }
  }

  function relabelBetTitle() {
    if (App.bet == null || App.bet.actor == null) return;
    $('#bet-title').textContent = t('bet.title', { name: App.names[App.bet.actor] }) +
      (App.bet.round > 1 ? t('bet.rebidSuffix', { n: App.bet.round }) : '');
  }

  function openBetOverlay(p) {
    const range = $('#bet-range');
    range.value = 5;
    $('#bet-value').textContent = '5';
    App.bet.actor = p;
    relabelBetTitle();
    showOverlay('#ov-bet');
    range.oninput = () => { $('#bet-value').textContent = range.value; };
    $('#btn-bet-ok').onclick = () => {
      const v = parseInt(range.value, 10);
      hideOverlays();
      submitBid(p, v);
    };
  }

  function applyPendingBid() {
    if (App.bet && App.bet.pending && App.bet.pending.round === App.bet.round) {
      App.bet.bids[App.bet.pending.p] = App.bet.pending.v;
      App.bet.pending = null;
    }
  }

  function submitBid(p, v) {
    App.bet.bids[p] = v;
    if (App.mode === 'hotseat') {
      if (p === 1) {
        handoff(t('handoff.betTitle', { name: App.names[2] }),
          t('handoff.betDescShort', { other: App.names[1] }),
          () => openBetOverlay(2));
      } else {
        resolveBets();
      }
    } else {
      App.net.send({ t: 'bid', round: App.bet.round, v });
      setStatus('status.waitBid');
      applyPendingBid(); // 재베팅 타이밍 차이로 먼저 도착해 있던 상대 베팅 반영
      maybeResolveBets();
    }
  }

  function maybeResolveBets() {
    if (App.bet.bids[1] != null && App.bet.bids[2] != null) resolveBets();
  }

  function resolveBets(randomFirst) {
    const b1 = App.bet.bids[1], b2 = App.bet.bids[2];
    if (b1 === b2 && randomFirst == null) {
      if (App.bet.round === 1) {
        // 동률 → 재베팅
        App.bet.round = 2;
        App.bet.bids = { 1: null, 2: null };
        toast(t('toast.bidTie', { v: b1 }), 'warn', 4000);
        if (App.mode === 'hotseat') {
          handoff(t('handoff.rebidTitle', { name: App.names[1] }),
            t('handoff.betDescShort', { other: App.names[2] }),
            () => openBetOverlay(1));
        } else {
          openBetOverlay(App.myPlayer);
        }
        return;
      }
      // 재베팅도 동률 → 랜덤 선공 (색은 그대로)
      if (isOnline()) {
        if (App.myPlayer === 1) { // 방장이 권위자로서 결정
          const first = Math.random() < 0.5 ? 1 : 2;
          App.net.send({ t: 'tiebreak', first });
          resolveBets(first);
        }
        // 참가자는 tiebreak 메시지를 기다림
        return;
      }
      randomFirst = Math.random() < 0.5 ? 1 : 2;
      toast(t('toast.bidTieRandom'), 'warn', 4500);
    }

    let winner, winnerBid;
    if (randomFirst != null) {
      winner = randomFirst;
      winnerBid = b1; // 동률
    } else {
      winner = b1 > b2 ? 1 : 2;
      winnerBid = Math.max(b1, b2);
      // 베팅 승자가 흑+선공. 잠정 색과 다르면 통째로 스왑.
      if (App.playerColor[winner] !== BLACK) {
        App.game.swapColors();
        App.playerColor = winner === 1 ? { 1: BLACK, 2: WHITE } : { 1: WHITE, 2: BLACK };
      }
    }
    const firstColor = App.playerColor[winner];
    App.game.startPlay(firstColor, winnerBid, { 1: b1, 2: b2 });

    const loser = winner === 1 ? 2 : 1;
    toast(t('toast.betResult', {
      winner: App.names[winner],
      v: b1 === b2 ? b1 : Math.max(b1, b2),
      color: colorName(firstColor),
      loser: App.names[loser],
      bid: winnerBid,
    }), 'good', 6000);

    enterPlayPhase();
  }

  /* ---------------- 3) 본게임 ---------------- */
  function enterPlayPhase() {
    App.stage = 'play';
    setPhaseChip('phase.play');
    $('#btn-pass').style.display = 'inline-block';
    $('#btn-confirm').style.display = 'none';
    $('#btn-resume').style.display = 'none';
    App.view.opts.showHiddenFor = isOnline() ? myColor() : null;
    App.view.opts.ghost = 'stone';
    refreshAll();
  }

  function onBoardClick(pt) {
    if (App.stage === 'base') { baseClick(pt); return; }
    if (App.stage === 'scoring') { toggleDead(pt, false); return; }
    if (App.stage !== 'play' || !canAct()) return;

    const color = App.game.turn;
    if (App.clickMode === 'scan') { doScan(color, pt, false); return; }
    if (App.clickMode === 'hidden') { doHidden(color, pt, false); return; }
    doMove(color, pt, false);
  }

  function doMove(color, pt, fromRemote) {
    const r = App.game.tryMove(color, pt.x, pt.y);
    if (!r.ok) { if (!fromRemote) toastIllegal(r.reason); return; }
    if (!fromRemote && isOnline()) App.net.send({ t: 'move', x: pt.x, y: pt.y });
    handleActionResult(r, color, fromRemote);
  }

  function doHidden(color, pt, fromRemote) {
    const r = App.game.tryHidden(color, pt.x, pt.y);
    if (!r.ok) { if (!fromRemote) toastIllegal(r.reason); return; }
    if (!fromRemote && isOnline()) App.net.send({ t: 'hidden', x: pt.x, y: pt.y });
    if (r.type === 'hidden') {
      App.clickMode = 'move';
      App.view.opts.ghost = 'stone';
      if (!fromRemote) HSAudio.hiddenPlaced(); // 긴장 드론 종료 + 해소 타격
      if (fromRemote) {
        toast(t('toast.hiddenRemote'), 'warn', 5000);
      } else if (isOnline()) {
        toast(t('toast.hiddenOnlineOk'), 'good');
      } else {
        toast(t('toast.hiddenLocalOk'), 'good', 4500);
      }
    }
    handleActionResult(r, color, fromRemote, true);
  }

  function doScan(color, pt, fromRemote) {
    const r = App.game.scan(color, pt.x, pt.y);
    if (!r.ok) { if (!fromRemote) toastIllegal(r.reason); return; }
    if (!fromRemote && isOnline()) App.net.send({ t: 'scan', x: pt.x, y: pt.y });
    App.clickMode = 'move';
    App.view.opts.ghost = 'stone';
    if (!fromRemote) HSAudio.scanPing(r.found != null);

    if (fromRemote) {
      toast(r.found != null ? t('toast.scanRemoteFound') : t('toast.scanRemote'), 'warn', 5000);
    } else {
      toast(r.found != null ? t('toast.scanFound') : t('toast.scanMiss'),
        r.found != null ? 'good' : 'bad', 4500);
    }
    // 잠깐 보였다가 사라짐 (기억해야 함)
    if (r.found != null && (!fromRemote || App.mode === 'hotseat')) {
      App.tempReveal.add(r.found);
      App.view.render();
      setTimeout(() => { App.tempReveal.delete(r.found); App.view.render(); }, 2500);
    }
    refreshAll();
  }

  function toastIllegal(reason) {
    const keys = {
      'occupied': 'illegal.occupied',
      'suicide': 'illegal.suicide',
      'ko': 'illegal.ko',
      'not-your-turn': 'illegal.notYourTurn',
      'no-hidden-left': 'illegal.noHiddenLeft',
      'no-scan-left': 'illegal.noScanLeft',
      'not-playing': 'illegal.notPlaying',
    };
    toast(t(keys[reason] || 'illegal.default'), 'bad');
  }

  function handleActionResult(r, color, fromRemote, wasHidden) {
    if (r.type === 'probe') {
      const probedMine = isOnline() && App.game.board[r.revealed[0]] === myColor();
      if (fromRemote) {
        toast(probedMine ? t('toast.probeMine') : t('toast.probeRemote'), 'warn', 5000);
      } else {
        toast(t('toast.probeLocal'), 'warn', 5000);
      }
      refreshAll();
      return;
    }
    // 착수음 (일반 착수는 딸깍 / 히든 착수는 긴장 음악 종료 + 해소 타격)
    if (r.type === 'move') HSAudio.stone();
    else if (r.type === 'hidden') {
      if (fromRemote) HSAudio.hiddenPlaced();
      else HSAudio.stone();
    }

    // 일반/히든 착수 결과
    if (r.captures && r.captures.length > 0) {
      const pts = r.captures.length;
      if (!fromRemote) toast(t('toast.captured', { n: pts }), 'good');
      else toast(t('toast.capturedBy', { n: pts }), 'warn');
    }
    if (r.selfCaptured && r.selfCaptured.length > 0) {
      toast(fromRemote ? t('toast.selfCapRemote') : t('toast.selfCapLocal'), 'bad', 5500);
    }
    if (r.revealedHidden && r.revealedHidden.length > 0 && !wasHidden) {
      toast(t('toast.hiddenRevealed'), 'warn', 4500);
    }
    // ±화점 획득 알림 (히든 착수의 화점 획득은 위치가 새므로 조용히 처리)
    const bonusVisible = !wasHidden || (isOnline() && !fromRemote);
    if (r.pointBonus && bonusVisible) {
      toast(r.pointBonus > 0 ? t('toast.plusPoint') : t('toast.minusPoint'),
        r.pointBonus > 0 ? 'good' : 'bad', 3500);
    }
    refreshAll();
  }

  /* ---------------- 패스/기권/모드 버튼 ---------------- */
  function doPass(color, fromRemote) {
    const r = App.game.pass(color);
    if (!r.ok) return;
    if (!fromRemote && isOnline()) App.net.send({ t: 'pass' });
    HSAudio.pass();
    toast(t('toast.pass', { name: nameOfColor(color) }), '', 2500);
    if (r.scoring) enterScoring();
    refreshAll();
  }

  function enterScoring() {
    App.stage = 'scoring';
    HSAudio.hiddenCancel();
    setPhaseChip('phase.scoring');
    App.deadSet.clear();
    App.scoreConfirmed = { 1: false, 2: false };
    App.view.opts.deadSet = App.deadSet;
    App.view.opts.territory = App.game.territoryMap(App.deadSet);
    App.view.opts.showHiddenFor = 'all'; // 계가 시 모든 히든 공개(엔진에서도 공개됨)
    App.view.opts.ghost = null;
    App.view.opts.interactive = true;    // 양측 모두 사석 지정 가능
    $('#btn-pass').style.display = 'none';
    $('#btn-confirm').style.display = 'inline-block';
    $('#btn-confirm').textContent = t('btn.scoreConfirm');
    $('#btn-confirm').disabled = false;
    $('#btn-resume').style.display = 'inline-block';
    setStatus('status.scoring');
    toast(t('toast.scoringStart'), 'good', 5000);
    HSAudio.scoring();
    refreshAll();
  }

  function toggleDead(pt, fromRemote) {
    if (App.stage !== 'scoring') return;
    const i = App.game.idx(pt.x, pt.y);
    if (App.game.board[i] === EMPTY) return;
    const g = App.game.group(i);
    const isDead = App.deadSet.has(i);
    for (const s of g.stones) {
      if (isDead) App.deadSet.delete(s); else App.deadSet.add(s);
    }
    App.scoreConfirmed = { 1: false, 2: false };
    $('#btn-confirm').disabled = false;
    App.view.opts.territory = App.game.territoryMap(App.deadSet);
    if (!fromRemote && isOnline()) App.net.send({ t: 'dead', x: pt.x, y: pt.y });
    refreshAll();
  }

  function confirmScore() {
    if (App.mode === 'hotseat') { finalizeGame(); return; }
    App.scoreConfirmed[App.myPlayer] = true;
    App.net.send({ t: 'scoreOk' });
    $('#btn-confirm').disabled = true;
    setStatus('status.waitScore');
    maybeFinalize();
  }

  function maybeFinalize() {
    if (App.scoreConfirmed[1] && App.scoreConfirmed[2]) finalizeGame();
  }

  function finalizeGame() {
    const res = App.game.finalize(App.deadSet);
    App.stage = 'over';
    stopClock();
    showResult(res);
  }

  function doResume(fromRemote) {
    const r = App.game.resumePlay();
    if (!r.ok) return;
    if (!fromRemote && isOnline()) App.net.send({ t: 'resume' });
    toast(t('toast.resume'), 'good');
    App.view.opts.territory = null;
    App.deadSet.clear();
    enterPlayPhase();
  }

  function doResign(color, fromRemote) {
    const r = App.game.resign(color);
    if (!r.ok) return;
    HSAudio.hiddenCancel();
    if (!fromRemote && isOnline()) App.net.send({ t: 'resign' });
    App.stage = 'over';
    stopClock();
    showResult(null, color);
  }

  /* ---------------- 결과 ---------------- */
  function showResult(res, loserColor, reason) {
    App._lastResult = { res, loserColor, reason };
    renderResult(res, loserColor, reason);
    // 내가 이겼는지 기준으로 차임 (핫시트는 항상 승리 차임)
    const winColor = res ? res.winner : other(loserColor);
    const iWon = !isOnline() || winColor === myColor();
    HSAudio.result(iWon);
    showOverlay('#ov-result');
  }

  function renderResult(res, loserColor, reason) {
    const box = $('#result-table');
    if (res) {
      const B = res[BLACK], W = res[WHITE];
      const row = (label, b, w) => `<tr><td>${escapeHtml(label)}</td><td>${b}</td><td>${w}</td></tr>`;
      box.innerHTML = `<table>
        <tr><th></th><th>● ${escapeHtml(nameOfColor(BLACK))}</th><th>○ ${escapeHtml(nameOfColor(WHITE))}</th></tr>
        ${row(t('res.stones'), B.stones, W.stones)}
        ${row(t('res.bases'), B.bases * 5, W.bases * 5)}
        ${row(t('res.territory'), B.territory, W.territory)}
        ${row(t('res.plus'), '+' + B.plus * 5, '+' + W.plus * 5)}
        ${row(t('res.minus'), '−' + B.minus * 5, '−' + W.minus * 5)}
        ${row(t('res.betting'), B.betting, W.betting)}
        ${row(t('res.scanBonus'), B.scanBonus, W.scanBonus)}
        ${(B.timePenalty || W.timePenalty) ? row(t('res.timePenalty'), '−' + B.timePenalty, '−' + W.timePenalty) : ''}
        <tr class="total"><td>${escapeHtml(t('res.total'))}</td><td>${B.total}</td><td>${W.total}</td></tr>
      </table>
      <p class="cap-note">${escapeHtml(t('res.capNote', { b: B.captures, w: W.captures }))}</p>
      ${res.tie ? `<p class="tie-note">${escapeHtml(t('res.tieNote'))}</p>` : ''}`;
      $('#result-winner').textContent =
        t('res.winner', { name: nameOfColor(res.winner), color: colorName(res.winner) });
    } else {
      box.innerHTML = '';
      const winner = other(loserColor);
      const how = t(reason === 'timeout' ? 'win.timeout' : reason === 'left' ? 'win.left' : 'win.resign');
      const why = t(reason === 'timeout' ? 'why.timeout' : reason === 'left' ? 'why.left' : 'why.resign');
      $('#result-winner').textContent = t('res.winnerBy', {
        name: nameOfColor(winner),
        color: colorName(winner),
        how,
        loser: nameOfColor(loserColor),
        why,
      });
    }
  }

  function requestRematch() {
    if (App.mode === 'hotseat') { startGame(); return; }
    App.rematchWant[App.myPlayer] = true;
    App.net.send({ t: 'rematch' });
    $('#btn-rematch').textContent = t('btn.rematchWait');
    $('#btn-rematch').disabled = true;
    maybeRematch();
  }

  function maybeRematch() {
    if (App.rematchWant[1] && App.rematchWant[2]) {
      $('#btn-rematch').textContent = t('btn.rematch');
      $('#btn-rematch').disabled = false;
      startGame();
    }
  }

  /* ---------------- 네트워크 수신 ---------------- */
  function onNetMessage(msg) {
    switch (msg.t) {
      case 'hello': {
        const their = App.myPlayer === 1 ? 2 : 1;
        App.names[their] = msg.name || t('name.opponent');
        if (App.myPlayer === 1) { // 방장이 설정을 내려주고 게임 시작
          App.net.send({ t: 'config', mapId: App.mapId, byo: App.byoyomi });
          hideOverlays();
          startGame();
        }
        break;
      }
      case 'config': {
        App.mapId = msg.mapId;
        App.byoyomi = msg.byo || null;
        hideOverlays();
        startGame();
        break;
      }
      case 'base': {
        const their = App.myPlayer === 1 ? 2 : 1;
        App.base.picks[their] = msg.list;
        App.base.confirmed[their] = true;
        maybeRevealBases();
        break;
      }
      case 'bid': {
        const their = App.myPlayer === 1 ? 2 : 1;
        if (msg.round === App.bet.round) {
          App.bet.bids[their] = msg.v;
          maybeResolveBets();
        } else {
          // 라운드가 어긋나면 값만 보관 (재베팅 타이밍 차이)
          App.bet.pending = { round: msg.round, v: msg.v, p: their };
        }
        break;
      }
      case 'tiebreak':
        resolveBets(msg.first);
        break;
      case 'move':
        doMove(App.game.turn, { x: msg.x, y: msg.y }, true);
        break;
      case 'hidden':
        doHidden(App.game.turn, { x: msg.x, y: msg.y }, true);
        break;
      case 'hiddenArm':
        HSAudio.hiddenArm(); // "히든" 멘트 + 긴장 음악 (착수 시 종료)
        toast(t('toast.hiddenArmRemote'), 'warn', 4500);
        break;
      case 'hiddenCancel':
        HSAudio.hiddenCancel();
        break;
      case 'scan':
        doScan(App.game.turn, { x: msg.x, y: msg.y }, true);
        break;
      case 'pass':
        doPass(App.game.turn, true);
        break;
      case 'dead':
        toggleDead({ x: msg.x, y: msg.y }, true);
        break;
      case 'scoreOk': {
        const their = App.myPlayer === 1 ? 2 : 1;
        App.scoreConfirmed[their] = true;
        maybeFinalize();
        break;
      }
      case 'resume':
        doResume(true);
        break;
      case 'byo': {
        const turnColor = App.game.turn;
        App.game.consumeByoyomi(turnColor);
        const p = colorPlayer(turnColor);
        if (App.byo) { App.byo[p].left = msg.left; App.byo[p].count = App.byoyomi.sec; }
        toast(t('toast.byoRemote', { n: msg.left }), 'good', 3500);
        refreshAll();
        break;
      }
      case 'timeloss': {
        const turnColor = App.game.turn;
        App.game.timeLoss(turnColor);
        App.stage = 'over';
        stopClock();
        showResult(null, turnColor, 'timeout');
        break;
      }
      case 'resign': {
        const theirColor = App.playerColor[App.myPlayer === 1 ? 2 : 1];
        doResign(theirColor, true);
        break;
      }
      case 'rematch': {
        const their = App.myPlayer === 1 ? 2 : 1;
        App.rematchWant[their] = true;
        toast(t('toast.rematchWant'), 'good');
        maybeRematch();
        break;
      }
    }
  }

  /* ---------------- 패널/시계 갱신 ---------------- */
  function refreshAll() {
    const g = App.game;
    if (!g) return;
    // 재베팅 라운드 어긋남 처리
    if (App.bet && App.bet.pending && App.bet.pending.round === App.bet.round) {
      applyPendingBid();
      maybeResolveBets();
    }

    // 초읽기: 턴이 바뀌면 새 차례의 카운트다운 리셋
    if (App.byo && g.phase === 'play' && App._clockTurn !== g.turn) {
      App.byo[colorPlayer(g.turn)].count = App.byoyomi.sec;
      App._clockTurn = g.turn;
    }

    const live = g.phase === 'scoring' || g.phase === 'over'
      ? g.score(App.deadSet)
      : g.score(null, { live: true });

    for (const c of [BLACK, WHITE]) {
      const panel = c === BLACK ? '#panel-black' : '#panel-white';
      const p = colorPlayer(c);
      const s = live[c];
      $(panel + ' .p-name').textContent = App.names[p];
      $(panel + ' .p-score').textContent = s.total;
      $(panel + ' .p-detail').innerHTML =
        t('panel.detail', {
          stones: s.stones, bases: s.bases * 5, territory: s.territory,
          plus: s.plus * 5, minus: s.minus * 5, captures: s.captures,
          betting: s.betting, scan: s.scanBonus,
        }) + (s.timePenalty ? t('panel.timePenalty', { n: s.timePenalty }) : '');

      const hBtn = $(panel + ' .btn-hidden');
      const sBtn = $(panel + ' .btn-scan');
      const hiddenLeft = g.hiddenQuota[c] - g.hiddenUsed[c];
      const scanLeft = g.scanQuota[c] - g.scanUsed[c];
      hBtn.querySelector('.cnt').textContent = hiddenLeft;
      sBtn.querySelector('.cnt').textContent = scanLeft;
      const isTurnPanel = g.phase === 'play' && g.turn === c;
      const controlsHere = isOnline() ? myColor() === c : true;
      hBtn.disabled = !(isTurnPanel && controlsHere && hiddenLeft > 0);
      sBtn.disabled = !(isTurnPanel && controlsHere && scanLeft > 0);
      hBtn.classList.toggle('armed', App.clickMode === 'hidden' && isTurnPanel);
      sBtn.classList.toggle('armed', App.clickMode === 'scan' && isTurnPanel);

      $(panel).classList.toggle('active', g.phase === 'play' && g.turn === c);
    }

    if (g.phase === 'play') {
      const turnP = colorPlayer(g.turn);
      const mine = !isOnline() || turnP === App.myPlayer;
      setStatusRaw(t('status.turn', { name: App.names[turnP], color: colorName(g.turn) }) +
        (App.clickMode === 'hidden' ? t('status.suffixHidden') :
         App.clickMode === 'scan' ? t('status.suffixScan') :
         mine ? '' : t('status.suffixWait')));
      App.view.opts.ghostColor = g.turn;
      App.view.opts.ghost = App.clickMode === 'scan' ? 'scan' : App.clickMode === 'hidden' ? 'hidden' : 'stone';
      App.view.opts.interactive = canAct();
    }
    updateClockDisplay();
    App.view.render();
  }

  function fmtClock(sec) {
    const m = Math.floor(sec / 60), s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  function startClock() {
    stopClock();
    App.clockTimer = setInterval(() => {
      if (!App.game || App.game.phase !== 'play') return;
      const turnColor = App.game.turn;
      const p = colorPlayer(turnColor);
      App.clocks[p]++;
      if (App.byo) {
        // 온라인에서는 차례인 쪽 클라이언트가 시간 판정의 주체
        const authority = !isOnline() || p === App.myPlayer;
        const b = App.byo[p];
        b.count--;
        if (b.count < 0) {
          if (authority) {
            b.left--;
            if (b.left <= 0) {
              if (isOnline()) App.net.send({ t: 'timeloss' });
              App.game.timeLoss(turnColor);
              App.stage = 'over';
              stopClock();
              showResult(null, turnColor, 'timeout');
              return;
            }
            App.game.consumeByoyomi(turnColor);
            b.count = App.byoyomi.sec;
            toast(t('toast.byoLocal', { name: App.names[p], n: b.left }), 'warn', 4000);
            if (isOnline()) App.net.send({ t: 'byo', left: b.left });
            refreshAll();
            return;
          }
          b.count = 0; // 원격(차례인 쪽)의 판정을 기다림
        }
      }
      updateClockDisplay();
    }, 1000);
  }

  function updateClockDisplay() {
    if (!App.game) return;
    for (const c of [BLACK, WHITE]) {
      const p = colorPlayer(c);
      const el = $((c === BLACK ? '#panel-black' : '#panel-white') + ' .p-clock');
      if (App.byo) {
        const b = App.byo[p];
        const active = App.game.phase === 'play' && App.game.turn === c;
        el.textContent = active
          ? t('clock.active', { sec: Math.max(0, b.count), periods: b.left })
          : t('clock.idle', { periods: b.left });
        el.classList.toggle('urgent', active && b.count <= 5);
      } else {
        el.textContent = fmtClock(App.clocks[p]);
        el.classList.remove('urgent');
      }
    }
  }
  function stopClock() { if (App.clockTimer) { clearInterval(App.clockTimer); App.clockTimer = null; } }

  /* ---------------- 버튼 배선 ---------------- */
  function wireButtons() {
    $$('.btn-hidden').forEach((b) => {
      b.onclick = () => {
        if (!canAct()) return;
        if (App.clickMode === 'hidden') { cancelHiddenArm(); refreshAll(); return; }
        const arm = () => {
          App.clickMode = 'hidden';
          HSAudio.hiddenArm();
          if (isOnline()) App.net.send({ t: 'hiddenArm' }); // 상대도 즉시 인지
          refreshAll();
        };
        if (App.mode === 'hotseat') {
          confirmDialog(t('confirm.hidden'), (yes) => { if (yes) arm(); });
        } else arm();
      };
    });
    $$('.btn-scan').forEach((b) => {
      b.onclick = () => {
        if (!canAct()) return;
        if (App.clickMode === 'scan') { App.clickMode = 'move'; refreshAll(); return; }
        cancelHiddenArm(); // 히든 대기 중 스캔으로 전환
        confirmDialog(t('confirm.scan'), (yes) => {
          if (yes) { App.clickMode = 'scan'; HSAudio.scanArm(); refreshAll(); }
        });
      };
    });
    $('#btn-pass').onclick = () => {
      if (!canAct()) return;
      confirmDialog(t('confirm.pass'), (yes) => {
        if (yes) { cancelHiddenArm(); doPass(App.game.turn, false); }
      });
    };
    $('#btn-resign').onclick = () => {
      if (App.stage !== 'play' && App.stage !== 'scoring') return;
      const c = isOnline() ? myColor() : App.game.turn;
      confirmDialog(t('confirm.resign', { name: nameOfColor(c) }), (yes) => {
        if (yes) { cancelHiddenArm(); doResign(c, false); }
      });
    };
    $('#btn-confirm').onclick = () => {
      if (App.stage === 'base') confirmBase();
      else if (App.stage === 'scoring') confirmScore();
    };
    $('#btn-resume').onclick = () => doResume(false);
    $('#btn-leave').onclick = () => {
      // 온라인 대국 중 나가기 = 기권(패배) 처리 → 상대는 자동 승리
      if (isOnline() && App.game && App.stage !== 'over' && App.stage !== 'lobby') {
        confirmDialog(t('confirm.leaveGame'), (yes) => {
          if (yes) { cancelHiddenArm(); doResign(myColor(), false); }
        });
        return;
      }
      confirmDialog(t('confirm.leave'), (yes) => { if (yes) showLobby(); });
    };
    $('#btn-rematch').onclick = requestRematch;
    $('#btn-to-lobby').onclick = showLobby;
    $('#btn-wait-cancel').onclick = showLobby;
    $('#btn-copy-code').onclick = () => {
      const code = $('#room-code').textContent;
      if (navigator.clipboard) navigator.clipboard.writeText(code).then(() => toast(t('toast.codeCopied'), 'good'));
    };
  }

  function showLobby() {
    if (App.net) { App.net.destroy(); App.net = null; }
    stopClock();
    HSAudio.hiddenCancel();
    App.game = null;
    App.stage = 'lobby';
    App._status = null;
    App._phase = null;
    hideOverlays();
    $('#screen-game').classList.add('hidden');
    $('#screen-lobby').classList.remove('hidden');
    HSAudio.lobby();
    // 공개방 모드로 돌아왔으면 로비 목록 다시 연결
    teardownPublicLobby();
    if (App.mode === 'public') initPublicLobby();
  }

  /* ---------------- 초기화 ---------------- */
  window.addEventListener('DOMContentLoaded', () => {
    initLang();
    initGuide();
    initLobby();
    wireButtons();
  });

  // 디버그/테스트용 핸들 (콘솔에서 상태 확인)
  window.__hsApp = App;
})();
