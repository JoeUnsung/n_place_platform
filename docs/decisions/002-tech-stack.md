# ADR-002: 기술 스택 선정

## 상태
채택 (2026-02-25)

## 결정

| 레이어 | 기술 | 이유 |
|--------|------|------|
| Backend | Python 3.12 + FastAPI | 비동기 지원, 자동 OpenAPI 문서, 빠른 개발 |
| HTTP Client | httpx | async 네이티브, requests 호환 API |
| Database | Supabase (PostgreSQL) | 호스팅 불필요, REST API + Python SDK |
| Scheduler | APScheduler | Python 네이티브, AsyncIO 지원 |
| Frontend | React + Vite + TypeScript | 빠른 HMR, 타입 안전성 |
| UI | shadcn/ui + Tailwind CSS | 커스터마이징 자유도 높음, 깔끔한 디자인 |
| Chart | Recharts | React 네이티브, 순위 차트에 적합 |
| Container | Docker Compose | 로컬 개발 + 배포 통일 |

## PoC 단계 의도적 제외
- 인증/권한: service_role 키로 백엔드 접근 (PoC)
- 상태 관리: useState/useEffect만 사용 (Redux 등 미도입)
- 테스트: 수동 E2E만 (자동화 테스트 미작성)
