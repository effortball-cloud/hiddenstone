/* =========================================================
 * HIDDENSTONE — 다국어(i18n) / Localization
 *
 * 한국어(ko) · English(en) 두 언어를 앱 안에서 즉시 전환한다.
 *  - 정적 텍스트: HTML에 data-i18n / data-i18n-html / data-i18n-ph /
 *    data-i18n-title / data-i18n-aria 속성을 달면 applyDom()이 채운다.
 *  - 동적 텍스트: HSI18n.t('key', { param: value })
 *  - 언어는 localStorage('hs-lang')에 저장되고, 없으면 브라우저 언어로 자동 판별.
 * ========================================================= */
(function (global) {
  'use strict';

  const STORE_KEY = 'hs-lang';
  const LANGS = ['ko', 'en'];

  const DICT = {
    /* ==================== 한국어 ==================== */
    ko: {
      /* --- 앱/브랜드 --- */
      'app.title': '히든스톤 HIDDENSTONE — 전략 바둑 대전',
      'app.subtitle': '보이지 않는 한 수, <b>히든스톤</b>',
      'app.tagline': '베이스빌드 · 턴베팅 · 히든 · 스캔 — 심리전이 있는 바둑',
      'app.footer': '바둑 룰 기반 전략 대전 게임 · 베이스빌드 / 턴베팅 / 히든 / 스캔',
      'lang.name': '한국어',
      'lang.switchTo': 'Switch to English',

      /* --- 로비 --- */
      'lobby.help': '📖 규칙',
      'lobby.bgmLabel': '🎵 로비 음악',
      'bgm.zen': '🪷 고요한 기원',
      'bgm.arcade': '🕹️ 아케이드',
      'bgm.epic': '⚔️ 에픽 타이틀',

      'lobby.modeHead': '게임 모드',
      'mode.hotseat.name': '같은 기기에서 2인',
      'mode.hotseat.desc': '1P/2P가 번갈아 조작 (비밀 단계는 화면 가림)',
      'mode.public.name': '온라인 — 공개방',
      'mode.public.desc': '열린 방을 목록에서 보고 코드 없이 바로 참가',
      'mode.host.name': '온라인 — 코드방 만들기',
      'mode.host.desc': '비공개 방 코드를 만들어 친구에게 전달',
      'mode.guest.name': '온라인 — 코드로 참가',
      'mode.guest.desc': '친구에게 받은 방 코드로 접속',

      'lobby.onlineWarn': '⚠ PeerJS 라이브러리를 불러오지 못해 온라인 모드를 사용할 수 없습니다. 인터넷 연결을 확인하세요.',
      'lobby.codeLabel': '방 코드',
      'lobby.codePh': '예: A3K7Q',

      'lobby.createPublic': '＋ 공개방 만들기',
      'lobby.refresh': '목록 새로고침',
      'lobby.connecting': '로비에 연결하는 중…',
      'lobby.connected': '로비 연결됨',
      'lobby.subFail': '로비 구독에 실패했습니다.',
      'lobby.noMqttLib': 'MQTT 로비 라이브러리를 불러오지 못했습니다. 코드방을 이용하세요.',
      'lobby.unavailable': '공개 로비를 사용할 수 없습니다.',
      'lobby.brokerFail': '공개 로비 서버에 연결하지 못했습니다. 코드방을 이용하거나 잠시 후 다시 시도하세요.',
      'lobby.noRooms': '열린 방이 없습니다. 「공개방 만들기」로 방을 열고 상대를 기다려보세요.',
      'room.anon': '익명',
      'room.waiting': '대기중',
      'room.join': '참가',

      'lobby.mapHead': '맵 선택',
      'lobby.byoHead': '초읽기 (시간제)',
      'byo.none.name': '없음',
      'byo.none.desc': '시간 제한 없이 편하게',
      'byo.25.name': '25초 × 3회',
      'byo.25.desc': '정식 대회 규격. 초읽기 소진 시 −2점, 전부 소진 시 시간패',
      'byo.15.name': '15초 × 3회',
      'byo.15.desc': '스피드전',

      'lobby.playerHead': '플레이어',
      'label.p1': '1P 이름',
      'label.p2': '2P 이름',
      'label.myName': '내 이름',
      'lobby.start': '게임 시작',

      /* --- 맵 --- */
      'map.genesis.name': '제네시스',
      'map.genesis.desc': '공식 대회 표준. 4귀 3-3에 −점, 변 1선 한가운데 +점 (밸런스형).',
      'map.sky.name': '스카이',
      'map.sky.desc': '제네시스에 천원 −점이 추가된 분산형 (−5/+4).',
      'map.chaos.name': '카오스',
      'map.chaos.desc': '−점 8개, +점 없음. 근접 전투형 (좌표는 고증 기반 추정).',
      'map.classic.name': '클래식',
      'map.classic.desc': '±화점이 없는 순수 대결 맵.',
      'map.serengeti.name': '세렝게티',
      'map.serengeti.desc': '13×13 대형 맵. 제네시스 패턴의 확장 (−4/+4 밸런스형).',
      'map.pts': '+점 {plus} / −점 {minus}',

      /* --- 이름 기본값 --- */
      'name.p1': '플레이어 1',
      'name.p2': '플레이어 2',
      'name.me': '나',
      'name.opponent': '상대',

      /* --- 게임 헤더/공통 --- */
      'phase.base': '베이스빌드',
      'phase.betting': '턴베팅',
      'phase.play': '대국',
      'phase.scoring': '계가',
      'btn.rules': '규칙',
      'btn.leave': '나가기',
      'btn.pass': '패스',
      'btn.resume': '대국 재개',
      'btn.resign': '기권',
      'btn.hidden': '히든',
      'btn.scan': '스캔',
      'color.black': '흑',
      'color.white': '백',

      /* --- 베이스빌드 --- */
      'handoff.title': '핸드오프',
      'handoff.ok': '준비 완료 — 시작',
      'handoff.baseTitle': '{name}의 베이스빌드',
      'handoff.baseDesc': '{other}는 화면을 보지 마세요! 몰래 돌 {n}개를 배치합니다.',
      'status.basePick': '{name} — 베이스 돌 {n}개를 몰래 배치하세요 (다시 클릭하면 취소)',
      'status.waitBase': '상대의 베이스빌드를 기다리는 중…',
      'btn.baseConfirm': '베이스 확정 ({cur}/{max})',
      'err.baseMax': '베이스는 {n}개까지입니다.',
      'toast.baseCollision': '베이스 충돌! {n}개 지점이 −점으로 변했습니다.',
      'toast.baseReveal': '베이스빌드 공개!',

      /* --- 턴베팅 --- */
      'status.betting': '필드를 보고 선공을 위해 덤(점수)을 베팅하세요.',
      'handoff.betTitle': '{name}의 턴베팅',
      'handoff.betDesc': '{other}는 화면을 보지 마세요! 선공을 원하는 만큼 베팅합니다.',
      'handoff.betDescShort': '{other}는 화면을 보지 마세요!',
      'handoff.rebidTitle': '{name}의 재베팅',
      'bet.title': '{name}의 턴베팅',
      'bet.rebidSuffix': ' (재베팅 {n}회차)',
      'bet.note': '👀 <b>왼쪽 필드에서 공개된 베이스 위치를 확인</b>하고 베팅하세요.<br>더 높게 베팅한 쪽이 <b>흑 + 선공</b>이 되고, 베팅한 점수만큼 상대(후공)에게 줍니다.<br>동률이면 재베팅, 또 동률이면 선공 랜덤(흑백 유지).',
      'bet.unit': '점',
      'bet.ok': '베팅 확정',
      'status.waitBid': '상대의 베팅을 기다리는 중…',
      'toast.bidTie': '베팅 동률({v}점)! 재베팅합니다.',
      'toast.bidTieRandom': '재베팅도 동률! 선공을 무작위로 정합니다. (흑백은 바뀌지 않음)',
      'toast.betResult': '{winner} {v}점 베팅으로 선공({color})! {loser}는 {bid}점을 받고 시작합니다.',

      /* --- 대국 --- */
      'status.turn': '{name} ({color}) 차례',
      'status.suffixHidden': ' — 히든 착수 위치 선택',
      'status.suffixScan': ' — 스캔할 지점 선택',
      'status.suffixWait': ' — 대기 중',

      'illegal.occupied': '이미 돌이 있는 자리입니다.',
      'illegal.suicide': '자살수는 둘 수 없습니다.',
      'illegal.ko': '패! 바로 되따낼 수 없습니다.',
      'illegal.notYourTurn': '당신의 차례가 아닙니다.',
      'illegal.noHiddenLeft': '히든을 이미 사용했습니다.',
      'illegal.noScanLeft': '스캔을 이미 사용했습니다.',
      'illegal.notPlaying': '지금은 착수할 수 없습니다.',
      'illegal.default': '둘 수 없는 곳입니다.',

      'toast.hiddenArmRemote': '⚠ 상대가 히든을 사용합니다!',
      'toast.hiddenRemote': '⚠ 상대가 히든을 사용했습니다! 위치는 보이지 않습니다.',
      'toast.hiddenOnlineOk': '히든 착수 완료. 상대에게는 보이지 않습니다.',
      'toast.hiddenLocalOk': '히든 착수 완료 (화면에 표시되지 않습니다. 위치를 기억하세요!)',
      'toast.hiddenRevealed': '히든 돌이 공개되었습니다!',

      'toast.scanRemoteFound': '⚠ 상대가 스캔으로 내 히든을 확인했습니다! (+2점 획득)',
      'toast.scanRemote': '상대가 스캔을 사용했습니다. (+2점 획득)',
      'toast.scanFound': '스캔 성공! 히든을 찾았습니다. (상대 +2점)',
      'toast.scanMiss': '스캔 실패… 히든이 없습니다. (상대 +2점)',

      'toast.probeMine': '⚠ 상대가 내 히든을 발견했습니다!',
      'toast.probeRemote': '상대가 히든을 발견했습니다!',
      'toast.probeLocal': '히든 발견! 그 자리엔 상대의 히든이 있었습니다. 다른 곳에 착수하세요.',

      'toast.captured': '{n}개의 돌을 따냈습니다!',
      'toast.capturedBy': '상대가 {n}개의 돌을 따냈습니다.',
      'toast.selfCapRemote': '상대의 착수가 히든에 걸려 그대로 잡혔습니다!',
      'toast.selfCapLocal': '⚠ 그 자리는 히든에 포위되어 있었습니다! 착수한 돌이 잡혔습니다.',
      'toast.plusPoint': '✨ +5점 화점 획득!',
      'toast.minusPoint': '💥 −5점 화점을 밟았습니다!',
      'toast.pass': '{name} 패스',

      /* --- 계가/종료 --- */
      'btn.scoreConfirm': '계가 확정',
      'status.scoring': '죽은 돌(사석)을 클릭해 지정한 뒤 계가를 확정하세요.',
      'toast.scoringStart': '양측 패스 — 계가로 넘어갑니다. 죽은 돌을 클릭해 지정하세요.',
      'status.waitScore': '상대의 계가 확정을 기다리는 중…',
      'toast.resume': '대국을 재개합니다.',

      'res.title': '결과',
      'res.stones': '돌',
      'res.bases': '베이스 ×5',
      'res.territory': '집',
      'res.plus': '+점 ×5',
      'res.minus': '−점 ×5',
      'res.betting': '턴베팅',
      'res.scanBonus': '스캔 보너스',
      'res.timePenalty': '초읽기 벌점',
      'res.total': '합계',
      'res.capNote': '따낸 돌: ● {b}개 · ○ {w}개 (따냄은 잡힌 쪽 점수 감소로 반영)',
      'res.tieNote': '동점 → 후공 승리!',
      'res.winner': '🏆 {name} ({color}) 승리!',
      'res.winnerBy': '🏆 {name} ({color}) {how}! — {loser} {why}',
      'win.timeout': '시간승',
      'win.left': '승리',
      'win.resign': '불계승',
      'why.timeout': '초읽기 소진(시간패)',
      'why.left': '접속 종료 (기권 처리)',
      'why.resign': '기권',
      'btn.rematch': '다시하기',
      'btn.rematchWait': '상대 수락 대기 중…',
      'btn.toLobby': '로비로',
      'toast.rematchWant': '상대가 다시하기를 원합니다.',

      /* --- 패널/시계 --- */
      'panel.detail': '돌 {stones} · 베이스 {bases} · 집 {territory}<br>+점 {plus} · −점 {minus} · 따냄 {captures}개<br>베팅 {betting} · 스캔 {scan}',
      'panel.timePenalty': ' · 시간벌점 −{n}',
      'clock.active': '⏱ {sec}초 · 초읽기 {periods}회',
      'clock.idle': '초읽기 {periods}회',
      'toast.byoLocal': '⏱ {name} 초읽기 소진! −2점 (남은 초읽기 {n}회)',
      'toast.byoRemote': '⏱ 상대 초읽기 소진! −2점 (남은 {n}회)',

      /* --- 확인 대화상자 --- */
      'confirm.yes': '확인',
      'confirm.no': '취소',
      'confirm.hidden': '히든 착수: 착수 후에는 화면에 표시되지 않습니다. 상대가 화면을 보고 있지 않은지 확인하세요!',
      'confirm.scan': '스캔을 사용하면 성공/실패와 관계없이 상대에게 2점을 줍니다. 사용할까요?',
      'confirm.pass': '패스하시겠습니까? 양측이 연속 패스하면 계가로 넘어갑니다.',
      'confirm.resign': '{name} — 정말 기권하시겠습니까?',
      'confirm.leaveGame': '대국 중에 나가면 기권(패배) 처리되고 상대가 승리합니다. 정말 나가시겠습니까?',
      'confirm.leave': '게임을 나가고 로비로 돌아갈까요?',

      /* --- 온라인 대기/네트워크 --- */
      'wait.title': '온라인 대기',
      'wait.default': '기다리는 중…',
      'wait.forOpponent': '상대가 접속하길 기다리는 중…',
      'wait.joining': '방에 접속하는 중…',
      'wait.joiningRoom': '{name}의 방에 접속하는 중…',
      'wait.publicOpen': '공개방을 열었습니다. 상대가 목록에서 참가하길 기다리는 중…',
      'wait.copyCode': '코드 복사',
      'wait.codeNote': '이 코드를 친구에게 알려주세요. 친구는 같은 페이지에서<br>「온라인 — 코드로 참가」로 코드를 입력하면 됩니다.',
      'wait.cancel': '취소',
      'toast.codeCopied': '방 코드가 복사되었습니다.',
      'err.needCode': '방 코드를 입력하세요.',
      'err.noPeerHost': 'PeerJS를 불러오지 못해 온라인 대전을 할 수 없습니다.',
      'err.noPeerJoin': 'PeerJS를 불러오지 못해 참가할 수 없습니다.',
      'toast.oppLeft': '상대의 접속이 끊어졌습니다.',
      'toast.disconnected': '상대와의 연결이 끊어졌습니다.',
      'net.noPeer': 'PeerJS를 불러오지 못했습니다. 인터넷 연결을 확인하세요.',
      'net.peerUnavailable': '해당 코드의 방을 찾을 수 없습니다. 코드를 확인하세요.',
      'net.network': '네트워크 연결에 문제가 있습니다.',
      'net.incompatible': '이 브라우저는 WebRTC를 지원하지 않습니다.',
      'net.error': '연결 오류: {msg}',
      'net.noMqttLib': 'MQTT 라이브러리를 불러오지 못했습니다. 인터넷 연결을 확인하세요.',

      /* --- 규칙 도움말 --- */
      'help.title': '히든스톤 규칙 요약',
      'help.close': '닫기',
      'help.1': '<b>기본</b> — 바둑과 동일: 활로가 없는 돌은 따냄. 자살수 금지, 패 규칙 적용. 돌 1개 = 1점.',
      'help.2': '<b>±화점</b> — <span class="pt-plus">+</span>에 돌을 두면 +5점, <span class="pt-minus">−</span>는 −5점. <b>처음 돌을 놓는 순간 1회만</b> 적용되고 화점은 사라집니다. 남아 있는 −점은 집으로 계산되지 않습니다.',
      'help.3': '<b>베이스빌드</b> — 시작 전 각자 몰래 돌 3개 배치 후 동시 공개. 같은 자리에 겹치면 둘 다 제거되고 그 자리는 −점. 베이스 돌(무늬)은 5점짜리 — 잡으면 5점, 살아 있으면 5점.',
      'help.4': '<b>턴베팅</b> — 베이스 공개 후 덤을 비밀 베팅. 높은 쪽이 흑+선공, 베팅값만큼 후공에게 점수를 줍니다. 동률 2번이면 랜덤 선공(흑백 유지).',
      'help.5': '<b>히든(H)</b> — 게임당 1회, 보이지 않는 착수. 상대는 사용 사실만 알 수 있습니다. 잡거나 잡히면 공개. 상대가 그 자리를 클릭하면 공개되고 상대는 다른 곳에 둘 수 있습니다.',
      'help.6': '<b>스캔(S)</b> — 게임당 1회, 한 지점을 확인. 성공/실패와 무관하게 상대에게 2점. 찾은 히든은 잠깐만 보이니 위치를 기억하세요! 스캔은 턴을 소비하지 않습니다.',
      'help.7': '<b>따냄</b> — 잡힌 돌은 잡힌 쪽의 점수(돌 1점, 베이스 5점)가 사라지는 것으로 반영됩니다.',
      'help.8': '<b>초읽기</b> — (옵션) 매 수마다 초읽기. 1회 소진할 때마다 −2점, 전부 소진하면 시간패.',
      'help.9': '<b>종국</b> — 양측 연속 패스 → 사석 지정 → 계가. <b>동점이면 후공 승</b>.',
      'help.10': '<b>점수</b> — 돌 + 베이스×5 + 집 + (+점×5) − (−점×5) + 턴베팅 + 스캔보너스 − 초읽기벌점.',

      /* --- 사운드 --- */
      'sound.on': '소리 끄기',
      'sound.off': '소리 켜기',

      /* --- 음성 안내 --- */
      'voice.lang': 'ko-KR',
      'voice.gameStart': '대국 시작',
      'voice.hidden': '히든',
      'voice.pass': '패스',
      'voice.scoring': '계가를 시작합니다. 죽은 돌을 지정한 뒤 계가를 확정하세요.',
    },

    /* ==================== English ==================== */
    en: {
      /* --- Brand --- */
      'app.title': 'HIDDENSTONE — Strategic Go Battle',
      'app.subtitle': 'One move they never see — <b>HIDDENSTONE</b>',
      'app.tagline': 'Base Build · Turn Bidding · Hidden · Scan — Go with a mind game',
      'app.footer': 'A strategy battle game built on Go rules · Base Build / Turn Bidding / Hidden / Scan',
      'lang.name': 'English',
      'lang.switchTo': '한국어로 전환',

      /* --- Lobby --- */
      'lobby.help': '📖 Rules',
      'lobby.bgmLabel': '🎵 Lobby music',
      'bgm.zen': '🪷 Still Garden',
      'bgm.arcade': '🕹️ Arcade',
      'bgm.epic': '⚔️ Epic Title',

      'lobby.modeHead': 'GAME MODE',
      'mode.hotseat.name': 'Two players, one device',
      'mode.hotseat.desc': 'P1/P2 take turns (secret phases hide the screen)',
      'mode.public.name': 'Online — Public room',
      'mode.public.desc': 'Browse open rooms and join instantly, no code needed',
      'mode.host.name': 'Online — Create code room',
      'mode.host.desc': 'Generate a private room code and send it to a friend',
      'mode.guest.name': 'Online — Join by code',
      'mode.guest.desc': 'Enter the room code your friend gave you',

      'lobby.onlineWarn': '⚠ PeerJS failed to load, so online modes are unavailable. Check your internet connection.',
      'lobby.codeLabel': 'Room code',
      'lobby.codePh': 'e.g. A3K7Q',

      'lobby.createPublic': '＋ Create public room',
      'lobby.refresh': 'Refresh list',
      'lobby.connecting': 'Connecting to the lobby…',
      'lobby.connected': 'Lobby connected',
      'lobby.subFail': 'Failed to subscribe to the lobby.',
      'lobby.noMqttLib': 'The MQTT lobby library failed to load. Please use a code room instead.',
      'lobby.unavailable': 'The public lobby is unavailable.',
      'lobby.brokerFail': 'Could not reach the public lobby server. Use a code room or try again shortly.',
      'lobby.noRooms': 'No open rooms. Hit “Create public room” and wait for an opponent.',
      'room.anon': 'Anonymous',
      'room.waiting': 'Waiting',
      'room.join': 'Join',

      'lobby.mapHead': 'MAP',
      'lobby.byoHead': 'BYO-YOMI (TIME LIMIT)',
      'byo.none.name': 'None',
      'byo.none.desc': 'Play at your own pace, no clock',
      'byo.25.name': '25 sec × 3',
      'byo.25.desc': 'Official tournament setting. −2 points per period used, loss on time when all are gone',
      'byo.15.name': '15 sec × 3',
      'byo.15.desc': 'Speed match',

      'lobby.playerHead': 'PLAYERS',
      'label.p1': 'P1 name',
      'label.p2': 'P2 name',
      'label.myName': 'Your name',
      'lobby.start': 'START GAME',

      /* --- Maps --- */
      'map.genesis.name': 'Genesis',
      'map.genesis.desc': 'Official tournament standard. −points on the 3-3 corners, +points at the midpoint of each edge (balanced).',
      'map.sky.name': 'Sky',
      'map.sky.desc': 'Genesis plus a −point on the center point (−5/+4, spread out).',
      'map.chaos.name': 'Chaos',
      'map.chaos.desc': '8 −points, no +points. Close-combat map (coordinates are a researched estimate).',
      'map.classic.name': 'Classic',
      'map.classic.desc': 'No ±points — pure skill.',
      'map.serengeti.name': 'Serengeti',
      'map.serengeti.desc': 'Large 13×13 board. The Genesis pattern extended (−4/+4, balanced).',
      'map.pts': '{plus} plus / {minus} minus',

      /* --- Default names --- */
      'name.p1': 'Player 1',
      'name.p2': 'Player 2',
      'name.me': 'You',
      'name.opponent': 'Opponent',

      /* --- Game header --- */
      'phase.base': 'BASE BUILD',
      'phase.betting': 'TURN BIDDING',
      'phase.play': 'MATCH',
      'phase.scoring': 'SCORING',
      'btn.rules': 'Rules',
      'btn.leave': 'Leave',
      'btn.pass': 'Pass',
      'btn.resume': 'Resume match',
      'btn.resign': 'Resign',
      'btn.hidden': 'Hidden',
      'btn.scan': 'Scan',
      'color.black': 'Black',
      'color.white': 'White',

      /* --- Base build --- */
      'handoff.title': 'Hand off',
      'handoff.ok': 'Ready — start',
      'handoff.baseTitle': '{name}’s base build',
      'handoff.baseDesc': '{other}, look away! You are secretly placing {n} stones.',
      'status.basePick': '{name} — secretly place {n} base stones (click again to undo)',
      'status.waitBase': 'Waiting for your opponent’s base build…',
      'btn.baseConfirm': 'Confirm bases ({cur}/{max})',
      'err.baseMax': 'You can place at most {n} bases.',
      'toast.baseCollision': 'Base collision! {n} point(s) turned into −points.',
      'toast.baseReveal': 'Bases revealed!',

      /* --- Turn bidding --- */
      'status.betting': 'Study the field and bid komi for the first move.',
      'handoff.betTitle': '{name}’s bid',
      'handoff.betDesc': '{other}, look away! Bid as much as you want the first move.',
      'handoff.betDescShort': '{other}, look away!',
      'handoff.rebidTitle': '{name}’s re-bid',
      'bet.title': '{name}’s bid',
      'bet.rebidSuffix': ' (re-bid, round {n})',
      'bet.note': '👀 <b>Check the revealed base positions on the field</b> before you bid.<br>The higher bid takes <b>Black + the first move</b>, and pays that many points to the opponent.<br>A tie means a re-bid; a second tie picks the first move at random (colors stay).',
      'bet.unit': 'pts',
      'bet.ok': 'Confirm bid',
      'status.waitBid': 'Waiting for your opponent’s bid…',
      'toast.bidTie': 'Tied bid ({v} pts)! Re-bidding.',
      'toast.bidTieRandom': 'Tied again! The first move is decided at random. (Colors stay the same.)',
      'toast.betResult': '{winner} bid {v} and takes the first move as {color}! {loser} starts with {bid} points.',

      /* --- Match --- */
      'status.turn': '{name} ({color}) to play',
      'status.suffixHidden': ' — choose where to place your hidden stone',
      'status.suffixScan': ' — choose a point to scan',
      'status.suffixWait': ' — waiting',

      'illegal.occupied': 'There is already a stone there.',
      'illegal.suicide': 'Self-capture is not allowed.',
      'illegal.ko': 'Ko! You cannot recapture immediately.',
      'illegal.notYourTurn': 'It is not your turn.',
      'illegal.noHiddenLeft': 'You have already used your hidden move.',
      'illegal.noScanLeft': 'You have already used your scan.',
      'illegal.notPlaying': 'You cannot play right now.',
      'illegal.default': 'You cannot play there.',

      'toast.hiddenArmRemote': '⚠ Your opponent is playing a hidden stone!',
      'toast.hiddenRemote': '⚠ Your opponent played a hidden stone! Its position is not shown.',
      'toast.hiddenOnlineOk': 'Hidden stone placed. Your opponent cannot see it.',
      'toast.hiddenLocalOk': 'Hidden stone placed (not drawn on screen — remember where it is!)',
      'toast.hiddenRevealed': 'A hidden stone has been revealed!',

      'toast.scanRemoteFound': '⚠ Your opponent scanned and found your hidden stone! (they gain +2)',
      'toast.scanRemote': 'Your opponent used a scan. (you gain +2)',
      'toast.scanFound': 'Scan hit! You found the hidden stone. (opponent +2)',
      'toast.scanMiss': 'Scan missed… nothing hidden there. (opponent +2)',

      'toast.probeMine': '⚠ Your opponent found your hidden stone!',
      'toast.probeRemote': 'Your opponent found a hidden stone!',
      'toast.probeLocal': 'Hidden stone found! Your opponent’s hidden stone was there. Play somewhere else.',

      'toast.captured': 'You captured {n} stone(s)!',
      'toast.capturedBy': 'Your opponent captured {n} stone(s).',
      'toast.selfCapRemote': 'Your opponent walked into your hidden stone and was captured!',
      'toast.selfCapLocal': '⚠ That point was surrounded by a hidden stone! Your stone was captured.',
      'toast.plusPoint': '✨ +5 point claimed!',
      'toast.minusPoint': '💥 You stepped on a −5 point!',
      'toast.pass': '{name} passed',

      /* --- Scoring / end --- */
      'btn.scoreConfirm': 'Confirm score',
      'status.scoring': 'Click dead stones to mark them, then confirm the score.',
      'toast.scoringStart': 'Both passed — moving to scoring. Click dead stones to mark them.',
      'status.waitScore': 'Waiting for your opponent to confirm the score…',
      'toast.resume': 'The match resumes.',

      'res.title': 'Result',
      'res.stones': 'Stones',
      'res.bases': 'Bases ×5',
      'res.territory': 'Territory',
      'res.plus': '+points ×5',
      'res.minus': '−points ×5',
      'res.betting': 'Turn bidding',
      'res.scanBonus': 'Scan bonus',
      'res.timePenalty': 'Byo-yomi penalty',
      'res.total': 'Total',
      'res.capNote': 'Captured: ● {b} · ○ {w} (captures are scored as a loss for the captured side)',
      'res.tieNote': 'Tied → the second player wins!',
      'res.winner': '🏆 {name} ({color}) wins!',
      'res.winnerBy': '🏆 {name} ({color}) {how}! — {loser} {why}',
      'win.timeout': 'wins on time',
      'win.left': 'wins',
      'win.resign': 'wins by resignation',
      'why.timeout': 'ran out of byo-yomi',
      'why.left': 'disconnected (counted as resignation)',
      'why.resign': 'resigned',
      'btn.rematch': 'Rematch',
      'btn.rematchWait': 'Waiting for opponent…',
      'btn.toLobby': 'Lobby',
      'toast.rematchWant': 'Your opponent wants a rematch.',

      /* --- Panel / clock --- */
      'panel.detail': 'Stones {stones} · Bases {bases} · Territory {territory}<br>+pts {plus} · −pts {minus} · Captured {captures}<br>Bid {betting} · Scan {scan}',
      'panel.timePenalty': ' · Time penalty −{n}',
      'clock.active': '⏱ {sec}s · {periods} left',
      'clock.idle': '{periods} periods left',
      'toast.byoLocal': '⏱ {name} used a byo-yomi period! −2 points ({n} left)',
      'toast.byoRemote': '⏱ Opponent used a byo-yomi period! −2 points ({n} left)',

      /* --- Confirm dialogs --- */
      'confirm.yes': 'OK',
      'confirm.no': 'Cancel',
      'confirm.hidden': 'Hidden move: it will not be drawn on screen once played. Make sure your opponent is not watching!',
      'confirm.scan': 'A scan gives your opponent 2 points whether it hits or misses. Use it?',
      'confirm.pass': 'Pass? If both players pass in a row, the game moves to scoring.',
      'confirm.resign': '{name} — really resign?',
      'confirm.leaveGame': 'Leaving mid-match counts as a resignation and your opponent wins. Leave anyway?',
      'confirm.leave': 'Leave the game and return to the lobby?',

      /* --- Online wait / network --- */
      'wait.title': 'Online',
      'wait.default': 'Waiting…',
      'wait.forOpponent': 'Waiting for an opponent to connect…',
      'wait.joining': 'Connecting to the room…',
      'wait.joiningRoom': 'Connecting to {name}’s room…',
      'wait.publicOpen': 'Public room is open. Waiting for someone to join from the list…',
      'wait.copyCode': 'Copy code',
      'wait.codeNote': 'Send this code to your friend. On the same page they pick<br>“Online — Join by code” and enter it.',
      'wait.cancel': 'Cancel',
      'toast.codeCopied': 'Room code copied.',
      'err.needCode': 'Enter a room code.',
      'err.noPeerHost': 'PeerJS failed to load, so online play is unavailable.',
      'err.noPeerJoin': 'PeerJS failed to load, so you cannot join.',
      'toast.oppLeft': 'Your opponent disconnected.',
      'toast.disconnected': 'The connection to your opponent was lost.',
      'net.noPeer': 'PeerJS failed to load. Check your internet connection.',
      'net.peerUnavailable': 'No room found with that code. Please check it.',
      'net.network': 'There is a problem with the network connection.',
      'net.incompatible': 'This browser does not support WebRTC.',
      'net.error': 'Connection error: {msg}',
      'net.noMqttLib': 'The MQTT library failed to load. Check your internet connection.',

      /* --- Rules help --- */
      'help.title': 'HIDDENSTONE rules at a glance',
      'help.close': 'Close',
      'help.1': '<b>Basics</b> — same as Go: stones with no liberties are captured. No self-capture, ko applies. Each stone on the board = 1 point.',
      'help.2': '<b>±points</b> — playing on a <span class="pt-plus">+</span> scores +5, a <span class="pt-minus">−</span> scores −5. It applies <b>only once, the moment the first stone lands</b>, then the marker disappears. Unclaimed −points do not count as territory.',
      'help.3': '<b>Base Build</b> — before the match each side secretly places 3 stones, then both are revealed at once. Stones on the same point cancel out and that point becomes a −point. A base stone (swirl) is worth 5 points — 5 if it lives, 5 lost if captured.',
      'help.4': '<b>Turn Bidding</b> — after the reveal, secretly bid komi. The higher bid takes Black and the first move, paying that many points to the opponent. Two ties in a row means the first move is random (colors stay).',
      'help.5': '<b>Hidden (H)</b> — once per game, an invisible move. Your opponent only learns that you used it. It is revealed when it captures or is captured. If your opponent clicks that point, it is revealed and they may play elsewhere.',
      'help.6': '<b>Scan (S)</b> — once per game, inspect one point. Hit or miss, your opponent gains 2 points. A found hidden stone flashes only briefly, so remember the spot! A scan does not use your turn.',
      'help.7': '<b>Captures</b> — a captured stone is scored as points lost by the side that owned it (1 for a stone, 5 for a base).',
      'help.8': '<b>Byo-yomi</b> — (optional) a countdown on every move. Each period used costs −2 points; running out of all of them loses on time.',
      'help.9': '<b>Ending</b> — two passes in a row → mark dead stones → score. <b>A tie goes to the second player.</b>',
      'help.10': '<b>Score</b> — stones + bases×5 + territory + (+points×5) − (−points×5) + turn bid + scan bonus − byo-yomi penalty.',

      /* --- Sound --- */
      'sound.on': 'Mute',
      'sound.off': 'Unmute',

      /* --- Voice --- */
      'voice.lang': 'en-US',
      'voice.gameStart': 'Game start',
      'voice.hidden': 'Hidden',
      'voice.pass': 'Pass',
      'voice.scoring': 'Scoring. Mark the dead stones, then confirm the score.',
    },
  };

  /* ---------------- 상태 ---------------- */
  let lang = 'ko';
  const listeners = [];

  function detect() {
    try {
      const saved = localStorage.getItem(STORE_KEY);
      if (saved && LANGS.indexOf(saved) >= 0) return saved;
    } catch (e) {}
    try {
      const nav = (global.navigator.language || global.navigator.userLanguage || 'ko').toLowerCase();
      return nav.indexOf('ko') === 0 ? 'ko' : 'en';
    } catch (e) {}
    return 'ko';
  }

  /* {param} 자리를 값으로 채운다. 키가 없으면 키 자체를 돌려줘 누락을 눈에 띄게 한다. */
  function t(key, params) {
    const table = DICT[lang] || DICT.ko;
    let s = table[key];
    if (s == null) s = (DICT.ko[key] != null ? DICT.ko[key] : key);
    if (params) {
      s = s.replace(/\{(\w+)\}/g, (m, k) =>
        (params[k] != null ? String(params[k]) : m));
    }
    return s;
  }

  /* HTML의 data-i18n* 속성을 현재 언어로 채운다 */
  function applyDom(root) {
    const scope = root || document;
    scope.querySelectorAll('[data-i18n]').forEach((el) => {
      el.textContent = t(el.getAttribute('data-i18n'));
    });
    scope.querySelectorAll('[data-i18n-html]').forEach((el) => {
      el.innerHTML = t(el.getAttribute('data-i18n-html'));
    });
    scope.querySelectorAll('[data-i18n-ph]').forEach((el) => {
      el.placeholder = t(el.getAttribute('data-i18n-ph'));
    });
    scope.querySelectorAll('[data-i18n-title]').forEach((el) => {
      el.title = t(el.getAttribute('data-i18n-title'));
    });
    scope.querySelectorAll('[data-i18n-aria]').forEach((el) => {
      el.setAttribute('aria-label', t(el.getAttribute('data-i18n-aria')));
    });
    document.documentElement.lang = lang;
    document.title = t('app.title');
  }

  function setLang(l, opts) {
    if (LANGS.indexOf(l) < 0 || l === lang) return;
    lang = l;
    try { localStorage.setItem(STORE_KEY, l); } catch (e) {}
    applyDom();
    if (!(opts && opts.silent)) listeners.forEach((fn) => { try { fn(l); } catch (e) {} });
  }

  const I18n = {
    get lang() { return lang; },
    langs: LANGS.slice(),
    other() { return lang === 'ko' ? 'en' : 'ko'; },
    t,
    setLang,
    toggle() { setLang(I18n.other()); },
    apply: applyDom,
    onChange(fn) { if (typeof fn === 'function') listeners.push(fn); },
    /* 특정 언어의 값을 강제로 뽑을 때(음성 언어코드 등) */
    inLang(l, key) { return (DICT[l] && DICT[l][key]) || t(key); },
  };

  lang = detect();

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => applyDom());
  } else {
    applyDom();
  }

  global.HSI18n = I18n;
})(window);
