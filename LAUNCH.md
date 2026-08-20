# 앱 스토어 출시 준비 — HIDDENSTONE

이 문서는 **지금 준비된 것**과 **직접 하셔야 하는 것**을 나눠 적었습니다.
계정 생성·결제·스토어 제출은 제가 대신 할 수 없어서, 그 앞까지 전부 만들어 두었습니다.

라이브 주소: <https://effortball-cloud.github.io/hiddenstone/>

---

## 준비 완료된 것

| 항목 | 위치 | 비고 |
|---|---|---|
| PWA 매니페스트 | `manifest.webmanifest` | id·이름·설명·아이콘·스크린샷·바로가기 포함 |
| 서비스 워커 | `sw.js` | **오프라인에서 AI 대전·튜토리얼·기보 재생 동작 확인** |
| 앱 아이콘 | `assets/icon-*.png` | 16 · 32 · 48 · 64 · 128 · 180 · 192 · 256 · 512 · 1024 |
| 스토어 아이콘 (512) | `assets/icon-512.png` | Play 요구 규격 |
| 피처 그래픽 | `screenshots/store/feature-1024x500.png` | 1024×500, 알파 없음 (Play 필수) |
| 폰 스크린샷 3장 | `screenshots/store/phone-1~3.png` | 1080×1920 (9:16) |
| 태블릿/와이드 1장 | `screenshots/store/wide-1.png` | 1280×800 |
| 개인정보처리방침 | `privacy.html` | 한/영, 배포 주소에서 접근 가능 |
| 외부 CDN 제거 | `vendor/` | PeerJS·MQTT 자체 호스팅 (둘 다 MIT) |

### 스토어 등록 정보 (그대로 복사해서 쓰시면 됩니다)

**앱 이름**
```
HIDDENSTONE
```

**짧은 설명 (영문, 80자 이내)**
```
Go with a hidden move. Bid for first, hide a stone, scan for theirs.
```

**짧은 설명 (한국어, 80자 이내)**
```
보이지 않는 한 수가 있는 바둑. 선공을 경매하고, 돌 하나를 숨기고, 상대의 것을 찾으세요.
```

**전체 설명 (영문)**
```
HIDDENSTONE is Go with a mind game layered on top.

You already know the board: stones, liberties, captures, territory. What you don't know is
where your opponent's hidden stone is — or whether the point you are about to play is a trap.

WHAT MAKES IT DIFFERENT

• Base Build — before the first move, both players secretly place three base stones.
  A base is worth five points, not one. If you both pick the same point, both stones are
  destroyed and that spot turns into a penalty.

• Komi Bidding — the first move is auctioned. Bid how many points you will pay for it.
  Bid too much and you have already lost ground.

• Hidden — once per game you may play a stone your opponent cannot see. It is not drawn
  on their board at all. They are only told that you used it.

• Scan — once per game, probe a single point to look for their hidden stone. Hit or miss,
  it costs you two points, and the answer flashes only briefly. Remember it.

• ± points — marked intersections give or take five points, but only for the first stone
  that lands there. After that they are gone.

PLAY RIGHT NOW

• Play the AI at three difficulty levels — no sign-up, no waiting for an opponent.
  The AI cannot see your hidden stone either; it has to guess like anyone else.
• Learn by doing — a six-step hands-on tutorial, plus an illustrated rules guide.
• Play a friend by sending one link. They tap it and walk straight into your room.
• Two players on one device, with the screen covered during secret phases.
• Your record and your last twenty games are saved, and you can replay any of them
  move by move — with every hidden stone revealed.

Korean and English, switchable inside the game. Works offline. No account, no ads, no tracking.

Based on Go rules, with a set of twists from a strategy board game that went offline in 2009.
```

