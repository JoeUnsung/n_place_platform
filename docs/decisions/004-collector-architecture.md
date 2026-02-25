# ADR-004: Collector 추상화 아키텍처

## 상태
채택 (2026-02-25)

## 결정
BaseCollector ABC를 정의하고 NaverMapCollector로 구현.

```
BaseCollector (ABC)
├── search_keyword(keyword) → list[RankingResult]
├── get_store_info(place_id) → StoreInfo | None
└── find_store_rank(keyword, place_id) → RankingResult | None

NaverMapCollector(BaseCollector)
├── search_keyword_api()      # 공식 API (fallback)
├── search_keyword_scrape()   # Apollo State JSON (primary)
├── _extract_apollo_state()   # JSON 추출 헬퍼
└── _strip_html()             # HTML 태그 제거
```

## 근거
- 수집 방식 변경 시 collector만 교체 가능
- 테스트 시 Mock collector 주입 가능
- 향후 다른 플랫폼(카카오맵 등) 확장 용이

## NaverMapCollector 내부 전략
1. `find_store_rank`: Apollo State → 공식 API fallback
2. `get_store_info`: Apollo State (place_id 상세) + 공식 API (보완)
3. Rate limiting: 요청 간 1.5초 딜레이
4. `_has_api_keys` 프로퍼티로 API 키 유무에 따라 자동 분기

## 진화 과정
1. 초기: HTML CSS 셀렉터 파싱 → SPA라 실패
2. 중간: 공식 API primary + HTML fallback → place_id 매칭 불가
3. 최종: Apollo State primary + 공식 API fallback → 정확한 매칭 + 풍부한 데이터
