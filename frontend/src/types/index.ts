export interface Store {
  id: string;
  naver_place_id: string;
  name: string;
  category: string | null;
  address: string | null;
  naver_place_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface TrackedKeyword {
  id: string;
  store_id: string;
  keyword: string;
  is_active: boolean;
  collection_time: string;
  alert_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface RankingSnapshot {
  id: string;
  tracked_keyword_id: string;
  rank_position: number | null;
  total_results: number | null;
  visitor_count: number | null;
  blog_review_count: number | null;
  collected_at: string;
}

export interface DashboardKeyword extends TrackedKeyword {
  latest_rank: number | null;
  prev_rank: number | null;
  rank_change: number | null;
}

export interface DashboardStore extends Store {
  keywords: DashboardKeyword[];
}