**전체 설명 (한국어)**
```
히든스톤은 바둑 위에 심리전을 한 겹 얹은 게임입니다.

판은 이미 아는 그대로입니다. 돌, 활로, 따냄, 집. 모르는 것은 상대의 히든 돌이 어디 있는지,
그리고 지금 두려는 자리가 함정인지 아닌지입니다.

무엇이 다른가

• 베이스빌드 — 첫 수를 두기 전에 양쪽이 몰래 돌 세 개를 놓습니다.
  베이스는 1점이 아니라 5점짜리입니다. 같은 자리를 고르면 둘 다 사라지고 그 자리는 감점이 됩니다.

• 턴베팅 — 선공을 경매로 삽니다. 몇 점을 낼지 비밀 입찰하는데, 너무 비싸게 사면 이미 손해입니다.

• 히든 — 게임당 한 번, 상대에게 보이지 않는 돌을 둘 수 있습니다.
  상대 화면에는 아예 그려지지 않고, "히든을 썼다"는 사실만 통보됩니다.

• 스캔 — 게임당 한 번, 한 지점을 찍어 상대의 히든을 찾습니다.
  맞히든 못 맞히든 2점을 내주고, 답은 잠깐 반짝였다 사라집니다. 기억해야 합니다.

• ±화점 — 표시된 자리는 5점을 주거나 뺏습니다. 단, 처음 놓인 돌 하나에만 발동하고 사라집니다.

지금 바로 둘 수 있습니다

• AI와 3단계 난이도로 대국 — 가입도, 상대를 기다릴 필요도 없습니다.
  AI도 당신의 히든을 볼 수 없습니다. 똑같이 찍어서 찾아야 합니다.
• 직접 해보며 배우는 6단계 튜토리얼과 그림 규칙 가이드
• 친구와는 링크 하나로 — 누르면 바로 방에 들어옵니다
• 같은 기기에서 둘이서, 비밀 단계에는 화면을 가리고
• 전적과 최근 20판의 기보가 저장되고, 아무 판이나 한 수씩 다시 볼 수 있습니다
  (다시보기에서는 히든 돌도 전부 공개됩니다)

한국어·영어를 게임 안에서 전환할 수 있습니다. 오프라인에서도 동작하고,
계정도 광고도 추적도 없습니다.

바둑 룰을 기반으로, 2009년 서비스가 끝난 전략 보드게임의 특수 규칙을 되살렸습니다.
```

**카테고리**: 게임 → 보드 (Board)
**태그/키워드**: go, baduk, weiqi, board game, strategy, two player, offline, ai opponent
**개인정보처리방침 URL**: `https://effortball-cloud.github.io/hiddenstone/privacy.html`
**콘텐츠 등급**: 전체 이용가 — 폭력·성적 콘텐츠·도박 요소 없음
**데이터 보안 양식**: 수집·공유하는 데이터 **없음**, 데이터는 기기 내부에만 저장

---

## 직접 하셔야 하는 것

### 0. 먼저 — 개인정보처리방침에 연락처 채우기
`privacy.html`에 두 군데 `[여기에 연락용 이메일을 넣으세요]` / `[put your contact email here]`
가 있습니다. Play 콘솔에도 같은 이메일이 필요하니 **공개해도 되는 주소**로 채워 넣으세요.
저는 임의로 이메일을 넣지 않았습니다.

### 1. Google Play 개발자 계정 (안드로이드 — 권장)
- <https://play.google.com/console> 에서 가입, **등록비 미화 25달러(1회)**
- 개인 계정은 신원 확인에 며칠 걸릴 수 있습니다
- 2023년 이후 개인 개발자는 **비공개 테스트(테스터 12명, 14일)** 를 거쳐야
  프로덕션 출시가 가능합니다. 이 기간을 일정에 넣어두세요.

### 2. 안드로이드 패키지 만들기 — PWABuilder
이 PC에 Node·Java·Android SDK가 없어 여기서 빌드할 수 없습니다.
브라우저만으로 되는 경로를 쓰세요.

1. <https://www.pwabuilder.com> 접속
2. `https://effortball-cloud.github.io/hiddenstone/` 입력 → Start
3. 점수 확인 (매니페스트·서비스워커·HTTPS는 이미 갖춰져 있습니다)
4. **Package for stores → Android → Generate**
5. 옵션에서 확인할 것
   - Package ID: 예 `io.github.effortballcloud.hiddenstone`
     (한 번 정하면 **영원히 못 바꿉니다**. 신중히.)
   - Signing key: **"Create new"** 선택 → 생성된 키를 내려받아 **반드시 안전하게 보관**
     (이 키를 잃어버리면 같은 앱으로 업데이트를 못 올립니다)
   - Display mode: standalone
