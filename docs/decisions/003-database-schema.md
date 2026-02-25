# ADR-003: 데이터베이스 스키마 설계

## 상태
채택 (2026-02-25), dev 적용 완료

## 테이블 구조

### stores
매장 기본 정보. naver_place_id로 고유 식별.

### tracked_keywords
매장별 추적 키워드. (store_id, keyword) 유니크 제약.
- collection_time: PoC에서는 스케줄러가 무시 (전체 일괄 수집)
- alert_enabled: 향후 알림 기능용 예약 필드

### ranking_snapshots
순위 이력 (append-only). 시계열 데이터.
- idx_snapshots_keyword_time 인덱스: 최신 순위 조회 최적화
- rank_position NULL 허용: 수집 실패 시에도 기록

## RLS 정책
- PoC: service_role 키로 백엔드 접근, RLS 미적용
- 프로덕션 전환 시: 사용자별 RLS 정책 추가 필요
