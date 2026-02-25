# N-Place Platform

네이버 플레이스 키워드 순위 추적 시스템

## Tech Stack
- Backend: Python 3.12 + FastAPI + httpx + Supabase
- Frontend: React + Vite + TypeScript + shadcn/ui + Recharts
- Database: Supabase (PostgreSQL)
- Scheduler: APScheduler
- Data Collection: Naver Apollo State JSON 파싱 (primary) + 공식 지역 검색 API (fallback)

## Development

### Backend
```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -e .
uvicorn app.main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Docker
```bash
docker compose up
```

## Database
- Migrations in supabase/migrations/
- Always apply to dev first, prod after user confirmation
- Using service_role key for backend, anon key for frontend read-only
- Supabase project: aflspzhzzsusrexsdotv

## API Endpoints
- Backend runs on port 8000
- Frontend runs on port 5173
- API prefix: /api/

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/stores | 매장 등록 (place_id → 메타 자동 파싱) |
| GET | /api/stores | 매장 목록 |
| GET | /api/stores/{id} | 매장 상세 |
| DELETE | /api/stores/{id} | 매장 삭제 |
| POST | /api/stores/{id}/keywords | 키워드 추적 추가 |
| GET | /api/stores/{id}/keywords | 키워드 목록 |
| GET | /api/keywords/{id} | 키워드 상세 |
| PATCH | /api/keywords/{id} | 추적 설정 변경 |
| DELETE | /api/keywords/{id} | 키워드 삭제 |
| POST | /api/keywords/{id}/collect | 수동 순위 수집 |
| GET | /api/keywords/{id}/rankings | 순위 히스토리 (?from=&to=) |
| GET | /api/dashboard | 전체 대시보드 요약 |

## Data Collection Architecture
- Primary: pcmap.place.naver.com의 `__APOLLO_STATE__` JSON 파싱
  - place_id 매칭으로 정확한 순위 추출
  - visitor_count, blog_review_count 포함
  - 최대 50개 결과
- Fallback: 네이버 공식 지역 검색 API (display 최대 5개)
  - API 키 필요: NAVER_CLIENT_ID, NAVER_CLIENT_SECRET

## Key Files
- backend/app/collector/naver_map.py - 데이터 수집 핵심 로직
- backend/app/services/ - 비즈니스 로직
- backend/app/routers/ - API 엔드포인트
- frontend/src/pages/ - 페이지 컴포넌트
- frontend/src/hooks/ - API 연동 훅
