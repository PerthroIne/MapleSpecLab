# MapleSpecLab v1.1.1 배포 순서

대상은 GitHub Desktop의 공개 저장소 `MapleSpecLab`입니다. `MapleSpecLab-Dev`가 아닙니다.

## 1. 배포 전 백업

1. 제공된 ZIP을 별도 폴더에 압축 해제합니다.
2. GitHub Desktop을 열고 왼쪽 위 `Current Repository`에서 `MapleSpecLab`을 선택합니다.
3. 상단 `Repository` → `Show in Explorer`로 공개 저장소 폴더를 엽니다.
4. 저장소에 미커밋 변경이 표시되면 먼저 기존 작업인지 확인하고 별도로 커밋하거나 백업합니다.

## 2. 파일 교체

1. 압축 해제한 폴더 안의 파일과 폴더를 모두 선택합니다.
2. 공개 저장소 `MapleSpecLab` 폴더에 복사하고 같은 이름의 파일은 덮어씁니다.
3. `.git` 폴더는 ZIP에 포함되어 있지 않으므로 저장소 연결은 유지됩니다.

## 3. 변경 확인과 커밋

1. GitHub Desktop으로 돌아가 `Changes` 목록을 확인합니다.
2. 최소한 `index.html`, `app.js`, `official-guide.js`, `styles.css`, `version.json`, `README.md`, `CHANGELOG.md`, `DEPLOYMENT_GUIDE.md`가 보이는지 확인합니다.
3. `Summary`에 `Release v1.1.1 - companion image review`를 입력합니다.
4. `Description`에 다음을 입력합니다.

   `다중 동료 이미지, 초상화·테두리 기반 검토, E 장착 표시 연동 추가`

5. `Commit to main`을 누릅니다.

## 4. GitHub로 올리기

1. GitHub Desktop 상단의 `Push origin`을 누릅니다.
2. 완료될 때까지 창을 닫지 않습니다.
3. GitHub 저장소 웹페이지의 `Actions`에서 Pages 배포가 성공했는지 확인합니다.

## 5. 공개 페이지 확인

1. GitHub Pages 주소를 새 탭 또는 모바일 브라우저에서 엽니다.
2. 브라우저에 이전 화면이 남으면 강력 새로고침하거나 주소 뒤에 `?v=1.1.1`을 붙여 확인합니다.
3. 정보 메뉴에서 `v1.1.1`과 공식 가이드 확인일이 보이는지 확인합니다.
4. 현재 스펙의 `ⓘ`, 도움말의 공식 기준 카드, 동료 등급 접기/펼치기를 확인합니다.

## 6. GitHub Release 만들기

1. 저장소 웹페이지에서 `Releases` → `Draft a new release`를 엽니다.
2. `Choose a tag`에 `v1.1.1`을 입력하고 새 태그를 만듭니다.
3. 제목은 `MapleSpecLab v1.1.1`으로 입력합니다.
4. 본문에는 `CHANGELOG.md`의 v1.1.1 항목을 붙여넣습니다.
5. 필요하면 제공된 완성본 ZIP을 Release 첨부 파일로 추가합니다.
6. `Publish release`를 누릅니다.

## 되돌려야 할 때

GitHub Desktop `History`에서 바로 이전 정상 커밋을 확인한 뒤, 해당 커밋을 우클릭하고 `Revert Changes in Commit`을 사용합니다. 되돌림 커밋을 만든 다음 `Push origin`을 누르면 공개 페이지도 이전 상태로 돌아갑니다.
