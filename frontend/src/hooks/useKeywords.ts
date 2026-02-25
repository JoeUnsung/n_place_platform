import { useState, useEffect, useCallback } from 'react';
import type { TrackedKeyword } from '@/types';

const API_BASE = import.meta.env.VITE_API_URL || '';

export function useKeywords(storeId: string) {
  const [keywords, setKeywords] = useState<TrackedKeyword[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchKeywords = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/stores/${storeId}/keywords`);
      if (!res.ok) throw new Error('키워드 목록을 불러오지 못했습니다.');
      const data = await res.json();
      setKeywords(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }, [storeId]);

  const createKeyword = useCallback(
    async (keyword: string) => {
      const res = await fetch(`${API_BASE}/api/stores/${storeId}/keywords`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.detail || '키워드 추가에 실패했습니다.');
      }
      const created: TrackedKeyword = await res.json();
      setKeywords((prev) => [...prev, created]);
      return created;
    },
    [storeId],
  );

  const updateKeyword = useCallback(
    async (keywordId: string, updates: Partial<Pick<TrackedKeyword, 'is_active' | 'alert_enabled'>>) => {
      const res = await fetch(`${API_BASE}/api/keywords/${keywordId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error('키워드 수정에 실패했습니다.');
      const updated: TrackedKeyword = await res.json();
      setKeywords((prev) => prev.map((k) => (k.id === keywordId ? updated : k)));
      return updated;
    },
    [],
  );

  const deleteKeyword = useCallback(
    async (keywordId: string) => {
      const res = await fetch(`${API_BASE}/api/keywords/${keywordId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('키워드 삭제에 실패했습니다.');
      setKeywords((prev) => prev.filter((k) => k.id !== keywordId));
    },
    [],
  );

  const collectKeyword = useCallback(
    async (keywordId: string) => {
      const res = await fetch(`${API_BASE}/api/keywords/${keywordId}/collect`, {
        method: 'POST',
      });
      if (!res.ok) throw new Error('수집 요청에 실패했습니다.');
      return res.json();
    },
    [],
  );

  useEffect(() => {
    fetchKeywords();
  }, [fetchKeywords]);

  return { keywords, loading, error, fetchKeywords, createKeyword, updateKeyword, deleteKeyword, collectKeyword };
}
