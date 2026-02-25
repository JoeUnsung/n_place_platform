# ADR-001: 데이터 수집 전략

## 상태
채택 (2026-02-25)

## 컨텍스트
네이버 플레이스 키워드 순위를 추적하기 위해 데이터 수집 방식을 결정해야 함.

## 검토한 옵션

### 옵션 1: 네이버 공식 지역 검색 API
- 안정적이고 합법적
- display 최대 5개 제한 → 5위까지만 확인 가능
- place_id 미반환 (link 필드가 외부 URL) → 매장 매칭 불가

### 옵션 2: HTML CSS 셀렉터 파싱
- pcmap.place.naver.com의 HTML을 BeautifulSoup으로 파싱
- React SPA라 초기 HTML에 검색 결과 없음 → CSS 셀렉터 매칭 실패

### 옵션 3: Apollo State JSON 파싱 (채택)
- pcmap.place.naver.com의 `__APOLLO_STATE__` JSON 추출
- place_id 정확 매칭, 50개 결과, visitor/blog review count 포함

## 결정
**Apollo State JSON 파싱을 primary로, 공식 API를 fallback으로 사용**

## 근거
- 공식 API는 place_id를 반환하지 않아 순위 매칭에 부적합
- Apollo State는 모든 필요 데이터를 JSON으로 제공
- 공식 API는 매장 정보 조회 등 보조 용도로 활용

## 리스크
- 네이버 프론트엔드 구조 변경 시 파싱 실패 가능
- 대응: 정기적 모니터링 + 파싱 실패 시 알림
