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

      'wait.inviteLabel': '초대 링크 — 이것만 보내면 됩니다',
      'wait.copyLink': '링크 복사',
      'wait.linkNote': '친구가 이 링크를 누르면 <b>코드 입력 없이 바로</b> 들어옵니다. 카카오톡·디스코드에 그대로 붙여넣으세요.',
      'wait.invited': '초대 링크로 방에 접속하는 중… (방 코드 {code})',
      'toast.linkCopied': '초대 링크를 복사했습니다. 친구에게 붙여넣기 하세요.',

      /* --- 인터랙티브 튜토리얼 (js/tutorial.js) --- */
      'tut.open': '▶ 직접 해보기 (2분)',
      'tut.stepOf': '{n} / {total}',
      'tut.next': '다음 →',
      'tut.skip': '튜토리얼 종료',
      'tut.need.hidden': '먼저 왼쪽 패널의 <b>H 히든</b> 버튼을 누르세요.',
      'tut.need.scan': '먼저 왼쪽 패널의 <b>S 스캔</b> 버튼을 누르세요.',
      'tut.wrong.occupied': '이미 돌이 있는 자리입니다. 빈 교차점을 클릭하세요.',
      'tut.wrong.illegal': '그 자리에는 둘 수 없습니다. 다른 곳을 시도해보세요.',

      'tut.place.title': '돌 놓기',
      'tut.place.ask': '빈 교차점을 아무 곳이나 클릭해 흑돌을 놓아보세요.',
      'tut.place.done': '그게 전부입니다. 판에 살아남은 돌 하나가 곧 1점입니다.',

      'tut.capture.title': '따냄',
      'tut.capture.ask': '가운데 백돌은 활로가 <b>{coord}</b> 하나뿐입니다. 거기에 두어 따내세요.',
      'tut.capture.wrong': '{coord}에 두어야 백돌을 따낼 수 있습니다.',
      'tut.capture.done': '따냈습니다. 이 게임의 따냄은 잡은 쪽이 점수를 얻는 게 아니라, <b>잡힌 쪽의 점수가 사라지는</b> 것으로 계산됩니다.',

      'tut.plus.title': '± 화점',
      'tut.plus.ask': '<b>{coord}</b>의 + 다이아몬드에 처음 놓는 돌은 즉시 5점을 얻습니다. 놓아보세요.',
      'tut.plus.wrong': '+ 다이아몬드는 {coord}입니다. 아래쪽 파란 − 는 반대로 5점을 잃는 자리예요.',
      'tut.plus.done': '5점 획득. 표식이 사라진 것을 보세요 — ±화점은 <b>처음 한 번만</b> 발동합니다.',

      'tut.base.title': '베이스 돌',
      'tut.base.ask': '무늬가 있는 돌은 베이스 — 1점이 아니라 <b>5점</b>짜리입니다. {coord}에 두어 백 베이스를 잡아보세요.',
      'tut.base.wrong': '{coord}입니다. 베이스 하나는 일반 돌 다섯 개와 같습니다.',
      'tut.base.done': '백은 5점을 잃었습니다. 그래서 베이스는 처음 배치할 때 <b>서로 떨어뜨려</b> 두는 게 안전합니다.',

      'tut.hidden.title': '히든 — 보이지 않는 수',
      'tut.hidden.ask': '왼쪽 패널의 <b>H 히든</b> 버튼을 누른 뒤, 빈 자리 아무 곳에 두세요.',
      'tut.hidden.done': '놓았습니다. 점선 링은 <b>나에게만</b> 보이는 표시입니다 — 상대 화면에는 이 돌이 아예 그려지지 않고, "히든을 썼다"는 사실만 통보됩니다.',

      'tut.scan.title': '스캔 — 한 점 탐색',
      'tut.scan.ask': '상대가 히든을 숨겨 뒀습니다. 연습이니 알려드리면 <b>{coord}</b>입니다. <b>S 스캔</b>을 누르고 그 자리를 확인해보세요.',
      'tut.scan.wrong': '{coord}를 스캔해보세요.',
      'tut.scan.done': '찾았습니다. 실전에서는 위치를 <b>모르는 상태로</b> 찍어야 하고, 성공이든 실패든 상대가 2점을 얻습니다. 게다가 잠깐 반짝였다 사라지니 기억해야 합니다.',

      'tut.finish.title': '준비 끝!',
      'tut.finish.body': '규칙의 핵심은 다 만져봤습니다. 남은 건 <b>베이스빌드</b>(시작 전 몰래 3개)와 <b>턴베팅</b>(선공 경매)인데, 둘 다 실제 대국이 시작되면 화면이 순서대로 안내해줍니다.',
      'tut.finish.playAI': 'AI와 한 판 두기',
      'tut.finish.lobby': '로비로',

      /* --- AI 대전 --- */
      'mode.ai.name': 'AI와 대전',
      'mode.ai.desc': '혼자서 바로 시작 — 난이도 3단계',
      'lobby.aiHead': 'AI 난이도',
      'ai.easy.name': '입문',
      'ai.easy.desc': '규칙을 익히는 중이라면. 실수도 하고 느슨하게 둡니다',
      'ai.normal.name': '보통',
      'ai.normal.desc': '따냄·활로를 챕니다. 히든과 스캔도 씁니다',
      'ai.hard.name': '고수',
      'ai.hard.desc': '한 수 앞을 내다보고 손해 보는 수를 피합니다',
      'ai.name.easy': 'AI · 입문',
      'ai.name.normal': 'AI · 보통',
      'ai.name.hard': 'AI · 고수',

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

      /* --- 일러스트 가이드 (js/guide.js) --- */
      'guide.tabHow': '게임 배우기',
      'guide.tabRules': '규칙 요약',
      'guide.open': '❓ 게임 배우기',
      'guide.intro': '바둑을 아신다면 이 게임의 90%는 이미 아는 겁니다. 돌을 에워싸 따내고, 집이 넓은 쪽이 이깁니다. 여기에 <b>정보</b>를 다루는 네 가지 규칙이 더해집니다.',
      'guide.outro': '한 판만 해보면 다 익혀집니다. 규칙 세부 사항은 위쪽 「규칙 요약」 탭에 정리돼 있습니다.',

      'guide.what.title': '이 게임은 무엇인가',
      'guide.what.lead': '바둑판 위의 바둑입니다. 다만 시작 전부터 서로 숨기는 것이 있고, 선공을 돈으로 사며, 게임당 한 번은 <b>보이지 않는 수</b>를 둘 수 있습니다.',
      'guide.what.p1': '<b>베이스빌드</b> — 대국 시작 전, 서로 몰래 돌 3개를 깔아둡니다.',
      'guide.what.p2': '<b>턴베팅</b> — 고정 덤 대신, 선공을 놓고 점수를 걸어 경매합니다.',
      'guide.what.p3': '<b>히든</b> — 게임당 1회, 상대 화면에 그려지지 않는 수.',
      'guide.what.p4': '<b>스캔</b> — 게임당 1회, 한 지점에 상대 히든이 있는지 확인.',
      'guide.what.panelGo': '보통 바둑',
      'guide.what.panelHs': '히든스톤',
      'guide.what.cap': '같은 바둑판인데, 무늬 있는 베이스 돌·± 다이아몬드·점선으로 표시된 히든이 얹혀 있습니다.',

      'guide.points.title': '± 화점',
      'guide.points.lead': '다이아몬드로 표시된 지점이 있습니다. 그 자리에 <b>처음</b> 놓인 돌이 즉시 점수를 얻습니다 — +는 5점, −는 −5점. 그리고 표식은 사라집니다.',
      'guide.points.p1': '딱 한 번만 발동합니다. 그 자리에 나중에 놓이는 돌은 아무 효과가 없습니다.',
      'guide.points.p2': '아무도 밟지 않은 −점은 중립입니다. 어느 쪽 집으로도 계산되지 않습니다.',
      'guide.points.p3': '맵마다 배치가 다릅니다. 제네시스는 +4/−4, 카오스는 −8에 +는 없습니다.',
      'guide.points.panelBefore': '두기 전',
      'guide.points.panelAfter': '둔 다음',
      'guide.points.cap': '흑이 + 자리에 놓아 5점을 얻고, 다이아몬드는 소멸합니다(점선이 사라진 자리).',

      'guide.base.title': '베이스빌드',
      'guide.base.lead': '첫 수를 두기 전에 각자 <b>몰래</b> 돌 3개를 놓습니다. 두 사람의 배치는 동시에 공개됩니다.',
      'guide.base.p1': '베이스 돌은 1점이 아니라 <b>5점</b>입니다. 잡히면 5점이 날아갑니다.',
      'guide.base.p2': '소용돌이 무늬가 있어 일반 돌과 항상 구분됩니다.',
      'guide.base.p3': '같은 자리를 골랐다면 둘 다 제거되고, 그 지점은 −점으로 바뀝니다.',
      'guide.base.panelMine': '내 배치 (비공개)',
      'guide.base.panelTheirs': '상대 배치 (비공개)',
      'guide.base.panelReveal': '동시 공개',
      'guide.base.cap': '가운데를 서로 겹쳐 골랐으므로 둘 다 사라지고 그 자리는 −점이 됩니다.',

      'guide.komi.title': '턴베팅 — 선공 경매',
      'guide.komi.lead': '바둑에서는 백이 고정된 덤을 받아 흑의 선공 이득을 보상합니다. 여기서는 그 덤을 <b>경매</b>합니다. 베이스가 공개된 판을 보고, 두 사람이 동시에 0~25 중 하나를 비밀 제시합니다.',
      'guide.komi.p1': '높게 부른 쪽이 <b>흑을 잡고 선공</b>합니다. 그리고 부른 점수만큼 상대에게 줍니다.',
      'guide.komi.p2': '즉, 20을 불렀다면 선공이 그만큼 절실하다는 뜻이고 값도 그만큼 치릅니다.',
      'guide.komi.p3': '동률이면 한 번 재베팅. 또 동률이면 선공만 무작위로 정하고 흑백은 그대로입니다.',
      'guide.komi.who1': '플레이어 1',
      'guide.komi.who2': '플레이어 2',
      'guide.komi.unit': '점',
      'guide.komi.ocFirst': '흑 · 선공',
      'guide.komi.ocFirstSub': '더 높게 불렀으므로',
      'guide.komi.ocPaid': '{v}점 받고 시작',
      'guide.komi.ocPaidSub': '백 · 후공',
      'guide.komi.cap': '8 대 3 → 플레이어 1이 흑으로 선공하고, 플레이어 2는 8점을 안고 시작합니다.',

      'guide.hidden.title': '히든 — 보이지 않는 수',
      'guide.hidden.lead': '게임당 한 번, 상대 화면에 <b>그려지지 않는</b> 돌을 놓을 수 있습니다. 유령이 아니라 실제 돌입니다. 활로를 차지하고, 따내고, 잡히기도 합니다.',
      'guide.hidden.p1': '상대는 "히든을 썼다"는 사실만 통보받습니다. 위치는 모릅니다.',
      'guide.hidden.p2': '따내거나, 잡히거나, 상대가 그 자리에 두려 하면 공개됩니다.',
      'guide.hidden.p3': '상대가 그 자리를 클릭하면 다른 곳에 두게 되지만 — 그때부터는 위치를 알게 됩니다.',
      'guide.hidden.panelYou': '내 화면',
      'guide.hidden.panelThem': '상대 화면',
      'guide.hidden.cap': '같은 국면입니다. 점선으로 표시된 돌은 나에게만 보입니다.',

      'guide.scan.title': '스캔 — 한 점 탐색',
      'guide.scan.lead': '게임당 한 번, 한 지점을 지목해 상대 히든이 거기 있는지 확인합니다. <b>턴을 소비하지 않습니다.</b>',
      'guide.scan.p1': '성공이든 실패든 상대에게 <b>2점</b>을 줍니다. 정보는 공짜가 아닙니다.',
      'guide.scan.p2': '찾아내도 잠깐 반짝였다가 사라집니다. 위치를 기억해야 합니다.',
      'guide.scan.p3': '턴을 쓰지 않으니, 스캔한 그 수에 바로 착수할 수 있습니다.',
      'guide.scan.panelHit': '성공 — 히든 발견',
      'guide.scan.panelMiss': '실패 — 없음',
      'guide.scan.cap': '어느 쪽이든 상대는 2점을 얻습니다. 그래서 언제 쓰는지가 실력입니다.',

      'guide.scoring.title': '종국과 점수 계산',
      'guide.scoring.lead': '양쪽이 연달아 패스하면 끝납니다. 죽은 돌을 지정하고 계가를 확정합니다. 점수는 집만이 아닙니다.',
      'guide.scoring.p1': '판에 살아 있는 돌은 1점씩, 베이스는 5점씩 계산됩니다.',
      'guide.scoring.p2': '따냄은 <b>잡힌 쪽의 점수가 줄어드는</b> 것으로 반영됩니다. 잡은 쪽에 가산되지 않습니다.',
      'guide.scoring.p3': '합계가 같으면 <b>후공이 승리</b>합니다.',
      'guide.scoring.panelBoard': '종국 국면',
      'guide.scoring.panelTable': '점수 계산 예',
      'guide.scoring.cap': '× 는 사석입니다. 흑은 고리 8개(그중 하나가 베이스)로 안쪽 빈 점 1개를 집으로 만들었고, 백은 베팅으로 받은 8점을 그대로 가집니다. 오른쪽 위 −점은 아무도 밟지 않았으므로 어느 쪽 점수에도 들어가지 않습니다.',

      'guide.flow.title': '한 판의 흐름',
      'guide.flow.lead': '시작부터 끝까지 네 단계입니다.',
      'guide.flow.s1': '몰래 3개',
      'guide.flow.s2': '선공 경매',
      'guide.flow.s3': '히든 · 스캔',
      'guide.flow.s4': '사석 · 계가',

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
      'app.tagline': 'Base Build · Komi Bidding · Hidden · Scan — Go with a mind game',
      'app.footer': 'A strategy battle game built on Go rules · Base Build / Komi Bidding / Hidden / Scan',
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

      'wait.inviteLabel': 'Invite link — just send this',
      'wait.copyLink': 'Copy link',
      'wait.linkNote': 'Your friend clicks this and walks straight in — <b>no code to type</b>. Paste it into any chat.',
      'wait.invited': 'Joining the room from your invite link… (room code {code})',
      'toast.linkCopied': 'Invite link copied. Paste it to your friend.',

      /* --- Interactive tutorial (js/tutorial.js) --- */
      'tut.open': '▶ Try it hands-on (2 min)',
      'tut.stepOf': '{n} / {total}',
      'tut.next': 'Next →',
      'tut.skip': 'Exit tutorial',
      'tut.need.hidden': 'First press the <b>H Hidden</b> button in the left panel.',
      'tut.need.scan': 'First press the <b>S Scan</b> button in the left panel.',
      'tut.wrong.occupied': 'There is already a stone there. Click an empty intersection.',
      'tut.wrong.illegal': 'You cannot play there. Try another point.',

      'tut.place.title': 'Placing a stone',
      'tut.place.ask': 'Click any empty intersection to place a black stone.',
      'tut.place.done': 'That is all there is to it. Every stone that survives on the board is worth 1 point.',

      'tut.capture.title': 'Capturing',
      'tut.capture.ask': 'The white stone in the middle has just one liberty left, at <b>{coord}</b>. Play there to capture it.',
      'tut.capture.wrong': 'Play at {coord} to capture the white stone.',
      'tut.capture.done': 'Captured. Here a capture is scored as <b>points lost by the stone’s owner</b>, not points gained by the capturer.',

      'tut.plus.title': '± points',
      'tut.plus.ask': 'The first stone to land on the + diamond at <b>{coord}</b> scores 5 points at once. Play there.',
      'tut.plus.wrong': 'The + diamond is at {coord}. The blue − below it costs you 5 instead.',
      'tut.plus.done': 'Five points. Notice the marker is gone — a ± point fires <b>only once, ever</b>.',

      'tut.base.title': 'Base stones',
      'tut.base.ask': 'A stone with a swirl is a base — worth <b>5 points</b>, not 1. Play {coord} to capture White’s base.',
      'tut.base.wrong': 'It is {coord}. One base is worth five ordinary stones.',
      'tut.base.done': 'White just lost 5 points. That is why you <b>spread your bases apart</b> when you place them.',

      'tut.hidden.title': 'Hidden — the invisible move',
      'tut.hidden.ask': 'Press the <b>H Hidden</b> button in the left panel, then play on any empty point.',
      'tut.hidden.done': 'Placed. The dashed ring is a marker <b>only you</b> can see — on your opponent’s board this stone is not drawn at all. They are only told that you used Hidden.',

      'tut.scan.title': 'Scan — probe one point',
      'tut.scan.ask': 'Your opponent has a hidden stone out there. This is practice, so here is the answer: <b>{coord}</b>. Press <b>S Scan</b> and check that point.',
      'tut.scan.wrong': 'Try scanning {coord}.',
      'tut.scan.done': 'Found it. In a real game you scan <b>without knowing</b> where it is, and your opponent gains 2 points whether you hit or miss. It also flashes only briefly, so you have to remember the spot.',

      'tut.finish.title': 'You are ready',
      'tut.finish.body': 'You have now handled every core rule. What is left is <b>Base Build</b> (3 secret stones before the game) and <b>Komi Bidding</b> (the auction for the first move) — and the game walks you through both as soon as a real match starts.',
      'tut.finish.playAI': 'Play a game against the AI',
      'tut.finish.lobby': 'Back to lobby',

      /* --- AI opponent --- */
      'mode.ai.name': 'Play the AI',
      'mode.ai.desc': 'Start alone right now — three difficulty levels',
      'lobby.aiHead': 'AI DIFFICULTY',
      'ai.easy.name': 'Beginner',
      'ai.easy.desc': 'For learning the rules. It makes mistakes and plays loosely',
      'ai.normal.name': 'Standard',
      'ai.normal.desc': 'Spots captures and liberties. Uses Hidden and Scan too',
      'ai.hard.name': 'Strong',
      'ai.hard.desc': 'Looks one move ahead and avoids losing exchanges',
      'ai.name.easy': 'AI · Beginner',
      'ai.name.normal': 'AI · Standard',
      'ai.name.hard': 'AI · Strong',

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
      'phase.betting': 'KOMI BIDDING',
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
      'status.betting': 'Study the board and bid komi for the first move.',
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
      'btn.scoreConfirm': 'Confirm count',
      'status.scoring': 'Click dead stones to mark them, then confirm the count.',
      'toast.scoringStart': 'Both passed — moving to scoring. Click dead stones to mark them.',
      'status.waitScore': 'Waiting for your opponent to confirm the score…',
      'toast.resume': 'The match resumes.',

      'res.title': 'Result',
      'res.stones': 'Stones',
      'res.bases': 'Bases ×5',
      'res.territory': 'Territory',
      'res.plus': '+points ×5',
      'res.minus': '−points ×5',
      'res.betting': 'Komi bid',
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
      'help.4': '<b>Komi Bidding</b> — after the reveal, secretly bid komi. The higher bid takes Black and the first move, paying that many points to the opponent. Two ties in a row means the first move is random (colors stay).',
      'help.5': '<b>Hidden (H)</b> — once per game, an invisible move. Your opponent only learns that you used it. It is revealed when it captures or is captured. If your opponent clicks that point, it is revealed and they may play elsewhere.',
      'help.6': '<b>Scan (S)</b> — once per game, inspect one point. Hit or miss, your opponent gains 2 points. A found hidden stone flashes only briefly, so remember the spot! A scan does not use your turn.',
      'help.7': '<b>Captures</b> — a captured stone is scored as points lost by the side that owned it (1 for a stone, 5 for a base).',
      'help.8': '<b>Byo-yomi</b> — (optional) a countdown on every move. Each period used costs −2 points; running out of all of them loses on time.',
      'help.9': '<b>Ending</b> — two passes in a row → mark dead stones → score. <b>A tie goes to the second player.</b>',
      'help.10': '<b>Score</b> — stones + bases×5 + territory + (+points×5) − (−points×5) + turn bid + scan bonus − byo-yomi penalty.',

      /* --- Illustrated guide (js/guide.js) --- */
      'guide.tabHow': 'Learn the game',
      'guide.tabRules': 'Rules reference',
      'guide.open': '❓ Learn the game',
      'guide.intro': 'If you play Go, you already know 90% of this game. Stones are captured by surrounding them, and the larger territory wins. What HIDDENSTONE adds is four rules about <b>information</b> — what your opponent does and does not get to see.',
      'guide.outro': 'One game is enough to internalise all of it. Exact rule details live in the “Rules reference” tab above.',

      'guide.what.title': 'What is this game?',
      'guide.what.lead': 'It is Go on a Go board. But you both hide something before the first move, the right to move first is bought at auction, and once per game you may play a stone your opponent <b>cannot see</b>.',
      'guide.what.p1': '<b>Base Build</b> — before the game starts, each player secretly places 3 stones.',
      'guide.what.p2': '<b>Komi Bidding</b> — instead of a fixed komi, you bid points for the first move.',
      'guide.what.p3': '<b>Hidden</b> — once per game, a move that is never drawn on your opponent’s board.',
      'guide.what.p4': '<b>Scan</b> — once per game, check one intersection for their hidden stone.',
      'guide.what.panelGo': 'Ordinary Go',
      'guide.what.panelHs': 'HIDDENSTONE',
      'guide.what.cap': 'Same board — now with swirl-marked base stones, ± diamonds, and a dashed hidden stone.',

      'guide.points.title': '± Points',
      'guide.points.lead': 'Some intersections carry a diamond. The <b>first</b> stone to land there scores at once — +5 on a plus point, −5 on a minus point — and then the marker is gone for good.',
      'guide.points.p1': 'It fires exactly once. A stone played there later gets nothing.',
      'guide.points.p2': 'A minus point nobody ever touches stays neutral — it counts as no one’s territory.',
      'guide.points.p3': 'Maps differ: Genesis has 4 plus and 4 minus, Chaos has 8 minus and no plus at all.',
      'guide.points.panelBefore': 'Before',
      'guide.points.panelAfter': 'After',
      'guide.points.cap': 'Black plays the plus point, gains 5, and the diamond disappears (dashed outline shows where it was).',

      'guide.base.title': 'Base Build',
      'guide.base.lead': 'Before the first move each player <b>secretly</b> places 3 base stones. Both sets are revealed at the same moment.',
      'guide.base.p1': 'A base stone is worth <b>5 points</b>, not 1. Losing one costs you all 5.',
      'guide.base.p2': 'They carry a swirl mark, so you can always tell a base from an ordinary stone.',
      'guide.base.p3': 'If you both chose the same intersection, both stones are removed and that point becomes a minus point.',
      'guide.base.panelMine': 'Your placement (secret)',
      'guide.base.panelTheirs': 'Their placement (secret)',
      'guide.base.panelReveal': 'Revealed together',
      'guide.base.cap': 'Both picked the centre, so both stones vanish and the point turns into a minus point.',

      'guide.komi.title': 'Komi Bidding',
      'guide.komi.lead': 'In Go, White receives a fixed komi to offset Black’s first-move advantage. Here that komi is <b>auctioned</b>. Looking at the revealed bases, both players secretly name a number from 0 to 25.',
      'guide.komi.p1': 'The higher bid takes <b>Black and the first move</b> — and pays that many points to the opponent.',
      'guide.komi.p2': 'So bidding 20 says you badly want the initiative, and you are paying full price for it.',
      'guide.komi.p3': 'A tie forces one re-bid. A second tie assigns the first move at random; the colours stay as they were.',
      'guide.komi.who1': 'Player 1',
      'guide.komi.who2': 'Player 2',
      'guide.komi.unit': 'pts',
      'guide.komi.ocFirst': 'Black · moves first',
      'guide.komi.ocFirstSub': 'for bidding higher',
      'guide.komi.ocPaid': 'starts on {v} points',
      'guide.komi.ocPaidSub': 'White · moves second',
      'guide.komi.cap': '8 against 3 → Player 1 takes Black and the first move; Player 2 begins 8 points up.',

      'guide.hidden.title': 'Hidden — the invisible move',
      'guide.hidden.lead': 'Once per game you may place a stone that is <b>never drawn</b> on your opponent’s board. It is not a ghost: it takes liberties, it captures, and it can be captured.',
      'guide.hidden.p1': 'They are told that you used Hidden — but never where.',
      'guide.hidden.p2': 'It is revealed the moment it captures, is captured, or they try to play on that point.',
      'guide.hidden.p3': 'If they do play into it, they simply choose another point — but from then on they know.',
      'guide.hidden.panelYou': 'Your screen',
      'guide.hidden.panelThem': 'Their screen',
      'guide.hidden.cap': 'The identical position. Only you can see the dashed stone.',

      'guide.scan.title': 'Scan — probe one point',
      'guide.scan.lead': 'Once per game you may inspect a single intersection to see whether their hidden stone sits there. It <b>does not use your turn</b>.',
      'guide.scan.p1': 'Hit or miss, your opponent gains <b>2 points</b>. Information is never free.',
      'guide.scan.p2': 'Even a hit only flashes for a moment before vanishing again — memorise the spot.',
      'guide.scan.p3': 'Because it costs no turn, you can scan and still play your move immediately after.',
      'guide.scan.panelHit': 'Hit — found it',
      'guide.scan.panelMiss': 'Miss — nothing there',
      'guide.scan.cap': 'Either way your opponent collects 2 points, which is what makes the timing a real decision.',

      'guide.scoring.title': 'Ending & scoring',
      'guide.scoring.lead': 'Two passes in a row end the game. Mark the dead stones, then confirm the count. The score is more than territory.',
      'guide.scoring.p1': 'Every stone still on the board is 1 point; every base stone is 5.',
      'guide.scoring.p2': 'Captures are scored as <b>points lost by the side that owned the stone</b> — the capturer gains nothing directly.',
      'guide.scoring.p3': 'If the totals are level, <b>the player who moved second wins</b>.',
      'guide.scoring.panelBoard': 'Final position',
      'guide.scoring.panelTable': 'Worked example',
      'guide.scoring.cap': '× marks a dead stone. Black’s ring of 8 stones (one of them a base) encloses 1 point of territory, and White still holds the 8 points won at the bid. The minus point in the top right was never played, so it counts for neither side.',

      'guide.flow.title': 'How one game runs',
      'guide.flow.lead': 'Four phases, start to finish.',
      'guide.flow.s1': '3 secret stones',
      'guide.flow.s2': 'auction the first move',
      'guide.flow.s3': 'hidden · scan',
      'guide.flow.s4': 'dead stones · count',

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