6. 받은 zip 안에 `.aab`(업로드용)와 `assetlinks.json`이 들어 있습니다

### 3. 주소창 숨기기 — assetlinks.json 올리기
TWA는 도메인 소유를 증명해야 상단 주소창이 사라집니다.

1. PWABuilder가 준 `assetlinks.json` 파일을 이 저장소의
   `.well-known/assetlinks.json` 경로에 넣고 커밋·푸시
2. `https://effortball-cloud.github.io/hiddenstone/.well-known/assetlinks.json` 로 열리는지 확인

> 주의: GitHub Pages가 하위 경로(`/hiddenstone/`)로 서비스되고 있어서,
> assetlinks는 원래 **도메인 루트**(`effortball-cloud.github.io/.well-known/...`)에 있어야 합니다.
> 즉 이 저장소가 아니라 **`effortball-cloud.github.io` 이름의 별도 저장소**를 만들어
> 거기에 올려야 합니다. 그 저장소가 없다면 새로 만드시면 되고, 게임 자체는 지금 위치 그대로 둬도 됩니다.
> 이게 번거로우면 커스텀 도메인을 하나 연결하는 편이 깔끔합니다.

### 4. Play 콘솔에 등록
- 앱 만들기 → 이름 `HIDDENSTONE`, 기본 언어 영어(한국어 추가)
- 위 "스토어 등록 정보" 복사해 붙여넣기
- 그래픽: `screenshots/store/` 의 이미지들 업로드
  - 앱 아이콘: `assets/icon-512.png`
  - 피처 그래픽: `feature-1024x500.png`
  - 휴대전화 스크린샷: `phone-1.png` ~ `phone-3.png` (최소 2장 필요)
  - 7인치/10인치 태블릿: `wide-1.png`
- 개인정보처리방침 URL 입력
- 콘텐츠 등급 설문 (전체 이용가로 나옵니다)
- 데이터 보안 양식: **수집하는 데이터 없음**으로 답변
- 광고 포함 여부: **아니요**
- `.aab` 업로드 → 비공개 테스트 → 프로덕션

### 5. iOS (나중에 판단)
- Apple Developer Program **연 99달러**
- PWA를 그대로 올릴 수 없어 WKWebView 래퍼(PWABuilder iOS 패키지 또는 Capacitor)가 필요합니다
- 심사가 안드로이드보다 까다롭고, "웹사이트를 그대로 감싼 앱"은 거부되는 경우가 있습니다
  (4.2 Minimum Functionality). 오프라인 동작·AI 대전·기보 저장이 있어 불리하진 않지만
  안드로이드에서 반응을 본 뒤 판단하시길 권합니다.

---

## 스토어 없이도 이미 되는 것

지금 주소를 그대로 보내도 **설치형 앱처럼 씁니다.**
- 안드로이드 크롬: 메뉴 → "앱 설치" / "홈 화면에 추가"
- 아이폰 사파리: 공유 → "홈 화면에 추가"
- 설치하면 주소창 없이 전체화면으로 실행되고, 오프라인에서도 AI 대전이 됩니다

OGS·레딧 같은 커뮤니티에 알릴 때는 스토어 심사를 기다릴 필요 없이 이 주소를 쓰시면 됩니다.

---

## 아직 남은 위험

- **상표 출원 미완** — KIPRIS 검색은 `히든스톤`·`hiddenstone` 모두 0건이었지만,
  한국은 선출원주의라 먼저 낸 쪽이 가져갑니다. 앱이 알려지기 전에 9류·41류로 출원해 두는 게 안전합니다.
- **온라인 대전은 친선전용** — 히든 좌표가 상대 브라우저로 전달되어 개발자 도구로 볼 수 있습니다.
  게임 안에도 고지해 두었습니다. 경쟁전을 하려면 서버 심판이 필요하고 그건 별도 프로젝트입니다.
- **공개방은 공용 MQTT 브로커** 사용 — 스팸이나 가짜 방이 올라올 수 있습니다.
- **라이선스 파일 없음** — 현재 기본값(모든 권리 보유). 상업 출시에는 오히려 맞지만 의도한 상태인지 확인하세요.
