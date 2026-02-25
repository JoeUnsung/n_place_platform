import { useState, useCallback } from 'react';
import type { RankingSnapshot } from '@/types';

const API_BASE = import.meta.env.VITE_API_URL || '';

export function useRankings(keywordId: string) {
  const [rankings, setRankings] = useState<RankingSnapshot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRankings = useCallback(
    async (from?: string, to?: string) => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        if (from) params.set('from', from);
        if (to) params.set('to', to);
        const qs = params.toString() ? `?${params.toString()}` : '';
        const res = await fetch(`${API_BASE}/api/keywords/${keywordId}/rankings${qs}`);
        if (!res.ok) throw new Error('순위 데이터를 불러오지 못했습니다.');
        const data = await res.json();
        setRankings(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : '오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    },
    [keywordId],
  );

  return { rankings, loading, error, fetchRankings };
}
