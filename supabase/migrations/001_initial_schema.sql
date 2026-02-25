-- stores: 등록된 매장
CREATE TABLE stores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    naver_place_id VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    address TEXT,
    naver_place_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- tracked_keywords: 매장별 추적 키워드
CREATE TABLE tracked_keywords (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    keyword VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    collection_time TIME DEFAULT '15:00',
    alert_enabled BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(store_id, keyword)
);

-- ranking_snapshots: 순위 이력 (append-only)
CREATE TABLE ranking_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tracked_keyword_id UUID NOT NULL REFERENCES tracked_keywords(id) ON DELETE CASCADE,
    rank_position INTEGER,
    total_results INTEGER,
    visitor_count INTEGER,
    blog_review_count INTEGER,
    collected_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_snapshots_keyword_time
    ON ranking_snapshots(tracked_keyword_id, collected_at DESC);
