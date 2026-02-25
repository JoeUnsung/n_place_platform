# 네이버 플레이스 검색 API 리서치 결과

## 1. 데이터 수집 방식 비교

### 방법 A: 네이버 공식 지역 검색 API (Primary)

| 항목 | 내용 |
|------|------|
| 엔드포인트 | `https://openapi.naver.com/v1/search/local.json` |
| 인증 | `X-Naver-Client-Id` + `X-Naver-Client-Secret` |
| 발급 | [developers.naver.com](https://developers.naver.com/apps/) |
| 비용 | 무료 (일 25,000회) |
| 문서 | [developers.naver.com/docs/serviceapi/search/local](https://developers.naver.com/docs/serviceapi/search/local/local.md) |

**요청 파라미터**
| 파라미터 | 설명 | 기본값 |
|----------|------|--------|
| `query` | 검색 키워드 (필수) | - |
| `display` | 결과 개수 | 최대 5 |
| `start` | 시작 위치 (1-based) | 1 |
| `sort` | 정렬 (`random`=관련도순) | random |

**응답 JSON 구조**
```json
{
  "lastBuildDate": "Wed, 25 Feb 2026 ...",
  "total": 123,
  "start": 1,
  "display": 5,
  "items": [
    {
      "title": "<b>강남</b> 맛집",
      "link": "https://...",
      "category": "한식>삼겹살",
      "description": "",
      "telephone": "02-1234-5678",
      "address": "서울특별시 강남구...",
      "roadAddress": "서울특별시 강남구...",
      "mapx": "127.0...",
      "mapy": "37.5..."
    }
  ]
}
```

**제한사항**
- `display` 최대 5개 → 상위 5위까지만 확인 가능
- `title`에 HTML 태그(`<b>`) 포함 → 제거 필요
- 위치 기반 필터링 미지원

---

### 방법 B: pcmap.place.naver.com Apollo State JSON 파싱 (실제 채택 - Primary)

| 항목 | 내용 |
|------|------|
| 검색 URL | `https://pcmap.place.naver.com/place/list?query={keyword}` |
| 상세 URL | `https://pcmap.place.naver.com/place/{place_id}` |
| 인증 | 불필요 |
| 데이터 소스 | `window.__APOLLO_STATE__` JSON (HTML 내 임베디드) |

**필수 HTTP 헤더**
```
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36
Accept-Language: ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7
Referer: https://map.naver.com/
```

**데이터 추출 방식**
- pcmap.place.naver.com은 React SPA로, 검색 결과가 서버사이드 렌더링 HTML이 아닌 `__APOLLO_STATE__` JSON에 포함
- CSS 셀렉터 파싱은 실패 (SPA이므로 초기 HTML에 결과 없음)
- `<script>` 태그에서 `__APOLLO_STATE__` JSON을 정규식으로 추출
- `ROOT_QUERY.restaurantList.items` → `__ref` 리스트로 순서 있는 결과 추출
- 각 `RestaurantListSummary:{id}:{id}` 엔트리에서 place_id, visitorReviewCount, blogCafeReviewCount 추출

**장점**: 50위+ 순위 확인 가능, place_id 정확 매칭, visitor_count/blog_review_count 포함
**단점**: 네이버 프론트엔드 구조 변경 시 파싱 실패 가능

---

## 2. 채택한 전략: Apollo State Primary + 공식 API Fallback

```
find_store_rank(keyword, place_id):
    1. pcmap Apollo State JSON으로 50위까지 검색 (place_id 정확 매칭)
    2. 실패 시 → 공식 API로 상위 5위 확인 (fallback)
    3. API 키 없으면 → Apollo State만 사용
```

**최초 계획과 달라진 이유**:
- 공식 API는 place_id를 반환하지 않음 (link 필드가 외부 URL) → place_id 매칭 불가
- 공식 API의 display 최대 5개 제한으로 순위 추적에 부적합
- Apollo State는 place_id를 정확히 포함하고 50개까지 결과 제공
- Apollo State에서 visitor_count, blog_review_count도 함께 추출 가능

---

## 3. 봇 탐지 및 대응

### 네이버의 봇 탐지 패턴
- User-Agent 검사 (비브라우저 차단)
- Referer 헤더 검사
- 요청 빈도 기반 차단
- JavaScript 렌더링 의존 (일부 데이터)

### 대응 전략
- 브라우저와 동일한 헤더 세트 사용
- 요청 간 1.5초+ 딜레이
- 세션 재사용 (httpx.AsyncClient)
- 공식 API를 primary로 사용하여 스크래핑 의존도 최소화

---

## 4. 참고 프로젝트

| 프로젝트 | 방식 | URL |
|----------|------|-----|
| goaldeer/naver-place-rank-tracker | requests + BeautifulSoup | [GitHub](https://github.com/goaldeer/naver-place-rank-tracker) |
| seolhalee/Naver-Place-scraper | Selenium + BeautifulSoup | [GitHub](https://github.com/seolhalee/Naver-Place-scraper) |
| Apify Naver Map Scraper | Headless browser | [Apify](https://apify.com/delicious_zebu/naver-map-search-results-scraper) |

---

## 5. 경쟁 서비스 (벤치마킹)

| 서비스 | URL |
|--------|-----|
| 마케팅마법사 | [placewizard.kr](https://placewizard.kr/) |
| 셀러랩스 | [sellerlabs.oopy.io](https://sellerlabs.oopy.io/smartplace-rank) |
| 사장님닷컴 | [sjnim.com](https://sjnim.com/) |
| 탑클릭 | [topclick.kr](https://www.topclick.kr/search/place) |
| 플레이스마스터 | [plma.kr](https://www.plma.kr/) |
| 부스팅샵 | [boostings.shop](https://boostings.shop/rank/place) |
