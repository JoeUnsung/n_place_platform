# N Place Platform

네이버 플레이스 키워드 순위 추적 시스템. 매장을 등록하고 키워드별 검색 순위를 자동으로 추적합니다.

## 주요 기능

- **매장 등록**: 네이버 플레이스 ID로 매장 등록 (이름/카테고리/주소 자동 파싱)
- **키워드 순위 추적**: 키워드별 네이버 지도 검색 순위 수집
- **순위 히스토리**: 일별 순위 변동 차트 및 테이블
- **대시보드**: 전체 매장/키워드 순위 현황 한눈에 확인
- **자동 수집**: 스케줄러 기반 정기 순위 수집

## 기술 스택

| 구분 | 기술 |
|------|------|
| Backend | Python 3.12, FastAPI, httpx, Supabase |
| Frontend | React, Vite, TypeScript, shadcn/ui, Recharts |
| Database | Supabase (PostgreSQL) |
| Scheduler | APScheduler |

## 시작하기

### 환경 설정

```bash
cp .env.example .env
# .env 파일에 Supabase 키와 네이버 API 키 입력
```

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

## 사용법

1. http://localhost:5173 접속
2. **매장 등록**: 네이버 플레이스 URL에서 place_id 복사 → 매장 등록
3. **키워드 추가**: 추적할 검색 키워드 등록
4. **순위 확인**: 대시보드에서 순위 확인 또는 수동 수집 실행
5. **히스토리**: 키워드별 순위 변동 추이 차트 확인
